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
      
      // Try to estimate gas, but don't fail if estimation fails
      // Gas estimation can fail even when the actual transaction would succeed
      let gasLimit;
      try {
        const gasEstimate = await contract.distributeGlobalPool.estimateGas();
        gasLimit = gasEstimate * BigInt(120) / BigInt(100); // Add 20% buffer
        console.log('Gas estimation succeeded:', gasLimit.toString());
      } catch (error: any) {
        console.warn('Gas estimation failed, will try transaction anyway:', error.message);
        // Don't throw here - let the actual transaction attempt proceed
        // Gas estimation can be overly conservative
      }
      
      // Attempt the actual transaction
      try {
        const tx = gasLimit 
          ? await contract.distributeGlobalPool({ gasLimit })
          : await contract.distributeGlobalPool();
          
        console.log('Distribution transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('Distribution transaction confirmed:', receipt.hash);
        
        return { transactionHash: receipt.hash };
      } catch (error: any) {
        console.error('Distribution transaction failed:', error);
        console.error('Error details:', {
          message: error.message,
          data: error.data,
          code: error.code,
          reason: error.reason,
        });
        
        // Parse common errors from actual transaction failure
        if (error.data?.includes('0x118cdaa7')) {
          throw new Error('Only the contract owner can distribute the global pool');
        }
        if (error.message?.includes('EnforcedPause')) {
          throw new Error('Contract is paused. Unpause it first before distributing');
        }
        if (error.message?.includes('No eligible users')) {
          throw new Error('No eligible users to distribute to. Add eligible users first.');
        }
        if (error.message?.includes('transfer amount exceeds balance') || 
            error.message?.includes('BEP40')) {
          throw new Error('Insufficient USDT balance in contract. Try using "Batch Distribute" instead, or add a small buffer of USDT to the contract.');
        }
        if (error.message?.includes('user rejected') || error.message?.includes('User denied')) {
          throw new Error('Transaction was rejected in your wallet');
        }
        
        // Try to extract revert reason
        let errorMessage = 'Distribution failed';
        if (error.reason) {
          errorMessage += `: ${error.reason}`;
        } else if (error.message) {
          const match = error.message.match(/reverted with reason string '([^']+)'/);
          if (match) {
            errorMessage += `: ${match[1]}`;
          } else if (error.message.includes('reverted')) {
            errorMessage += '. The transaction was reverted by the contract.';
          } else {
            // Show first 200 chars of error message
            const shortMessage = error.message.substring(0, 200);
            errorMessage += `: ${shortMessage}`;
          }
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: invalidateQueries,
  });

  // Note: updateEligibleUsers function does not exist in the contract
  // The contract automatically uses the current eligible users list when distributing

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
      
      // Try to estimate gas first to catch errors early
      try {
        await contract.addEligibleUser.estimateGas(userAddress);
      } catch (error: any) {
        console.error('Add eligible user estimation failed:', error);
        
        // Parse common errors
        if (error.message?.includes('Already eligible')) {
          throw new Error('This user is already in the eligible list');
        }
        if (error.data?.includes('0x118cdaa7')) {
          throw new Error('Only the contract owner can add eligible users');
        }
        
        // Re-throw with original message if we can't parse it
        throw error;
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
      
      // Try to estimate gas first to catch errors early
      try {
        await contract.removeEligibleUser.estimateGas(userAddress);
      } catch (error: any) {
        console.error('Remove eligible user estimation failed:', error);
        
        // Parse common errors
        if (error.message?.includes('Not eligible')) {
          throw new Error('This user is not in the eligible list. They may have already been removed or were never added.');
        }
        if (error.data?.includes('0x118cdaa7')) {
          throw new Error('Only the contract owner can remove eligible users');
        }
        
        // Re-throw with original message if we can't parse it
        throw error;
      }
      
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
