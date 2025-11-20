'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/lib/wallet';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { useLevelIncome } from '@/lib/hooks/useLevelIncome';
import { useGlobalPool } from '@/lib/hooks/useGlobalPool';
// import { useAchieverRewards } from '@/lib/hooks/useAchieverRewards';
// import { useNonWorkingIncome } from '@/lib/hooks/useNonWorkingIncome';
// import { useCountdown } from '@/lib/hooks/useCountdown';
import { useWithdrawLevel, useWithdrawAll, useClaimNonWorking } from '@/lib/hooks/useWithdraw';
import { useClaimGlobalPool } from '@/lib/hooks/useClaimGlobalPool';
import { useContractEvents } from '@/lib/hooks/useContractEvents';
import { IncomeTableSkeleton } from '@/components/skeletons/IncomeTableSkeleton';
import TransactionModal, { TransactionStatus } from '@/components/TransactionModal';
import type { NonWorkingIncomeData } from '@/lib/hooks/useNonWorkingIncome';
import { parseError } from '@/lib/utils/errorMessages';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/lib/hooks/useSidebar';

// function MonthlyRewardsContent({ 
//   nonWorkingIncome, 
//   claimNonWorking, 
//   handleClaimNonWorking 
// }: { 
//   nonWorkingIncome: NonWorkingIncomeData;
//   claimNonWorking: any;
//   handleClaimNonWorking: () => void;
// }) {
//   const countdown = useCountdown(Number(nonWorkingIncome.nextClaimTime));

//   return (
//     <>
//       <div className="grid grid-cols-2 gap-4 mb-6">
//         <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-4 text-center">
//           <div className="text-sm text-gray-400 mb-1">Total Claimed</div>
//           <div className="text-2xl font-bold text-green-400 orbitron">
//             ${nonWorkingIncome.totalClaimedUSD}
//           </div>
//           <div className="text-xs text-gray-400 mt-1">All time</div>
//         </div>

//         <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-4 text-center">
//           <div className="text-sm text-gray-400 mb-1">Last Claim</div>
//           <div className="text-lg font-bold text-green-400 orbitron">
//             {Number(nonWorkingIncome.lastClaimTime) > 0
//               ? new Date(Number(nonWorkingIncome.lastClaimTime) * 1000).toLocaleDateString()
//               : 'Never'}
//           </div>
//           <div className="text-xs text-gray-400 mt-1">Date</div>
//         </div>
//       </div>

//       {nonWorkingIncome.hasDirectReferrals ? (
//         <div className="bg-orange-500/10 border border-orange-400/20 rounded-xl p-4 text-center">
//           <div className="text-sm text-orange-300 mb-2">
//             <i className="fas fa-info-circle mr-2"></i>
//             Not Eligible for Non-Working Rewards
//           </div>
//           <div className="text-sm text-gray-400 mt-2">
//             Non-working rewards are only available for users without direct referrals. Since you have an active team, you earn through Level Income and Global Pool instead!
//           </div>
//         </div>
//       ) : nonWorkingIncome.canClaim ? (
//         <button
//           onClick={handleClaimNonWorking}
//           disabled={claimNonWorking.isPending}
//           className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed orbitron"
//         >
//           {claimNonWorking.isPending ? (
//             <>
//               <i className="fas fa-spinner fa-spin mr-2"></i>
//               Processing...
//             </>
//           ) : (
//             <>
//               <i className="fas fa-gift mr-2"></i>
//               Claim Non-Working Reward
//             </>
//           )}
//         </button>
//       ) : (
//         <div className="space-y-4">
//           {/* Countdown Display */}
//           {!countdown.isExpired && Number(nonWorkingIncome.nextClaimTime) > 0 && (
//             <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-xl p-6 text-center">
//               <div className="text-sm text-gray-400 mb-3">
//                 <i className="fas fa-hourglass-half mr-2"></i>
//                 Time Until Next Claim
//               </div>
//               <div className="text-4xl font-bold text-green-400 orbitron mb-2">
//                 {countdown.formatted}
//               </div>
//               <div className="grid grid-cols-4 gap-2 mt-4">
//                 {countdown.days > 0 && (
//                   <div className="bg-green-500/20 rounded-lg p-2">
//                     <div className="text-2xl font-bold text-green-400">{countdown.days}</div>
//                     <div className="text-xs text-gray-400">Days</div>
//                   </div>
//                 )}
//                 <div className="bg-green-500/20 rounded-lg p-2">
//                   <div className="text-2xl font-bold text-green-400">{countdown.hours}</div>
//                   <div className="text-xs text-gray-400">Hours</div>
//                 </div>
//                 <div className="bg-green-500/20 rounded-lg p-2">
//                   <div className="text-2xl font-bold text-green-400">{countdown.minutes}</div>
//                   <div className="text-xs text-gray-400">Minutes</div>
//                 </div>
//                 <div className="bg-green-500/20 rounded-lg p-2">
//                   <div className="text-2xl font-bold text-green-400">{countdown.seconds}</div>
//                   <div className="text-xs text-gray-400">Seconds</div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Disabled Claim Button */}
//           <button
//             disabled
//             className="w-full bg-gray-600 text-gray-400 font-bold py-4 px-6 rounded-xl cursor-not-allowed orbitron opacity-50"
//           >
//             <i className="fas fa-lock mr-2"></i>
//             Claim Available {Number(nonWorkingIncome.nextClaimTime) > 0 
//               ? new Date(Number(nonWorkingIncome.nextClaimTime) * 1000).toLocaleDateString()
//               : 'After Activation'}
//           </button>

