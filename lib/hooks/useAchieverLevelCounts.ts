import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

export interface AchieverLevelCountsData {
  levelCounts: number[]; // Count of users at each achiever level [level1, level2, level3, level4, level5]
}

/**
 * Hook to fetch achiever level counts for a user
 * This shows how many users at each achiever level the user has in their network
 */
export function useAchieverLevelCounts(userAddress?: string | null) {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'achieverLevelCounts', userAddress],
    queryFn: async (): Promise<AchieverLevelCountsData | null> => {
      if (!userAddress || !provider) {
        return null;
      }

      try {
        const contract = getReadContract(provider);
        
        // Get level counts for the user
        const counts = await contract.getUserLevelCounts(userAddress);

        return {
          levelCounts: counts.map((c: bigint) => Number(c)),
        };
      } catch (error) {
        console.error('Error fetching achiever level counts:', error);
        return null;
      }
    },
    enabled: !!userAddress && !!provider,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}
