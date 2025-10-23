'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWallet } from '@/lib/wallet';
import { useUserInfo } from '@/lib/hooks/useUserInfo';

/**
 * RouteGuard component that handles user flow routing
 * 
 * Flow:
 * 1. No wallet → /wallet
 * 2. Wallet connected but not registered → /register
 * 3. Registered but no profile → /profile?setup=true
 * 4. Has profile but not activated → /activate
 * 5. Fully activated → /dashboard (/)
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { address } = useWallet();
  const { data: userInfo, isLoading } = useUserInfo(address);

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Public routes that don't need authentication
    const publicRoutes = ['/wallet'];
    if (publicRoutes.includes(pathname)) return;

    // If no wallet connected, redirect to wallet page
    if (!address) {
      if (pathname !== '/wallet') {
        router.push('/wallet');
      }
      return;
    }

    // If wallet connected, check user status
    if (userInfo) {
      const userId = Number(userInfo.userId);

      // Not registered
      if (userId === 0) {
        if (pathname !== '/register') {
          router.push('/register');
        }
        return;
      }

      // Registered but no profile
      if (!userInfo.userName || !userInfo.contactNumber) {
        if (pathname !== '/profile') {
          router.push('/profile?setup=true');
        }
        return;
      }

      // Has profile but not activated
      if (!userInfo.isActive) {
        if (pathname !== '/activate') {
          router.push('/activate');
        }
        return;
      }

      // Fully activated - allow access to all pages
      // If they're on wallet/register/profile setup pages, redirect to dashboard
      if (pathname === '/wallet' || pathname === '/register') {
        router.push('/');
      }
    }
  }, [address, userInfo, isLoading, pathname, router]);

  // Show loading state while checking
  if (isLoading && address) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="rain-animation" id="rain-container"></div>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
            <i className="fas fa-spinner fa-spin text-2xl text-cyan-400"></i>
          </div>
          <p className="text-gray-400">Loading your account...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
