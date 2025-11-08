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
  needsAdminApproval: boolean;
  hasReceivedReward: boolean;
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
        let needsAdminApproval = false;
        let hasReceivedReward = false;

        if (userAddress) {
          try {
            const userInfo = await contract.getUserInfo(userAddress);
            const userId = userInfo[0]; // userId
            const isActive = userInfo[5]; // isActive
            
            // Check if user is in the eligible users list (admin-approved)
            try {
              eligibleUsers = await contract.getEligibleUsers();
              userInEligibleList = eligibleUsers.some(
                (addr: string) => addr.toLowerCase() === userAddress.toLowerCase()
              );
              eligibleUsersCount = eligibleUsers.length;
            } catch (error) {
              console.warn('Could not fetch eligible users list:', error);
            }

            // User is eligible if they are active AND in the eligible list
            userEligible = isActive && userInEligibleList;
            
            // User needs admin approval if they are active but NOT in the eligible list
            needsAdminApproval = isActive && !userInEligibleList;

            if (userInEligibleList && eligibleUsersCount > 0) {
              // Calculate share based on eligible users count
              userShare = balance / BigInt(eligibleUsersCount);
            }

            // Calculate total global pool claimed by this user from transactions
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

        return {
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
          needsAdminApproval,
          hasReceivedReward,
        };
      } catch (error) {
        console.error('Error fetching global pool data:', error);
        return null;
      }
    },
    enabled: !!provider,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}
