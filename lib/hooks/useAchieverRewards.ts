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
              count = directReferrals;
              description = `Requires ${requirement} direct referrals`;
            } else {
              count = levelCountsArray[level - 2];
              description = `Requires ${requirement} Level ${level - 1} users`;
            }
            
            const meetsRequirement = count >= requirement;
            
            let isMarkedByAdmin = false;
            try {
              isMarkedByAdmin = await contract.hasUserAchievedLevel(userAddress, BigInt(level));
            } catch (error) {
              console.warn(`Error checking admin mark for level ${level}:`, error);
            }
            
            let isRewarded = false;
            try {
              isRewarded = await contract.isAchieverRewarded(userId, BigInt(level));
            } catch (error) {
              console.warn(`Error checking reward status for level ${level}:`, error);
            }
            
            let rewardStatus: 'not-eligible' | 'pending-admin' | 'unclaimed' | 'claimed';
            let needsAdminApproval = false;
            let canClaim = false;
            
            if (!meetsRequirement) {
              rewardStatus = 'not-eligible';
            } else if (!isMarkedByAdmin) {
              rewardStatus = 'pending-admin';
              needsAdminApproval = true;
            } else if (isRewarded) {
              rewardStatus = 'claimed';
            } else {
              rewardStatus = 'unclaimed';
              canClaim = true;
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
