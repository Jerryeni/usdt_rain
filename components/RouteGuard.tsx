'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWallet } from '@/lib/wallet';
import { useUserInfo } from '@/lib/hooks/useUserInfo';

/**
 * RouteGuard component that handles user flow routing
 * 
 * Flow:
 * 1. No wallet → Only public pages (help, terms, wallet)
 * 2. Wallet connected but not registered → /register + public pages
 * 3. Registered but no profile → /profile?setup=true + public pages
 * 4. Has profile but not activated → /activate + public pages
 * 5. Fully activated → All pages accessible
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { address } = useWallet();
  const { data: userInfo, isLoading } = useUserInfo(address);

  // Public routes accessible to everyone (no wallet needed)
  const publicRoutes = ['/wallet', '/help', '/terms'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Protected routes that require full activation
  const protectedRoutes = [
    '/',           // Dashboard
    '/income',     // Income page
    '/referrals',  // Team/Referrals page
    '/transactions', // Transactions page
    '/share',      // Share page
    '/leaderboard', // Leaderboard
    '/settings',   // Settings
    '/admin',      // Admin page
  ];
  const isProtectedRoute = protectedRoutes.includes(pathname);

  // Setup routes (accessible during onboarding)
  const setupRoutes = ['/register', '/profile', '/activate'];
  const isSetupRoute = setupRoutes.includes(pathname);

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // If no wallet connected
    if (!address) {
      // Allow public routes
      if (isPublicRoute) return;
      
      // Redirect to wallet page for any other route
      if (pathname !== '/wallet') {
        router.push('/wallet');
      }
      return;
    }

    // If wallet connected, check user status
    if (userInfo) {
      const userId = Number(userInfo.userId);
      const hasProfile = userInfo.userName && userInfo.contactNumber;
      const isActivated = userInfo.isActive;

      // Not registered
      if (userId === 0) {
        // Allow public routes and register page
        if (isPublicRoute || pathname === '/register') return;
        
        // Redirect to register for protected routes
        if (isProtectedRoute || pathname === '/profile' || pathname === '/activate') {
          router.push('/register');
        }
        return;
      }

      // Registered but no profile
      if (!hasProfile) {
        // Allow public routes, register, and profile pages
        if (isPublicRoute || pathname === '/register' || pathname === '/profile') return;
        
        // Redirect to profile setup for protected routes
        if (isProtectedRoute || pathname === '/activate') {
          router.push('/profile?setup=true');
        }
        return;
      }

      // Has profile but not activated
      if (!isActivated) {
        // Allow public routes, register, profile, and activate pages
        if (isPublicRoute || isSetupRoute) return;
        
        // Redirect to activate for protected routes
        if (isProtectedRoute) {
          router.push('/activate');
        }
        return;
      }

      // Fully activated - allow access to all pages
      // If they're on setup pages, redirect to dashboard
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

  // Block rendering for unauthorized access
  if (!address && !isPublicRoute) {
    // No wallet and trying to access protected route - show nothing while redirecting
    return null;
  }

  if (address && userInfo) {
    const userId = Number(userInfo.userId);
    const hasProfile = userInfo.userName && userInfo.contactNumber;
    const isActivated = userInfo.isActive;

    // Not registered - only allow public routes and register
    if (userId === 0 && !isPublicRoute && pathname !== '/register') {
      return null;
    }

    // Registered but no profile - only allow public, register, and profile
    if (userId > 0 && !hasProfile && !isPublicRoute && pathname !== '/register' && pathname !== '/profile') {
      return null;
    }

    // Has profile but not activated - only allow public and setup routes
    if (userId > 0 && hasProfile && !isActivated && !isPublicRoute && !isSetupRoute) {
      return null;
    }
  }

  return <>{children}</>;
}
