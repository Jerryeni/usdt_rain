'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/lib/wallet';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { useTransactions, TransactionType } from '@/lib/hooks/useTransactions';
import { useContractEvents } from '@/lib/hooks/useContractEvents';
import { TransactionCardSkeleton } from '@/components/skeletons/TransactionCardSkeleton';
import { getTransactionUrl } from '@/lib/config/env';

export default function TransactionsPage() {
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<TransactionType>('all');
  const pageSize = 20;

  const { address } = useWallet();
  const { data: userInfo } = useUserInfo(address);
  const { data: transactionData, isLoading } = useTransactions(
    userInfo?.userId,
    currentPage,
    pageSize,
    filterType
  );

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

  const handleFilterChange = (type: TransactionType) => {
    setFilterType(type);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'registration':
        return { icon: 'fa-user-plus', color: 'blue' };
      case 'activation':
        return { icon: 'fa-check-circle', color: 'green' };
      case 'level_income':
        return { icon: 'fa-arrow-down', color: 'cyan' };
      case 'withdrawal':
        return { icon: 'fa-arrow-up', color: 'orange' };
      case 'global_pool':
        return { icon: 'fa-globe', color: 'purple' };
      case 'non_working':
        return { icon: 'fa-gift', color: 'pink' };
      case 'profile_update':
        return { icon: 'fa-edit', color: 'gray' };
      default:
        return { icon: 'fa-exchange-alt', color: 'gray' };
    }
  };

  const getTransactionLabel = (type: TransactionType) => {
    switch (type) {
      case 'registration':
        return 'Registration';
      case 'activation':
        return 'Activation';
      case 'level_income':
        return 'Level Income';
      case 'withdrawal':
        return 'Withdrawal';
      case 'global_pool':
        return 'Global Pool';
      case 'non_working':
        return 'Non-Working Income';
      case 'profile_update':
        return 'Profile Update';
      default:
        return 'Transaction';
    }
  };

  const totalPages = transactionData 
    ? Math.ceil(transactionData.totalCount / pageSize)
    : 0;

  // Show loading state
  if (isLoading && !transactionData) {
    return (
      <div className="relative z-10 min-h-screen">
        <div className="rain-animation" id="rain-container"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
              <i className="fas fa-spinner fa-spin text-2xl text-cyan-400"></i>
            </div>
            <p className="text-gray-400">Loading transactions...</p>
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
            <h1 className="text-xl font-bold orbitron gradient-text">Transactions</h1>
            <p className="text-gray-400 text-xs">Transaction History</p>
          </div>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      {/* Filter Section */}
      <section className="px-4 py-4">
        <div className="glass-card rounded-xl p-3">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                filterType === 'all'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                  : 'bg-gray-700/20 text-gray-400 hover:bg-gray-700/30'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('level_income')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                filterType === 'level_income'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                  : 'bg-gray-700/20 text-gray-400 hover:bg-gray-700/30'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => handleFilterChange('withdrawal')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                filterType === 'withdrawal'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                  : 'bg-gray-700/20 text-gray-400 hover:bg-gray-700/30'
              }`}
            >
              Withdrawals
            </button>
            <button
              onClick={() => handleFilterChange('global_pool')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                filterType === 'global_pool'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                  : 'bg-gray-700/20 text-gray-400 hover:bg-gray-700/30'
              }`}
            >
              Global Pool
            </button>
          </div>
        </div>
      </section>

      {/* Transactions List */}
      <section className="px-4 pb-6">
        {isLoading ? (
          <TransactionCardSkeleton count={5} />
        ) : transactionData && transactionData.transactions.length > 0 ? (
          <>
            <div className="space-y-3">
              {transactionData.transactions.map((tx) => {
                const { icon, color } = getTransactionIcon(tx.type);
                return (
                  <div key={tx.transactionId.toString()} className="glass-card rounded-xl p-4 slide-in">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg bg-${color}-500/20 flex items-center justify-center mr-3`}>
                          <i className={`fas ${icon} text-${color}-400`}></i>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            {getTransactionLabel(tx.type)}
                            {tx.level && ` - Level ${tx.level}`}
                          </h3>
                          <p className="text-gray-400 text-xs">
                            {tx.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          tx.type === 'withdrawal' ? 'text-orange-400' : 'text-green-400'
                        }`}>
                          {tx.type === 'withdrawal' ? '-' : '+'}${tx.amountUSD}
                        </div>
                        <div className="text-xs text-gray-400">USDT</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-700/30 space-y-2">
                      {tx.type === 'level_income' && (
                        <div className="flex items-center text-xs">
                          <span className="text-gray-400 mr-2">From:</span>
                          {tx.sourceUserName || tx.sourceUserId ? (
                            <div className="flex items-center bg-cyan-500/10 px-2 py-1 rounded">
                              <i className="fas fa-user text-cyan-400 mr-1"></i>
                              <span className="text-cyan-400 font-medium">
                                {tx.sourceUserName || `User #${tx.sourceUserId?.toString()}`}
                              </span>
                              {tx.sourceUserId && tx.sourceUserName && (
                                <span className="text-gray-400 ml-1">#{tx.sourceUserId.toString()}</span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center bg-gray-500/10 px-2 py-1 rounded">
                              <i className="fas fa-user text-gray-400 mr-1"></i>
                              <span className="text-gray-400 font-medium">Network Member</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          {tx.userName ? (
                            <span>
                              <i className="fas fa-user mr-1"></i>
                              {tx.userName}
                            </span>
                          ) : tx.userId ? (
                            <span>User #{tx.userId.toString()}</span>
                          ) : (
                            <span>ID: {tx.transactionId.toString()}</span>
                          )}
                        </div>
                        {tx.txHash && (
                          <a
                            href={getTransactionUrl(tx.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 transition-colors"
                          >
                            <span>View on BSCScan</span>
                            <i className="fas fa-external-link-alt"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    currentPage === 1
                      ? 'bg-gray-700/20 text-gray-600 cursor-not-allowed'
                      : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                  }`}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                          currentPage === pageNum
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                            : 'bg-gray-700/20 text-gray-400 hover:bg-gray-700/30'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-700/20 text-gray-600 cursor-not-allowed'
                      : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                  }`}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}

            {/* Transaction Count */}
            <div className="mt-4 text-center text-sm text-gray-400">
              Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, transactionData.totalCount)} of {transactionData.totalCount} transactions
            </div>
          </>
        ) : (
          <div className="glass-card rounded-xl p-8 text-center">
            <i className="fas fa-receipt text-4xl text-gray-600 mb-4"></i>
            <h3 className="text-white font-semibold mb-2">No Transactions Yet</h3>
            <p className="text-gray-400 text-sm">
              {filterType === 'all' 
                ? 'Your transaction history will appear here'
                : `No ${getTransactionLabel(filterType).toLowerCase()} transactions found`
              }
            </p>
          </div>
        )}
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
          <Link href="/transactions" className="flex flex-col items-center space-y-1 text-cyan-400">
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
