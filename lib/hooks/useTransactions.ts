import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

export type TransactionType = 
  | 'registration'
  | 'activation'
  | 'level_income'
  | 'withdrawal'
  | 'global_pool'
  | 'non_working'
  | 'profile_update'
  | 'all';

export interface Transaction {
  transactionId: bigint;
  userAddress: string;
  userName?: string;
  userId?: bigint;
  type: TransactionType;
  amount: bigint;
  amountUSD: string;
  level?: number;
  timestamp: Date;
  txHash?: string;
  status: 'confirmed';
  sourceUserId?: bigint;
  sourceUserName?: string;
  sourceUserAddress?: string;
}

export interface TransactionData {
  transactions: Transaction[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Formats a bigint amount to USD string
 */
function formatToUSD(amount: bigint): string {
  const value = Number(amount) / 1e18;
  return value.toFixed(2);
}

/**
 * Maps contract transaction type string to our TransactionType
 */
function mapTransactionType(typeString: string): TransactionType {
  const lowerType = typeString.toLowerCase();
  
  if (lowerType.includes('registration') || lowerType.includes('register')) {
    return 'registration';
  }
  if (lowerType.includes('activation') || lowerType.includes('activate')) {
    return 'activation';
  }
  if (lowerType.includes('level') || lowerType.includes('income')) {
    return 'level_income';
  }
  if (lowerType.includes('withdrawal') || lowerType.includes('withdraw')) {
    return 'withdrawal';
  }
  if (lowerType.includes('global') || lowerType.includes('pool')) {
    return 'global_pool';
  }
  if (lowerType.includes('non') || lowerType.includes('working')) {
    return 'non_working';
  }
  if (lowerType.includes('profile')) {
    return 'profile_update';
  }
  
  return 'all';
}

/**
 * Hook to fetch transaction history from the USDTRain contract
 * 
 * @param userId - The user's ID in the contract
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of transactions per page
 * @param filterType - Filter by transaction type
 * @returns Query result with transaction data
 */
export function useTransactions(
  userId?: bigint | null,
  page: number = 1,
  pageSize: number = 20,
  filterType: TransactionType = 'all'
) {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'transactions', userId?.toString(), page, pageSize, filterType],
    queryFn: async (): Promise<TransactionData | null> => {
      if (!userId || userId === BigInt(0) || !provider) {
        return null;
      }

      try {
        const contract = getReadContract(provider);

        // Fetch all transactions for the user
        const rawTransactions = await contract.getUserTransactions(userId);
        
        const transactionsPromises = rawTransactions.map(async (tx: any) => {
          let userName = '';
          let txUserId: bigint | undefined;
          let sourceUserId: bigint | undefined;
          let sourceUserName: string | undefined;
          let sourceUserAddress: string | undefined;
          
          try {
            txUserId = await contract.getUserIdByAddress(tx.userAddress);
            
            if (txUserId && Number(txUserId) > 0) {
              try {
                const profile = await contract.getUserProfile(tx.userAddress);
                userName = profile.userName || '';
              } catch (e) {
                // Profile might not be set
              }
            }
          } catch (e) {
            // User might not be registered
          }
          
          const txType = mapTransactionType(tx.transactionType);
          
          console.log('Transaction data:', {
            id: tx.transactionId?.toString(),
            type: tx.transactionType,
            hasSourceUserId: !!tx.sourceUserId,
            sourceUserId: tx.sourceUserId?.toString(),
            level: tx.level?.toString(),
          });
          
          if (tx.sourceUserId && Number(tx.sourceUserId) > 0) {
            sourceUserId = tx.sourceUserId;
            
            try {
              sourceUserAddress = await contract.getUserAddressById(sourceUserId);
              const sourceProfile = await contract.getUserProfile(sourceUserAddress);
              sourceUserName = sourceProfile.userName || undefined;
            } catch (e) {
              console.warn('Error fetching source user profile:', e);
            }
          }
          
          return {
            transactionId: tx.transactionId,
            userAddress: tx.userAddress,
            userName: userName || undefined,
            userId: txUserId,
            type: txType,
            amount: tx.amount,
            amountUSD: formatToUSD(tx.amount),
            level: tx.level && Number(tx.level) > 0 ? Number(tx.level) : undefined,
            timestamp: new Date(Number(tx.timestamp) * 1000),
            status: 'confirmed' as const,
            sourceUserId,
            sourceUserName,
            sourceUserAddress,
          };
        });
        
        let transactions: Transaction[] = await Promise.all(transactionsPromises);

        // Filter by type if specified
        if (filterType !== 'all') {
          transactions = transactions.filter(tx => tx.type === filterType);
        }

        // Sort by timestamp (newest first)
        transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        const totalCount = transactions.length;

        // Apply pagination
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalCount);
        const paginatedTransactions = transactions.slice(startIndex, endIndex);

        return {
          transactions: paginatedTransactions,
          totalCount,
          hasMore: endIndex < totalCount,
        };
      } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }
    },
    enabled: !!userId && userId !== BigInt(0) && !!provider,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    retry: 2,
  });
}

