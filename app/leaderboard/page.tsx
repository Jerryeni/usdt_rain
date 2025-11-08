'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { useWallet } from '@/lib/wallet';
import { useUserInfo } from '@/lib/hooks/useUserInfo';

export default function LeaderboardPage() {
  const [isClient, setIsClient] = useState(false);
  const { address } = useWallet();
  const { data: userInfo } = useUserInfo(address);
  const { data: leaderboard, isLoading } = useLeaderboard(50);

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

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-cyan-400 to-blue-500';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '⭐';
  };

  // Find current user's rank
  const userRank = leaderboard?.find(
    (entry) => address && entry.address.toLowerCase() === address.toLowerCase()
  );

  // Show loading state
  if (isLoading && !leaderboard) {
    return (
      <div className="relative z-10 min-h-screen">
        <div className="rain-animation" id="rain-container"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
              <i className="fas fa-spinner fa-spin text-2xl text-cyan-400"></i>
            </div>
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen pb-24">
      {/* Animated USDT Rain Background */}
      <div className="rain-animation" id="rain-container"></div>

      {/* Header */}
      <header className="px-4 py-4 border-b border-gray-800/50 backdrop-blur-lg bg-black/20">
        <div className="flex items-center justify-between">
          <button onClick={goBack} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
            <i className="fas fa-arrow-left text-cyan-400"></i>
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold orbitron gradient-text">Leaderboard</h1>
            <p className="text-gray-400 text-xs">Top Earners</p>
          </div>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      {/* User's Rank Card */}
      {userRank && (
        <section className="px-4 py-6">
          <div className="glass-card rounded-2xl p-4 slide-in border-2 border-cyan-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mr-3">
                  <span className="text-2xl">{getRankIcon(userRank.rank)}</span>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Your Rank</div>
                  <div className="text-xl font-bold text-cyan-400 orbitron">#{userRank.rank}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Total Earned</div>
                <div className="text-xl font-bold text-white orbitron">${userRank.totalEarnedUSD}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Top 3 Podium */}
      {leaderboard && leaderboard.length >= 3 && (
        <section className="px-4 mb-6">
          <div className="slide-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-lg font-bold text-white mb-4">🏆 Top 3 Champions</h2>
            <div className="grid grid-cols-3 gap-2">
              {/* 2nd Place */}
              <div className="glass-card rounded-xl p-3 text-center" style={{ marginTop: '20px' }}>
                <div className="text-3xl mb-2">🥈</div>
                <div className="text-sm font-bold text-gray-300 truncate">{leaderboard[1].userName}</div>
                <div className="text-xs text-gray-400 mb-2">#{leaderboard[1].rank}</div>
                <div className="text-lg font-bold text-gray-300 orbitron">${leaderboard[1].totalEarnedUSD}</div>
              </div>

              {/* 1st Place */}
              <div className="glass-card rounded-xl p-3 text-center border-2 border-yellow-400/30">
                <div className="text-4xl mb-2">👑</div>
                <div className="text-sm font-bold text-yellow-400 truncate">{leaderboard[0].userName}</div>
                <div className="text-xs text-yellow-400/70 mb-2">#{leaderboard[0].rank}</div>
                <div className="text-xl font-bold text-yellow-400 orbitron">${leaderboard[0].totalEarnedUSD}</div>
              </div>

              {/* 3rd Place */}
              <div className="glass-card rounded-xl p-3 text-center" style={{ marginTop: '20px' }}>
                <div className="text-3xl mb-2">🥉</div>
                <div className="text-sm font-bold text-orange-300 truncate">{leaderboard[2].userName}</div>
                <div className="text-xs text-gray-400 mb-2">#{leaderboard[2].rank}</div>
                <div className="text-lg font-bold text-orange-300 orbitron">${leaderboard[2].totalEarnedUSD}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Full Leaderboard */}
      <section className="px-4 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-bold text-white mb-4">All Rankings</h2>
          
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="w-10 h-10 bg-gray-700/50 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700/50 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-700/50 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-700/50 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : leaderboard && leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.userId ? entry.userId.toString() : `entry-${index}`}
                  className={`glass-card rounded-xl p-4 ${
                    address && entry.address.toLowerCase() === address.toLowerCase()
                      ? 'border-2 border-cyan-400/30'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRankColor(entry.rank)} flex items-center justify-center mr-3 font-bold text-white`}>
                        {entry.rank <= 3 ? getRankIcon(entry.rank) : `#${entry.rank}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold truncate">{entry.userName}</div>
                        <div className="text-xs text-gray-400">
                          {entry.directReferrals} referrals • Level {entry.achieverLevel}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <div className="text-lg font-bold text-cyan-400 orbitron">${entry.totalEarnedUSD}</div>
                      <div className="text-xs text-gray-400">earned</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center">
              <i className="fas fa-trophy text-4xl text-gray-600 mb-4"></i>
              <h3 className="text-white font-semibold mb-2">No Rankings Yet</h3>
              <p className="text-gray-400 text-sm">
                Be the first to earn and claim your spot on the leaderboard!
              </p>
            </div>
          )}
        </div>
      </section>

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
          <Link href="/referrals" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-cyan-400 transition-colors">
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
