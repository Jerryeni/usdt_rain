import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

export interface LevelIncome {
  level: number;
  percentage: number;
  earned: bigint;
  withdrawn: bigint;
  available: bigint;
  earnedUSD: string;
  withdrawnUSD: string;
  availableUSD: string;
}

export interface LevelIncomeData {
  levels: LevelIncome[];
  totals: {
    earned: bigint;
    withdrawn: bigint;
    available: bigint;
    earnedUSD: string;
    withdrawnUSD: string;
    availableUSD: string;
  };
}

/**
 * Formats a bigint amount to USD string with 2 decimal places
 */
function formatToUSD(amount: bigint): string {
  const value = Number(amount) / 1e18;
  return value.toFixed(2);
}

/**
 * Hook to fetch level income data from the USDTRain contract
 * 
 * Fetches:
 * - Earned amounts per level
 * - Withdrawn amounts per level
 * - Available amounts per level
 * - Level percentages
 * 
 * @param userAddress - The user's wallet address
 * @returns Query result with level income data
 */
export function useLevelIncome(userAddress?: string | null) {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'levelIncome', userAddress],
    queryFn: async (): Promise<LevelIncomeData | null> => {
      if (!userAddress || !provider) {
        return null;
      }

      try {
        const contract = getReadContract(provider);

        // Try to use the new optimized function first
        let earnedArray, withdrawnArray, availableArray, totalEarned, totalWithdrawn, totalAvailable;
        
        try {
          // Get user ID first
          const userId = await contract.getUserIdByAddress(userAddress);
          
          // Use new getLevelIncomeStatsById function (single call!)
          const stats = await contract.getLevelIncomeStatsById(userId);
          earnedArray = stats.earned || stats[0];
          withdrawnArray = stats.withdrawn || stats[1];
          availableArray = stats.available || stats[2];
          totalEarned = stats.totalEarned || stats[3];
          totalWithdrawn = stats.totalWithdrawn || stats[4];
          totalAvailable = stats.totalAvailable || stats[5];
        } catch (error) {
          console.warn('getLevelIncomeStatsById not available, using fallback');
          // Fallback to old method (multiple calls)
          [earnedArray, withdrawnArray, availableArray] = await Promise.all([
            contract.getUserLevelIncome(userAddress),
            contract.getUserLevelWithdrawn(userAddress),
            contract.getUserAvailableLevelIncome(userAddress),
          ]);
          
          // Calculate totals manually
          totalEarned = earnedArray.reduce((sum: bigint, val: bigint) => sum + val, BigInt(0));
          totalWithdrawn = withdrawnArray.reduce((sum: bigint, val: bigint) => sum + val, BigInt(0));
          totalAvailable = availableArray.reduce((sum: bigint, val: bigint) => sum + val, BigInt(0));
        }

        // Fetch level percentages (0-9 for 10 levels)
        const percentagePromises = Array.from({ length: 10 }, (_, i) =>
          contract.LEVEL_PERCENTAGES(i)
        );
        const percentages = await Promise.all(percentagePromises);

        // Build level income array
        const levels: LevelIncome[] = Array.from({ length: 10 }, (_, i) => {
          const earned = earnedArray[i];
          const withdrawn = withdrawnArray[i];
          const available = availableArray[i];
          const percentage = Number(percentages[i]);

          return {
            level: i + 1,
            percentage,
            earned,
            withdrawn,
            available,
            earnedUSD: formatToUSD(earned),
            withdrawnUSD: formatToUSD(withdrawn),
            availableUSD: formatToUSD(available),
          };
        });

        // Use totals from contract if available, otherwise calculate
        return {
          levels,
          totals: {
            earned: totalEarned,
            withdrawn: totalWithdrawn,
            available: totalAvailable,
            earnedUSD: formatToUSD(totalEarned),
            withdrawnUSD: formatToUSD(totalWithdrawn),
            availableUSD: formatToUSD(totalAvailable),
          },
        };
      } catch (error) {
        console.error('Error fetching level income:', error);
        throw error;
      }
    },
    enabled: !!userAddress && !!provider,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    retry: 2,
  });
}

/**
 * Hook to fetch level income statistics with additional details
 * 
 * This is an alternative hook that uses the getLevelIncomeStats function
 * which returns more detailed information in a single call
 * 
 * @param userAddress - The user's wallet address
 * @returns Query result with detailed level income stats
 */
export function useLevelIncomeStats(userAddress?: string | null) {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'levelIncomeStats', userAddress],
    queryFn: async () => {
      if (!userAddress || !provider) {
        return null;
      }

      try {
        const contract = getReadContract(provider);
        const stats = await contract.getLevelIncomeStats(userAddress);

        // stats returns: [earned, withdrawn, available, totalEarned, totalWithdrawn, totalAvailable]
        const [earnedArray, withdrawnArray, availableArray, totalEarned, totalWithdrawn, totalAvailable] = stats;

        // Fetch level percentages
        const percentagePromises = Array.from({ length: 10 }, (_, i) =>
          contract.LEVEL_PERCENTAGES(i)
        );
        const percentages = await Promise.all(percentagePromises);

        // Build level income array
        const levels: LevelIncome[] = Array.from({ length: 10 }, (_, i) => {
          const earned = earnedArray[i];
          const withdrawn = withdrawnArray[i];
          const available = availableArray[i];
          const percentage = Number(percentages[i]);

          return {
            level: i + 1,
            percentage,
            earned,
            withdrawn,
            available,
            earnedUSD: formatToUSD(earned),
            withdrawnUSD: formatToUSD(withdrawn),
            availableUSD: formatToUSD(available),
          };
        });

        return {
          levels,
          totals: {
            earned: totalEarned,
            withdrawn: totalWithdrawn,
            available: totalAvailable,
            earnedUSD: formatToUSD(totalEarned),
            withdrawnUSD: formatToUSD(totalWithdrawn),
            availableUSD: formatToUSD(totalAvailable),
          },
        };
      } catch (error) {
        console.error('Error fetching level income stats:', error);
        // Fall back to null if this function doesn't exist in the contract
        return null;
      }
    },
    enabled: !!userAddress && !!provider,
    staleTime: 30000,
    refetchInterval: 60000,
    retry: 1,
  });
}
