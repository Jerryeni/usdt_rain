'use client';

import Link from 'next/link';

export default function SettingsPage() {
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
            <h1 className="text-xl font-bold orbitron gradient-text">Settings</h1>
            <p className="text-gray-400 text-xs">App Configuration</p>
          </div>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      {/* Settings Content */}
      <section className="px-4 py-6">
        <div className="max-w-md mx-auto space-y-4">
            {/* App Info */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">App Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Version</span>
                  <span className="text-white font-semibold">1.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Network</span>
                  <span className="text-cyan-400 font-semibold">Universe Chain Mainnet</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Chain ID</span>
                  <span className="text-white font-semibold">1137</span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/help" className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all">
                  <div className="flex items-center">
                    <i className="fas fa-question-circle text-cyan-400 mr-3"></i>
                    <span className="text-white">Help & Support</span>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </Link>
                <Link href="/terms" className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all">
                  <div className="flex items-center">
                    <i className="fas fa-file-contract text-cyan-400 mr-3"></i>
                    <span className="text-white">Terms & Conditions</span>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </Link>
              </div>
            </div>
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-20 border-t border-gray-800 px-4 py-3">
        <div className="flex items-center justify-around">
          <Link href="/" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-cyan-400 transition-colors">
            <i className="fas fa-home text-lg"></i>
            <span className="text-xs">Dashboard</span>
          </Link>
          <Link href="/income" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-cyan-400 transition-colors">
            <i className="fas fa-chart-bar text-lg"></i>
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
          <Link href="/settings" className="flex flex-col items-center space-y-1 text-cyan-400">
            <i className="fas fa-cog text-lg"></i>
            <span className="text-xs">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
