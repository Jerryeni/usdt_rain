import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

export interface PendingAchieverReward {
  userId: number;
  userAddress: string;
  userName: string;
  level: number;
  requirement: number;
  currentCount: number;
  meetsRequirement: boolean;
}

export function usePendingAchieverRewards() {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'pendingAchieverRewards'],
    queryFn: async (): Promise<PendingAchieverReward[]> => {
      if (!provider) {
        return [];
      }

      try {
        const contract = getReadContract(provider);
        
        // Get total users
        const totalUsers = await contract.totalUsers();
        const totalUsersNum = Number(totalUsers);
        
        // Get achiever requirements
        const requirements = await contract.getAchieverRequirements();
        const requirementsArray = requirements.map((r: bigint) => Number(r));
        
        const pendingRewards: PendingAchieverReward[] = [];
        
        // Check each user (starting from 1, as 0 is the first user/sponsor)
        for (let userId = 1; userId <= totalUsersNum; userId++) {
          try {
            const userAddress = await contract.getUserAddressById(BigInt(userId));
            
            // Skip if address is zero (invalid user)
            if (userAddress === '0x0000000000000000000000000000000000000000') {
              continue;
            }
            
            // Get user info
            const userInfo = await contract.getUserInfo(userAddress);
            const userName = userInfo[9] || `User ${userId}`;
            const directReferrals = Number(userInfo[2]);
            
            // Get level counts
            const levelCounts = await contract.getUserLevelCounts10ById(BigInt(userId));
            const levelCountsArray = Array.from(levelCounts as bigint[]).map(c => Number(c));
            
            // Check each achiever level
            for (let level = 1; level <= requirementsArray.length; level++) {
              const requirement = requirementsArray[level - 1];
              
              // Determine current count based on level
              let currentCount = 0;
              if (level === 1) {
                currentCount = directReferrals;
              } else {
                const networkLevelIndex = level - 2;
                currentCount = levelCountsArray[networkLevelIndex] || 0;
              }
              
              const meetsRequirement = currentCount >= requirement;
              
              // Check if already rewarded
              const isRewarded = await contract.isAchieverRewarded(BigInt(userId), BigInt(level));
              
              // If user meets requirement but hasn't been rewarded, add to pending list
              if (meetsRequirement && !isRewarded) {
                pendingRewards.push({
                  userId,
                  userAddress,
                  userName,
                  level,
                  requirement,
                  currentCount,
                  meetsRequirement,
                });
              }
            }
          } catch (error) {
            console.warn(`Error checking user ${userId}:`, error);
            continue;
          }
        }
        
        return pendingRewards;
      } catch (error) {
        console.error('Error fetching pending achiever rewards:', error);
        return [];
      }
    },
    enabled: !!provider,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
