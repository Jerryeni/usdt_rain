import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getWriteContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

/**
 * Hook for claiming global pool share
 */
export function useClaimGlobalPool() {
  const { signer } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<{ transactionHash: string }> => {
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      const contract = getWriteContract(signer);

      try {
        // Estimate gas first
        let gasEstimate;
        try {
          gasEstimate = await contract.claimGlobalPoolShare.estimateGas();
          console.log('Gas estimate for claim:', gasEstimate.toString());
        } catch (error) {
          console.warn('Gas estimation failed:', error);
          // Continue without gas estimate
        }

        // Send transaction
        const tx = await contract.claimGlobalPoolShare(gasEstimate ? {
          gasLimit: gasEstimate * BigInt(12) / BigInt(10) // Add 20% buffer
        } : {});

        console.log('Claim transaction sent:', tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log('Claim transaction confirmed:', receipt?.hash);

        return {
          transactionHash: tx.hash,
        };
      } catch (error) {
        console.error('Claim failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Global pool claimed successfully:', data);
      // Invalidate and refetch global pool data
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'globalPool'] });
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'userInfo'] });
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'transactions'] });
    },
    onError: (error: unknown) => {
      console.error('Claim error:', error);
    },
  });
}
