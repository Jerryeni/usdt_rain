'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/lib/hooks/useSidebar';

export default function TermsPage() {
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

  return (
    <div className="relative z-10 min-h-screen pb-24">
      {/* Animated USDT Rain Background */}
      <div className="rain-animation" id="rain-container"></div>

      {/* Header */}
      <header className="px-4 py-4 border-b border-gray-800/50 backdrop-blur-lg bg-black/20">
        <div className="flex items-center justify-between">
          <Link href="/" className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
            <i className="fas fa-arrow-left text-cyan-400"></i>
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold orbitron gradient-text">Terms & Conditions</h1>
            <p className="text-gray-400 text-xs">USDT Rains Project</p>
          </div>
          <button onClick={toggleSidebar} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
            <i className="fas fa-bars text-cyan-400"></i>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar onClose={closeSidebar} />

      {/* Content */}
      <section className="px-4 py-6">
        <div className="glass-card rounded-2xl p-6 slide-in">
          <div className="prose prose-invert max-w-none">
            
            {/* 1. Project Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-cyan-400 mb-3 orbitron">1. Project Overview</h2>
              <p className="text-gray-300 mb-3">
                USDT Rains is a decentralized smart contract–based community project built on the Universe Blockchain. The platform operates on a 100% distribution and renounced smart contract, ensuring full transparency, autonomy, and trustless operation.
              </p>
              <p className="text-gray-300">
                Participation in the project is voluntary and community-driven.
              </p>
            </div>

            {/* 2. Activation & Participation */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-cyan-400 mb-3 orbitron">2. Activation & Participation</h2>
              <p className="text-gray-300 mb-3">
                To join the USDT Rains project, every participant must pay a <strong className="text-white">$25 activation fee</strong> (in USDT on Universe Blockchain).
              </p>
              <p className="text-gray-300 mb-3">
                Once the activation is completed, the smart contract automatically distributes the funds as follows:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-3 space-y-2">
                <li><strong className="text-white">70%</strong> — Level Bonus Distribution</li>
                <li><strong className="text-white">20%</strong> — Global Share Dividend</li>
                <li><strong className="text-white">10%</strong> — Admin Liquidity & Maintenance</li>
              </ul>
              <p className="text-gray-300">
                All transactions are executed automatically by the smart contract without manual intervention.
              </p>
            </div>

            {/* 3. Nature of the Program */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-cyan-400 mb-3 orbitron">3. Nature of the Program</h2>
              <p className="text-gray-300 mb-3">
                The USDT Rains Project is a <strong className="text-white">community development and support ecosystem</strong>, not an investment or financial product.
              </p>
              <p className="text-gray-300 mb-3">
                <strong className="text-white">No guaranteed returns</strong> or fixed income are promised to participants. Earnings depend entirely on network growth, referral participation, and community engagement.
              </p>
              <p className="text-gray-300">
                The activation fee is a <strong className="text-white">one-time contribution</strong> and <strong className="text-red-400">non-refundable</strong> under any circumstances.
              </p>
            </div>

            {/* 4. Smart Contract Transparency */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-cyan-400 mb-3 orbitron">4. Smart Contract Transparency</h2>
              <p className="text-gray-300 mb-3">
                The smart contract is <strong className="text-white">fully decentralized, immutable, and renounced</strong> — meaning no person or entity can alter, modify, or reclaim control once deployed.
              </p>
              <p className="text-gray-300">
                All transactions are publicly viewable on the Universe Blockchain Explorer, ensuring total transparency.
              </p>
            </div>

            {/* 5. Participant Responsibility */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-cyan-400 mb-3 orbitron">5. Participant Responsibility</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Participants are responsible for verifying all wallet addresses and transactions before making payments.</li>
                <li>The project team, admins, or community leaders <strong className="text-white">cannot reverse, cancel, or refund</strong> any transaction executed by the smart contract.</li>
                <li>Each participant should understand basic blockchain and cryptocurrency operations before joining.</li>
              </ul>
            </div>

            {/* 6. Risk Disclaimer */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-cyan-400 mb-3 orbitron">6. Risk Disclaimer</h2>
              <p className="text-gray-300 mb-3">
                Participation in blockchain-based smart contract systems carries certain risks, including <strong className="text-white">market volatility, smart contract bugs, and user errors</strong>.
              </p>
              <p className="text-gray-300">
                USDT Rains Project and its community are <strong className="text-white">not liable</strong> for any direct or indirect losses due to user mistakes, market behavior, or technical issues beyond control.
              </p>
            </div>

            {/* 7. Community Governance */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-cyan-400 mb-3 orbitron">7. Community Governance</h2>
              <p className="text-gray-300 mb-3">
                Decisions related to the project's development, awareness programs, and community events are governed by <strong className="text-white">decentralized participation</strong>.
              </p>
              <p className="text-gray-300">
                Any suggestions or proposals from members are subject to community consensus and transparency.
              </p>
            </div>

            {/* 8. Legal Compliance */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-cyan-400 mb-3 orbitron">8. Legal Compliance</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Participants are responsible for complying with local laws regarding cryptocurrency usage and taxation.</li>
                <li>The project does not offer investment advice or operate as a financial institution.</li>
              </ul>
            </div>

            {/* 9. Amendments */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-cyan-400 mb-3 orbitron">9. Amendments</h2>
              <p className="text-gray-300 mb-3">
                Since the project is <strong className="text-white">decentralized and renounced</strong>, no entity can modify the smart contract.
              </p>
              <p className="text-gray-300">
                However, community guidelines and documentation may evolve through collective consensus to ensure smooth operation and clarity.
              </p>
            </div>

            {/* 10. Acceptance of Terms */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-cyan-400 mb-3 orbitron">10. Acceptance of Terms</h2>
              <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4">
                <p className="text-gray-300">
                  By activating your account and participating in the USDT Rains Project, you confirm that you have <strong className="text-white">read, understood, and agreed</strong> to all the terms and conditions mentioned above.
                </p>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="mt-8 pt-6 border-t border-gray-700/50">
              <h3 className="text-lg font-bold text-white mb-4">Connect With Us</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <a href="https://www.instagram.com/usdtrains" target="_blank" rel="noopener noreferrer" className="glass-card rounded-xl p-3 text-center hover:scale-105 transition-transform">
                  <i className="fab fa-instagram text-2xl text-pink-400 mb-2"></i>
                  <div className="text-xs text-gray-300">Instagram</div>
                </a>
                <a href="https://www.facebook.com/usdtrains" target="_blank" rel="noopener noreferrer" className="glass-card rounded-xl p-3 text-center hover:scale-105 transition-transform">
                  <i className="fab fa-facebook text-2xl text-blue-400 mb-2"></i>
                  <div className="text-xs text-gray-300">Facebook</div>
                </a>
                <a href="https://t.me/usdtrains" target="_blank" rel="noopener noreferrer" className="glass-card rounded-xl p-3 text-center hover:scale-105 transition-transform">
                  <i className="fab fa-telegram text-2xl text-cyan-400 mb-2"></i>
                  <div className="text-xs text-gray-300">Telegram</div>
                </a>
                <a href="https://whatsapp.com/channel/0029VbBcRYnAInPeytt2470H" target="_blank" rel="noopener noreferrer" className="glass-card rounded-xl p-3 text-center hover:scale-105 transition-transform">
                  <i className="fab fa-whatsapp text-2xl text-green-400 mb-2"></i>
                  <div className="text-xs text-gray-300">WhatsApp</div>
                </a>
                <a href="https://www.youtube.com/@USDTRAIN" target="_blank" rel="noopener noreferrer" className="glass-card rounded-xl p-3 text-center hover:scale-105 transition-transform">
                  <i className="fab fa-youtube text-2xl text-red-400 mb-2"></i>
                  <div className="text-xs text-gray-300">YouTube</div>
                </a>
              </div>
            </div>

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
