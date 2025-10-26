import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

/**
 * Hook to check if the current wallet is the contract owner or first registered user
 * Admin access is granted to:
 * 1. Contract owner
 * 2. First registered user (the one who registered with sponsor ID 0)
 */
export function useIsOwner() {
  const { address, provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'isOwner', address],
    queryFn: async (): Promise<boolean> => {
      if (!address || !provider) {
        return false;
      }

      try {
        const contract = getReadContract(provider);
        
        // Check if user is the contract owner
        const ownerAddress = await contract.owner();
        
        if (ownerAddress.toLowerCase() === address.toLowerCase()) {
          return true;
        }
        
        // Check if user is the first registered user (sponsor ID 0)
        try {
          const userInfo = await contract.getUserInfo(address);
          const sponsorId = Number(userInfo[1]); // sponsorId is at index 1
          
          // First user has sponsor ID 0
          if (sponsorId === 0) {
            return true;
          }
        } catch (error) {
          // User might not be registered yet
          return false;
        }
        
        return false;
      } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
    },
    enabled: !!address && !!provider,
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // Refetch every 2 minutes
  });
}
