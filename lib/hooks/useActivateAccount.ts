import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getWriteContract } from '../contracts/USDTRain';
import { Contract } from "ethers";
import { useWallet } from '../wallet';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook for activating user account in the USDTRain contract
 */
export function useActivateAccount() {
  const { signer } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<{ transactionHash: string }> => {
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      const contract = getWriteContract(signer);

      try {
        // 1. Fetch activation fee and USDT token address
        const activationFee = await contract.ACTIVATION_FEE();
        const usdtTokenAddress = await contract.usdtToken();

        // 2. Create USDT contract instance
        const usdtAbi = [
          "function approve(address spender, uint256 amount) public returns (bool)",
          "function allowance(address owner, address spender) public view returns (uint256)",
          "function balanceOf(address owner) public view returns (uint256)",
          "function decimals() public view returns (uint8)"
        ];
        if (!contract.runner) {
          throw new Error("Contract runner is not available");
        }
        const usdt = new Contract(usdtTokenAddress, usdtAbi, signer);

        // 3. Verify USDT contract and check user balance
        const userAddress = await signer.getAddress();
        
        // Verify the USDT contract is valid
        let balance, decimals;
        try {
          console.log('Checking USDT contract at:', usdtTokenAddress);
          decimals = await usdt.decimals();
          balance = await usdt.balanceOf(userAddress);
        } catch (error) {
          console.error('USDT contract error:', error);
          throw new Error(`Invalid USDT contract address (${usdtTokenAddress}). Please contact support or check your contract configuration.`);
        }
        const minRequiredUSD = 25; // Minimum 25 USD worth of USDT
        const minRequiredUSDT = BigInt(minRequiredUSD * (10 ** Number(decimals))); // Convert to USDT units

        console.log('USDT Balance:', balance.toString(), 'Required:', minRequiredUSDT.toString());

        if (balance < minRequiredUSDT) {
          throw new Error(`Insufficient USDT balance. You need at least $${minRequiredUSD} worth of USDT (${minRequiredUSDT.toString()} USDT) to activate your account.`);
        }

        // Use the minimum of activationFee and minRequiredUSDT
        const requiredAmount = activationFee > minRequiredUSDT ? activationFee : minRequiredUSDT;

        // 4. Check allowance
        const allowance = await usdt.allowance(userAddress, contract.target);
        if (allowance < requiredAmount) {
          // Approve contract to spend USDT
          const approveTx = await usdt.approve(contract.target, requiredAmount);
          console.log('USDT approve tx sent:', approveTx.hash);
          await approveTx.wait();
          console.log('USDT approved for activation fee');
        }

        // 5. Estimate gas for activation
        let gasEstimate;
        try {
          gasEstimate = await contract.activateAccount.estimateGas();
          console.log('Activation gas estimate:', gasEstimate.toString());
        } catch (error) {
          console.error('Gas estimation failed for activation:', error);
          // Try to get more details about why it's failing
          const errorMessage = (error as any)?.message || String(error);
          if (errorMessage.includes('insufficient funds')) {
            throw new Error('Insufficient BNB for gas fees. Please add some BNB to your wallet.');
          } else if (errorMessage.includes('User already activated')) {
            throw new Error('Your account is already activated.');
          } else if (errorMessage.includes('User not registered')) {
            throw new Error('Please register your account first before activating.');
          } else if (errorMessage.includes('CALL_EXCEPTION')) {
            throw new Error('Transaction will fail. Please ensure you have approved USDT spending and have sufficient balance ($25 USDT minimum).');
          }
          throw new Error(`Activation check failed: ${errorMessage}`);
        }

        // 6. Send activation transaction
        const tx = await contract.activateAccount(gasEstimate ? {
          gasLimit: gasEstimate * BigInt(12) / BigInt(10) // Add 20% buffer
        } : {});

        console.log('Activation transaction sent:', tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log('Activation confirmed:', receipt?.hash);

        return {
          transactionHash: tx.hash
        };
      } catch (error) {
        console.error('Account activation failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Account activated successfully:', data);
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['usdtrain'] });
    },
    onError: (error: unknown) => {
        console.error('Account activation error:', error);
        
        const errorMessage = (error as Error)?.message || String(error);
        let title = "Account Activation Failed";
        let description = errorMessage;

        // Provide user-friendly error messages
        if (errorMessage.includes('user rejected')) {
          title = "Transaction Cancelled";
          description = "You cancelled the activation transaction in your wallet.";
        } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('Insufficient')) {
          title = "Insufficient Balance";
          description = errorMessage;
        } else if (errorMessage.includes('already activated')) {
          title = "Already Activated";
          description = "Your account is already activated.";
        } else if (errorMessage.includes('not registered')) {
          title = "Not Registered";
          description = "Please register your account first.";
        } else if (errorMessage.includes('CALL_EXCEPTION')) {
          title = "Activation Requirements Not Met";
          description = "Please ensure you have at least $25 USDT and have approved the contract to spend your USDT.";
        } else if (errorMessage.includes('could not decode result') || errorMessage.includes('BAD_DATA')) {
          title = "Invalid USDT Contract";
          description = "The USDT token contract address is invalid or not responding. Please ensure you're using a valid testnet USDT contract.";
        } else if (errorMessage.includes('Invalid USDT contract')) {
          title = "USDT Contract Error";
          description = errorMessage;
        }

        toast({
            title,
            description,
            variant: "destructive",
        });
    },
  });
}