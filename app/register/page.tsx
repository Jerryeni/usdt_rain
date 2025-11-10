'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/lib/wallet';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { useRegisterUser } from '@/lib/hooks/useRegisterUser';
import { getReadContract } from '@/lib/contracts/USDTRain';
import TransactionModal, { TransactionStatus } from '@/components/TransactionModal';
import { parseError } from '@/lib/utils/errorMessages';

function RegisterPageContent() {
  const [isClient, setIsClient] = useState(false);
  const [sponsorId, setSponsorId] = useState('');
  const [sponsorInfo, setSponsorInfo] = useState<any>(null);
  const [loadingSponsor, setLoadingSponsor] = useState(false);
  const [sponsorError, setSponsorError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, connect, isConnecting, provider } = useWallet();
  const { data: userInfo, isLoading: loadingUserInfo } = useUserInfo(address);
  const registerUser = useRegisterUser();

  // Transaction modal state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
  const [txHash, setTxHash] = useState<string>();
  const [txError, setTxError] = useState<string>();

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

  // Extract sponsor ID from URL or set default based on total users
  useEffect(() => {
    if (isClient && searchParams) {
      const refParam = searchParams.get('ref');
      if (refParam) {
        setSponsorId(refParam);
      } else if (totalUsers === 0) {
        // First user must use sponsor ID 0
        setSponsorId('0');
      }
      // Otherwise leave empty - user will enter it manually
    }
  }, [isClient, searchParams, totalUsers]);

  // Check total users on mount
  useEffect(() => {
    const checkTotalUsers = async () => {
      if (provider) {
        try {
          const contract = getReadContract(provider);
          const total = await contract.totalUsers();
          setTotalUsers(Number(total));
        } catch (error) {
          console.error('Error checking total users:', error);
        }
      }
    };
    checkTotalUsers();
  }, [provider]);

  // Redirect if already registered
  useEffect(() => {
    if (userInfo && userInfo.userId && Number(userInfo.userId) > 0) {
      router.push('/');
    }
  }, [userInfo, router]);

  // Validate sponsor ID when it changes
  useEffect(() => {
    if (sponsorId && provider) {
      validateSponsor(sponsorId);
    }
  }, [sponsorId, provider]);

  const validateSponsor = async (id: string) => {
    if (!id || !provider) {
      // Clear sponsor info if no ID provided
      setSponsorInfo(null);
      setSponsorError('');
      return;
    }

    const sponsorIdNum = parseInt(id, 10);
    if (isNaN(sponsorIdNum) || sponsorIdNum < 0) {
      setSponsorError('Invalid sponsor ID - must be a non-negative number');
      setSponsorInfo(null);
      return;
    }

    setLoadingSponsor(true);
    setSponsorError('');

    try {
      const contract = getReadContract(provider);
      
      // First check if any users exist in the system
      const totalUsers = await contract.totalUsers();
      
      // If no users exist yet and sponsor ID is 0, allow first user registration
      if (Number(totalUsers) === 0 && sponsorIdNum === 0) {
        setSponsorInfo({
          userId: BigInt(0),
          address: '0x0000000000000000000000000000000000000000',
          userName: 'First User (Sponsor ID 0 for genesis user)',
          isActive: true,
          directReferrals: 0,
        });
        setSponsorError('');
        setLoadingSponsor(false);
        return;
      }

      // If no users exist but sponsor ID is not 0, show error
      if (Number(totalUsers) === 0 && sponsorIdNum !== 0) {
        setSponsorError('No users exist yet. First user must use sponsor ID 0.');
        setSponsorInfo(null);
        setLoadingSponsor(false);
        return;
      }
      
      // Get sponsor address
      const sponsorAddress = await contract.getUserAddressById(BigInt(sponsorIdNum));
      
      if (!sponsorAddress || sponsorAddress === '0x0000000000000000000000000000000000000000') {
        setSponsorError(`Sponsor ID ${sponsorIdNum} not found. Please check the ID or contact support.`);
        setSponsorInfo(null);
        return;
      }

      // Get sponsor info
      const info = await contract.getUserInfo(sponsorAddress);
      
      // getUserInfo returns an array: [userId, sponsorId, directReferrals, totalEarned, 
      // totalWithdrawn, isActive, activationTimestamp, nonWorkingClaimed, achieverLevel, userName, contactNumber]
      const sponsorUserId = info[0]; // userId at index 0
      const sponsorUserName = info[9] || ''; // userName at index 9
      const sponsorDirectReferrals = info[2]; // directReferrals at index 2
      const sponsorIsActive = info[5]; // isActive at index 5
      
      // Ensure userId is valid
      const validUserId = sponsorUserId !== undefined && sponsorUserId !== null 
        ? BigInt(sponsorUserId) 
        : BigInt(sponsorIdNum);
      
      // Use the sponsor's actual name if available, otherwise show User #ID
      const displayName = sponsorUserName && sponsorUserName.trim() !== '' 
        ? sponsorUserName 
        : `User #${sponsorIdNum}`;
      
      setSponsorInfo({
        userId: validUserId,
        address: sponsorAddress,
        userName: displayName,
        isActive: sponsorIsActive,
        directReferrals: Number(sponsorDirectReferrals || 0),
      });
      setSponsorError('');
    } catch (error) {
      console.error('Error validating sponsor:', error);
      const errorMessage = (error as Error).message || '';
      
      // Provide helpful error messages
      if (errorMessage.includes('totalUsers')) {
        setSponsorError('Unable to verify sponsor. You may be the first user - any sponsor ID will work.');
        // Allow registration as first user
        setSponsorInfo({
          userId: BigInt(sponsorIdNum),
          address: '0x0000000000000000000000000000000000000000',
          userName: 'First User',
          isActive: true,
          directReferrals: 0,
        });
      } else {
        setSponsorError('Failed to validate sponsor ID. Please try again or contact support.');
        setSponsorInfo(null);
      }
    } finally {
      setLoadingSponsor(false);
    }
  };

  const handleRegister = async () => {
    if (!address) {
      return;
    }

    if (!sponsorId) {
      setSponsorError('Please enter a sponsor ID');
      return;
    }

    if (!sponsorInfo) {
      setSponsorError('Please wait for sponsor validation or enter a valid sponsor ID');
      return;
    }

    if (!termsAccepted) {
      setSponsorError('Please accept the terms and conditions');
      return;
    }

    setTxModalOpen(true);
    setTxStatus('estimating');
    setTxHash(undefined);
    setTxError(undefined);

    try {
      setTxStatus('signing');
      const result = await registerUser.mutateAsync(BigInt(sponsorId));

      setTxHash(result.transactionHash);
      setTxStatus('pending');

      setTimeout(() => {
        setTxStatus('confirmed');
        // Redirect to activation page after successful registration
        setTimeout(() => {
          router.push('/activate');
        }, 2000);
      }, 2000);
    } catch (error) {
      console.error('Registration failed:', error);
      
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

  if (loadingUserInfo) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="rain-animation" id="rain-container"></div>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
            <i className="fas fa-spinner fa-spin text-2xl text-cyan-400"></i>
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen pb-20">
      {/* Animated USDT Rain Background */}
      <div className="rain-animation" id="rain-container"></div>

      {/* Header */}
      <header className="px-4 py-4 border-b border-gray-800/50 backdrop-blur-lg bg-black/20">
        <div className="flex items-center justify-between">
          <Link href="/" className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
            <i className="fas fa-arrow-left text-cyan-400"></i>
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold orbitron gradient-text">Register</h1>
            <p className="text-gray-400 text-xs">Join USDT Rain</p>
          </div>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      {/* Registration Form */}
      <section className="px-4 py-6">
        <div className="max-w-md mx-auto">
          
          <div className="glass-card rounded-2xl p-6 slide-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <i className="fas fa-user-plus text-2xl text-cyan-400"></i>
              </div>
              <h2 className="text-xl font-bold text-white orbitron mb-2">Create Account</h2>
              <p className="text-gray-400 text-sm">Register with a sponsor to get started</p>
            </div>

            {/* Wallet Connection */}
            {!address ? (
              <div className="mb-6">
                <div className="bg-orange-500/10 border border-orange-400/20 rounded-xl p-4 mb-4">
                  <div className="text-center">
                    <i className="fas fa-wallet text-orange-400 text-2xl mb-2"></i>
                    <h3 className="text-orange-400 font-semibold mb-1">Connect Wallet</h3>
                    <p className="text-gray-300 text-sm">Please connect your wallet to register</p>
                  </div>
                </div>
                <button
                  onClick={connect}
                  disabled={isConnecting}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-wallet mr-2"></i>
                      Connect Wallet
                    </>
                  )}
                </button>
              </div>
            ) : (
              <>
                {/* Sponsor ID Input */}
                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-2">
                    Sponsor ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={sponsorId}
                    onChange={(e) => setSponsorId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder={totalUsers === 0 ? "Enter 0 for first user" : "Enter sponsor ID"}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    <i className="fas fa-info-circle mr-1"></i>
                    {totalUsers === 0 
                      ? 'First user must use sponsor ID 0. Subsequent users use existing user IDs.'
                      : 'Enter a sponsor ID from your referral link or use an existing user ID.'
                    }
                  </p>
                  {sponsorError && (
                    <p className="mt-2 text-red-400 text-sm">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {sponsorError}
                    </p>
                  )}
                </div>

                {/* Sponsor Info */}
                {loadingSponsor && (
                  <div className="mb-6 animate-pulse">
                    <div className="glass-card rounded-xl p-4">
                      <div className="h-4 bg-gray-700/50 rounded w-32 mb-2"></div>
                      <div className="h-6 bg-gray-700/50 rounded w-48"></div>
                    </div>
                  </div>
                )}

                {sponsorInfo && !loadingSponsor && (
                  <div className="mb-6">
                    <div className={`glass-card rounded-xl p-4 ${
                      sponsorInfo.userName.includes('First User') 
                        ? 'bg-blue-500/10 border border-blue-400/20' 
                        : 'bg-green-500/10 border border-green-400/20'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          sponsorInfo.userName.includes('First User')
                            ? 'bg-blue-500/20'
                            : 'bg-green-500/20'
                        }`}>
                          <i className={`fas ${
                            sponsorInfo.userName.includes('First User') 
                              ? 'fa-star text-blue-400' 
                              : 'fa-check text-green-400'
                          }`}></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-400">
                            {sponsorInfo.userName.includes('First User') ? 'First User Registration' : 'Sponsor'}
                          </p>
                          <h3 className="text-white font-semibold">{sponsorInfo.userName}</h3>
                          <p className="text-xs text-gray-400 font-mono">
                            ID: {sponsorInfo.userId ? sponsorInfo.userId.toString() : sponsorId}
                            {sponsorInfo.directReferrals > 0 && ` • ${sponsorInfo.directReferrals} referrals`}
                          </p>
                        </div>
                      </div>
                      {sponsorInfo.userName.includes('First User') && (
                        <div className="mt-3 pt-3 border-t border-blue-400/20">
                          <p className="text-xs text-blue-300">
                            <i className="fas fa-info-circle mr-1"></i>
                            You're registering as the first user. No existing sponsor required.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="mb-6">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 mr-3"
                    />
                    <span className="text-sm text-gray-400">
                      I agree to the{' '}
                      <Link href="/terms" className="text-cyan-400 hover:text-cyan-300">
                        Terms and Conditions
                      </Link>{' '}
                      and understand the risks involved in cryptocurrency investments
                    </span>
                  </label>
                </div>

                {/* Register Button */}
                <button
                  onClick={handleRegister}
                  disabled={!sponsorInfo || !termsAccepted || registerUser.isPending}
                  className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed orbitron text-lg"
                >
                  {registerUser.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Registering...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-rocket mr-2"></i>
                      Register Now
                    </>
                  )}
                </button>

                {/* Connected Wallet Info */}
                <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-400/20 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Connected Wallet</div>
                    <div className="text-cyan-400 font-mono font-semibold">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="glass-card rounded-2xl p-6 slide-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Why Join USDT Rain?</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-chart-line text-green-400"></i>
                </div>
                <div>
                  <div className="text-white font-medium">10-Level Income System</div>
                  <div className="text-gray-400">Earn from your entire network</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-globe text-blue-400"></i>
                </div>
                <div>
                  <div className="text-white font-medium">Global Pool Rewards</div>
                  <div className="text-gray-400">Share in platform-wide earnings</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-shield-alt text-purple-400"></i>
                </div>
                <div>
                  <div className="text-white font-medium">Smart Contract Security</div>
                  <div className="text-gray-400">Transparent and secure on UBC</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-coins text-cyan-400"></i>
                </div>
                <div>
                  <div className="text-white font-medium">Instant Withdrawals</div>
                  <div className="text-gray-400">Access your earnings anytime</div>
                </div>
              </div>
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
        title="User Registration"
        description={txStatus === 'confirmed' ? 'Registration successful! Redirecting to activation...' : undefined}
      />
    </div>
  );
}


export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="relative z-10 min-h-screen">
        <div className="rain-animation" id="rain-container"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
              <i className="fas fa-spinner fa-spin text-2xl text-cyan-400"></i>
            </div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
