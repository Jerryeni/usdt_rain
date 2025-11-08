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
  sourceId?: bigint;
  sourceUserName?: string;
  timestamp: Date;
  txHash?: string;
  status: 'confirmed';
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
        const result = await contract.getUserTransactions(userId);
        
        // The function now returns arrays: ids, addresses, types, amounts, levels, timestamps, sourceIds
        const ids = result[0];
        const addresses = result[1];
        const types = result[2];
        const amounts = result[3];
        const levels = result[4];
        const timestamps = result[5];
        const sourceIds = result[6];
        
        const transactionsPromises = ids.map(async (_: any, index: number) => {
          let userName = '';
          let txUserId: bigint | undefined;
          let sourceUserName = '';
          
          try {
            const fetchedUserId = await contract.getUserIdByAddress(addresses[index]);
            
            // Ensure we have a valid userId before using it
            if (fetchedUserId !== undefined && fetchedUserId !== null) {
              txUserId = BigInt(fetchedUserId);
              
              if (txUserId && Number(txUserId) > 0) {
                try {
                  const userInfo = await contract.getUserInfo(addresses[index]);
                  userName = userInfo[9] || ''; // userName field
                } catch (e) {
                  // Profile might not be set
                  console.warn('Could not fetch user info for address:', addresses[index]);
                }
              }
            }
          } catch (e) {
            // User might not be registered yet
            console.warn('Could not fetch userId for address:', addresses[index], e);
          }
          
          // Fetch source user name if sourceId exists
          const sourceId = sourceIds[index];
          if (sourceId && Number(sourceId) > 0) {
            try {
              const sourceAddress = await contract.getUserAddressById(sourceId);
              if (sourceAddress && sourceAddress !== '0x0000000000000000000000000000000000000000') {
                try {
                  const sourceUserInfo = await contract.getUserInfo(sourceAddress);
                  sourceUserName = sourceUserInfo[9] || ''; // userName field
                } catch (e) {
                  console.warn('Could not fetch source user info for sourceId:', sourceId.toString());
                }
              }
            } catch (e) {
              console.warn('Could not fetch source user address for sourceId:', sourceId.toString());
            }
          }
          
          const txType = mapTransactionType(types[index]);
          
          return {
            transactionId: ids[index],
            userAddress: addresses[index],
            userName: userName || undefined,
            userId: txUserId,
            type: txType,
            amount: amounts[index],
            amountUSD: formatToUSD(amounts[index]),
            level: levels[index] && Number(levels[index]) > 0 ? Number(levels[index]) : undefined,
            sourceId: sourceIds[index] && Number(sourceIds[index]) > 0 ? sourceIds[index] : undefined,
            sourceUserName: sourceUserName || undefined,
            timestamp: new Date(Number(timestamps[index]) * 1000),
            status: 'confirmed' as const,
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
