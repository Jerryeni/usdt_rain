import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

/**
 * Hook for listening to USDTRain contract events and updating UI state
 */
export function useUSDTRainEvents() {
  const { provider } = useWallet();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!provider) return;

    const contract = getReadContract(provider);

    // Event handlers
    const handleUserRegistered = (userId: bigint, userAddress: string, sponsorId: bigint) => {
      console.log('UserRegistered event:', { userId: userId.toString(), userAddress, sponsorId: sponsorId.toString() });

      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'contractStats'] });
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'userInfo'] });
    };

    const handleUserActivated = (userId: bigint, userAddress: string) => {
      console.log('UserActivated event:', { userId: userId.toString(), userAddress });

      // Invalidate user-specific and contract-wide data
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'userInfo', userAddress] });
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'contractStats'] });
    };

    const handleLevelIncomePaid = (userId: bigint, level: bigint, amount: bigint) => {
      console.log('LevelIncomePaid event:', {
        userId: userId.toString(),
        level: level.toString(),
        amount: amount.toString()
      });

      // Invalidate user earnings data
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'userInfo'] });
    };

    const handleProfileUpdated = (userId: bigint, userAddress: string, userName: string, contactNumber: string) => {
      console.log('ProfileUpdated event:', { userId: userId.toString(), userAddress, userName, contactNumber });

      // Invalidate user profile data
      queryClient.invalidateQueries({ queryKey: ['usdtrain', 'userInfo', userAddress] });
    };

    // Set up event listeners
    contract.on('UserRegistered', handleUserRegistered);
    contract.on('UserActivated', handleUserActivated);
    contract.on('LevelIncomePaid', handleLevelIncomePaid);
    contract.on('ProfileUpdated', handleProfileUpdated);

    console.log('USDTRain event listeners set up');

    // Cleanup function to remove listeners
    return () => {
      contract.off('UserRegistered', handleUserRegistered);
      contract.off('UserActivated', handleUserActivated);
      contract.off('LevelIncomePaid', handleLevelIncomePaid);
      contract.off('ProfileUpdated', handleProfileUpdated);
      console.log('USDTRain event listeners removed');
    };
  }, [provider, queryClient]);
}