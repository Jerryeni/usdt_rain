import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

export interface NonWorkingIncomeData {
  totalClaimed: bigint;
  totalClaimedUSD: string;
  lastClaimTime: bigint;
  canClaim: boolean;
  nextClaimTime: bigint;
  achieverLevel: bigint;
  hasDirectReferrals: boolean;
}

/**
 * Hook to fetch non-working income (monthly rewards) information
 */
export function useNonWorkingIncome(userAddress?: string | null) {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'nonWorkingIncome', userAddress],
    queryFn: async (): Promise<NonWorkingIncomeData | null> => {
      if (!userAddress || !provider) {
        return null;
      }

      try {
        const contract = getReadContract(provider);
        
        // Get user info which includes non-working income data
        const userInfo = await contract.getUserInfo(userAddress);
        
        const totalClaimed = userInfo[7]; // nonWorkingClaimed
        const achieverLevel = userInfo[8]; // achieverLevel
        const isActive = userInfo[5]; // isActive
        const directReferrals = userInfo[2]; // directReferrals
        
        // Get user struct to get last claim time
        const users = await contract.users(userAddress);
        const lastClaimTime = BigInt(users[8] || 0); // lastNonWorkingClaim is at index 8
        
        // Get NON_WORKING_DURATION constant (30 days in seconds)
        const nonWorkingDuration = await contract.NON_WORKING_DURATION();
        
        // Calculate next claim time
        const nextClaimTime = lastClaimTime + nonWorkingDuration;
        const currentTime = BigInt(Math.floor(Date.now() / 1000));
        
        // User can claim if they are active, have NO direct referrals, and enough time has passed
        // Monthly rewards are ONLY for users WITHOUT direct referrals (non-working income)
        const hasNoDirectReferrals = Number(directReferrals) === 0;
        const canClaim = isActive && hasNoDirectReferrals && currentTime >= nextClaimTime;

        return {
          totalClaimed,
          totalClaimedUSD: (Number(totalClaimed) / 1e18).toFixed(2),
          lastClaimTime,
          canClaim,
          nextClaimTime,
          achieverLevel,
          hasDirectReferrals: !hasNoDirectReferrals,
        };
      } catch (error) {
        console.error('Error fetching non-working income data:', error);
        // Return default data instead of null to prevent "unavailable" message
        return {
          totalClaimed: BigInt(0),
          totalClaimedUSD: '0.00',
          lastClaimTime: BigInt(0),
          canClaim: false,
          nextClaimTime: BigInt(0),
          achieverLevel: BigInt(0),
          hasDirectReferrals: false,
        };
      }
    },
    enabled: !!userAddress && !!provider,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}
