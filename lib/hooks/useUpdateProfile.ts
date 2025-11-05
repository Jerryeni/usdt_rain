import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getWriteContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';
import { useToast } from '@/components/ui/use-toast';
import { parseError } from '../utils/errorMessages';

export interface ProfileData {
  userName: string;
  contactNumber: string;
}

export interface UpdateProfileResult {
  transactionHash: string;
}

/**
 * Validates profile data before submission
 */
function validateProfileData(data: ProfileData): { valid: boolean; error?: string } {
  // Validate username
  if (!data.userName || data.userName.trim().length === 0) {
    return { valid: false, error: 'Username is required' };
  }

  if (data.userName.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long' };
  }

  if (data.userName.length > 50) {
    return { valid: false, error: 'Username must be less than 50 characters' };
  }

  // Validate contact number
  if (!data.contactNumber || data.contactNumber.trim().length === 0) {
    return { valid: false, error: 'Contact number is required' };
  }

  // Basic phone number validation (allows various formats including letters for international formats)
  const phoneRegex = /^[\d\s\-\+\(\)a-zA-Z]+$/;
  if (!phoneRegex.test(data.contactNumber)) {
    return { valid: false, error: 'Contact number contains invalid characters' };
  }

  if (data.contactNumber.replace(/\D/g, '').length < 7) {
    return { valid: false, error: 'Contact number is too short' };
  }

  if (data.contactNumber.length > 20) {
    return { valid: false, error: 'Contact number is too long' };
  }

  return { valid: true };
}

/**
 * Hook for updating user profile information in the USDTRain contract
 * 
 * Updates:
 * - Username
 * - Contact number
 * 
 * @returns Mutation hook for profile updates
 */
export function useUpdateProfile() {
  const { signer, address } = useWallet();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (profileData: ProfileData): Promise<UpdateProfileResult> => {
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      if (!address) {
        throw new Error('No wallet address found');
      }

      // Validate profile data
      const validation = validateProfileData(profileData);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const contract = getWriteContract(signer);

      try {
        // Trim whitespace
        const userName = profileData.userName.trim();
        const contactNumber = profileData.contactNumber.trim();

        // Estimate gas
        let gasEstimate;
        try {
          gasEstimate = await contract.updateProfile.estimateGas(userName, contactNumber);
          console.log('Gas estimate for updateProfile:', gasEstimate.toString());
        } catch (error) {
          console.warn('Gas estimation failed:', error);
          // Continue without gas estimate
        }

        // Send transaction
        const tx = await contract.updateProfile(
          userName,
          contactNumber,
          gasEstimate ? { gasLimit: gasEstimate * BigInt(12) / BigInt(10) } : {}
        );

        console.log('Profile update transaction sent:', tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log('Profile update confirmed:', receipt?.hash);

        return {
          transactionHash: tx.hash,
        };
      } catch (error) {
        console.error('Profile update failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Profile updated successfully:', data);
      
      // Invalidate and refetch user info
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'userInfo'] });
      
      // Show success toast
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully!',
        variant: 'success',
      });
    },
    onError: (error: unknown) => {
      console.error('Profile update error:', error);
      
      // Use the error parsing utility for user-friendly messages
      const parsedError = parseError(error);

      toast({
        title: parsedError.title,
        description: parsedError.action ? `${parsedError.message} ${parsedError.action}` : parsedError.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to get current profile data
 * Convenience hook that extracts profile info from user info
 */
export function useProfileData(userAddress?: string | null) {
  const { provider } = useWallet();
  const queryClient = useQueryClient();

  // Try to get from cache first
  const cachedUserInfo = queryClient.getQueryData(['usdtrain', 'userInfo', userAddress]);

  if (cachedUserInfo && typeof cachedUserInfo === 'object' && cachedUserInfo !== null) {
    const info = cachedUserInfo as any;
    return {
      userName: info.userName || '',
      contactNumber: info.contactNumber || '',
      lastUpdated: info.profileUpdatedAt ? new Date(Number(info.profileUpdatedAt) * 1000) : null,
    };
  }

  return {
    userName: '',
    contactNumber: '',
    lastUpdated: null,
  };
}
