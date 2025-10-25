import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

export interface AchieverRewardsData {
  currentLevel: number;
  currentCount: number;
  nextLevelRequirement: number;
  progressPercentage: number;
  requirements: number[];
  levelCounts: number[]; // [level1Count, level2Count, level3Count, level4Count, level5Count]
  achievedLevels: number[];
  directReferrals: number;
  levelDetails: {
    level: number;
    requirement: number;
    currentCount: number;
    isAchieved: boolean;
    description: string;
  }[];
}

/**
 * Comprehensive hook for achiever rewards system
 * Implements the hierarchical achiever level structure:
 * - Level 1: Based on direct referrals
 * - Level 2: Based on count of Level 1 users in network
 * - Level 3: Based on count of Level 2 users in network
 * - Level 4: Based on count of Level 3 users in network
 * - Level 5: Based on count of Level 4 users in network
 */
export function useAchieverRewards(userAddress?: string | null) {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'achieverRewards', userAddress],
    queryFn: async (): Promise<AchieverRewardsData | null> => {
      if (!userAddress || !provider) {
        return null;
      }

      try {
        const contract = getReadContract(provider);
        
        // Get achiever progress (current level and progress to next)
        const progress = await contract.getAchieverProgress(userAddress);
        const currentLevel = Number(progress[0]);
        const currentCount = Number(progress[1]);
        const nextLevelRequirement = Number(progress[2]);
        const progressPercentage = Number(progress[3]);
        
        // Get achiever requirements (requirements for each level)
        const requirements = await contract.getAchieverRequirements();
        const requirementsArray = requirements.map((r: bigint) => Number(r));
        
        // Get level counts (count of users at each achiever level in network)
        const levelCounts = await contract.getUserLevelCounts(userAddress);
        const levelCountsArray = levelCounts.map((c: bigint) => Number(c));
        
        // Get achiever info (current level, achieved levels, direct referrals)
        const achieverInfo = await contract.getUserAchieverInfo(userAddress);
        const achievedLevels = achieverInfo[1].map((l: bigint) => Number(l));
        const directReferrals = Number(achieverInfo[2]);
        
        // Build detailed level information
        const levelDetails = requirementsArray.map((requirement: number, index: number) => {
          const level = index + 1;
          const isAchieved = achievedLevels.includes(level);
          
          // Determine current count for this level
          let count = 0;
          let description = '';
          
          if (level === 1) {
            // Level 1 is based on direct referrals
            count = directReferrals;
            description = `Requires ${requirement} direct referrals`;
          } else {
            // Level 2+ is based on count of users at previous level
            count = levelCountsArray[level - 2]; // level 2 uses levelCounts[0] (Level 1 count)
            description = `Requires ${requirement} users at Level ${level - 1}`;
          }
          
          return {
            level,
            requirement,
            currentCount: count,
            isAchieved,
            description,
          };
        });

        return {
          currentLevel,
          currentCount,
          nextLevelRequirement,
          progressPercentage,
          requirements: requirementsArray,
          levelCounts: levelCountsArray,
          achievedLevels,
          directReferrals,
          levelDetails,
        };
      } catch (error) {
        console.error('Error fetching achiever rewards:', error);
        return null;
      }
    },
    enabled: !!userAddress && !!provider,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}
