'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/lib/hooks/useSidebar';

function HelpPageContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const fromReward = searchParams?.get('from') === 'reward';
  const { toggleSidebar, closeSidebar } = useSidebar();

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

  const goBack = () => {
    window.history.back();
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I claim my achiever rewards?",
      answer: "Once you've achieved a level by meeting the requirements (direct referrals for Level 1, or users at previous levels for Levels 2-5), a 'Claim Level X Reward' button will appear on the Income page. Click it to claim your reward. After claiming, please contact support to receive your reward payout."
    },
    {
      question: "What are the different income streams?",
      answer: "USDT RAIN has 4 income streams: 1) Level Income - Commission from your 10-level network (auto-distributed), 2) Global Pool - Shared among eligible users (auto-distributed), 3) Achiever Rewards - Achievement bonuses for reaching levels (claim via button, then contact support), 4) Monthly Rewards - For users without direct referrals (claim every 30 days)."
    },
    {
      question: "How does the achiever level system work?",
      answer: "Level 1 requires direct referrals. Levels 2-5 require users at the previous achiever level in your network. For example, Level 2 requires X users at Level 1, Level 3 requires X users at Level 2, and so on. This creates a hierarchical achievement system."
    },
    {
      question: "When can I claim monthly rewards?",
      answer: "Monthly rewards (non-working income) are available only for users WITHOUT direct referrals. You can claim every 30 days. A countdown timer shows when your next claim is available."
    },
    {
      question: "How do I activate my account?",
      answer: "To activate your account, deposit $25 USDT to the contract. This one-time activation fee is distributed as: Level Income to your upline, Global Pool for all users, and Reserve for platform maintenance."
    },
    {
      question: "What happens after I claim an achiever reward?",
      answer: "After successfully claiming an achiever reward on the blockchain, you need to contact our support team to receive your reward payout. The claim marks your achievement on-chain, and our team will process the actual reward transfer."
    },
    {
      question: "How do I contact support for my reward?",
      answer: "You can reach our support team via: Email: support@usdtrain.com, Telegram: @USDTRainSupport, or WhatsApp: +1234567890. Please provide your wallet address and the level you claimed."
    },
    {
      question: "Why are level income and global pool auto-distributed?",
      answer: "Level income and global pool rewards are automatically sent to your wallet when earned. There's no need to claim them manually. Only monthly rewards and achiever rewards require manual claiming."
    }
  ];

  const supportChannels = [
    {
      icon: 'fa-envelope',
      title: 'Email Support',
      description: 'support@usdtrain.com',
      link: 'mailto:support@usdtrain.com',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: 'fa-paper-plane',
      title: 'Telegram',
      description: '@USDTRainSupport',
      link: 'https://t.me/USDTRainSupport',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: 'fa-brands fa-whatsapp',
      title: 'WhatsApp',
      description: '+1 (234) 567-8900',
      link: 'https://wa.me/1234567890',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: 'fa-brands fa-discord',
      title: 'Discord',
      description: 'Join our community',
      link: 'https://discord.gg/usdtrain',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="relative z-10 min-h-screen pb-24">
      {/* Animated USDT Rain Background */}
      <div className="rain-animation" id="rain-container"></div>

      {/* Header */}
      <header className="px-4 py-4 border-b border-gray-800/50 backdrop-blur-lg bg-black/20">
        <div className="flex items-center justify-between">
          <Link href="/" className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
            <i className="fas fa-home text-cyan-400"></i>
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold orbitron gradient-text">Help & Support</h1>
            <p className="text-gray-400 text-xs">We're here to help</p>
          </div>
          <button onClick={toggleSidebar} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
            <i className="fas fa-bars text-cyan-400"></i>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar onClose={closeSidebar} />

      {/* Reward Claim Success Message */}
      {fromReward && (
        <section className="px-4 py-6">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-2xl p-6 slide-in">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center animate-pulse">
                <i className="fas fa-trophy text-3xl text-green-400"></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 orbitron">🎉 Reward Claimed Successfully!</h3>
              <p className="text-gray-300 mb-4 text-base">
                Your achiever reward has been marked on the blockchain. Please contact our support team below to receive your reward payout.
              </p>
              <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-4 mb-4">
                <p className="text-sm text-green-300 font-semibold mb-2">
                  <i className="fas fa-info-circle mr-2"></i>
                  Next Steps:
                </p>
                <ol className="text-left text-sm text-gray-300 space-y-2 ml-6">
                  <li>1. Choose a support channel below</li>
                  <li>2. Provide your wallet address</li>
                  <li>3. Mention the level you claimed</li>
                  <li>4. Our team will process your reward</li>
                </ol>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-xl p-3">
                <p className="text-xs text-yellow-300">
                  <i className="fas fa-clock mr-2"></i>
                  Typical processing time: 24-48 hours
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Support Channels */}
      <section className="px-4 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-bold text-white mb-4">Contact Support</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {supportChannels.map((channel, index) => (
              <a
                key={index}
                href={channel.link}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card rounded-xl p-4 hover:scale-105 transition-transform"
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${channel.color} bg-opacity-20 flex items-center justify-center mr-3`}>
                    <i className={`${channel.icon} text-xl text-white`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{channel.title}</div>
                    <div className="text-sm text-gray-400">{channel.description}</div>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-bold text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-white pr-4">{faq.question}</span>
                  <i className={`fas fa-chevron-${openFaq === index ? 'up' : 'down'} text-cyan-400`}></i>
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 text-gray-300 text-sm border-t border-gray-700/50 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-4 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-lg font-bold text-white mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/income" className="glass-card rounded-xl p-4 text-center hover:scale-105 transition-transform">
              <i className="fas fa-chart-line text-2xl text-cyan-400 mb-2"></i>
              <div className="text-sm font-semibold text-white">Income Details</div>
            </Link>
            <Link href="/referrals" className="glass-card rounded-xl p-4 text-center hover:scale-105 transition-transform">
              <i className="fas fa-users text-2xl text-purple-400 mb-2"></i>
              <div className="text-sm font-semibold text-white">My Team</div>
            </Link>
            <Link href="/transactions" className="glass-card rounded-xl p-4 text-center hover:scale-105 transition-transform">
              <i className="fas fa-history text-2xl text-blue-400 mb-2"></i>
              <div className="text-sm font-semibold text-white">Transactions</div>
            </Link>
            <Link href="/settings" className="glass-card rounded-xl p-4 text-center hover:scale-105 transition-transform">
              <i className="fas fa-cog text-2xl text-gray-400 mb-2"></i>
              <div className="text-sm font-semibold text-white">Settings</div>
            </Link>
          </div>
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

export default function HelpPage() {
  return (
    <Suspense fallback={
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="rain-animation" id="rain-container"></div>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
            <i className="fas fa-spinner fa-spin text-2xl text-cyan-400"></i>
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <HelpPageContent />
    </Suspense>
  );
}
