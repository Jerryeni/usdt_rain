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
      question: "How do I activate my account?",
      answer: "To activate your account, deposit $25 (UBC-20) USDT to the contract. This one-time activation fee is distributed as: Level Income to your upline, Global Pool for all users, and Reserve for platform maintenance."
    },
    {
      question: "What are the different income streams?",
      answer: "USDT RAIN has 2 income streams: 1) Level Income - Commission from your 10-level network (auto-distributed), 2) Global Pool - Shared among eligible users (auto-distributed, you must claim everyday)."
    },
    {
      question: "How are level income and Global Pool auto-distributed?",
      answer: "Level income is automatically transferred to your wallet whenever your team members activate their IDs. Global Pool rewards are generated automatically, but you must manually claim your Global Pool rewards once every day."
    },
    {
      question: "How do I contact support for my reward?",
      answer: "You can't contact our support team directly, but you can follow and chat via our social media channels below."
    }
  ];

  const supportChannels = [
    {
      icon: 'fa-brands fa-instagram',
      title: 'Instagram',
      description: '@usdtrains',
      link: 'https://www.instagram.com/usdtrains',
      color: 'from-pink-500 to-purple-500'
    },
    {
      icon: 'fa-brands fa-facebook',
      title: 'Facebook',
      description: 'USDT Rains',
      link: 'https://www.facebook.com/usdtrains',
      color: 'from-blue-600 to-blue-500'
    },
    {
      icon: 'fa-brands fa-telegram',
      title: 'Telegram',
      description: '@usdtrains',
      link: 'https://t.me/usdtrains',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: 'fa-brands fa-whatsapp',
      title: 'WhatsApp',
      description: 'Join Channel',
      link: 'https://whatsapp.com/channel/0029VbBcRYnAInPeytt2470H',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: 'fa-brands fa-youtube',
      title: 'YouTube',
      description: '@USDTRAIN',
      link: 'https://www.youtube.com/@USDTRAIN',
      color: 'from-red-500 to-red-600'
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

      {/* Social Media Channels */}
      <section className="px-4 mb-6 mt-6">
        <div className="slide-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-bold text-white mb-4">Follow Us on Social Media</h2>
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
