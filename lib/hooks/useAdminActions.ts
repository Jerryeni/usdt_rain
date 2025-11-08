import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getWriteContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

/**
 * Hook for admin actions on the contract
 */
export function useAdminActions() {
  const { signer } = useWallet();
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['usdtrain'] });
  };

  // Pause contract
  const pause = useMutation({
    mutationFn: async () => {
      if (!signer) throw new Error('Wallet not connected');
      const contract = getWriteContract(signer);
      const tx = await contract.pause();
      const receipt = await tx.wait();
      return { transactionHash: receipt.hash };
    },
    onSuccess: invalidateQueries,
  });

  // Unpause contract
  const unpause = useMutation({
    mutationFn: async () => {
      if (!signer) throw new Error('Wallet not connected');
      const contract = getWriteContract(signer);
      const tx = await contract.unpause();
      const receipt = await tx.wait();
      return { transactionHash: receipt.hash };
    },
    onSuccess: invalidateQueries,
  });

  // Distribute global pool
  const distributeGlobalPool = useMutation({
    mutationFn: async () => {
      if (!signer) throw new Error('Wallet not connected');
      
      const contract = getWriteContract(signer);
      
      // Try to estimate gas first to catch errors early
      try {
        await contract.distributeGlobalPool.estimateGas();
      } catch (error: any) {
        // Parse common errors
        if (error.data?.includes('0x118cdaa7')) {
          throw new Error('Only the contract owner can distribute the global pool');
        }
        if (error.message?.includes('EnforcedPause')) {
          throw new Error('Contract is paused. Unpause it first before distributing');
        }
        if (error.message?.includes('insufficient funds')) {
          throw new Error('Insufficient funds in global pool to distribute');
        }
        // Re-throw with original message if we can't parse it
        throw error;
      }
      
      const tx = await contract.distributeGlobalPool();
      const receipt = await tx.wait();
      return { transactionHash: receipt.hash };
    },
    onSuccess: invalidateQueries,
  });

  // Update eligible users
  const updateEligibleUsers = useMutation({
    mutationFn: async () => {
      if (!signer) throw new Error('Wallet not connected');
      const contract = getWriteContract(signer);
      const tx = await contract.updateEligibleUsers();
      const receipt = await tx.wait();
      return { transactionHash: receipt.hash };
    },
    onSuccess: invalidateQueries,
  });

  // Emergency withdraw
  const emergencyWithdraw = useMutation({
    mutationFn: async () => {
      if (!signer) throw new Error('Wallet not connected');
      const contract = getWriteContract(signer);
      const tx = await contract.emergencyWithdraw();
      const receipt = await tx.wait();
      return { transactionHash: receipt.hash };
    },
    onSuccess: invalidateQueries,
  });

  // Update distribution percentages
  const updateDistributionPercentages = useMutation({
    mutationFn: async ({
      levelIncome,
      globalPool,
      reserve,
    }: {
      levelIncome: number;
      globalPool: number;
      reserve: number;
    }) => {
      if (!signer) throw new Error('Wallet not connected');
      const contract = getWriteContract(signer);
      const tx = await contract.updateDistributionPercentages(
        BigInt(levelIncome),
        BigInt(globalPool),
        BigInt(reserve)
      );
      const receipt = await tx.wait();
      return { transactionHash: receipt.hash };
    },
    onSuccess: invalidateQueries,
  });

  // Update reserve wallet
  const updateReserveWallet = useMutation({
    mutationFn: async (newReserveWallet: string) => {
      if (!signer) throw new Error('Wallet not connected');
      const contract = getWriteContract(signer);
      const tx = await contract.updateReserveWallet(newReserveWallet);
      const receipt = await tx.wait();
      return { transactionHash: receipt.hash };
    },
    onSuccess: invalidateQueries,
  });

  // Transfer ownership
  const transferOwnership = useMutation({
    mutationFn: async (newOwner: string) => {
      if (!signer) throw new Error('Wallet not connected');
      const contract = getWriteContract(signer);
      const tx = await contract.transferOwnership(newOwner);
      const receipt = await tx.wait();
      return { transactionHash: receipt.hash };
    },
    onSuccess: invalidateQueries,
  });

  // Mark achiever reward as distributed
  const markAchieverReward = useMutation({
    mutationFn: async ({ userId, level }: { userId: number; level: number }) => {
      if (!signer) throw new Error('Wallet not connected');
      const contract = getWriteContract(signer);
      
      // Validate inputs
      if (userId <= 0) throw new Error('Invalid user ID');
      if (level < 1 || level > 5) throw new Error('Level must be between 1 and 5');
      
      const tx = await contract.markAchieverReward(BigInt(userId), BigInt(level));
      const receipt = await tx.wait();
      return { transactionHash: receipt.hash };
    },
    onSuccess: invalidateQueries,
  });

  // Add eligible user for global pool
  const addEligibleUser = useMutation({
    mutationFn: async (userAddress: string) => {
      if (!signer) throw new Error('Wallet not connected');
      const contract = getWriteContract(signer);
      
      // Validate address
      if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid Ethereum address');
      }
      
      const tx = await contract.addEligibleUser(userAddress);
      const receipt = await tx.wait();
      return { transactionHash: receipt.hash, userAddress };
    },
    onSuccess: invalidateQueries,
  });

  // Remove eligible user from global pool
  const removeEligibleUser = useMutation({
    mutationFn: async (userAddress: string) => {
      if (!signer) throw new Error('Wallet not connected');
      const contract = getWriteContract(signer);
      
      const tx = await contract.removeEligibleUser(userAddress);
      const receipt = await tx.wait();
      return { transactionHash: receipt.hash, userAddress };
    },
    onSuccess: invalidateQueries,
  });

  // Distribute global pool in batches
  const distributeGlobalPoolBatch = useMutation({
    mutationFn: async () => {
      if (!signer) throw new Error('Wallet not connected');
      const contract = getWriteContract(signer);
      
      const tx = await contract.distributeGlobalPoolBatch();
      const receipt = await tx.wait();
      return { transactionHash: receipt.hash };
    },
    onSuccess: invalidateQueries,
  });

  return {
    pause,
    unpause,
    distributeGlobalPool,
    updateEligibleUsers,
    emergencyWithdraw,
    updateDistributionPercentages,
    updateReserveWallet,
    transferOwnership,
    markAchieverReward,
    addEligibleUser,
    removeEligibleUser,
    distributeGlobalPoolBatch,
  };
}
