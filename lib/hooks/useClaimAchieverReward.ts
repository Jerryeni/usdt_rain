import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getWriteContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

/**
 * Hook to claim achiever reward for a specific level
 */
export function useClaimAchieverReward() {
  const { signer } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, level }: { userId: bigint; level: number }) => {
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      const contract = getWriteContract(signer);
      
      // Call markAchieverReward function
      const tx = await contract.markAchieverReward(userId, BigInt(level));
      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash,
        userId,
        level,
      };
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'achieverRewardStatus'] });
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'achieverRewards'] });
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'achieverProgress'] });
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'userInfo'] });
    },
  });
}
