'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/lib/wallet';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { useUpdateProfile } from '@/lib/hooks/useUpdateProfile';
import { useContractEvents } from '@/lib/hooks/useContractEvents';
import TransactionModal, { TransactionStatus } from '@/components/TransactionModal';
import { formatAddress } from '@/lib/config/env';
import { parseError } from '@/lib/utils/errorMessages';

export default function ProfilePage() {
  const [isClient, setIsClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [validationError, setValidationError] = useState('');

  const router = useRouter();
  const { address, disconnect } = useWallet();
  const { data: userInfo, isLoading: loadingUserInfo } = useUserInfo(address);
  const updateProfile = useUpdateProfile();

  // Transaction modal state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
  const [txHash, setTxHash] = useState<string>();
  const [txError, setTxError] = useState<string>();

  // Set up event listeners
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

  // Initialize form with user data
  useEffect(() => {
    if (userInfo) {
      setUserName(userInfo.userName || '');
      setContactNumber(userInfo.contactNumber || '');
    }
  }, [userInfo]);

  const goBack = () => {
    window.history.back();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setValidationError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValidationError('');
    // Reset to original values
    if (userInfo) {
      setUserName(userInfo.userName || '');
      setContactNumber(userInfo.contactNumber || '');
    }
  };

  const handleSave = async () => {
    // Validate
    if (!userName.trim()) {
      setValidationError('Username is required');
      return;
    }

    if (userName.trim().length < 3) {
      setValidationError('Username must be at least 3 characters');
      return;
    }

    if (!contactNumber.trim()) {
      setValidationError('Contact number is required');
      return;
    }

    setValidationError('');
    setTxModalOpen(true);
    setTxStatus('estimating');
    setTxHash(undefined);
    setTxError(undefined);

    try {
      setTxStatus('signing');
      const result = await updateProfile.mutateAsync({
        userName: userName.trim(),
        contactNumber: contactNumber.trim(),
      });

      setTxHash(result.transactionHash);
      setTxStatus('pending');

      setTimeout(() => {
        setTxStatus('confirmed');
        setIsEditing(false);
        
        // Check if this is initial setup (from query param)
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('setup') === 'true') {
          // Redirect to dashboard after initial profile setup
          setTimeout(() => {
            router.push('/');
          }, 1500);
        }
      }, 2000);
    } catch (error) {
      console.error('Profile update failed:', error);
      
      // Parse error into user-friendly message
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

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect your wallet?')) {
      disconnect();
      window.location.href = '/';
    }
  };

  // Show loading state
  if (loadingUserInfo) {
    return (
      <div className="relative z-10 min-h-screen">
        <div className="rain-animation" id="rain-container"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
              <i className="fas fa-spinner fa-spin text-2xl text-cyan-400"></i>
            </div>
            <p className="text-gray-400">Loading profile...</p>
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
          <button onClick={goBack} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
            <i className="fas fa-arrow-left text-cyan-400"></i>
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold orbitron gradient-text">Profile</h1>
            <p className="text-gray-400 text-xs">Account Settings</p>
          </div>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      {/* Profile Header */}
      <section className="px-4 py-6">
        <div className="glass-card rounded-2xl p-6 text-center slide-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <i className="fas fa-user text-3xl text-cyan-400"></i>
          </div>

          {loadingUserInfo ? (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-700/50 rounded w-32 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-700/50 rounded w-48 mx-auto"></div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-1">
                {userInfo?.userName || 'User'}
              </h2>
              <p className="text-gray-400 text-sm font-mono mb-4">
                {address ? formatAddress(address) : 'Not Connected'}
              </p>

              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-cyan-400">
                    {userInfo?.userId ? userInfo.userId.toString() : '-'}
                  </div>
                  <div className="text-xs text-gray-400">User ID</div>
                </div>
                <div className="w-px h-8 bg-gray-700"></div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${userInfo?.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                    {userInfo?.isActive ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-xs text-gray-400">Status</div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Profile Information */}
      <section className="px-4 mb-6">
        <div className="glass-card rounded-2xl p-6 slide-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Profile Information</h3>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-semibold hover:bg-cyan-500/30 transition-colors"
              >
                <i className="fas fa-edit mr-2"></i>
                Edit
              </button>
            )}
          </div>

          {validationError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-400/20 rounded-lg text-red-400 text-sm">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {validationError}
            </div>
          )}

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Username</label>
              {isEditing ? (
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  placeholder="Enter your username"
                  maxLength={50}
                />
              ) : (
                <div className="px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-lg text-white">
                  {userInfo?.userName || 'Not set'}
                </div>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Contact Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  placeholder="Enter your contact number"
                  maxLength={20}
                />
              ) : (
                <div className="px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-lg text-white">
                  {userInfo?.contactNumber || 'Not set'}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                  className="flex-1 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateProfile.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={updateProfile.isPending}
                  className="flex-1 bg-gray-700/50 hover:bg-gray-700/70 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Account Details */}
      <section className="px-4 mb-6">
        <div className="glass-card rounded-2xl p-6 slide-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-bold text-white mb-4">Account Details</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400">Sponsor ID</span>
              <span className="text-white font-semibold">
                {userInfo?.sponsorId ? userInfo.sponsorId.toString() : '-'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400">Direct Referrals</span>
              <span className="text-white font-semibold">
                {userInfo?.directReferrals ? Number(userInfo.directReferrals) : 0}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400">Total Earned</span>
              <span className="text-green-400 font-semibold">
                ${userInfo?.totalEarned ? (Number(userInfo.totalEarned) / 1e18).toFixed(2) : '0.00'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400">Total Withdrawn</span>
              <span className="text-orange-400 font-semibold">
                ${userInfo?.totalWithdrawn ? (Number(userInfo.totalWithdrawn) / 1e18).toFixed(2) : '0.00'}
              </span>
            </div>

            {userInfo?.activationTimestamp && Number(userInfo.activationTimestamp) > 0 && (
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">Activated On</span>
                <span className="text-white font-semibold">
                  {new Date(Number(userInfo.activationTimestamp) * 1000).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="px-4 mb-6">
        <div className="space-y-3">
          <button
            onClick={handleDisconnect}
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-3 px-6 rounded-xl transition-all border border-red-400/20"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Disconnect Wallet
          </button>
        </div>
      </section>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={txModalOpen}
        status={txStatus}
        txHash={txHash}
        error={txError}
        onClose={closeTxModal}
        title="Update Profile"
      />

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
          <Link href="/profile" className="flex flex-col items-center space-y-1 text-cyan-400">
            <i className="fas fa-user text-lg"></i>
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
