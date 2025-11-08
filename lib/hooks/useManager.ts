import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReadContract, getWriteContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

/**
 * Hook to get the current manager address
 */
export function useManager() {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'manager'],
    queryFn: async (): Promise<string | null> => {
      if (!provider) return null;

      try {
        const contract = getReadContract(provider);
        const manager = await contract.manager();
        return manager;
      } catch (error) {
        console.error('Error fetching manager:', error);
        return null;
      }
    },
    enabled: !!provider,
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // Refetch every 2 minutes
  });
}

/**
 * Hook to check if current user is the manager
 */
export function useIsManager() {
  const { address } = useWallet();
  const { data: manager } = useManager();

  if (!address || !manager) return false;
  
  // Check if current address matches manager address (case-insensitive)
  return address.toLowerCase() === manager.toLowerCase();
}

/**
 * Hook to check if current user is owner or manager
 */
export function useIsOwnerOrManager() {
  const { address } = useWallet();
  const { data: manager } = useManager();
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'isOwnerOrManager', address],
    queryFn: async (): Promise<boolean> => {
      if (!address || !provider) return false;

      try {
        const contract = getReadContract(provider);
        
        // Check if user is owner
        const owner = await contract.owner();
        if (address.toLowerCase() === owner.toLowerCase()) {
          return true;
        }

        // Check if user is manager
        if (manager && address.toLowerCase() === manager.toLowerCase()) {
          return true;
        }

        return false;
      } catch (error) {
        console.error('Error checking owner/manager status:', error);
        return false;
      }
    },
    enabled: !!address && !!provider,
    staleTime: 60000,
  });
}

/**
 * Hook to set a new manager (owner only)
 */
export function useSetManager() {
  const { signer } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newManager: string) => {
      if (!signer) throw new Error('Wallet not connected');

      // Validate address format
      if (!newManager.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid Ethereum address format');
      }

      const contract = getWriteContract(signer);
      
      try {
        const tx = await contract.setManager(newManager);
        const receipt = await tx.wait();

        return {
          transactionHash: receipt.hash,
          newManager,
        };
      } catch (error: any) {
        // Parse common errors
        if (error.message?.includes('OwnableUnauthorizedAccount')) {
          throw new Error('Only the contract owner can set the manager');
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate manager queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'manager'] });
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'isOwnerOrManager'] });
    },
  });
}
