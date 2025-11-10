'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/lib/wallet';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { getNextStep, useUserFlowState } from '@/lib/hooks/useUserFlow';

export default function WalletPage() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { address, connect, isConnecting, isInjected } = useWallet();
  const { data: userInfo, isLoading: loadingUserInfo } = useUserInfo(address);
  const userFlowState = useUserFlowState();

  // Auto-redirect after wallet connection
  useEffect(() => {
    if (address && userFlowState !== 'loading' && userFlowState !== 'no-wallet') {
      const nextStep = getNextStep(userFlowState);
      console.log(`Wallet connected, redirecting to: ${nextStep}`);
      setTimeout(() => router.push(nextStep), 1500); // Small delay to show success
    }
  }, [address, userFlowState, router]);

  useEffect(() => {
    setIsClient(true);

    // Create animated rain effect
    function createRain() {
      const rainContainer = document.getElementById('rain-container');
      if (!rainContainer) return;

      const symbols = ['₮', 'U', '$', '₮', 'T'];

      const interval = setInterval(() => {
        if (!rainContainer) return;

        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        drop.style.left = Math.random() * 100 + '%';
        drop.style.animationDuration = (Math.random() * 3 + 5) + 's';
        drop.style.animationDelay = Math.random() * 2 + 's';

        rainContainer.appendChild(drop);

        setTimeout(() => {
          if (rainContainer?.contains(drop)) {
            rainContainer?.removeChild(drop);
          }
        }, 10000);
      }, 300);

      return () => clearInterval(interval);
    }

    createRain();
  }, []);

  // Handle routing after wallet connection
  useEffect(() => {
    if (!address || loadingUserInfo) return;

    // User is connected, check their status
    if (userInfo) {
      const userId = Number(userInfo.userId);
      
      if (userId === 0) {
        // Not registered - go to register
        router.push('/register');
      } else if (!userInfo.userName || !userInfo.contactNumber) {
        // Registered but no profile - go to profile setup
        router.push('/profile?setup=true');
      } else if (!userInfo.isActive) {
        // Has profile but not activated - go to activate
        router.push('/activate');
      } else {
        // Fully set up - go to dashboard
        router.push('/');
      }
    }
  }, [address, userInfo, loadingUserInfo, router]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleInstallWallet = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center">
      {/* Animated USDT Rain Background */}
      <div className="rain-animation" id="rain-container"></div>

      <div className="max-w-md w-full mx-4">
        <div className="glass-card rounded-2xl p-8 slide-in text-center">
          {/* Logo */}
          <div className="mx-auto mb-6 flex items-center justify-center">
            <img 
              src="/usdtrain-logo.png" 
              alt="USDT RAINS" 
              className="h-20 w-auto object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold orbitron gradient-text mb-3">
            Welcome to USDT Rain
          </h1>
          <p className="text-gray-400 mb-8">
            Connect your wallet to get started with earning
          </p>

          {/* Features */}
          <div className="space-y-3 mb-8 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-chart-line text-green-400 text-sm"></i>
              </div>
              <span className="text-gray-300 text-sm">10-Level Income System</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-globe text-blue-400 text-sm"></i>
              </div>
              <span className="text-gray-300 text-sm">Global Pool Rewards</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-shield-alt text-purple-400 text-sm"></i>
              </div>
              <span className="text-gray-300 text-sm">Secure Smart Contracts</span>
            </div>
          </div>

          {/* Connect Button or Install Prompt */}
          {!isInjected ? (
            <>
              <div className="bg-orange-500/10 border border-orange-400/20 rounded-xl p-4 mb-6">
                <i className="fas fa-exclamation-triangle text-orange-400 text-2xl mb-2"></i>
                <p className="text-orange-400 font-semibold mb-1">Wallet Not Found</p>
                <p className="text-gray-300 text-sm">Please install MetaMask to continue</p>
              </div>
              <button
                onClick={handleInstallWallet}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all orbitron text-lg"
              >
                <i className="fas fa-download mr-2"></i>
                Install MetaMask
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting || !!address}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed orbitron text-lg"
            >
              {isConnecting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Connecting...
                </>
              ) : address ? (
                <>
                  <i className="fas fa-check-circle mr-2"></i>
                  Connected
                </>
              ) : (
                <>
                  <i className="fas fa-wallet mr-2"></i>
                  Connect Wallet
                </>
              )}
            </button>
          )}

          {/* Security Note */}
          <p className="text-gray-500 text-xs mt-6">
            <i className="fas fa-lock mr-1"></i>
            We never store your private keys or seed phrase
          </p>
        </div>
      </div>
    </div>
  );
}
