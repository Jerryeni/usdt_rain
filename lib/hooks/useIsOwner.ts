import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

/**
 * Hook to check if the current wallet is the contract owner or first user (user ID 1)
 * Admin access is granted to:
 * 1. Contract owner
 * 2. First registered user (user ID 1)
 */
export function useIsOwner() {
  const { address, provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'isOwner', address],
    queryFn: async (): Promise<boolean> => {
      if (!address || !provider) {
        console.log('useIsOwner: No address or provider');
        return false;
      }

      try {
        const contract = getReadContract(provider);
        
        // Check if user is the contract owner
        const ownerAddress = await contract.owner();
        console.log('useIsOwner: Contract owner:', ownerAddress);
        console.log('useIsOwner: Current address:', address);
        
        if (ownerAddress.toLowerCase() === address.toLowerCase()) {
          console.log('useIsOwner: User is contract owner - granting access');
          return true;
        }
        
        // Check if user is the first registered user (user ID 1)
        try {
          const userId = await contract.getUserIdByAddress(address);
          const userIdNumber = Number(userId);
          console.log('useIsOwner: User ID:', userIdNumber);
          
          if (userIdNumber === 1) {
            console.log('useIsOwner: User is first user (ID 1) - granting access');
            return true;
          }
          
          if (userIdNumber === 0) {
            console.log('useIsOwner: User not registered yet (ID 0)');
          } else {
            console.log('useIsOwner: User is registered but not first user');
          }
        } catch (error: any) {
          // User might not be registered yet or contract call failed
          console.log('useIsOwner: Error checking user ID:', error.message || error);
        }
        
        console.log('useIsOwner: Access denied - not owner or first user');
        return false;
      } catch (error: any) {
        console.error('useIsOwner: Error checking owner status:', error.message || error);
        return false;
      }
    },
    enabled: !!address && !!provider,
    staleTime: 30000, // 30 seconds (reduced for testing)
    refetchInterval: 60000, // Refetch every minute (reduced for testing)
  });
}
