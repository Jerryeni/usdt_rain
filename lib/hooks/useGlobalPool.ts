import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

export interface GlobalPoolData {
  balance: bigint;
  balanceUSD: string;
  percentage: bigint;
  userEligible: boolean;
  userInEligibleList: boolean;
  userShare: bigint;
  userShareUSD: string;
  totalClaimed: bigint;
  totalClaimedUSD: string;
  eligibleUsersCount: number;
  eligibleUsers: string[];
  hasReceivedReward: boolean;
  canRequestEligibility: boolean;
  isPendingApproval: boolean;
  // New fields from getGlobalPoolStats
  totalAllocated: bigint;
  totalAllocatedUSD: string;
  totalPending: bigint;
  totalPendingUSD: string;
  // User-specific from getUserGlobalPoolInfo
  userPending: bigint;
  userPendingUSD: string;
  userClaimed: bigint;
  userClaimedUSD: string;
}

/**
 * Hook to fetch global pool information
 */
export function useGlobalPool(userAddress?: string | null) {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'globalPool', userAddress],
    queryFn: async (): Promise<GlobalPoolData | null> => {
      if (!provider) {
        return null;
      }

      try {
        const contract = getReadContract(provider);

        // Get global pool balance
        const balance = await contract.globalPoolBalance();

        // Get global pool percentage
        const percentage = await contract.globalPoolPercentage();

        // Calculate user eligibility, share, and total claimed
        let userEligible = false;
        let userInEligibleList = false;
        let userShare = BigInt(0);
        let totalClaimed = BigInt(0);
        let eligibleUsersCount = 0;
        let eligibleUsers: string[] = [];
        let hasReceivedReward = false;
        let canRequestEligibility = false;
        let isPendingApproval = false;
        
        // New global pool stats
        let totalAllocated = BigInt(0);
        let totalPending = BigInt(0);
        let userPending = BigInt(0);
        let userClaimed = BigInt(0);

        // Fetch eligible users list and count from contract
        console.log('🔍 Fetching eligible users from contract...');
        try {
          eligibleUsers = await contract.getEligibleUsers();
          console.log('✅ Fetched eligible users array:', eligibleUsers);
          
          // IMPORTANT: Always use array length, NOT eligibleUserCount()
          // The contract's eligibleUserCount() function is not being updated correctly
          // It returns 0 even when there are users in the array
          eligibleUsersCount = eligibleUsers.length;
          console.log('📊 Using array length as count:', eligibleUsersCount);
          
        } catch (error) {
          console.error('❌ Could not fetch eligible users list:', error);
        }
        
        console.log('📈 Final eligibleUsersCount:', eligibleUsersCount);
        console.log('📋 Final eligibleUsers array:', eligibleUsers);
        
        // Fetch global pool stats
        try {
          const stats = await contract.getGlobalPoolStats();
          totalAllocated = stats[0]; // totalAllocated
          totalClaimed = stats[1]; // totalClaimed
          totalPending = stats[2]; // totalPending
          const statsEligibleCount = Number(stats[3]); // eligibleCount
          
          // Use the count from stats if available
          if (statsEligibleCount > 0) {
            eligibleUsersCount = statsEligibleCount;
          }
          
          console.log('📊 Global Pool Stats:', {
            totalAllocated: (Number(totalAllocated) / 1e18).toFixed(2),
            totalClaimed: (Number(totalClaimed) / 1e18).toFixed(2),
            totalPending: (Number(totalPending) / 1e18).toFixed(2),
            eligibleCount: statsEligibleCount
          });
        } catch (error) {
          console.error('Could not fetch global pool stats:', error);
        }

        if (userAddress) {
          try {
            const userInfo = await contract.getUserInfo(userAddress);
            const userId = userInfo[0]; // userId
            const isActive = userInfo[5]; // isActive
            
            // Check if user is in the eligible users list (admin-approved)
            userInEligibleList = eligibleUsers.some(
              (addr: string) => addr.toLowerCase() === userAddress.toLowerCase()
            );

            // User is eligible if they are active AND in the eligible list
            userEligible = isActive && userInEligibleList;
            
            // Check if user can request eligibility (10+ referrals, active, not in list)
            const directReferrals = Number(userInfo[2] || 0);
            canRequestEligibility = isActive && !userInEligibleList && directReferrals >= 10;
            
            // If user has 10+ referrals but not in list, they're pending approval
            isPendingApproval = isActive && !userInEligibleList && directReferrals >= 10;

            if (userInEligibleList && eligibleUsersCount > 0) {
              // Calculate share based on eligible users count
              userShare = balance / BigInt(eligibleUsersCount);
            }
            
            // Fetch user-specific global pool info
            try {
              const userPoolInfo = await contract.getUserGlobalPoolInfo(userAddress);
              userPending = userPoolInfo[0]; // pending
              userClaimed = userPoolInfo[1]; // claimed
              
              console.log('👤 User Global Pool Info:', {
                pending: (Number(userPending) / 1e18).toFixed(2),
                claimed: (Number(userClaimed) / 1e18).toFixed(2)
              });
              
              // User has received reward if they have claimed anything
              hasReceivedReward = userClaimed > BigInt(0);
            } catch (error) {
              console.warn('Could not fetch user global pool info:', error);
            }

            // Calculate total global pool claimed by this user from transactions (legacy)
            try {
              const result = await contract.getUserTransactions(userId);
              const types = result[2]; // transaction types array
              const amounts = result[3]; // amounts array

              // Sum up all "Global Pool" transactions
              for (let i = 0; i < types.length; i++) {
                const txType = types[i];
                const amount = amounts[i];

                if (txType.toLowerCase().includes('global') || txType.toLowerCase().includes('pool')) {
                  totalClaimed += BigInt(amount);
                }
              }
              
              // If user has received global pool rewards, they've been rewarded
              hasReceivedReward = totalClaimed > BigInt(0);
            } catch (error) {
              console.warn('Could not fetch user transactions:', error);
            }
          } catch (error) {
            console.warn('Could not fetch user eligibility:', error);
          }
        }

        const result = {
          balance,
          balanceUSD: (Number(balance) / 1e18).toFixed(2),
          percentage,
          userEligible,
          userInEligibleList,
          userShare,
          userShareUSD: (Number(userShare) / 1e18).toFixed(2),
          totalClaimed,
          totalClaimedUSD: (Number(totalClaimed) / 1e18).toFixed(2),
          eligibleUsersCount,
          eligibleUsers,
          hasReceivedReward,
          canRequestEligibility,
          isPendingApproval,
          // New fields
          totalAllocated,
          totalAllocatedUSD: (Number(totalAllocated) / 1e18).toFixed(2),
          totalPending,
          totalPendingUSD: (Number(totalPending) / 1e18).toFixed(2),
          userPending,
          userPendingUSD: (Number(userPending) / 1e18).toFixed(2),
          userClaimed,
          userClaimedUSD: (Number(userClaimed) / 1e18).toFixed(2),
        };
        
        console.log('🎯 Returning GlobalPoolData:', {
          eligibleUsersCount: result.eligibleUsersCount,
          eligibleUsersLength: result.eligibleUsers.length,
          totalAllocated: result.totalAllocatedUSD,
          totalClaimed: result.totalClaimedUSD,
          totalPending: result.totalPendingUSD,
          userPending: result.userPendingUSD,
          userClaimed: result.userClaimedUSD,
        });
        
        return result;
      } catch (error) {
        console.error('Error fetching global pool data:', error);
        return null;
      }
    },
    enabled: !!provider,
    staleTime: 10000, // 10 seconds - shorter to see updates faster
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
