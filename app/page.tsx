'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useWallet } from '../lib/wallet';
import { useUserInfo } from '../lib/hooks/useUserInfo';
import { useContractStats } from '../lib/hooks/useContractStats';
import { useContractEvents } from '../lib/hooks/useContractEvents';
import { useUserFlowState } from '../lib/hooks/useUserFlow';
import { UserFlowProgress } from '../components/UserFlowProgress';
import { isWalletAvailable } from '../lib/web3/provider';
import { Contract } from 'ethers';
import { ADDRESSES } from '../lib/contracts/addresses';

const USDT_ABI = [
   "function balanceOf(address owner) public view returns (uint256)",
   "function decimals() public view returns (uint8)"
 ];

export default function Dashboard() {
   const [isClient, setIsClient] = useState(false);
   const [fontAwesomeLoaded, setFontAwesomeLoaded] = useState(false);
   const router = useRouter();
   const { signer, address, connect, isConnecting } = useWallet();
   const { data: userInfo, isLoading: loadingUserInfo } = useUserInfo(address);
   const { data: contractStats, isLoading: loadingStats } = useContractStats();
   const userFlowState = useUserFlowState();
   const [usdtBalance, setUsdtBalance] = useState<null | number>(null);
   const [loadingBalance, setLoadingBalance] = useState(false);

  // Protected Route: Redirect if profile is not complete (not 100%)
  useEffect(() => {
    if (loadingUserInfo || userFlowState === 'loading') return;

    // Check if user has completed all steps
    if (userFlowState !== 'profile-complete') {
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
  }, [userFlowState, loadingUserInfo, router]);

  const animateCounter = useCallback((elementId: string, targetValue: number, duration = 2000) => {
    if (!isClient) return;

    const element = document.getElementById(elementId);
    if (!element) return;

    const startValue = 0;
    const increment = targetValue / (duration / 16);
    let currentValue = startValue;

    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= targetValue) {
        currentValue = targetValue;
        clearInterval(timer);
      }

      if (elementId === 'total-earnings') {
        element.textContent = '$' + currentValue.toFixed(2);
      } else {
        element.textContent = Math.floor(currentValue).toString();
      }
    }, 16);
  }, [isClient]);

  // Wallet installation handler
  const handleInstallWallet = () => {
    const walletUrl = 'https://metamask.io/download/';
    window.open(walletUrl, '_blank');
  };

  // Manual network switch handler
  const handleManualNetworkSwitch = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x61' }], // BSC Testnet
        });
        console.log("Network Switched: Successfully switched to BSC Testnet");
      } catch (error: unknown) {
        console.error('Manual network switch failed:', error);
        console.error("Network Switch Failed: Please switch to BSC Testnet manually in your wallet");
      }
    }
  };

  // Set up contract event listeners for real-time updates
  useContractEvents(address);

  // Fetch USDT balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!signer || !address) {
        setUsdtBalance(null);
        return;
      }
      setLoadingBalance(true);
      try {
        const usdt = new Contract(ADDRESSES.USDT, USDT_ABI, signer);
        const bal = await usdt.balanceOf(address);
        const dec = await usdt.decimals();
        setUsdtBalance(Number(bal) / 10 ** Number(dec));
      } catch (e) {
        // Silently handle USDT balance fetch errors (contract might not exist on testnet)
        setUsdtBalance(null);
        console.warn('Could not fetch USDT balance - contract may not exist on this network');
      } finally {
        setLoadingBalance(false);
      }
    };
    fetchBalance();
  }, [signer, address]);

  useEffect(() => {
    setIsClient(true);
    setFontAwesomeLoaded(true);

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

    // Animate counters with real data
    const timer = setTimeout(() => {
      const totalEarned = userInfo?.totalEarned ?
        Number(userInfo.totalEarned) / 1e18 : 0;
      const referrals = userInfo?.directReferrals ?
        Number(userInfo.directReferrals) : 0;

      animateCounter('total-earnings', totalEarned);
      animateCounter('active-referrals', referrals);
    }, 500);

    return () => clearTimeout(timer);
  }, [userInfo, animateCounter]);

  const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar?.classList.contains('-translate-x-full')) {
      sidebar.classList.remove('-translate-x-full');
      overlay?.classList.remove('opacity-0', 'pointer-events-none');
    } else {
      sidebar?.classList.add('-translate-x-full');
      overlay?.classList.add('opacity-0', 'pointer-events-none');
    }
  };

  const handleWalletConnection = async () => {
    if (isConnecting || address) return;

    try {
      console.log('Initiating wallet connection...');
      await connect();
      console.log('Wallet connection completed');
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

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
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render dashboard if user hasn't completed profile
  if (userFlowState !== 'profile-complete') {
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

  return (
    <div className="relative z-10 min-h-screen pb-24">
      {/* Animated USDT Rain Background */}
      <div className="rain-animation" id="rain-container"></div>

      {/* Header Section */}
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="slide-in">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-cyan-500/20 flex items-center justify-center">
              {fontAwesomeLoaded ? (
                <i className="fas fa-coins text-green-400 text-sm"></i>
              ) : (
                <div className="w-4 h-4 bg-green-400 rounded-full"></div>
              )}
            </div>
            <span className="text-white font-bold orbitron">USDT RAIN</span>
          </div>
        </div>

        <div className="slide-in flex items-center space-x-3" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={handleWalletConnection}
            disabled={isConnecting}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              address
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : isConnecting
                  ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                  : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
            }`}
          >
            {isConnecting ? (
              <span className="flex items-center">
                {fontAwesomeLoaded ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                )}
                Connecting...
              </span>
            ) : address ? (
              <>
                <i className="fas fa-check-circle mr-2"></i>
                Connected
              </>
            ) : (
              <>
                <i className="fas fa-wallet mr-2"></i>
                Connect
              </>
            )}
          </button>
          <button
            className="w-10 h-10 rounded-xl glass-card flex items-center justify-center"
            onClick={toggleSidebar}
          >
            {fontAwesomeLoaded ? (
              <i className="fas fa-bars text-cyan-400"></i>
            ) : (
              <div className="w-4 h-4 bg-cyan-400 rounded-sm"></div>
            )}
          </button>
        </div>
      </header>

      {/* Wallet Installation Prompt */}
      {isClient && !isWalletAvailable() && (
        <section className="px-4 sm:px-6 mb-6">
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-4 sm:p-6 slide-in">
            <div className="text-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                {fontAwesomeLoaded ? (
                  <i className="fas fa-wallet text-2xl text-orange-400"></i>
                ) : (
                  <div className="w-8 h-8 bg-orange-400 rounded-full"></div>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Web3 Wallet Required</h3>
              <p className="text-gray-300 mb-4">
                To use USDT RAIN, you need a Web3 wallet like MetaMask to connect to the blockchain.
              </p>
              <button
                onClick={handleInstallWallet}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                Install MetaMask
              </button>
            </div>
          </div>
        </section>
      )}

      {/* User Flow Progress - Show for non-complete users */}
      {isClient && userFlowState !== 'profile-complete' && userFlowState !== 'loading' && (
        <UserFlowProgress />
      )}

      {/* Main Earnings Card */}
      <section className="px-4 sm:px-6 mb-6">
        <div className={`earnings-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 slide-in ${!address ? 'opacity-50' : ''}`} style={{ animationDelay: '0.3s' }}>
          <div className="text-center mb-6">
            <div className="floating mb-4">
              <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500/20 to-cyan-500/20 flex items-center justify-center pulse-glow">
                {fontAwesomeLoaded ? (
                  <i className="fas fa-wallet text-xl sm:text-2xl gradient-text"></i>
                ) : (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-400 to-cyan-400 rounded-lg"></div>
                )}
              </div>
            </div>
            <h2 className="text-base sm:text-lg text-gray-300 mb-2">Total Earnings</h2>
            <div className="text-3xl sm:text-4xl font-bold gradient-text orbitron counter-animation" id="total-earnings">
              {loadingUserInfo ? 'Loading...' : userInfo?.totalEarned ?
                `$${(Number(userInfo.totalEarned) / 1e18).toFixed(2)}` :
                '$0.00'
              }
            </div>
            <div className="text-sm text-cyan-400 mt-1">USDT</div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-white counter-animation" id="active-referrals">
                {loadingUserInfo ? '...' : userInfo?.directReferrals ?
                  Number(userInfo.directReferrals) : 0
                }
              </div>
              <div className="text-xs text-gray-400">Active Referrals</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full pulse-glow ${address ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span className={`font-semibold text-sm ${address ? 'text-green-400' : 'text-gray-400'}`}>
                  {address ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">Wallet Status</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              className={`w-full glow-button text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl orbitron text-base sm:text-lg ${
                !address || (usdtBalance !== null && usdtBalance < 10) ? 'animate-pulse' : ''
              }`}
              disabled={!address || (usdtBalance !== null && usdtBalance < 10)}
              onClick={() => {
                if (!address) {
                  handleWalletConnection();
                } else if (usdtBalance !== null && usdtBalance < 10) {
                  // Trigger wallet to open for deposit
                  if (window.ethereum) {
                    window.ethereum.request({
                      method: 'wallet_watchAsset',
                      params: {
                        type: 'ERC20',
                        options: {
                          address: ADDRESSES.USDT,
                          symbol: 'USDT',
                          decimals: 18,
                        },
                      },
                    } as any).catch((error: any) => {
                      console.log('Failed to trigger wallet for deposit:', error);
                    });
                  }
                }
              }}
            >
              {!address ? 'Deposit to Activate' :
               loadingUserInfo ? 'Loading...' :
               userInfo?.isActive && userInfo?.activationTimestamp && Number(userInfo.activationTimestamp) > 0 ? 'Activated' : 'Deposit $25 USDT to Activate'}
            </button>
            {address && userInfo && (!userInfo.isActive || !userInfo.activationTimestamp || Number(userInfo.activationTimestamp) === 0) && (
              <Link href="/activate">
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl orbitron text-sm transition-colors"
                >
                  View Activation Page
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Quick Stats Row */}
      <section className="px-4 sm:px-6 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-white font-semibold mb-3">Platform Statistics</h3>
          {loadingStats ? (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 animate-pulse">
              <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                <div className="h-6 bg-gray-700/50 rounded w-16 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-700/50 rounded w-20 mx-auto"></div>
              </div>
              <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                <div className="h-6 bg-gray-700/50 rounded w-16 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-700/50 rounded w-20 mx-auto"></div>
              </div>
              <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                <div className="h-6 bg-gray-700/50 rounded w-16 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-700/50 rounded w-20 mx-auto"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-xl font-bold gradient-text orbitron counter-animation">
                  ${contractStats ? Number(contractStats._totalDistributed / BigInt(1e18)).toFixed(2) : '0.00'}
                </div>
                <div className="text-xs text-gray-400 mt-1">Total Distributed</div>
              </div>
              <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-xl font-bold gradient-text orbitron counter-animation">
                  {contractStats ? Number(contractStats._totalUsers) : '0'}
                </div>
                <div className="text-xs text-gray-400 mt-1">Total Users</div>
              </div>
              <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-xl font-bold gradient-text orbitron counter-animation">
                  {contractStats ? Number(contractStats._totalActivatedUsers) : '0'}
                </div>
                <div className="text-xs text-gray-400 mt-1">Active Users</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bottom Navigation - Mobile First */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-20 border-t border-gray-800 px-4 py-3">
        <div className="flex items-center justify-around">
          <Link href="/" className="flex flex-col items-center space-y-1 text-cyan-400">
            {fontAwesomeLoaded ? (
              <i className="fas fa-home text-lg"></i>
            ) : (
              <div className="w-4 h-4 bg-cyan-400 rounded"></div>
            )}
            <span className="text-xs">Dashboard</span>
          </Link>
          <Link href="/income" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-cyan-400 transition-colors">
            {fontAwesomeLoaded ? (
              <i className="fas fa-chart-bar text-lg"></i>
            ) : (
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
            )}
            <span className="text-xs">Income</span>
          </Link>
          <Link href="/referrals" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-cyan-400 transition-colors">
            {fontAwesomeLoaded ? (
              <i className="fas fa-users text-lg"></i>
            ) : (
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
            )}
            <span className="text-xs">Team</span>
          </Link>
          <Link href="/transactions" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-cyan-400 transition-colors">
            {fontAwesomeLoaded ? (
              <i className="fas fa-exchange-alt text-lg"></i>
            ) : (
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
            )}
            <span className="text-xs">Transactions</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-cyan-400 transition-colors">
            {fontAwesomeLoaded ? (
              <i className="fas fa-user text-lg"></i>
            ) : (
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
            )}
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>

      {/* Sidebar Menu */}
      <div id="sidebar" className="fixed top-0 left-0 w-80 h-full bg-black/95 backdrop-blur-20 border-r border-gray-800 transform -translate-x-full transition-transform duration-300 z-50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-cyan-500/20 flex items-center justify-center">
                {fontAwesomeLoaded ? (
                  <i className="fas fa-coins text-green-400"></i>
                ) : (
                  <div className="w-6 h-6 bg-green-400 rounded-lg"></div>
                )}
              </div>
              <span className="text-white font-bold orbitron">USDT RAIN</span>
            </div>
            <button onClick={toggleSidebar} className="w-8 h-8 rounded-lg glass-card flex items-center justify-center">
              {fontAwesomeLoaded ? (
                <i className="fas fa-times text-cyan-400"></i>
              ) : (
                <div className="w-4 h-4 bg-cyan-400 rounded"></div>
              )}
            </button>
          </div>

          <div className="space-y-2">
            <Link href="/" className="flex items-center space-x-3 p-3 rounded-xl bg-cyan-500/20 text-cyan-400 cursor-pointer">
              {fontAwesomeLoaded ? (
                <i className="fas fa-home w-5"></i>
              ) : (
                <div className="w-4 h-4 bg-cyan-400 rounded"></div>
              )}
              <span>Dashboard</span>
            </Link>
            {/* <Link href="/wallet" className="flex items-center space-x-3 p-3 rounded-xl text-gray-400 hover:bg-white/10 transition-all cursor-pointer">
              {fontAwesomeLoaded ? (
                <i className="fas fa-wallet w-5"></i>
              ) : (
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
              )}
              <span>Wallet</span>
            </Link> */}
            {/* <Link href="/income" className="flex items-center space-x-3 p-3 rounded-xl text-gray-400 hover:bg-white/10 transition-all cursor-pointer">
              {fontAwesomeLoaded ? (
                <i className="fas fa-chart-line w-5"></i>
              ) : (
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
              )}
              <span>Income Details</span>
            </Link> */}
            {/* <Link href="/referrals" className="flex items-center space-x-3 p-3 rounded-xl text-gray-400 hover:bg-white/10 transition-all cursor-pointer">
              {fontAwesomeLoaded ? (
                <i className="fas fa-users w-5"></i>
              ) : (
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
              )}
              <span>My Team</span>
            </Link> */}
            <Link href="/share" className="flex items-center space-x-3 p-3 rounded-xl text-gray-400 hover:bg-white/10 transition-all cursor-pointer">
              {fontAwesomeLoaded ? (
                <i className="fas fa-share-alt w-5"></i>
              ) : (
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
              )}
              <span>Share & Earn</span>
            </Link>
            <Link href="/leaderboard" className="flex items-center space-x-3 p-3 rounded-xl text-gray-400 hover:bg-white/10 transition-all cursor-pointer">
              {fontAwesomeLoaded ? (
                <i className="fas fa-trophy w-5"></i>
              ) : (
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
              )}
              <span>Leaderboard</span>
            </Link>
            {/* <Link href="/transactions" className="flex items-center space-x-3 p-3 rounded-xl text-gray-400 hover:bg-white/10 transition-all cursor-pointer">
              {fontAwesomeLoaded ? (
                <i className="fas fa-history w-5"></i>
              ) : (
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
              )}
              <span>Transaction History</span>
            </Link> */}
            <Link href="/settings" className="flex items-center space-x-3 p-3 rounded-xl text-gray-400 hover:bg-white/10 transition-all cursor-pointer">
              {fontAwesomeLoaded ? (
                <i className="fas fa-cog w-5"></i>
              ) : (
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
              )}
              <span>Settings</span>
            </Link>
            <Link href="/help" className="flex items-center space-x-3 p-3 rounded-xl text-gray-400 hover:bg-white/10 transition-all cursor-pointer">
              {fontAwesomeLoaded ? (
                <i className="fas fa-question-circle w-5"></i>
              ) : (
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
              )}
              <span>Help & Support</span>
            </Link>
          </div>

          {/* Wallet Status in Sidebar */}
          <div className="mt-4 p-4 glass-card rounded-xl">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Wallet Status</div>
              <div className={`text-sm font-semibold ${address ? 'text-green-400' : 'text-gray-400'}`}>
                {address ? 'Connected' : 'Not Connected'}
              </div>
              {address && (
                <div className="text-xs text-cyan-400 font-mono mt-1">
                  {`${address.slice(0, 6)}...${address.slice(-4)}`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      <div
        id="sidebar-overlay"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300 z-40"
        onClick={toggleSidebar}
      />
    </div>
  );
}