/**
 * Hook to fetch recent transactions (lightweight)
 * 
 * @param userId - The user's ID
 * @param count - Number of recent transactions to fetch
 * @returns Query result with recent transactions
 */
export function useRecentTransactions(userId?: bigint | null, count: number = 10) {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'recentTransactions', userId?.toString(), count],
    queryFn: async (): Promise<Transaction[] | null> => {
      if (!userId || userId === BigInt(0) || !provider) {
        return null;
      }

      try {
        const contract = getReadContract(provider);

        // Try to use getUserRecentTransactions if available
        let rawTransactions;
        try {
          rawTransactions = await contract.getUserRecentTransactions(userId, count);
        } catch (e) {
          // Fallback to getUserTransactions and slice
          const allTransactions = await contract.getUserTransactions(userId);
          rawTransactions = allTransactions.slice(-count);
        }

        // Map to our Transaction type
        const transactions: Transaction[] = rawTransactions.map((tx: any) => ({
          transactionId: tx.transactionId,
          userAddress: tx.userAddress,
          type: mapTransactionType(tx.transactionType),
          amount: tx.amount,
          amountUSD: formatToUSD(tx.amount),
          level: tx.level && Number(tx.level) > 0 ? Number(tx.level) : undefined,
          timestamp: new Date(Number(tx.timestamp) * 1000),
          status: 'confirmed' as const,
        }));

        // Sort by timestamp (newest first)
        transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        return transactions;
      } catch (error) {
        console.error('Error fetching recent transactions:', error);
        throw error;
      }
    },
    enabled: !!userId && userId !== BigInt(0) && !!provider,
    staleTime: 30000,
    refetchInterval: 60000,
    retry: 2,
  });
}

/**
 * Hook to get transaction statistics
 * 
 * @param userId - The user's ID
 * @returns Query result with transaction stats
 */
export function useTransactionStats(userId?: bigint | null) {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'transactionStats', userId?.toString()],
    queryFn: async () => {
      if (!userId || userId === BigInt(0) || !provider) {
        return null;
      }

      try {
        const contract = getReadContract(provider);
        const rawTransactions = await contract.getUserTransactions(userId);

        // Calculate statistics
        const transactions = rawTransactions.map((tx: any) => ({
          type: mapTransactionType(tx.transactionType),
          amount: tx.amount,
        }));

        const stats = {
          total: transactions.length,
          byType: {
            registration: 0,
            activation: 0,
            level_income: 0,
            withdrawal: 0,
            global_pool: 0,
            non_working: 0,
            profile_update: 0,
          },
          totalIncome: BigInt(0),
          totalWithdrawn: BigInt(0),
        };

        transactions.forEach((tx: any) => {
          stats.byType[tx.type as keyof typeof stats.byType]++;
          
          if (tx.type === 'level_income' || tx.type === 'global_pool' || tx.type === 'non_working') {
            stats.totalIncome += tx.amount;
          }
          
          if (tx.type === 'withdrawal') {
            stats.totalWithdrawn += tx.amount;
          }
        });

        return {
          ...stats,
          totalIncomeUSD: formatToUSD(stats.totalIncome),
          totalWithdrawnUSD: formatToUSD(stats.totalWithdrawn),
        };
      } catch (error) {
        console.error('Error fetching transaction stats:', error);
        return null;
      }
    },
    enabled: !!userId && userId !== BigInt(0) && !!provider,
    staleTime: 60000,
    retry: 2,
  });
}
