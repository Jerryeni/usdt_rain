import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';
import { useToast } from '@/components/ui/use-toast';
import { UserInfo } from '../contracts/USDTRain';

/**
 * Hook to fetch user information from the USDTRain contract
 */
export function useUserInfo(userAddress?: string | null) {
  const { provider } = useWallet();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['usdtrain', 'userInfo', userAddress],
    queryFn: async (): Promise<UserInfo | null> => {
      if (!userAddress || !provider) {
        return null;
      }

      try {
        const contract = getReadContract(provider);
        const result = await contract.getUserInfo(userAddress);

        return {
          userId: result[0],
          sponsorId: result[1],
          directReferrals: result[2],
          totalEarned: result[3],
          totalWithdrawn: result[4],
          isActive: result[5],
          activationTimestamp: result[6],
          nonWorkingClaimed: result[7],
          achieverLevel: result[8],
          userName: result[9],
          contactNumber: result[10],
        };
      } catch (error) {
          console.error('Error fetching user info:', error);

          // For network errors, don't show toast immediately - let the component handle it
          if (error instanceof TypeError && error.message.includes('NetworkError')) {
            console.log('Network error detected, returning null for graceful fallback');
            return null;
          }

          // Only show toast for non-network errors
          toast({
              title: "Failed to fetch user info",
              description: (error as Error)?.message || String(error),
              variant: "destructive",
          });
          throw error;
      }
    },
    enabled: !!userAddress && !!provider,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    retry: (failureCount, error) => {
      // Don't retry on network errors
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}