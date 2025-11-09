'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/lib/wallet';
import { useIsOwner } from '@/lib/hooks/useIsOwner';
import { useAdminSummary } from '@/lib/hooks/useAdminSummary';
import { useAdminActions } from '@/lib/hooks/useAdminActions';
import { usePendingAchieverRewards } from '@/lib/hooks/usePendingAchieverRewards';
import { useMarkAchieverReward } from '@/lib/hooks/useMarkAchieverReward';
import TransactionModal, { TransactionStatus } from '@/components/TransactionModal';
import { AdminAccessDebug } from '@/components/AdminAccessDebug';
import { parseError } from '@/lib/utils/errorMessages';
import { EligibleUsersManager } from '@/components/EligibleUsersManager';
import { BatchDistribution } from '@/components/BatchDistribution';
import { ManagerRoleManager } from '@/components/ManagerRoleManager';
import { ContractConfigDisplay } from '@/components/ContractConfigDisplay';

export default function AdminDashboard() {
  const router = useRouter();
  const { address } = useWallet();
  const { data: isOwner, isLoading: isCheckingOwner } = useIsOwner();
  const isConnected = !!address;
  const { data: adminSummary, isLoading } = useAdminSummary();
  const { data: pendingRewards, isLoading: loadingPendingRewards } = usePendingAchieverRewards();
  const adminActions = useAdminActions();
  const markAchieverReward = useMarkAchieverReward();

  // Transaction modal state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
  const [txHash, setTxHash] = useState<string>();
  const [txError, setTxError] = useState<string>();
  const [txTitle, setTxTitle] = useState('Transaction');

  // Form states
  const [showDistributionForm, setShowDistributionForm] = useState(false);
  const [levelIncomePercentage, setLevelIncomePercentage] = useState('70');
  const [globalPoolPercentage, setGlobalPoolPercentage] = useState('20');
  const [reservePercentage, setReservePercentage] = useState('10');
  const [newReserveWallet, setNewReserveWallet] = useState('');
  const [newOwnerAddress, setNewOwnerAddress] = useState('');

  useEffect(() => {
    // Create animated rain effect
    function createRain() {
      const rainContainer = document.getElementById('rain-container');
      if (!rainContainer) return;

      const symbols = ['₮', 'U', '₮', 'T'];

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

  const handleAdminAction = async (
    action: () => Promise<any>,
    title: string
  ) => {
    setTxTitle(title);
    setTxModalOpen(true);
    setTxStatus('estimating');
    setTxHash(undefined);
    setTxError(undefined);

    try {
      setTxStatus('signing');
      const result = await action();

      setTxHash(result.transactionHash);
      setTxStatus('pending');

      setTimeout(() => {
        setTxStatus('confirmed');
      }, 2000);
    } catch (error) {
      console.error(`${title} failed:`, error);

      // Use the error parsing utility for user-friendly messages
      const parsedError = parseError(error);
      const errorMessage = parsedError.action 
        ? `${parsedError.message} ${parsedError.action}`
        : parsedError.message;

      setTxError(errorMessage);
      setTxStatus('failed');
    }
  };

  const handlePause = () => {
    handleAdminAction(
      () => adminActions.pause.mutateAsync(),
      'Pause Contract'
    );
  };

  const handleUnpause = () => {
    handleAdminAction(
      () => adminActions.unpause.mutateAsync(),
      'Unpause Contract'
    );
  };

  const handleDistributeGlobalPool = () => {
    handleAdminAction(
      () => adminActions.distributeGlobalPool.mutateAsync(),
      'Distribute Global Pool'
    );
  };

  const handleDistributeGlobalPoolBatch = () => {
    handleAdminAction(
      () => adminActions.distributeGlobalPoolBatch.mutateAsync(),
      'Distribute Global Pool (Batch)'
    );
  };

  const handleEmergencyWithdraw = () => {
    if (!confirm('Are you sure you want to perform an emergency withdrawal? This action cannot be undone.')) {
      return;
    }
    handleAdminAction(
      () => adminActions.emergencyWithdraw.mutateAsync(),
      'Emergency Withdraw'
    );
  };

  const handleUpdateDistribution = () => {
    const total = Number(levelIncomePercentage) + Number(globalPoolPercentage) + Number(reservePercentage);
    if (total !== 100) {
      alert('Percentages must add up to 100%');
      return;
    }

    handleAdminAction(
      () => adminActions.updateDistributionPercentages.mutateAsync({
        levelIncome: Number(levelIncomePercentage),
        globalPool: Number(globalPoolPercentage),
        reserve: Number(reservePercentage),
      }),
      'Update Distribution Percentages'
    );
    setShowDistributionForm(false);
  };

  const handleUpdateReserveWallet = () => {
    if (!newReserveWallet || !newReserveWallet.startsWith('0x')) {
      alert('Please enter a valid wallet address');
      return;
    }

    handleAdminAction(
      () => adminActions.updateReserveWallet.mutateAsync(newReserveWallet),
      'Update Reserve Wallet'
    );
    setNewReserveWallet('');
  };

  const handleTransferOwnership = () => {
    if (!newOwnerAddress || !newOwnerAddress.startsWith('0x')) {
      alert('Please enter a valid wallet address');
      return;
    }

    if (!confirm(`Are you sure you want to transfer ownership to ${newOwnerAddress}? This action cannot be undone.`)) {
      return;
    }

    handleAdminAction(
      () => adminActions.transferOwnership.mutateAsync(newOwnerAddress),
      'Transfer Ownership'
    );
    setNewOwnerAddress('');
  };

  const handleMarkAchieverReward = async (userId: number, level: number, userName: string) => {
    if (!confirm(`Approve Level ${level} Achiever Reward for ${userName} (User ID: ${userId})?`)) {
      return;
    }

    handleAdminAction(
      () => markAchieverReward.mutateAsync({ userId, level }),
      `Mark Achiever Reward - Level ${level}`
    );
  };

  const closeTxModal = () => {
    setTxModalOpen(false);
    setTxStatus('idle');
    setTxHash(undefined);
    setTxError(undefined);
  };

  const formatUsd = (value: unknown) =>
    value !== undefined && value !== null
      ? `$${(Number(value) / 1e18).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : '$0.00';

  // Redirect non-owners to home
  useEffect(() => {
    console.log('Admin page - Access check:', {
      isCheckingOwner,
      isConnected,
      isOwner,
      address
    });
    
    if (!isCheckingOwner && isConnected && isOwner === false) {
      console.log('Admin page - Redirecting to home (access denied)');
      router.push('/');
    }
  }, [isOwner, isCheckingOwner, isConnected, router, address]);

  // Loading state while checking owner
  if (isCheckingOwner || (isConnected && isOwner === undefined)) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="rain-animation" id="rain-container"></div>
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <i className="fas fa-spinner fa-spin text-5xl text-cyan-400 mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-4 orbitron">Verifying Access</h2>
          <p className="text-gray-400">Checking admin credentials...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="rain-animation" id="rain-container"></div>
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <i className="fas fa-wallet text-5xl text-cyan-400 mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-4 orbitron">Wallet Not Connected</h2>
          <p className="text-gray-400 mb-6">Please connect your wallet to access the admin dashboard</p>
          <Link
            href="/wallet"
            className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Connect Wallet
          </Link>
        </div>
      </div>
    );
  }

  // If not owner, show nothing (will redirect)
  if (!isOwner) {
    return null;
  }

  return (
    <div className="relative z-10 min-h-screen pb-24">
      {/* Animated USDT Rain Background */}
      <div className="rain-animation" id="rain-container"></div>

      {/* Header */}
      <header className="px-4 py-4 border-b border-gray-800/50 backdrop-blur-lg bg-black/20 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <Link href="/" className="w-10 h-10 rounded-xl glass-card flex items-center justify-center hover:scale-105 transition-transform">
            <i className="fas fa-arrow-left text-cyan-400"></i>
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold orbitron gradient-text flex items-center justify-center">
              <i className="fas fa-shield-alt text-cyan-400 mr-2 text-sm"></i>
              Admin Dashboard
            </h1>
            <p className="text-gray-400 text-xs">Contract Management Portal</p>
          </div>
          <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
            <i className="fas fa-crown text-yellow-400"></i>
          </div>
        </div>
      </header>

      {/* Info Banner */}
      <section className="px-4 py-4">
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-xl p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mr-3 flex-shrink-0">
              <i className="fas fa-info-circle text-cyan-400"></i>
            </div>
            <div className="flex-1">
              <p className="text-cyan-300 font-semibold text-sm">Admin Access Verified</p>
              <p className="text-gray-400 text-xs">Contract owner or first user - Full administrative control</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs text-green-400 font-semibold">ACTIVE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-4 mb-6">
        <div className="slide-in">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center">
            <i className="fas fa-bolt text-yellow-400 mr-2 text-xs"></i>
            Quick Actions
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <Link
              href="/leaderboard"
              className="glass-card rounded-xl p-3 text-center hover:scale-105 transition-transform"
            >
              <i className="fas fa-trophy text-yellow-400 text-lg mb-1 block"></i>
              <div className="text-xs text-white font-semibold">Leaderboard</div>
            </Link>
            <Link
              href="/transactions"
              className="glass-card rounded-xl p-3 text-center hover:scale-105 transition-transform"
            >
              <i className="fas fa-history text-cyan-400 text-lg mb-1 block"></i>
              <div className="text-xs text-white font-semibold">Transactions</div>
            </Link>
            <Link
              href="/"
              className="glass-card rounded-xl p-3 text-center hover:scale-105 transition-transform"
            >
              <i className="fas fa-home text-purple-400 text-lg mb-1 block"></i>
              <div className="text-xs text-white font-semibold">Dashboard</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Pending Achiever Rewards */}
      <section className="px-4 mb-6">
        <div className="slide-in">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <i className="fas fa-award text-pink-400 mr-2"></i>
            Pending Achiever Rewards
            {pendingRewards && pendingRewards.length > 0 && (
              <span className="ml-2 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {pendingRewards.length}
              </span>
            )}
          </h2>
          {loadingPendingRewards ? (
            <div className="glass-card rounded-2xl p-6 animate-pulse">
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-700/50 rounded-xl"></div>
                ))}
              </div>
            </div>
          ) : pendingRewards && pendingRewards.length > 0 ? (
            <div className="glass-card rounded-2xl p-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingRewards.map((reward) => (
                  <div
                    key={`${reward.userId}-${reward.level}`}
                    className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-400/20 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-pink-400">{reward.level}</span>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{reward.userName}</h3>
                            <p className="text-xs text-gray-400">User ID: {reward.userId}</p>
                          </div>
                        </div>
                        <div className="ml-11">
                          <p className="text-sm text-gray-300 mb-1">
                            Level {reward.level} Achiever Reward
                          </p>
                          <div className="flex items-center text-xs text-gray-400">
                            <i className="fas fa-check-circle text-green-400 mr-1"></i>
                            <span>
                              {reward.currentCount} / {reward.requirement} requirement met
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMarkAchieverReward(reward.userId, reward.level, reward.userName)}
                      disabled={markAchieverReward.isPending}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {markAchieverReward.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check mr-2"></i>
                          Approve Level {reward.level} Reward
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                <i className="fas fa-check-circle text-3xl text-pink-400"></i>
              </div>
              <h3 className="text-white font-semibold mb-2">All Caught Up!</h3>
              <p className="text-gray-400 text-sm">No pending achiever reward approvals at this time</p>
            </div>
          )}
        </div>
      </section>

      {/* Manager Role Management */}
      <section className="px-4 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <i className="fas fa-user-shield text-purple-400 mr-2"></i>
            Manager Role
          </h2>
          <ManagerRoleManager />
        </div>
      </section>

      {/* Eligible Users Management */}
      <section className="px-4 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <i className="fas fa-users text-cyan-400 mr-2"></i>
            Eligible Users Management
          </h2>
          <EligibleUsersManager />
        </div>
      </section>

      {/* Batch Distribution */}
      <section className="px-4 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <i className="fas fa-share-alt text-blue-400 mr-2"></i>
            Global Pool Distribution
          </h2>
          <BatchDistribution />
        </div>
      </section>

      {/* Contract Statistics */}
      <section className="px-4 mb-6">
        <div className="slide-in">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <i className="fas fa-chart-bar text-cyan-400 mr-2"></i>
            Contract Statistics
          </h2>
          {isLoading ? (
            <div className="glass-card rounded-2xl p-6 animate-pulse">
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-700/50 rounded-xl"></div>
                ))}
              </div>
            </div>
          ) : adminSummary ? (
            <div className="glass-card rounded-2xl p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-400/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Total Users</div>
                    <i className="fas fa-users text-cyan-400/50"></i>
                  </div>
                  <div className="text-2xl font-bold text-white orbitron">{adminSummary.totalUsers}</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-400/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Active Users</div>
                    <i className="fas fa-user-check text-cyan-400/50"></i>
                  </div>
                  <div className="text-2xl font-bold text-white orbitron">{adminSummary.activeUsers}</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-400/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Global Pool</div>
                    <i className="fas fa-swimming-pool text-cyan-400/50"></i>
                  </div>
                  <div className="text-lg font-bold text-white orbitron">{formatUsd(adminSummary.globalPoolBalance)}</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-400/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Distributed</div>
                    <i className="fas fa-hand-holding-usd text-cyan-400/50"></i>
                  </div>
                  <div className="text-lg font-bold text-white orbitron">{formatUsd(adminSummary.totalDistributed)}</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-400/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Eligible Users</div>
                    <i className="fas fa-user-shield text-cyan-400/50"></i>
                  </div>
                  <div className="text-2xl font-bold text-white orbitron">{adminSummary.eligibleUsers}</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-400/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Balance</div>
                    <i className="fas fa-wallet text-cyan-400/50"></i>
                  </div>
                  <div className="text-lg font-bold text-white orbitron">{formatUsd(adminSummary.contractBalance)}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6 text-center text-gray-400">
              <i className="fas fa-info-circle text-3xl mb-3"></i>
              <p>Unable to load statistics</p>
            </div>
          )}
        </div>
      </section>

      {/* Contract Configuration */}
      <section className="px-4 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <i className="fas fa-cog text-cyan-400 mr-2"></i>
            Contract Configuration
          </h2>
          <ContractConfigDisplay />
        </div>
      </section>

      {/* Contract Controls */}
      <section className="px-4 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <i className="fas fa-sliders-h text-cyan-400 mr-2"></i>
            Contract Controls
          </h2>
          
          {/* Primary Actions */}
          <div className="glass-card rounded-2xl p-4 mb-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Global Pool Distribution</h3>
            
            {/* Info Note */}
            <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <i className="fas fa-info-circle text-blue-400 mt-0.5 mr-2"></i>
                <div className="text-xs text-blue-300">
                  <strong>How it works:</strong> The contract automatically distributes to all eligible users you've added. Make sure you have eligible users added before distributing.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDistributeGlobalPool}
                disabled={adminActions.distributeGlobalPool.isPending}
                className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 hover:from-cyan-500/30 hover:to-cyan-600/20 border border-cyan-400/30 text-white font-semibold py-4 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-share-alt text-cyan-400 text-xl mb-2 block"></i>
                <div className="text-sm">
                  {adminActions.distributeGlobalPool.isPending ? 'Processing...' : 'Distribute Pool'}
                </div>
              </button>

              <button
                onClick={handleDistributeGlobalPoolBatch}
                disabled={adminActions.distributeGlobalPoolBatch.isPending}
                className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 hover:from-purple-500/30 hover:to-purple-600/20 border border-purple-400/30 text-white font-semibold py-4 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-layer-group text-purple-400 text-xl mb-2 block"></i>
                <div className="text-sm">
                  {adminActions.distributeGlobalPoolBatch.isPending ? 'Processing...' : 'Batch Distribute'}
                </div>
              </button>
            </div>
          </div>

          {/* Contract State */}
          <div className="glass-card rounded-2xl p-4 mb-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Contract State</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handlePause}
                disabled={adminActions.pause.isPending}
                className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 hover:from-yellow-500/30 hover:to-yellow-600/20 border border-yellow-400/30 text-white font-semibold py-4 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-pause-circle text-yellow-400 text-xl mb-2 block"></i>
                <div className="text-sm">
                  {adminActions.pause.isPending ? 'Processing...' : 'Pause Contract'}
                </div>
              </button>

              <button
                onClick={handleUnpause}
                disabled={adminActions.unpause.isPending}
                className="bg-gradient-to-br from-green-500/20 to-green-600/10 hover:from-green-500/30 hover:to-green-600/20 border border-green-400/30 text-white font-semibold py-4 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-play-circle text-green-400 text-xl mb-2 block"></i>
                <div className="text-sm">
                  {adminActions.unpause.isPending ? 'Processing...' : 'Unpause Contract'}
                </div>
              </button>
            </div>
          </div>

          {/* Emergency Actions */}
          <div className="glass-card rounded-2xl p-4 border-2 border-red-500/20">
            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-3 flex items-center">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              Emergency Actions
            </h3>
            <button
              onClick={handleEmergencyWithdraw}
              disabled={adminActions.emergencyWithdraw.isPending}
              className="w-full bg-gradient-to-br from-red-500/20 to-red-600/10 hover:from-red-500/30 hover:to-red-600/20 border border-red-400/30 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-exclamation-triangle text-red-400 mr-2"></i>
              {adminActions.emergencyWithdraw.isPending ? 'Processing...' : 'Emergency Withdraw'}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">⚠️ Use only in critical situations</p>
          </div>
        </div>
      </section>

      {/* Configuration */}
      <section className="px-4 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <i className="fas fa-cog text-cyan-400 mr-2"></i>
            Configuration
          </h2>
          
          {/* Distribution Percentages */}
          <div className="glass-card rounded-2xl p-5 mb-3">
            <button
              onClick={() => setShowDistributionForm(!showDistributionForm)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mr-3">
                  <i className="fas fa-percentage text-cyan-400"></i>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Distribution Percentages</h3>
                  <p className="text-xs text-gray-400">Adjust fee distribution ratios</p>
                </div>
              </div>
              <i className={`fas fa-chevron-${showDistributionForm ? 'up' : 'down'} text-gray-400`}></i>
            </button>

            {showDistributionForm && (
              <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Level Income %</label>
                  <input
                    type="number"
                    value={levelIncomePercentage}
                    onChange={(e) => setLevelIncomePercentage(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="70"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Global Pool %</label>
                  <input
                    type="number"
                    value={globalPoolPercentage}
                    onChange={(e) => setGlobalPoolPercentage(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Reserve %</label>
                  <input
                    type="number"
                    value={reservePercentage}
                    onChange={(e) => setReservePercentage(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="10"
                  />
                </div>
                <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-lg p-3">
                  <p className="text-xs text-cyan-300">
                    <i className="fas fa-info-circle mr-2"></i>
                    Total must equal 100%
                  </p>
                </div>
                <button
                  onClick={handleUpdateDistribution}
                  disabled={adminActions.updateDistributionPercentages.isPending}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adminActions.updateDistributionPercentages.isPending ? 'Processing...' : 'Update Percentages'}
                </button>
              </div>
            )}
          </div>

          {/* Reserve Wallet */}
          <div className="glass-card rounded-2xl p-5 mb-3">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mr-3">
                <i className="fas fa-wallet text-cyan-400"></i>
              </div>
              <div>
                <h3 className="text-white font-semibold">Reserve Wallet</h3>
                <p className="text-xs text-gray-400">Update reserve fund address</p>
              </div>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={newReserveWallet}
                onChange={(e) => setNewReserveWallet(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                placeholder="0x..."
              />
              <button
                onClick={handleUpdateReserveWallet}
                disabled={adminActions.updateReserveWallet.isPending || !newReserveWallet}
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adminActions.updateReserveWallet.isPending ? 'Processing...' : 'Update Reserve Wallet'}
              </button>
            </div>
          </div>

          {/* Transfer Ownership */}
          <div className="glass-card rounded-2xl p-5 border-2 border-red-500/20">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mr-3">
                <i className="fas fa-key text-red-400"></i>
              </div>
              <div>
                <h3 className="text-white font-semibold">Transfer Ownership</h3>
                <p className="text-xs text-red-400">⚠️ Irreversible action</p>
              </div>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={newOwnerAddress}
                onChange={(e) => setNewOwnerAddress(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-400 transition-colors font-mono"
                placeholder="0x..."
              />
              <button
                onClick={handleTransferOwnership}
                disabled={adminActions.transferOwnership.isPending || !newOwnerAddress}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {adminActions.transferOwnership.isPending ? 'Processing...' : 'Transfer Ownership'}
              </button>
            </div>
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
        title={txTitle}
      />

      {/* Debug Component - Remove in production */}
      <AdminAccessDebug />
    </div>
  );
}
