import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

export interface AchieverRewardsData {
  currentLevel: number;
  currentCount: number;
  nextLevelRequirement: number;
  progressPercentage: number;
  requirements: number[];
  levelCounts: number[];
  achievedLevels: number[];
  directReferrals: number;
  userId: bigint;
  levelDetails: {
    level: number;
    requirement: number;
    currentCount: number;
    meetsRequirement: boolean;
    isMarkedByAdmin: boolean;
    isRewarded: boolean;
    needsAdminApproval: boolean;
    canClaim: boolean;
    rewardStatus: 'not-eligible' | 'pending-admin' | 'unclaimed' | 'claimed';
    description: string;
  }[];
}

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
        
        const progress = await contract.getAchieverProgress(userAddress);
        const currentLevel = Number(progress[0]);
        const currentCount = Number(progress[1]);
        const nextLevelRequirement = Number(progress[2]);
        const progressPercentage = Number(progress[3]);
        
        const requirements = await contract.getAchieverRequirements();
        const requirementsArray = requirements.map((r: bigint) => Number(r));
        
        const achieverInfo = await contract.getUserAchieverInfo(userAddress);
        const achievedLevels = achieverInfo[1].map((l: bigint) => Number(l));
        const directReferrals = Number(achieverInfo[2]);
        
        const userId = await contract.getUserIdByAddress(userAddress);
        
        const levelCounts10 = await contract.getUserLevelCounts10(userAddress);
        const levelCountsArray = Array.from(levelCounts10 as bigint[]).map(c => Number(c));
        
        const levelDetails = await Promise.all(
          requirementsArray.map(async (requirement: number, index: number) => {
            const level = index + 1;
            
            let count = 0;
            let description = '';
            
            if (level === 1) {
              // Level 1 requires direct referrals
              count = directReferrals;
              description = `Requires ${requirement} direct referrals`;
            } else {
              // Level 2+ requires users at the previous network level
              // levelCountsArray[0] = Level 1 users, levelCountsArray[1] = Level 2 users, etc.
              // For Achiever Level 2, we need Level 1 users (index 0)
              // For Achiever Level 3, we need Level 2 users (index 1), etc.
              const networkLevelIndex = level - 2;
              count = levelCountsArray[networkLevelIndex] || 0;
              description = `Requires ${requirement} users at Network Level ${level - 1}`;
            }
            
            const meetsRequirement = count >= requirement;
            
            // Check if admin has rewarded this level (automatically rewards when marked)
            let isRewarded = false;
            try {
              isRewarded = await contract.isAchieverRewarded(userId, BigInt(level));
            } catch (error) {
              console.warn(`Error checking reward status for level ${level}:`, error);
            }
            
            let rewardStatus: 'not-eligible' | 'pending-admin' | 'unclaimed' | 'claimed';
            let needsAdminApproval = false;
            let canClaim = false;
            let isMarkedByAdmin = isRewarded;
            
            if (!meetsRequirement) {
              // User hasn't met the level count requirement yet
              rewardStatus = 'not-eligible';
            } else if (isRewarded) {
              // Admin has marked and automatically rewarded the user
              rewardStatus = 'claimed';
            } else {
              // User meets requirement but admin hasn't marked yet - contact admin
              rewardStatus = 'pending-admin';
              needsAdminApproval = true;
            }
            
            return {
              level,
              requirement,
              currentCount: count,
              meetsRequirement,
              isMarkedByAdmin,
              isRewarded,
              needsAdminApproval,
              canClaim,
              rewardStatus,
              description,
            };
          })
        );

        return {
          currentLevel,
          currentCount,
          nextLevelRequirement,
          progressPercentage,
          requirements: requirementsArray,
          levelCounts: levelCountsArray,
          achievedLevels,
          directReferrals,
          userId,
          levelDetails,
        };
      } catch (error) {
        console.error('Error fetching achiever rewards:', error);
        return null;
      }
    },
    enabled: !!userAddress && !!provider,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
