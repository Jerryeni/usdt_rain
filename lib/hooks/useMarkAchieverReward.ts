import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getWriteContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

export function useMarkAchieverReward() {
  const { provider } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, level }: { userId: number; level: number }) => {
      if (!provider) {
        throw new Error('Wallet not connected');
      }

      const contract = getWriteContract(provider);
      const tx = await contract.markAchieverReward(BigInt(userId), BigInt(level));
      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash,
        userId,
        level,
      };
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'achieverRewards'] });
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'adminSummary'] });
    },
  });
}
