import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getWriteContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook for registering a new user in the USDTRain contract
 */
export function useRegisterUser() {
  const { signer } = useWallet();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sponsorId: bigint): Promise<{ transactionHash: string; userId: bigint }> => {
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      const contract = getWriteContract(signer);

      try {
        // Estimate gas first
        let gasEstimate;
        try {
          gasEstimate = await contract.registerUser.estimateGas(sponsorId);
          console.log('Gas estimate:', gasEstimate.toString());
        } catch (error) {
          console.warn('Gas estimation failed:', error);
          // Continue without gas estimate
        }

        // Send transaction
        const tx = await contract.registerUser(sponsorId, gasEstimate ? {
          gasLimit: gasEstimate * BigInt(12) / BigInt(10) // Add 20% buffer
        } : {});

        console.log('Transaction sent:', tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt?.hash);

        // Extract userId from transaction receipt or events
        // For now, we'll need to refetch user info after registration
        const userId = BigInt(0); // This should be extracted from events

        return {
          transactionHash: tx.hash,
          userId
        };
      } catch (error) {
          console.error('Registration failed:', error);
          throw error;
      }
    },
    onSuccess: (data) => {
      console.log('User registered successfully:', data);
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['usdtrain'] });
    },
    onError: (error: unknown) => {
        console.error('Registration error:', error);
        toast({
            title: "Registration Failed",
            description: (error as Error)?.message || String(error),
            variant: "destructive",
        });
    },
  });
}