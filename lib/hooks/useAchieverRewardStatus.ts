import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

export interface AchieverRewardStatus {
  level: number;
  hasAchieved: boolean;
  isRewarded: boolean;
  canClaim: boolean;
  status: 'not-eligible' | 'unclaimed' | 'claimed';
}

export interface AchieverRewardStatusData {
  levels: AchieverRewardStatus[];
}

/**
 * Hook to check achiever reward status for all levels
 * Checks if user has achieved each level and if they've claimed the reward
 */
export function useAchieverRewardStatus(userAddress?: string | null) {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'achieverRewardStatus', userAddress],
    queryFn: async (): Promise<AchieverRewardStatusData | null> => {
      if (!userAddress || !provider) {
        return null;
      }

      try {
        const contract = getReadContract(provider);
        
        // Get user ID first
        const userId = await contract.getUserIdByAddress(userAddress);
        
        // Get achiever info
        const achieverInfo = await contract.getUserAchieverInfo(userAddress);
        const achievedLevels = achieverInfo[1].map((l: bigint) => Number(l));
        
        // Check status for each level (1-5)
        const levels: AchieverRewardStatus[] = [];
        
        for (let level = 1; level <= 5; level++) {
          // Check if user has achieved this level
          const hasAchieved = await contract.hasUserAchievedLevel(userAddress, BigInt(level));
          
          // Check if reward has been claimed
          let isRewarded = false;
          try {
            isRewarded = await contract.isAchieverRewarded(userId, BigInt(level));
          } catch (error) {
            console.warn(`Error checking isAchieverRewarded for level ${level}:`, error);
          }
          
          // Determine status
          let status: 'not-eligible' | 'unclaimed' | 'claimed';
          let canClaim = false;
          
          if (!hasAchieved) {
            status = 'not-eligible';
          } else if (isRewarded) {
            status = 'claimed';
          } else {
            status = 'unclaimed';
            canClaim = true;
          }
          
          levels.push({
            level,
            hasAchieved,
            isRewarded,
            canClaim,
            status,
          });
        }
        
        return { levels };
      } catch (error) {
        console.error('Error fetching achiever reward status:', error);
        return null;
      }
    },
    enabled: !!userAddress && !!provider,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}
