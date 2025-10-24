'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserFlowState } from '@/lib/hooks/useUserFlow';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { useWallet } from '@/lib/wallet';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfileComplete?: boolean;
}

/**
 * Protected Route Component
 * Ensures users complete the onboarding flow before accessing protected pages
 */
export function ProtectedRoute({ children, requireProfileComplete = true }: ProtectedRouteProps) {
  const router = useRouter();
  const { address } = useWallet();
  const { data: userInfo, isLoading: loadingUserInfo } = useUserInfo(address);
  const userFlowState = useUserFlowState();

  useEffect(() => {
    if (loadingUserInfo || userFlowState === 'loading') return;

    // If profile completion is required, check the state
    if (requireProfileComplete && userFlowState !== 'profile-complete') {
      // Redirect to appropriate step based on current state
      switch (userFlowState) {
        case 'no-wallet':
          router.push('/wallet');
          break;
        case 'not-registered':
          router.push('/register');
          break;
        case 'registered':
          router.push('/activate');
          break;
        case 'activated':
          router.push('/profile?setup=true');
          break;
        default:
          break;
      }
    }
  }, [userFlowState, loadingUserInfo, requireProfileComplete, router]);

  // Show loading state while checking user status
  if (loadingUserInfo || userFlowState === 'loading') {
    return (
      <div className="relative z-10 min-h-screen">
        <div className="rain-animation" id="rain-container"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
              <i className="fas fa-spinner fa-spin text-2xl text-cyan-400"></i>
            </div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render content if user hasn't completed required steps
  if (requireProfileComplete && userFlowState !== 'profile-complete') {
    return (
      <div className="relative z-10 min-h-screen">
        <div className="rain-animation" id="rain-container"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
              <i className="fas fa-lock text-2xl text-orange-400"></i>
            </div>
            <p className="text-gray-400">Redirecting to setup...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
