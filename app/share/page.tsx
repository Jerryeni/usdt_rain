'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/lib/wallet';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { useReferrals } from '@/lib/hooks/useReferrals';
import { useToast } from '@/components/ui/use-toast';

export default function SharePage() {
  const [isClient, setIsClient] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const { address } = useWallet();
  const { data: userInfo, isLoading: loadingUserInfo } = useUserInfo(address);
  const { data: referralData, isLoading: loadingReferrals } = useReferrals(userInfo?.userId);
  const { toast } = useToast();

  // Generate referral link
  const referralLink = userInfo?.userId 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${userInfo.userId.toString()}`
    : '';

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

  // Generate QR code when referral link is available
  useEffect(() => {
    if (referralLink && isClient) {
      // Using QR Server API for QR code generation
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralLink)}`;
      setQrCodeUrl(qrUrl);
    }
  }, [referralLink, isClient]);

  const goBack = () => {
    window.history.back();
  };

  const copyToClipboard = async () => {
    if (!referralLink) {
      toast({
        title: 'No Referral Link',
        description: 'Please connect your wallet and register first',
        variant: 'warning',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: 'Copied!',
        description: 'Referral link copied to clipboard',
        variant: 'success',
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: 'Copy Failed',
        description: 'Please copy the link manually',
        variant: 'destructive',
      });
    }
  };

  const shareViaWhatsApp = () => {
    if (!referralLink) return;
    const message = `🌧️ Join USDT RAIN and start earning!\n\n💰 Multi-level income system\n🌍 Global pool rewards\n✨ Passive income opportunities\n\nUse my referral link: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaTelegram = () => {
    if (!referralLink) return;
    const message = `🌧️ Join USDT RAIN and start earning! 💰`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaTwitter = () => {
    if (!referralLink) return;
    const message = `🌧️ Join USDT RAIN and start earning! Multi-level income + Global pool rewards 💰`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareViaFacebook = () => {
    if (!referralLink) return;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `usdtrain-referral-${userInfo?.userId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'QR Code Downloaded',
      description: 'Share it with your network!',
      variant: 'success',
    });
  };

  // Calculate earnings from referrals
  const referralEarnings = referralData?.byLevel.slice(0, 3).reduce((sum, level) => {
    return sum + Number(level.income);
  }, 0) || 0;

  // Show loading state
  if (loadingUserInfo && !userInfo) {
    return (
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
    );
  }

  return (
    <div className="relative z-10 min-h-screen pb-20">
      {/* Animated USDT Rain Background */}
      <div className="rain-animation" id="rain-container"></div>

      {/* Header with Navigation */}
      <header className="px-4 py-4 border-b border-gray-800/50 backdrop-blur-lg bg-black/20">
        <div className="flex items-center justify-between">
          <button onClick={goBack} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
            <i className="fas fa-arrow-left text-cyan-400"></i>
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold orbitron gradient-text">Share & Earn</h1>
            <p className="text-gray-400 text-xs">Invite Friends</p>
          </div>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      {/* Share Stats */}
      <section className="px-4 py-6">
        <div className="glass-card rounded-2xl p-6 slide-in">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mb-4">
              <i className="fas fa-share-alt text-2xl gradient-text"></i>
            </div>
            <h2 className="text-2xl font-bold orbitron gradient-text mb-2">Share & Earn</h2>
            <p className="text-gray-400">Invite friends and earn from their activity</p>
          </div>

          {loadingUserInfo || loadingReferrals ? (
            <div className="grid grid-cols-3 gap-4 mb-6 animate-pulse">
              <div className="text-center">
                <div className="h-8 bg-gray-700/50 rounded w-16 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-700/50 rounded w-20 mx-auto"></div>
              </div>
              <div className="text-center">
                <div className="h-8 bg-gray-700/50 rounded w-16 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-700/50 rounded w-20 mx-auto"></div>
              </div>
              <div className="text-center">
                <div className="h-8 bg-gray-700/50 rounded w-16 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-700/50 rounded w-20 mx-auto"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 orbitron">
                  {referralData?.direct.count || 0}
                </div>
                <p className="text-gray-400 text-xs">Total Referrals</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 orbitron">
                  ${(referralEarnings / 1e18).toFixed(0)}
                </div>
                <p className="text-gray-400 text-xs">Earned</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 orbitron">
                  {referralData?.teamStats.activeMembers || 0}
                </div>
                <p className="text-gray-400 text-xs">Active</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Referral Link */}
      <section className="px-4 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-bold text-white orbitron mb-4">Your Referral Link</h2>

          <div className="glass-card rounded-xl p-4 mb-4">
            {loadingUserInfo ? (
              <div className="animate-pulse">
                <div className="h-12 bg-gray-700/50 rounded mb-3"></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-12 bg-gray-700/50 rounded"></div>
                  <div className="h-12 bg-gray-700/50 rounded"></div>
                </div>
              </div>
            ) : !address ? (
              <div className="text-center py-6">
                <i className="fas fa-wallet text-3xl text-gray-600 mb-3"></i>
                <p className="text-gray-400 mb-4">Connect your wallet to get your referral link</p>
                <Link href="/wallet">
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-2 px-6 rounded-xl transition-all">
                    Connect Wallet
                  </button>
                </Link>
              </div>
            ) : !userInfo?.userId || Number(userInfo.userId) === 0 ? (
              <div className="text-center py-6">
                <i className="fas fa-user-plus text-3xl text-blue-400 mb-3"></i>
                <p className="text-gray-400 mb-4">Register your account to get your referral link</p>
                <Link href="/register">
                  <button className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold py-2 px-6 rounded-xl transition-all">
                    Register Now
                  </button>
                </Link>
              </div>
            ) : !userInfo?.isActive || !userInfo?.activationTimestamp || Number(userInfo.activationTimestamp) === 0 ? (
              <div className="text-center py-6">
                <i className="fas fa-rocket text-3xl text-orange-400 mb-3"></i>
                <p className="text-gray-400 mb-4">Activate your account to get your referral link</p>
                <Link href="/activate">
                  <button className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold py-2 px-6 rounded-xl transition-all">
                    Activate Account
                  </button>
                </Link>
              </div>
            ) : referralLink ? (
              <>
                <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 mb-3">
                  <span className="text-cyan-400 font-mono text-xs sm:text-sm truncate mr-2">
                    {referralLink}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors whitespace-nowrap"
                  >
                    <i className="fas fa-copy mr-1"></i>
                    Copy
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={shareViaWhatsApp}
                    className="bg-green-500/20 text-green-400 py-3 px-4 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    <i className="fab fa-whatsapp mr-2"></i>
                    WhatsApp
                  </button>
                  <button
                    onClick={shareViaTelegram}
                    className="bg-blue-500/20 text-blue-400 py-3 px-4 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    <i className="fab fa-telegram mr-2"></i>
                    Telegram
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={shareViaTwitter}
                    className="bg-sky-500/20 text-sky-400 py-3 px-4 rounded-lg hover:bg-sky-500/30 transition-colors"
                  >
                    <i className="fab fa-twitter mr-2"></i>
                    Twitter
                  </button>
                  <button
                    onClick={shareViaFacebook}
                    className="bg-indigo-500/20 text-indigo-400 py-3 px-4 rounded-lg hover:bg-indigo-500/30 transition-colors"
                  >
                    <i className="fab fa-facebook mr-2"></i>
                    Facebook
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <i className="fas fa-exclamation-circle text-3xl text-gray-600 mb-3"></i>
                <p className="text-gray-400 mb-4">Please register to get your referral link</p>
                <Link href="/register">
                  <button className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold py-2 px-6 rounded-xl transition-all">
                    Register Now
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* QR Code */}
      {qrCodeUrl && (
        <section className="px-4 mb-6">
          <div className="slide-in" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-xl font-bold text-white orbitron mb-4">QR Code</h2>

            <div className="glass-card rounded-xl p-6 text-center">
              <div className="w-52 h-52 mx-auto mb-4 bg-white rounded-xl p-3">
                <img src={qrCodeUrl} alt="Referral QR Code" className="w-full h-full" />
              </div>
              <p className="text-gray-400 text-sm mb-4">Scan to join with your referral link</p>
              <button
                onClick={downloadQRCode}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                <i className="fas fa-download mr-2"></i>
                Download QR Code
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Earnings Breakdown */}
      {referralData && referralData.byLevel.length > 0 && (
        <section className="px-4 mb-6">
          <div className="slide-in" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-xl font-bold text-white orbitron mb-4">Earnings Breakdown</h2>

            <div className="space-y-3">
              {referralData.byLevel.slice(0, 3).map((item) => (
                <div key={item.level} className="glass-card rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">Level {item.level}</h3>
                      <p className="text-gray-400 text-xs">
                        {item.count} referrals • {item.level === 1 ? '10%' : item.level === 2 ? '8%' : '6%'} commission
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">${item.incomeUSD}</div>
                      <div className="text-gray-400 text-xs">earned</div>
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
