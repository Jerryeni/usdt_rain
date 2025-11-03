'use client';

import Link from 'next/link';
import { useWallet } from '@/lib/wallet';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export default function AppHeader({ title, subtitle, onMenuClick }: AppHeaderProps) {
  const { address, connect, isConnecting } = useWallet();

  const handleWalletConnection = async () => {
    if (!address && !isConnecting) {
      try {
        await connect();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  return (
    <header className="px-4 py-4 border-b border-gray-800/50 backdrop-blur-lg bg-black/20">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-cyan-500/20 flex items-center justify-center">
            <i className="fas fa-coins text-green-400 text-sm"></i>
          </div>
          <span className="text-white font-bold orbitron">USDT RAIN</span>
        </Link>

        <div className="text-center absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-xl font-bold orbitron gradient-text">{title}</h1>
          {subtitle && <p className="text-gray-400 text-xs">{subtitle}</p>}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleWalletConnection}
            disabled={isConnecting}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              address
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : isConnecting
                  ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                  : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
            }`}
          >
            {isConnecting ? (
              <span className="flex items-center">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Connecting...
              </span>
            ) : address ? (
              <>
                <i className="fas fa-check-circle mr-2"></i>
                Connected
              </>
            ) : (
              <>
                <i className="fas fa-wallet mr-2"></i>
                Connect
              </>
            )}
          </button>
          <button
            className="w-10 h-10 rounded-xl glass-card flex items-center justify-center"
            onClick={onMenuClick}
          >
            <i className="fas fa-bars text-cyan-400"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
