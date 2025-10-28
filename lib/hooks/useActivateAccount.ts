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

        // 4. Check allowance and re-approve if needed
        let allowance = await usdt.allowance(userAddress, contract.target);
        console.log('Current allowance:', allowance.toString(), 'Required:', requiredAmount.toString());
        
        if (allowance < requiredAmount) {
          console.log('Insufficient allowance, requesting approval...');
          
          // If there's any existing allowance, reset it to 0 first (some tokens require this)
          if (allowance > BigInt(0)) {
            console.log('Resetting existing allowance to 0...');
            const resetTx = await usdt.approve(contract.target, BigInt(0));
            await resetTx.wait();
          }
          
          // Approve contract to spend USDT (approve more for future use)
          const approvalAmount = requiredAmount * BigInt(2); // Approve 2x for future activations
          const approveTx = await usdt.approve(contract.target, approvalAmount);
          console.log('USDT approve tx sent:', approveTx.hash);
          
          toast({
            title: "Approval Pending",
            description: "Waiting for USDT approval confirmation...",
          });
          
          await approveTx.wait();
          console.log('USDT approved for activation fee');
          
          // Verify approval was successful
          allowance = await usdt.allowance(userAddress, contract.target);
          console.log('New allowance after approval:', allowance.toString());
          
          if (allowance < requiredAmount) {
            throw new Error('Approval failed. Please try again.');
          }
          
          toast({
            title: "Approval Confirmed",
            description: "USDT spending approved. Proceeding with activation...",
          });
        } else {
          console.log('Sufficient allowance already exists');
        }

        // 5. Re-verify balance and allowance before activation
        const finalBalance = await usdt.balanceOf(userAddress);
        const finalAllowance = await usdt.allowance(userAddress, contract.target);
        
        console.log('Final checks - Balance:', finalBalance.toString(), 'Allowance:', finalAllowance.toString());
        
        if (finalBalance < requiredAmount) {
          throw new Error(`Insufficient USDT balance. You have ${Number(finalBalance) / (10 ** Number(decimals))} USDT but need at least ${minRequiredUSD} USDT.`);
        }
        
        if (finalAllowance < requiredAmount) {
          throw new Error('USDT approval expired or insufficient. Please try activating again.');
        }
        
        // 6. Check user registration and activation status
        let isRegistered = false;
        let isAlreadyActive = false;
        
        try {
          // Try to get user ID first (simpler call)
          const userId = await contract.getUserIdByAddress(userAddress);
          const userIdNum = Number(userId);
          console.log('User ID:', userIdNum);
          
          if (userIdNum === 0) {
            throw new Error('You must register your account before activating. Please go to the Register page first.');
          }
          
          isRegistered = true;
          
          // Now try to get full user info
          try {
            const userInfo = await contract.getUserInfo(userAddress);
            isAlreadyActive = userInfo[5] === true;
            
            console.log('User info:', {
              userId: userInfo[0].toString(),
              isActive: userInfo[5],
              sponsorId: userInfo[1].toString()
            });
            
            if (isAlreadyActive) {
              throw new Error('Your account is already activated. Please refresh the page.');
            }
          } catch (infoError: any) {
            console.warn('Could not fetch full user info, continuing...', infoError);
            // If we can't get user info but have a valid user ID, continue
          }
        } catch (error: any) {
          const errMsg = error.message || String(error);
          if (errMsg.includes('register') || errMsg.includes('activated')) {
            throw error;
          }
          // If we can't check registration, log warning but continue
          // The contract will reject if not registered
          console.warn('Could not verify registration status:', error);
        }
        
        // 7. Check BNB balance for gas
        const bnbBalance = await signer.provider?.getBalance(userAddress);
        console.log('BNB Balance:', bnbBalance?.toString());
        
        if (bnbBalance && bnbBalance < BigInt(10 ** 16)) { // Less than 0.01 BNB
          throw new Error('Insufficient BNB for gas fees. You need at least 0.01 BNB. Please add BNB to your wallet.');
        }
        
        // 8. Try to estimate gas for activation (optional - will proceed even if fails)
        let gasEstimate;
        try {
          gasEstimate = await contract.activateAccount.estimateGas();
          console.log('✅ Activation gas estimate:', gasEstimate.toString());
        } catch (error) {
          console.warn('⚠️ Gas estimation failed, will try transaction anyway:', error);
          const errorObj = error as any;
          const errorMessage = errorObj?.message || String(error);
          
          // Only throw if we can identify a clear blocker
          if (errorMessage.includes('User already activated')) {
            throw new Error('Your account is already activated. Please refresh the page.');
          } else if (errorMessage.includes('User not registered')) {
            throw new Error('You must register your account before activating. Please go to the Register page first.');
          } else if (errorMessage.includes('paused') || errorMessage.includes('Pausable: paused')) {
            throw new Error('The contract is currently paused. Please try again later or contact support.');
          } else if (errorMessage.includes('insufficient funds') && !errorMessage.includes('USDT')) {
            throw new Error('Insufficient BNB for gas fees. Please add some BNB to your wallet.');
          }
          
          // For other errors including "missing revert data", log but continue
          // The actual transaction will reveal the real error
          console.log('Will attempt transaction despite gas estimation failure...');
        }

        // 9. Send activation transaction
        let tx;
        try {
          tx = await contract.activateAccount(gasEstimate ? {
            gasLimit: gasEstimate * BigInt(12) / BigInt(10) // Add 20% buffer
          } : {
            gasLimit: BigInt(500000) // Default gas limit if estimation failed
          });
          
          console.log('✅ Activation transaction sent:', tx.hash);
        } catch (txError: any) {
          console.error('❌ Transaction failed:', txError);
          
          const txErrorMsg = txError?.message || String(txError);
          
          // Parse specific contract errors
          if (txErrorMsg.includes('User not registered')) {
            throw new Error('You must register your account before activating. Please go to the Register page first.');
          } else if (txErrorMsg.includes('User already activated')) {
            throw new Error('Your account is already activated. Please refresh the page.');
          } else if (txErrorMsg.includes('Pausable: paused')) {
            throw new Error('The contract is currently paused. Please try again later or contact support.');
          } else if (txErrorMsg.includes('ERC20: insufficient allowance') || txErrorMsg.includes('insufficient allowance')) {
            throw new Error('USDT approval is insufficient or expired. Please refresh the page and try again.');
          } else if (txErrorMsg.includes('ERC20: transfer amount exceeds balance')) {
            throw new Error('Insufficient USDT balance. Please ensure you have at least $25 USDT in your wallet.');
          } else if (txErrorMsg.includes('user rejected') || txErrorMsg.includes('User denied')) {
            throw new Error('Transaction cancelled. You rejected the transaction in your wallet.');
          }
          
          throw txError;
        }

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log('✅ Activation confirmed:', receipt?.hash);

        return {
          transactionHash: tx.hash
        };
      } catch (error) {
        console.error('❌ Account activation failed:', error);
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
        } else if (errorMessage.includes('missing revert data') || errorMessage.includes('CALL_EXCEPTION')) {
          title = "Activation Requirements Not Met";
          description = "Please refresh the page and try again. Ensure you have:\n• At least $25 USDT\n• Approved the contract\n• BNB for gas fees";
        } else if (errorMessage.includes('approval expired')) {
          title = "Approval Expired";
          description = "Your USDT approval has expired. Please refresh the page and try activating again.";
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