import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWallet } from '../wallet';
import { useUserInfo } from './useUserInfo';

/**
 * User flow states
 */
export type UserFlowState = 
  | 'no-wallet'           // No wallet connected
  | 'not-registered'      // Wallet connected but not registered
  | 'registered'          // Registered but not activated
  | 'activated'           // Activated but profile not complete
  | 'profile-complete'    // Profile complete - full access
  | 'loading';            // Loading user state

/**
 * Get the current user flow state
 */
export function useUserFlowState(): UserFlowState {
  const { address } = useWallet();
  const { data: userInfo, isLoading } = useUserInfo(address);

  if (isLoading) {
    return 'loading';
  }

  if (!address) {
    return 'no-wallet';
  }

  // Check if user is registered (userId > 0)
  if (!userInfo || !userInfo.userId || Number(userInfo.userId) === 0) {
    return 'not-registered';
  }

  // User is registered, check if activated
  // A user is activated if isActive is true AND activationTimestamp > 0
  if (!userInfo.isActive || !userInfo.activationTimestamp || Number(userInfo.activationTimestamp) === 0) {
    return 'registered';
  }

  // User is activated, check if profile is complete
  if (!userInfo.userName || !userInfo.contactNumber) {
    return 'activated';
  }

  return 'profile-complete';
}

/**
 * Get the next step in the user flow
 */
export function getNextStep(state: UserFlowState): string {
  switch (state) {
    case 'no-wallet':
      return '/wallet';
    case 'not-registered':
      return '/register';
    case 'registered':
      return '/activate';
    case 'activated':
      return '/profile?setup=true';
    case 'profile-complete':
      return '/';
    default:
      return '/';
  }
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(state: UserFlowState, route: string): boolean {
  // Public routes accessible to everyone
  const publicRoutes = ['/wallet', '/register'];
  if (publicRoutes.includes(route)) {
    return true;
  }

  // Routes that require wallet connection
  const walletRequiredRoutes = ['/register', '/profile', '/share'];
  if (walletRequiredRoutes.includes(route) && state === 'no-wallet') {
    return false;
  }

  // Routes that require registration
  const registrationRequiredRoutes = [
    '/', 
    '/income', 
    '/referrals', 
    '/transactions', 
    '/profile', 
    '/share'
  ];
  if (registrationRequiredRoutes.includes(route) && state === 'not-registered') {
    return false;
  }

  // All other routes are accessible if registered (even if not activated)
  return true;
}

/**
 * Hook to enforce user flow routing
 * Redirects users to the appropriate page based on their state
 */
export function useUserFlowRedirect(options?: {
  enabled?: boolean;
  allowedStates?: UserFlowState[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const state = useUserFlowState();
  const enabled = options?.enabled !== false;
  const allowedStates = options?.allowedStates;

  useEffect(() => {
    if (!enabled || state === 'loading') {
      return;
    }

    // If specific states are allowed, check if current state is allowed
    if (allowedStates && !allowedStates.includes(state)) {
      const nextStep = getNextStep(state);
      if (pathname !== nextStep) {
        console.log(`Redirecting from ${pathname} to ${nextStep} (state: ${state})`);
        router.push(nextStep);
      }
      return;
    }

    // Check if user can access current route
    if (!canAccessRoute(state, pathname)) {
      const nextStep = getNextStep(state);
      console.log(`Access denied to ${pathname}, redirecting to ${nextStep} (state: ${state})`);
      router.push(nextStep);
    }
  }, [state, pathname, router, enabled, allowedStates]);

  return { state, isLoading: state === 'loading' };
}

/**
 * Get user-friendly message for current state
 */
export function getUserFlowMessage(state: UserFlowState): {
  title: string;
  message: string;
  action: string;
  actionLink: string;
} {
  switch (state) {
    case 'no-wallet':
      return {
        title: 'Connect Your Wallet',
        message: 'To get started with USDT Rain, you need to connect your Web3 wallet.',
        action: 'Connect Wallet',
        actionLink: '/wallet',
      };
    case 'not-registered':
      return {
        title: 'Register Your Account',
        message: 'You need to register with a sponsor referral code to join USDT Rain.',
        action: 'Register Now',
        actionLink: '/register',
      };
    case 'registered':
      return {
        title: 'Activate Your Account',
        message: 'Deposit 25 USDT to activate your account and continue setup.',
        action: 'Activate Now',
        actionLink: '/activate',
      };
    case 'activated':
      return {
        title: 'Complete Your Profile',
        message: 'Add your username and contact number to finish setup.',
        action: 'Update Profile',
        actionLink: '/profile?setup=true',
      };
    case 'profile-complete':
      return {
        title: 'Welcome Back!',
        message: 'Your account is fully set up. Start earning by sharing your referral link.',
        action: 'View Dashboard',
        actionLink: '/',
      };
    default:
      return {
        title: 'Loading...',
        message: 'Please wait while we load your account information.',
        action: 'Please Wait',
        actionLink: '/',
      };
  }
}

/**
 * Hook to get user flow progress percentage
 */
export function useUserFlowProgress(): number {
  const state = useUserFlowState();

  switch (state) {
    case 'no-wallet':
      return 0;
    case 'not-registered':
      return 25;
    case 'registered':
      return 50;
    case 'activated':
      return 75;
    case 'profile-complete':
      return 100;
    default:
      return 0;
  }
}
