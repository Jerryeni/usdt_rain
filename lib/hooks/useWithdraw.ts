import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getWriteContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';
import { useToast } from '@/components/ui/use-toast';

export interface WithdrawParams {
  type: 'all' | 'level' | 'nonWorking';
  level?: number;
}

export interface WithdrawResult {
  transactionHash: string;
  amount?: bigint;
}

/**
 * Hook for withdrawing earnings from the USDTRain contract
 * 
 * Supports:
 * - Withdrawing all available earnings
 * - Withdrawing specific level earnings
 * - Claiming non-working income
 * 
 * @returns Mutation hook for withdrawal operations
 */
export function useWithdraw() {
  const { signer, address } = useWallet();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: WithdrawParams): Promise<WithdrawResult> => {
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      if (!address) {
        throw new Error('No wallet address found');
      }

      const contract = getWriteContract(signer);

      try {
        let tx;
        let gasEstimate;

        // Estimate gas based on withdrawal type
        try {
          switch (params.type) {
            case 'all':
              gasEstimate = await contract.withdrawEarnings.estimateGas();
              console.log('Gas estimate for withdrawEarnings:', gasEstimate.toString());
              break;
            
            case 'level':
              if (params.level === undefined) {
                throw new Error('Level is required for level withdrawal');
              }
              gasEstimate = await contract.withdrawLevelEarnings.estimateGas(params.level);
              console.log(`Gas estimate for withdrawLevelEarnings(${params.level}):`, gasEstimate.toString());
              break;
            
            case 'nonWorking':
              gasEstimate = await contract.claimNonWorkingIncome.estimateGas();
              console.log('Gas estimate for claimNonWorkingIncome:', gasEstimate.toString());
              break;
            
            default:
              throw new Error('Invalid withdrawal type');
          }
        } catch (error) {
          console.warn('Gas estimation failed:', error);
          // Continue without gas estimate
        }

        // Execute the appropriate withdrawal function
        switch (params.type) {
          case 'all':
            tx = await contract.withdrawEarnings(
              gasEstimate ? { gasLimit: gasEstimate * BigInt(12) / BigInt(10) } : {}
            );
            break;
          
          case 'level':
            if (params.level === undefined) {
              throw new Error('Level is required for level withdrawal');
            }
            tx = await contract.withdrawLevelEarnings(
              params.level,
              gasEstimate ? { gasLimit: gasEstimate * BigInt(12) / BigInt(10) } : {}
            );
            break;
          
          case 'nonWorking':
            tx = await contract.claimNonWorkingIncome(
              gasEstimate ? { gasLimit: gasEstimate * BigInt(12) / BigInt(10) } : {}
            );
            break;
          
          default:
            throw new Error('Invalid withdrawal type');
        }

        console.log('Withdrawal transaction sent:', tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log('Withdrawal confirmed:', receipt?.hash);

        return {
          transactionHash: tx.hash,
        };
      } catch (error) {
        console.error('Withdrawal failed:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('Withdrawal successful:', data);
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'userInfo'] });
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'levelIncome'] });
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'nonWorkingIncome'] });
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'transactions'] });
      
      // Show success toast
      const typeLabel = 
        variables.type === 'all' ? 'All earnings' :
        variables.type === 'level' ? `Level ${variables.level} earnings` :
        'Non-working income';
      
      toast({
        title: 'Withdrawal Successful',
        description: `${typeLabel} withdrawn successfully!`,
        variant: 'success',
      });
    },
    onError: (error: unknown) => {
      console.error('Withdrawal error:', error);
      
      // Parse error message
      const errorMessage = (error as Error)?.message || String(error);
      let userMessage = 'Failed to withdraw earnings';
      let description = errorMessage;

      // Handle common errors
      if (errorMessage.includes('user rejected')) {
        userMessage = 'Transaction Cancelled';
        description = 'You cancelled the withdrawal in your wallet.';
      } else if (errorMessage.includes('insufficient funds')) {
        userMessage = 'Insufficient Balance';
        description = 'You don\'t have enough BNB to pay for gas fees.';
      } else if (errorMessage.includes('No earnings available')) {
        userMessage = 'No Earnings Available';
        description = 'You don\'t have any earnings to withdraw.';
      } else if (errorMessage.includes('User not active')) {
        userMessage = 'Account Not Activated';
        description = 'Please activate your account before withdrawing.';
      }

      toast({
        title: userMessage,
        description,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for withdrawing all available earnings
 * Convenience wrapper around useWithdraw
 */
export function useWithdrawAll() {
  const withdraw = useWithdraw();

  return {
    ...withdraw,
    mutateAsync: async () => {
      return withdraw.mutateAsync({ type: 'all' });
    },
    mutate: () => {
      return withdraw.mutate({ type: 'all' });
    },
  };
}

/**
 * Hook for withdrawing specific level earnings
 * Convenience wrapper around useWithdraw
 */
export function useWithdrawLevel() {
  const withdraw = useWithdraw();

  return {
    ...withdraw,
    mutateAsync: async (level: number) => {
      if (level < 1 || level > 10) {
        throw new Error('Level must be between 1 and 10');
      }
      return withdraw.mutateAsync({ type: 'level', level });
    },
    mutate: (level: number) => {
      if (level < 1 || level > 10) {
        throw new Error('Level must be between 1 and 10');
      }
      return withdraw.mutate({ type: 'level', level });
    },
  };
}

/**
 * Hook for claiming non-working income
 * Convenience wrapper around useWithdraw
 */
export function useClaimNonWorking() {
  const withdraw = useWithdraw();

  return {
    ...withdraw,
    mutateAsync: async () => {
      return withdraw.mutateAsync({ type: 'nonWorking' });
    },
    mutate: () => {
      return withdraw.mutate({ type: 'nonWorking' });
    },
  };
}