//           <div className="text-center text-xs text-gray-400">
//             <i className="fas fa-info-circle mr-1"></i>
//             Rewards can be claimed every 5 minutes
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

export default function IncomeDetails() {
  const [isClient, setIsClient] = useState(false);
  const [isRequestingEligibility, setIsRequestingEligibility] = useState(false);
  const [hasRequestedEligibility, setHasRequestedEligibility] = useState(false);
  const router = useRouter();
  const { address } = useWallet();
  const { data: userInfo, isLoading: loadingUserInfo } = useUserInfo(address);
  const { data: levelIncome, isLoading: loadingLevelIncome } = useLevelIncome(address);
  const { data: globalPool, isLoading: loadingGlobalPool, refetch: refetchGlobalPool } = useGlobalPool(address);
  // const { data: achieverRewards, isLoading: loadingAchiever } = useAchieverRewards(address);
  // const { data: nonWorkingIncome, isLoading: loadingNonWorking } = useNonWorkingIncome(address);
  const withdrawLevel = useWithdrawLevel();
  const withdrawAll = useWithdrawAll();
  const claimGlobalPool = useClaimGlobalPool();
  const claimNonWorking = useClaimNonWorking();
  const { toggleSidebar, closeSidebar } = useSidebar();

  // Transaction modal state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
  const [txHash, setTxHash] = useState<string>();
  const [txError, setTxError] = useState<string>();

  // Set up event listeners for real-time updates
  useContractEvents(address);

  // Check localStorage for activation status
  useEffect(() => {
    if (address) {
      const storageKey = `eligibility_requested_${address.toLowerCase()}`;
      const hasRequested = localStorage.getItem(storageKey) === 'true';
      setHasRequestedEligibility(hasRequested);
    }
  }, [address]);

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
      
      const parsedError = parseError(error);
      const errorMessage = parsedError.action 
        ? `${parsedError.message} ${parsedError.action}`
        : parsedError.message;
      
      setTxError(errorMessage);
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
      
      const parsedError = parseError(error);
      const errorMessage = parsedError.action 
        ? `${parsedError.message} ${parsedError.action}`
        : parsedError.message;
      
      setTxError(errorMessage);
      setTxStatus('failed');
    }
  };

  // const handleClaimNonWorking = async () => {
  //   if (!nonWorkingIncome || !nonWorkingIncome.canClaim) {
  //     return;
  //   }

  //   setTxModalOpen(true);
  //   setTxStatus('estimating');
  //   setTxHash(undefined);
  //   setTxError(undefined);

  //   try {
  //     setTxStatus('signing');
  //     const result = await claimNonWorking.mutateAsync();

  //     setTxHash(result.transactionHash);
  //     setTxStatus('pending');

  //     setTimeout(() => {
  //       setTxStatus('confirmed');
  //     }, 2000);
  //   } catch (error) {
  //     console.error('Claim non-working income failed:', error);
      
  //     const parsedError = parseError(error);
  //     const errorMessage = parsedError.action 
  //       ? `${parsedError.message} ${parsedError.action}`
  //       : parsedError.message;
      
  //     setTxError(errorMessage);
  //     setTxStatus('failed');
  //   }
  // };

  const handleRequestEligibility = async () => {
    if (!address || isRequestingEligibility) return;

    setIsRequestingEligibility(true);
    console.log('[Income Page] Requesting eligibility for:', address);
    
    const BACKEND_URL = 'http://147.93.110.96:3001';
    const API_PREFIX = '/api/v1';
    
    try {
      // Call backend API directly
      const response = await fetch(`${BACKEND_URL}${API_PREFIX}/eligible-users/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      console.log('[Income Page] Response status:', response.status);
      console.log('[Income Page] Response content-type:', response.headers.get('content-type'));
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('[Income Page] Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned an invalid response. Please try again later.');
      }

      const data = await response.json();
      console.log('[Income Page] Response data:', data);

      if (data.success) {
        // Save activation status to localStorage
        const storageKey = `eligibility_requested_${address.toLowerCase()}`;
        localStorage.setItem(storageKey, 'true');
        setHasRequestedEligibility(true);
        
        alert('✅ Success! You have been added to the eligible list. Admin will distribute rewards soon.');
        // Refetch global pool data
        setTimeout(() => refetchGlobalPool(), 2000);
      } else {
        const errorMsg = data.error || 'Failed to request eligibility';
        console.error('[Income Page] Request failed:', errorMsg);
        alert(`❌ ${errorMsg}`);
      }
    } catch (error: any) {
      console.error('[Income Page] Exception:', error);
      alert(`❌ Failed to request eligibility: ${error.message || 'Please try again.'}`);
    } finally {
      setIsRequestingEligibility(false);
    }
  };

  const handleClaimGlobalPool = async () => {
    if (!globalPool || globalPool.userPending === BigInt(0)) {
      return;
    }

    setTxModalOpen(true);
    setTxStatus('estimating');
    setTxHash(undefined);
    setTxError(undefined);

    try {
      setTxStatus('signing');
      const result = await claimGlobalPool.mutateAsync();

      setTxHash(result.transactionHash);
      setTxStatus('pending');

      // Wait a bit then mark as confirmed
      setTimeout(() => {
        setTxStatus('confirmed');
      }, 2000);
    } catch (error) {
      console.error('Claim global pool failed:', error);
      
      const parsedError = parseError(error);
      const errorMessage = parsedError.action 
        ? `${parsedError.message} ${parsedError.action}`
        : parsedError.message;
      
      setTxError(errorMessage);
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
            <h1 className="text-xl font-bold orbitron gradient-text">Income Details</h1>
            <p className="text-gray-400 text-xs">Level + Global Pool</p>
          </div>
          <button onClick={toggleSidebar} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
            <i className="fas fa-bars text-cyan-400"></i>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-xl p-4 text-center overflow-autoß">
                  <div className="text-xs text-gray-400 mb-2">
                    <i className="fas fa-coins mr-1"></i>
                    Total Earned
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white counter-animation orbitron break-words px-1 ">
                    {formatUsd(userInfo?.totalEarned)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">All time earnings</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-xl p-4 text-center overflow-hidden">
                  <div className="text-xs text-gray-400 mb-2">
                    <i className="fas fa-check-circle mr-1"></i>
                    Total Claimed
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-green-400 counter-animation orbitron break-words px-1">
                    {formatUsd(userInfo?.totalWithdrawn)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Successfully withdrawn</div>
                </div>
              </div>
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
            <div className="grid grid-cols-3 gap-2 mb-4 pb-3 border-b border-gray-700/50">
              <div className="text-gray-400 text-xs font-medium">Level</div>
              <div className="text-gray-400 text-xs font-medium text-center">Commission</div>
              <div className="text-gray-400 text-xs font-medium text-right">Earned</div>
            </div>

            {/* Level Rows */}
            {loadingLevelIncome ? (
              <IncomeTableSkeleton />
            ) : levelIncome ? (
              <div className="space-y-2">
                {levelIncome.levels.map((item) => (
                  <div key={item.level} className="level-row grid grid-cols-3 gap-2 py-3 px-2 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-${getLevelColor(item.level)}-500/20 to-${getLevelColor(item.level)}-600/20 flex items-center justify-center mr-2`}>
                        <span className={`text-xs font-bold text-${getLevelColor(item.level)}-400`}>L{item.level}</span>
                      </div>
                    </div>
                    <div className="text-center text-white text-sm">{item.percentage / 100}%</div>
                    <div className="text-right text-white text-sm font-medium">${item.earnedUSD}</div>
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

      {/* Global Pool Section */}
      <section className="px-4 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mr-3">
              <i className="fas fa-globe text-purple-400 text-sm"></i>
            </div>
            <h2 className="text-xl font-bold text-white orbitron">Global Pool</h2>
          </div>

          <div className="glass-card rounded-2xl p-6">
            {loadingGlobalPool ? (
              <div className="animate-pulse">
                <div className="h-20 bg-gray-700/50 rounded-xl mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 bg-gray-700/50 rounded-xl"></div>
                  <div className="h-16 bg-gray-700/50 rounded-xl"></div>
                </div>
              </div>
            ) : globalPool ? (
              <>
                {/* Global Pool Stats */}
                <div className="grid grid-cols-1 gap-3 mb-4">
                  {/* <div className="bg-purple-500/10 border border-purple-400/20 rounded-xl p-3 text-center overflow-hidden">
                    <div className="text-xs text-gray-400 mb-1">Total Allocated</div>
                    <div className="text-base font-bold text-purple-400 orbitron break-words px-1">
                      ${globalPool.totalAllocatedUSD}
                    </div>
                  </div> */}
                  <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-3 text-center overflow-hidden">
                    <div className="text-xs text-gray-400 mb-1">Total Pool</div>
                    <div className="text-base sm:text-lg font-bold text-green-400 orbitron break-words px-1">
                      ${globalPool.balanceUSD}
                    </div>
                  </div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-3 text-center overflow-hidden">
                    <div className="text-xs text-gray-400 mb-1">Available to Claim</div>
                    <div className="text-base sm:text-lg font-bold text-cyan-400 orbitron break-words px-1">
                      ${globalPool.userPendingUSD}
                    </div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-3 text-center overflow-hidden">
                    <div className="text-xs text-gray-400 mb-1">My Total Claimed</div>
                    <div className="text-base sm:text-lg font-bold text-blue-400 orbitron break-words px-1">
                      ${globalPool.userClaimedUSD}
                    </div>
                  </div>
                </div>

                {/* Claim Button */}
                {globalPool.userInEligibleList && globalPool.userPending > BigInt(0) && (
                  <button
                    onClick={handleClaimGlobalPool}
                    disabled={claimGlobalPool.isPending}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed orbitron mb-3"
                  >
                    {claimGlobalPool.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Claiming...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-gift mr-2"></i>
                        Claim ${globalPool.userPendingUSD}
                      </>
                    )}
                  </button>
                )}

                {/* Status Messages */}
                {globalPool.userInEligibleList && globalPool.userPending === BigInt(0) && globalPool.userClaimed > BigInt(0) && (
                  <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-4">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                        <i className="fas fa-check-circle text-2xl text-green-400"></i>
                      </div>
                      <h3 className="text-green-400 font-semibold mb-1">All Claimed!</h3>
                      <p className="text-sm text-gray-300">
                        You've claimed ${globalPool.userClaimedUSD} from the global pool
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Check back daily after admin distributes
                      </p>
                    </div>
                  </div>
                )}

                {globalPool.userInEligibleList && globalPool.userPending === BigInt(0) && globalPool.userClaimed === BigInt(0) && (
                  <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-4">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <i className="fas fa-clock text-2xl text-cyan-400"></i>
                      </div>
                      <h3 className="text-cyan-400 font-semibold mb-1">Approved!</h3>
                      <p className="text-sm text-gray-300">
                        You're in the eligible list. Waiting for admin to distribute the global pool.
                      </p>
                    </div>
                  </div>
                )}

                {globalPool.canRequestEligibility && !globalPool.userInEligibleList && !hasRequestedEligibility && (
                  <div className="space-y-3">
                    <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-4">
                      <div className="text-center mb-3">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                          <i className="fas fa-check-circle text-2xl text-green-400"></i>
                        </div>
                        <h3 className="text-green-400 font-semibold mb-1">You're Eligible!</h3>
                        <p className="text-sm text-gray-300 mb-1">
                          You have 10+ direct referrals. Request to be added to the eligible list.
                        </p>
                      </div>
                      <button
                        onClick={handleRequestEligibility}
                        disabled={isRequestingEligibility}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRequestingEligibility ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane mr-2"></i>
                            Activate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {hasRequestedEligibility && !globalPool.userInEligibleList && (
                  <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <i className="fas fa-clock text-2xl text-blue-400"></i>
                      </div>
                      <h3 className="text-blue-400 font-semibold mb-1">Activation Pending</h3>
                      <p className="text-sm text-gray-300">
                        Your request has been submitted. Waiting for admin approval and reward distribution.
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        You'll be able to claim rewards once the admin distributes the global pool.
                      </p>
                    </div>
                  </div>
                )}

                {!globalPool.userEligible && !globalPool.canRequestEligibility && (
                  <div className="bg-orange-500/10 border border-orange-400/20 rounded-xl p-3">
                    <p className="text-sm text-orange-300 text-center">
                      <i className="fas fa-info-circle mr-2"></i>
                      {!address ? 'Connect wallet to view eligibility' : 
                       'Get 10+ direct referrals to become eligible for global pool rewards'}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <i className="fas fa-globe text-3xl mb-3"></i>
                <p>Global pool data unavailable</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Achiever Rewards Section */}
      {/* <section className="px-4 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/20 to-pink-600/20 flex items-center justify-center mr-3">
              <i className="fas fa-award text-pink-400 text-sm"></i>
            </div>
            <h2 className="text-xl font-bold text-white orbitron">Achiever Rewards</h2>
          </div>

          <div className="glass-card rounded-2xl p-6">
            {loadingAchiever ? (
              <div className="animate-pulse">
                <div className="h-20 bg-gray-700/50 rounded-xl mb-4"></div>
                <div className="h-32 bg-gray-700/50 rounded-xl"></div>
              </div>
            ) : achieverRewards ? (
              <>
                <div className="text-center mb-6">
                  <div className="text-sm text-gray-400 mb-2">Current Achiever Level</div>
                  <div className="text-4xl font-bold gradient-text orbitron mb-2">
                    Level {achieverRewards.currentLevel}
                  </div>
                  <div className="text-sm text-gray-400">
                    {achieverRewards.currentLevel === 0 
                      ? `${achieverRewards.currentCount} / ${achieverRewards.nextLevelRequirement} Direct Referrals to reach Level 1`
                      : `${achieverRewards.currentCount} / ${achieverRewards.nextLevelRequirement} users to reach Level ${achieverRewards.currentLevel + 1}`
                    }
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-pink-500/10 border border-pink-400/20 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">Direct Referrals</div>
                    <div className="text-2xl font-bold text-pink-400 orbitron">{achieverRewards.directReferrals}</div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-400/20 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">Level 1 Users</div>
                    <div className="text-2xl font-bold text-purple-400 orbitron">{achieverRewards.levelCounts[0] || 0}</div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Progress to Next Level</span>
                    <span>{achieverRewards.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${achieverRewards.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-white mb-3">Achiever Level Requirements</div>
                  {achieverRewards.levelDetails.map((levelDetail) => {
                    const index = levelDetail.level - 1;
                    return (
                      <div
                        key={levelDetail.level}
                        className={`p-3 rounded-lg ${
                          levelDetail.rewardStatus === 'claimed'
                            ? 'bg-green-500/10 border border-green-400/20'
                            : levelDetail.rewardStatus === 'unclaimed'
                              ? 'bg-pink-500/10 border border-pink-400/20'
                              : levelDetail.rewardStatus === 'pending-admin'
                                ? 'bg-blue-500/10 border border-blue-400/20'
                                : 'bg-gray-500/10 border border-gray-400/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                              levelDetail.rewardStatus === 'claimed'
                                ? 'bg-green-500/20'
                                : levelDetail.rewardStatus === 'unclaimed'
                                  ? 'bg-pink-500/20'
                                  : levelDetail.rewardStatus === 'pending-admin'
                                    ? 'bg-blue-500/20'
                                    : 'bg-gray-500/20'
                            }`}>
                              {levelDetail.rewardStatus === 'claimed' ? (
                                <i className="fas fa-check text-green-400"></i>
                              ) : levelDetail.rewardStatus === 'pending-admin' ? (
                                <i className="fas fa-clock text-blue-400"></i>
                              ) : (
                                <span className={`text-sm font-bold ${
                                  levelDetail.rewardStatus === 'unclaimed' ? 'text-pink-400' : 'text-gray-400'
                                }`}>
                                  {levelDetail.level}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className={`font-semibold ${
                                levelDetail.rewardStatus === 'claimed'
                                  ? 'text-green-400'
                                  : levelDetail.rewardStatus === 'unclaimed'
                                    ? 'text-pink-400'
                                    : levelDetail.rewardStatus === 'pending-admin'
                                      ? 'text-blue-400'
                                      : 'text-gray-400'
                              }`}>
                                Level {levelDetail.level}
                              </div>
                              <div className="text-xs text-gray-400">
                                {levelDetail.description}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 mb-3">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{levelDetail.currentCount} / {levelDetail.requirement}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                levelDetail.rewardStatus === 'claimed'
                                  ? 'bg-green-500'
                                  : levelDetail.meetsRequirement
                                    ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                                    : 'bg-gray-600'
                              }`}
                              style={{ width: `${Math.min((levelDetail.currentCount / levelDetail.requirement) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        {levelDetail.rewardStatus === 'not-eligible' ? (
                          <button
                            disabled
                            className="w-full bg-gray-600 text-gray-400 font-semibold py-2 px-4 rounded-lg cursor-not-allowed opacity-50 text-sm"
                          >
                            <i className="fas fa-lock mr-2"></i>
                            Not Eligible
                          </button>
                        ) : levelDetail.rewardStatus === 'pending-admin' ? (
                          <button
                            disabled
                            className="w-full bg-blue-500/20 text-blue-400 font-semibold py-2 px-4 rounded-lg cursor-default text-sm border border-blue-400/30"
                          >
                            <i className="fas fa-clock mr-2"></i>
                            Pending Reward
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full bg-green-500/20 text-green-400 font-semibold py-2 px-4 rounded-lg cursor-default text-sm border border-green-400/30"
                          >
                            <i className="fas fa-check-circle mr-2"></i>
                            Reward Received
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {achieverRewards.currentLevel < achieverRewards.requirements.length && achieverRewards.nextLevelRequirement > achieverRewards.currentCount && (
                  <div className="mt-4 bg-blue-500/10 border border-blue-400/20 rounded-xl p-3">
                    <p className="text-sm text-blue-300 text-center">
                      <i className="fas fa-info-circle mr-2"></i>
                      {achieverRewards.currentLevel === 0 
                        ? `Invite ${achieverRewards.nextLevelRequirement - achieverRewards.currentCount} more direct referrals to reach Level 1`
                        : `Get ${achieverRewards.nextLevelRequirement - achieverRewards.currentCount} more users at Network Level ${achieverRewards.currentLevel} to reach Achiever Level ${achieverRewards.currentLevel + 1}`
                      }
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <i className="fas fa-award text-3xl mb-3"></i>
                <p>Achiever progress unavailable</p>
                <p className="text-sm mt-2">Connect your wallet to view your progress</p>
              </div>
            )}
          </div>
        </div>
      </section> */}

      {/* Non-Working Rewards Section */}
      {/* <section className="px-4 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mr-3">
              <i className="fas fa-clock text-green-400 text-sm"></i>
            </div>
            <h2 className="text-xl font-bold text-white orbitron">Non-Working Rewards</h2>
          </div>

          <div className="glass-card rounded-2xl p-6">
            {loadingNonWorking ? (
              <div className="animate-pulse">
                <div className="h-20 bg-gray-700/50 rounded-xl mb-4"></div>
                <div className="h-12 bg-gray-700/50 rounded-xl"></div>
              </div>
            ) : nonWorkingIncome ? (
              <MonthlyRewardsContent 
                nonWorkingIncome={nonWorkingIncome}
                claimNonWorking={claimNonWorking}
                handleClaimNonWorking={handleClaimNonWorking}
              />
            ) : (
              <div className="text-center py-8 text-gray-400">
                <i className="fas fa-clock text-3xl mb-3"></i>
                <p>Non-working rewards data unavailable</p>
                <p className="text-sm mt-2">Connect your wallet and activate your account</p>
              </div>
            )}
          </div>
        </div>
      </section> */}

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

      <Sidebar onClose={closeSidebar} />
    </div>
  );
}
