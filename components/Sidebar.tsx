'use client';

import Link from 'next/link';
import { useWallet } from '@/lib/wallet';
import { formatAddress } from '@/lib/config/env';

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { address, disconnect } = useWallet();

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect your wallet?')) {
      disconnect();
      onClose();
      window.location.href = '/';
    }
  };

  return (
    <>
      <div
        id="sidebar"
        className="fixed top-0 left-0 w-80 h-full bg-black/95 backdrop-blur-20 border-r border-gray-800 transform -translate-x-full transition-transform duration-300 z-50"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-cyan-500/20 flex items-center justify-center">
                <i className="fas fa-coins text-green-400 text-sm"></i>
              </div>
              <span className="text-white font-bold orbitron">USDT RAIN</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg glass-card flex items-center justify-center"
            >
              <i className="fas fa-times text-cyan-400"></i>
            </button>
          </div>

          <nav className="space-y-2">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-cyan-500/10 transition-colors group"
            >
              <i className="fas fa-home text-cyan-400 w-5"></i>
              <span className="text-white group-hover:text-cyan-400 transition-colors">Dashboard</span>
            </Link>

           
            <Link
              href="/share"
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-cyan-500/10 transition-colors group"
            >
              <i className="fas fa-share-alt text-cyan-400 w-5"></i>
              <span className="text-white group-hover:text-cyan-400 transition-colors">Share & Earn</span>
            </Link>

            <Link
              href="/leaderboard"
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-cyan-500/10 transition-colors group"
            >
              <i className="fas fa-question-circle text-cyan-400 w-5"></i>
              <span className="text-white group-hover:text-cyan-400 transition-colors">Leaderboard</span>
            </Link>

             <Link
              href="/settings"
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-cyan-500/10 transition-colors group"
            >
              <i className="fas fa-question-circle text-cyan-400 w-5"></i>
              <span className="text-white group-hover:text-cyan-400 transition-colors">Settings</span>
            </Link>


            <Link
              href="/help"
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-cyan-500/10 transition-colors group"
            >
              <i className="fas fa-question-circle text-cyan-400 w-5"></i>
              <span className="text-white group-hover:text-cyan-400 transition-colors">Help & Support</span>
            </Link>

            

            <button
              onClick={handleDisconnect}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors group"
            >
              <i className="fas fa-sign-out-alt text-red-400 w-5"></i>
              <span className="text-white group-hover:text-red-400 transition-colors">Disconnect</span>
            </button>
          </nav>

          {address && (
            <div className="mt-4 p-4 glass-card rounded-xl">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">Connected Wallet</div>
                <div className="text-sm text-cyan-400 font-mono">{formatAddress(address)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        id="sidebar-overlay"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300 z-40"
        onClick={onClose}
      />
    </>
  );
}
