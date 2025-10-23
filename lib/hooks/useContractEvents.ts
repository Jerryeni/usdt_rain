import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';
import { useToast } from '@/components/ui/use-toast';
import type {
  UserRegisteredEvent,
  UserActivatedEvent,
  LevelIncomePaidEvent,
  ProfileUpdatedEvent,
} from '../contracts/USDTRain';

export interface EventHandlers {
  onUserRegistered?: (event: UserRegisteredEvent) => void;
  onUserActivated?: (event: UserActivatedEvent) => void;
  onLevelIncomePaid?: (event: LevelIncomePaidEvent) => void;
  onProfileUpdated?: (event: ProfileUpdatedEvent) => void;
  onGlobalPoolDistributed?: (event: any) => void;
  onNonWorkingIncomeClaimed?: (event: any) => void;
}

/**
 * Hook to listen to contract events and trigger UI updates
 * 
 * Listens to:
 * - UserRegistered
 * - UserActivated
 * - LevelIncomePaid
 * - ProfileUpdated
 * - GlobalPoolDistributed
 * - NonWorkingIncomeClaimed
 * 
 * Automatically invalidates React Query cache when relevant events occur
 * 
 * @param userAddress - The user's wallet address to filter events
 * @param handlers - Optional custom event handlers
 */
export function useContractEvents(
  userAddress?: string | null,
  handlers?: EventHandlers
) {
  const { provider } = useWallet();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!provider || !userAddress) {
      return;
    }

    let contract: any;
    const listeners: Array<() => void> = [];

    try {
      contract = getReadContract(provider);

      // UserRegistered Event
      const onUserRegistered = (userId: bigint, userAddr: string, sponsorId: bigint, event: any) => {
        console.log('UserRegistered event:', { userId, userAddr, sponsorId });

        // Only process if it's for the current user
        if (userAddr.toLowerCase() === userAddress.toLowerCase()) {
          // Invalidate user info
          queryClient.invalidateQueries({ queryKey: ['usdtrain', 'userInfo'] });
          
          // Show toast
          toast({
            title: 'Registration Successful',
            description: `Welcome! Your user ID is ${userId.toString()}`,
            variant: 'success',
          });

          // Call custom handler if provided
          handlers?.onUserRegistered?.({
            userId,
            userAddress: userAddr,
            sponsorId,
          });
        }
      };

      // UserActivated Event
      const onUserActivated = (userId: bigint, userAddr: string, event: any) => {
        console.log('UserActivated event:', { userId, userAddr });

        if (userAddr.toLowerCase() === userAddress.toLowerCase()) {
          // Invalidate user info
          queryClient.invalidateQueries({ queryKey: ['usdtrain', 'userInfo'] });
          
          // Show toast
          toast({
            title: 'Account Activated',
            description: 'Your account has been activated successfully!',
            variant: 'success',
          });

          // Call custom handler
          handlers?.onUserActivated?.({
            userId,
            userAddress: userAddr,
          });
        }
      };

      // LevelIncomePaid Event
      const onLevelIncomePaid = (userId: bigint, level: bigint, amount: bigint, event: any) => {
        console.log('LevelIncomePaid event:', { userId, level, amount });

        // We need to check if this income is for the current user
        // This requires fetching the user ID for the current address
        contract.getUserIdByAddress(userAddress).then((currentUserId: bigint) => {
          if (userId === currentUserId) {
            // Invalidate level income and user info
            queryClient.invalidateQueries({ queryKey: ['usdtrain', 'levelIncome'] });
            queryClient.invalidateQueries({ queryKey: ['usdtrain', 'userInfo'] });
            queryClient.invalidateQueries({ queryKey: ['usdtrain', 'transactions'] });
            
            // Show toast
            const amountUSD = (Number(amount) / 1e18).toFixed(2);
            toast({
              title: 'Income Received',
              description: `You received $${amountUSD} from Level ${level}`,
              variant: 'success',
            });

            // Call custom handler
            handlers?.onLevelIncomePaid?.({
              userId,
              level,
              amount,
            });
          }
        }).catch((error: any) => {
          console.error('Error checking user ID:', error);
        });
      };

      // ProfileUpdated Event
      const onProfileUpdated = (userId: bigint, userAddr: string, userName: string, contactNumber: string, event: any) => {
        console.log('ProfileUpdated event:', { userId, userAddr, userName, contactNumber });

        if (userAddr.toLowerCase() === userAddress.toLowerCase()) {
          // Invalidate user info
          queryClient.invalidateQueries({ queryKey: ['usdtrain', 'userInfo'] });
          
          // Call custom handler
          handlers?.onProfileUpdated?.({
            userId,
            userAddress: userAddr,
            userName,
            contactNumber,
          });
        }
      };

      // GlobalPoolDistributed Event
      const onGlobalPoolDistributed = (snapshotId: bigint, totalAmount: bigint, eligibleUsers: bigint, event: any) => {
        console.log('GlobalPoolDistributed event:', { snapshotId, totalAmount, eligibleUsers });

        // Invalidate contract stats and user info
        queryClient.invalidateQueries({ queryKey: ['usdtrain', 'contractStats'] });
        queryClient.invalidateQueries({ queryKey: ['usdtrain', 'userInfo'] });
        queryClient.invalidateQueries({ queryKey: ['usdtrain', 'transactions'] });
        
        // Show toast
        const amountUSD = (Number(totalAmount) / 1e18).toFixed(2);
        toast({
          title: 'Global Pool Distributed',
          description: `$${amountUSD} distributed to ${eligibleUsers} users`,
          variant: 'info',
        });

        // Call custom handler
        handlers?.onGlobalPoolDistributed?.({
          snapshotId,
          totalAmount,
          eligibleUsers,
        });
      };

      // NonWorkingIncomeClaimed Event
      const onNonWorkingIncomeClaimed = (userId: bigint, amount: bigint, event: any) => {
        console.log('NonWorkingIncomeClaimed event:', { userId, amount });

        // Check if it's for the current user
        contract.getUserIdByAddress(userAddress).then((currentUserId: bigint) => {
          if (userId === currentUserId) {
            // Invalidate user info and transactions
            queryClient.invalidateQueries({ queryKey: ['usdtrain', 'userInfo'] });
            queryClient.invalidateQueries({ queryKey: ['usdtrain', 'transactions'] });
            
            // Show toast
            const amountUSD = (Number(amount) / 1e18).toFixed(2);
            toast({
              title: 'Non-Working Income Claimed',
              description: `You claimed $${amountUSD}`,
              variant: 'success',
            });

            // Call custom handler
            handlers?.onNonWorkingIncomeClaimed?.({
              userId,
              amount,
            });
          }
        }).catch((error: any) => {
          console.error('Error checking user ID:', error);
        });
      };

      // Set up event listeners
      contract.on('UserRegistered', onUserRegistered);
      contract.on('UserActivated', onUserActivated);
      contract.on('LevelIncomePaid', onLevelIncomePaid);
      contract.on('ProfileUpdated', onProfileUpdated);
      contract.on('GlobalPoolDistributed', onGlobalPoolDistributed);
      contract.on('NonWorkingIncomeClaimed', onNonWorkingIncomeClaimed);

      // Store cleanup functions
      listeners.push(() => contract.off('UserRegistered', onUserRegistered));
      listeners.push(() => contract.off('UserActivated', onUserActivated));
      listeners.push(() => contract.off('LevelIncomePaid', onLevelIncomePaid));
      listeners.push(() => contract.off('ProfileUpdated', onProfileUpdated));
      listeners.push(() => contract.off('GlobalPoolDistributed', onGlobalPoolDistributed));
      listeners.push(() => contract.off('NonWorkingIncomeClaimed', onNonWorkingIncomeClaimed));

      console.log('Contract event listeners set up for:', userAddress);
    } catch (error) {
      console.error('Error setting up contract event listeners:', error);
    }

    // Cleanup function
    return () => {
      console.log('Cleaning up contract event listeners');
      listeners.forEach(cleanup => cleanup());
    };
  }, [provider, userAddress, queryClient, toast, handlers]);
}

