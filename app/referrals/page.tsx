'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/lib/wallet';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { useReferrals } from '@/lib/hooks/useReferrals';
import { useContractEvents } from '@/lib/hooks/useContractEvents';
import { ReferralCardSkeleton } from '@/components/skeletons/ReferralCardSkeleton';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/lib/hooks/useSidebar';

export default function Referrals() {
  const [isClient, setIsClient] = useState(false);
  const { address } = useWallet();
  const { data: userInfo, isLoading: loadingUserInfo } = useUserInfo(address);
  const { data: referralData, isLoading: loadingReferrals } = useReferrals(userInfo?.userId);
  const { toggleSidebar, closeSidebar } = useSidebar();

  // Set up event listeners for real-time updates
  useContractEvents(address);

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

  const goBack = () => {
    window.history.back();
  };

  const getLevelColor = (level: number) => {
    const colors = ['green', 'blue', 'purple', 'orange', 'red', 'teal', 'pink', 'indigo', 'yellow', 'cyan'];
    return colors[level - 1] || 'gray';
  };

  // Show loading state
  if ((loadingUserInfo || loadingReferrals) && !userInfo && !referralData) {
    return (
      <div className="relative z-10 min-h-screen">
        <div className="rain-animation" id="rain-container"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
              <i className="fas fa-spinner fa-spin text-2xl text-cyan-400"></i>
            </div>
            <p className="text-gray-400">Loading referral data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen pb-24">
      {/* Animated USDT Rain Background */}
      <div className="rain-animation" id="rain-container"></div>

      {/* Header with Navigation */}
      <header className="px-4 py-4 border-b border-gray-800/50 backdrop-blur-lg bg-black/20">
        <div className="flex items-center justify-between">
          <Link href="/" className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
            <i className="fas fa-home text-cyan-400"></i>
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold orbitron gradient-text">My Referrals</h1>
            <p className="text-gray-400 text-xs">Team Management</p>
          </div>
          <button onClick={toggleSidebar} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
            <i className="fas fa-bars text-cyan-400"></i>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar onClose={closeSidebar} />

      {/* Team Overview */}
      <section className="px-4 py-6">
        <div className="glass-card rounded-2xl p-6 slide-in">
          {loadingUserInfo || loadingReferrals ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="h-10 bg-gray-700/50 rounded w-20 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-24 mx-auto"></div>
                </div>
                <div className="text-center">
                  <div className="h-10 bg-gray-700/50 rounded w-20 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-24 mx-auto"></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold gradient-text orbitron counter-animation">
                    {referralData?.direct.count || 0}
                  </div>
                  <p className="text-gray-400 text-sm">Total Referrals</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold gradient-text orbitron counter-animation">
                    {referralData?.teamStats.activeMembers || 0}
                  </div>
                  <p className="text-gray-400 text-sm">Active Members</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-400/20 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mr-3">
                      <i className="fas fa-chart-line text-green-400 text-sm"></i>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Team Volume</h3>
                      <p className="text-gray-400 text-xs">Total earnings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold orbitron">
                      ${referralData?.teamStats.teamVolumeUSD || '0.00'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mr-3">
                      <i className="fas fa-users text-blue-400 text-sm"></i>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Total Network</h3>
                      <p className="text-gray-400 text-xs">All levels</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-400 font-bold orbitron">
                      {referralData?.teamStats.totalMembers || 0}
                    </div>
                    <div className="text-gray-400 text-xs">members</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Level Breakdown */}
      <section className="px-4 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-bold text-white orbitron mb-4">Level Breakdown</h2>

          {loadingReferrals ? (
            <ReferralCardSkeleton count={10} />
          ) : referralData && referralData.byLevel.length > 0 ? (
            <div className="space-y-3">
              {referralData.byLevel.slice(0, 10).map((item) => (
                <div key={item.level} className="glass-card rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg bg-${getLevelColor(item.level)}-500/20 flex items-center justify-center mr-3`}>
                        <span className={`text-${getLevelColor(item.level)}-400 font-bold text-sm`}>{item.level}</span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Level {item.level}</h3>
                        <p className="text-gray-400 text-xs">
                          {item.count} {item.count === 1 ? 'member' : 'members'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-${getLevelColor(item.level)}-400 font-bold`}>
                        ${item.incomeUSD}
                      </div>
                      <div className="text-gray-400 text-xs">earned</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center">
              <i className="fas fa-users text-4xl text-gray-600 mb-4"></i>
              <h3 className="text-white font-semibold mb-2">No Referrals Yet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Start building your team by sharing your referral link
              </p>
              <Link href="/share">
                <button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-2 px-6 rounded-xl transition-all">
                  <i className="fas fa-share-alt mr-2"></i>
                  Share Link
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Direct Referrals List */}
      {referralData && referralData.direct.referrals.length > 0 && (
        <section className="px-4 mb-6">
          <div className="slide-in" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-xl font-bold text-white orbitron mb-4">Direct Referrals</h2>

            <div className="space-y-3">
              {referralData.direct.referrals.map((referral) => (
                <div key={referral.userId.toString()} className="glass-card rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mr-3">
                        <i className="fas fa-user text-cyan-400"></i>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          {referral.userName ? (
                            <span className="flex items-center">
                              <i className="fas fa-id-badge text-cyan-400 text-xs mr-1.5"></i>
                              {referral.userName}
                              <span className="text-gray-500 text-xs ml-2">#{referral.userId ? referral.userId.toString() : 'N/A'}</span>
                            </span>
                          ) : (
                            `User #${referral.userId ? referral.userId.toString() : 'N/A'}`
                          )}
                        </h3>
                        {referral.contactNumber ? (
                          <p className="text-cyan-400 text-xs flex items-center mt-0.5">
                            <i className="fas fa-phone text-xs mr-1.5"></i>
                            {referral.contactNumber}
                          </p>
                        ) : (
                          <p className="text-gray-400 text-xs font-mono">
                            {referral.address.slice(0, 6)}...{referral.address.slice(-4)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${
                        referral.isActive 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {referral.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-700/30">
                    <div className="text-center">
                      <div className="text-sm text-white font-semibold">
                        {referral.directReferrals}
                      </div>
                      <div className="text-xs text-gray-400">Referrals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-cyan-400 font-semibold">
                        ${referral.totalEarned ? (Number(referral.totalEarned) / 1e18).toFixed(2) : '0.00'}
                      </div>
                      <div className="text-xs text-gray-400">Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-white font-semibold">
                        {referral.joinDate.toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">Joined</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-gray-800/50 px-4 py-3">
        <div className="flex items-center justify-around">
          <Link href="/" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-cyan-400 transition-colors">
            <i className="fas fa-home text-lg"></i>
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/income" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-cyan-400 transition-colors">
            <i className="fas fa-chart-line text-lg"></i>
            <span className="text-xs">Income</span>
          </Link>
          <Link href="/referrals" className="flex flex-col items-center space-y-1 text-cyan-400">
            <i className="fas fa-users text-lg"></i>
            <span className="text-xs">Team</span>
          </Link>
          <Link href="/transactions" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-cyan-400 transition-colors">
            <i className="fas fa-exchange-alt text-lg"></i>
            <span className="text-xs">Transactions</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-cyan-400 transition-colors">
            <i className="fas fa-user text-lg"></i>
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
