import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

export interface GlobalPoolData {
  balance: bigint;
  balanceUSD: string;
  percentage: bigint;
  userEligible: boolean;
  userShare: bigint;
  userShareUSD: string;
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
        
        // Calculate user eligibility and share if address provided
        let userEligible = false;
        let userShare = BigInt(0);
        
        if (userAddress) {
          try {
            const userInfo = await contract.getUserInfo(userAddress);
            userEligible = userInfo[5]; // isActive
            
            if (userEligible) {
              // Get eligible users count
              const stats = await contract.getContractStats();
              const eligibleCount = stats[4]; // _eligibleUsersCount
              
              if (eligibleCount > BigInt(0)) {
                userShare = balance / eligibleCount;
              }
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
          userShare,
          userShareUSD: (Number(userShare) / 1e18).toFixed(2),
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
