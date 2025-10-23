'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/lib/wallet';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { useLevelIncome } from '@/lib/hooks/useLevelIncome';
import { useWithdrawLevel, useWithdrawAll } from '@/lib/hooks/useWithdraw';
import { useContractEvents } from '@/lib/hooks/useContractEvents';
import { IncomeTableSkeleton } from '@/components/skeletons/IncomeTableSkeleton';
import TransactionModal, { TransactionStatus } from '@/components/TransactionModal';

export default function IncomeDetails() {
  const [isClient, setIsClient] = useState(false);
  const { address } = useWallet();
  const { data: userInfo, isLoading: loadingUserInfo } = useUserInfo(address);
  const { data: levelIncome, isLoading: loadingLevelIncome } = useLevelIncome(address);
  const withdrawLevel = useWithdrawLevel();
  const withdrawAll = useWithdrawAll();

  // Transaction modal state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
  const [txHash, setTxHash] = useState<string>();
  const [txError, setTxError] = useState<string>();

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

  const handleClaimAll = async () => {
    if (!levelIncome || levelIncome.totals.available === BigInt(0)) {
      return;
    }

    setTxModalOpen(true);
    setTxStatus('estimating');
    setTxHash(undefined);
    setTxError(undefined);

    try {
      setTxStatus('signing');
      const result = await withdrawAll.mutateAsync();
      
      setTxHash(result.transactionHash);
      setTxStatus('pending');
      
      // Wait a bit then mark as confirmed
      setTimeout(() => {
        setTxStatus('confirmed');
      }, 2000);
    } catch (error) {
      console.error('Claim all failed:', error);
      setTxError((error as Error).message);
      setTxStatus('failed');
    }
  };

  const handleClaimLevel = async (level: number) => {
    if (!levelIncome) return;

    const levelData = levelIncome.levels[level - 1];
    if (levelData.available === BigInt(0)) {
      return;
    }

    setTxModalOpen(true);
    setTxStatus('estimating');
    setTxHash(undefined);
    setTxError(undefined);

    try {
      setTxStatus('signing');
      const result = await withdrawLevel.mutateAsync(level);
      
      setTxHash(result.transactionHash);
      setTxStatus('pending');
      
      setTimeout(() => {
        setTxStatus('confirmed');
      }, 2000);
    } catch (error) {
      console.error(`Claim level ${level} failed:`, error);
      setTxError((error as Error).message);
      setTxStatus('failed');
    }
  };

  const closeTxModal = () => {
    setTxModalOpen(false);
    setTxStatus('idle');
    setTxHash(undefined);
    setTxError(undefined);
  };

  // Helper functions for formatting
  const formatUsd = (value: unknown) =>
      value !== undefined && value !== null
        ? `$${(Number(value) / 1e18).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '$0.00';

  const getLevelColor = (level: number) => {
    const colors = ['green', 'blue', 'purple', 'orange', 'red', 'teal', 'pink', 'indigo', 'yellow', 'gray'];
    return colors[level - 1] || 'gray';
  };

  // Show loading state
  if ((loadingUserInfo || loadingLevelIncome) && !userInfo && !levelIncome) {
    return (
      <div className="relative z-10 min-h-screen">
        <div className="rain-animation" id="rain-container"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
              <i className="fas fa-spinner fa-spin text-2xl text-cyan-400"></i>
            </div>
            <p className="text-gray-400">Loading income data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen">
      {/* Animated USDT Rain Background */}
      <div className="rain-animation" id="rain-container"></div>

      {/* Header with Navigation */}
      <header className="px-4 py-4 border-b border-gray-800/50 backdrop-blur-lg bg-black/20">
        <div className="flex items-center justify-between">
          <button onClick={goBack} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
            <i className="fas fa-arrow-left text-cyan-400"></i>
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold orbitron gradient-text">Income Details</h1>
            <p className="text-gray-400 text-xs">Level + Global Pool</p>
          </div>
          <button className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
            <i className="fas fa-bell text-cyan-400"></i>
          </button>
        </div>
      </header>

      {/* Header Summary Card */}
      <section className="px-4 py-6">
        <div className="glass-card rounded-2xl p-6 neon-border slide-in">
          <div className="text-center mb-6">
            <div className="floating mb-4">
              <div className="w-16 h-16 mx-auto rounded-full earnings-card flex items-center justify-center pulse-glow">
                <i className="fas fa-coins text-2xl gradient-text"></i>
              </div>
            </div>
            <h2 className="text-2xl font-bold orbitron gradient-text mb-2">Total Earnings</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mb-4"></div>
          </div>

          {loadingUserInfo || loadingLevelIncome ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center">
                  <div className="h-6 bg-gray-700/50 rounded w-20 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-700/50 rounded w-16 mx-auto"></div>
                </div>
                <div className="text-center">
                  <div className="h-6 bg-gray-700/50 rounded w-20 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-700/50 rounded w-16 mx-auto"></div>
                </div>
                <div className="text-center">
                  <div className="h-6 bg-gray-700/50 rounded w-20 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-700/50 rounded w-16 mx-auto"></div>
                </div>
              </div>
              <div className="h-12 bg-gray-700/50 rounded-xl"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-white counter-animation">
                    {formatUsd(userInfo?.totalEarned)}
                  </div>
                  <p className="text-gray-400 text-xs">Total Earned</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400 counter-animation">
                    {formatUsd(userInfo?.totalWithdrawn)}
                  </div>
                  <p className="text-gray-400 text-xs">Total Claimed</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-400 counter-animation">
                    {levelIncome ? `$${levelIncome.totals.availableUSD}` : '$0.00'}
                  </div>
                  <p className="text-gray-400 text-xs">Available</p>
                </div>
              </div>

              <button 
                className={`w-full claim-button text-black font-bold py-4 px-6 rounded-xl orbitron text-lg ${
                  !levelIncome || levelIncome.totals.available === BigInt(0) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleClaimAll}
                disabled={!levelIncome || levelIncome.totals.available === BigInt(0) || withdrawAll.isPending}
              >
                <i className="fas fa-download mr-2"></i>
                {withdrawAll.isPending ? 'Processing...' : `Claim All ($${levelIncome?.totals.availableUSD || '0.00'})`}
              </button>
            </>
          )}
        </div>
      </section>

      {/* Level Income Section */}
      <section className="px-4 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mr-3">
              <i className="fas fa-layer-group text-blue-400 text-sm"></i>
            </div>
            <h2 className="text-xl font-bold text-white orbitron">Level Income</h2>
          </div>

          <div className="glass-card rounded-2xl p-4">
            {/* Level Income Table Header */}
            <div className="grid grid-cols-5 gap-2 mb-4 pb-3 border-b border-gray-700/50">
              <div className="text-gray-400 text-xs font-medium">Level</div>
              <div className="text-gray-400 text-xs font-medium text-center">Share</div>
              <div className="text-gray-400 text-xs font-medium text-right">Earned</div>
              <div className="text-gray-400 text-xs font-medium text-right">Available</div>
              <div className="text-gray-400 text-xs font-medium text-center">Action</div>
            </div>

            {/* Level Rows */}
            {loadingLevelIncome ? (
              <IncomeTableSkeleton />
            ) : levelIncome ? (
              <div className="space-y-2">
                {levelIncome.levels.map((item) => (
                  <div key={item.level} className="level-row grid grid-cols-5 gap-2 py-3 px-2 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-${getLevelColor(item.level)}-500/20 to-${getLevelColor(item.level)}-600/20 flex items-center justify-center mr-2`}>
                        <span className={`text-xs font-bold text-${getLevelColor(item.level)}-400`}>L{item.level}</span>
                      </div>
                    </div>
                    <div className="text-center text-white text-sm">{item.percentage}%</div>
                    <div className="text-right text-white text-sm font-medium">${item.earnedUSD}</div>
                    <div className="text-right text-cyan-400 text-sm font-medium">${item.availableUSD}</div>
                    <div className="text-center">
                      <button 
                        className={`mini-claim-btn text-black text-xs font-bold py-1 px-3 rounded-md ${
                          item.available === BigInt(0) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => handleClaimLevel(item.level)}
                        disabled={item.available === BigInt(0) || withdrawLevel.isPending}
                      >
                        {withdrawLevel.isPending ? '...' : 'Claim'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <i className="fas fa-info-circle text-3xl mb-3"></i>
                <p>No income data available</p>
                <p className="text-sm mt-2">Connect your wallet to view your earnings</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={txModalOpen}
        status={txStatus}
        txHash={txHash}
        error={txError}
        onClose={closeTxModal}
        title="Withdraw Earnings"
      />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-gray-800/50 px-4 py-3">
        <div className="flex items-center justify-around">
          <Link href="/" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-cyan-400 transition-colors">
            <i className="fas fa-home text-lg"></i>
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/income" className="flex flex-col items-center space-y-1 text-cyan-400">
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