/**
 * Hook to listen to specific event types only
 * More lightweight than useContractEvents
 * 
 * @param userAddress - The user's wallet address
 * @param eventTypes - Array of event types to listen to
 * @param onEvent - Callback when any of the specified events occur
 */
export function useContractEventListener(
  userAddress?: string | null,
  eventTypes: Array<'UserRegistered' | 'UserActivated' | 'LevelIncomePaid' | 'ProfileUpdated'> = [],
  onEvent?: (eventType: string, data: any) => void
) {
  const { provider } = useWallet();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!provider || !userAddress || eventTypes.length === 0) {
      return;
    }

    let contract: any;
    const listeners: Array<() => void> = [];

    try {
      contract = getReadContract(provider);

      eventTypes.forEach(eventType => {
        const listener = (...args: any[]) => {
          console.log(`${eventType} event:`, args);
          
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['usdtrain'] });
          
          // Call custom callback
          onEvent?.(eventType, args);
        };

        contract.on(eventType, listener);
        listeners.push(() => contract.off(eventType, listener));
      });

      console.log(`Listening to events: ${eventTypes.join(', ')}`);
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }

    return () => {
      listeners.forEach(cleanup => cleanup());
    };
  }, [provider, userAddress, eventTypes, queryClient, onEvent]);
}
