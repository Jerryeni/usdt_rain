'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/lib/wallet';
import { getReadContract } from '@/lib/contracts/USDTRain';

/**
 * Component to find and display the system user (ID 1) information
 * Useful for knowing which sponsor ID to use for registration
 */
export function FindSystemUser() {
  const { provider } = useWallet();
  const [systemUser, setSystemUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSystemUser = async () => {
      if (!provider) {
        setLoading(false);
        return;
      }

      try {
        const contract = getReadContract(provider);
        
        // Get total users
        const totalUsers = await contract.totalUsers();
        
        if (Number(totalUsers) === 0) {
          setError('No users in the system yet. Contract needs to be initialized.');
          setLoading(false);
          return;
        }

        // Get user ID 1 address
        const userAddress = await contract.getUserAddressById(BigInt(1));
        
        if (!userAddress || userAddress === '0x0000000000000000000000000000000000000000') {
          setError('User ID 1 not found');
          setLoading(false);
          return;
        }

        // Get user info
        const userInfo = await contract.getUserInfo(userAddress);
        
        setSystemUser({
          userId: Number(userInfo.userId),
          address: userAddress,
          userName: userInfo.userName || 'System User',
          sponsorId: Number(userInfo.sponsorId),
          directReferrals: Number(userInfo.directReferrals),
          totalEarned: userInfo.totalEarned,
          isActive: userInfo.isActive,
        });
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching system user:', err);
        setError(err.message || 'Failed to fetch system user');
        setLoading(false);
      }
    };

    fetchSystemUser();
  }, [provider]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-gray-700/50 rounded w-32 mb-2"></div>
        <div className="h-6 bg-gray-700/50 rounded w-48"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6 bg-red-500/10 border border-red-400/20">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-red-400 text-2xl mb-2"></i>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!systemUser) {
    return null;
  }

  return (
    <div className="glass-card rounded-2xl p-6 bg-cyan-500/10 border border-cyan-400/20">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">System User Found</h3>
          <p className="text-sm text-gray-400">Use this ID as your sponsor</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
          <i className="fas fa-user-shield text-cyan-400 text-xl"></i>
        </div>
      </div>

      <div className="space-y-3">
        {/* User ID - Most Important */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">Sponsor ID to Use</p>
              <p className="text-3xl font-bold text-cyan-400 orbitron">{systemUser.userId}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(systemUser.userId.toString());
                alert('Sponsor ID copied to clipboard!');
              }}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-4 py-2 rounded-lg transition-all"
            >
              <i className="fas fa-copy mr-2"></i>
              Copy
            </button>
          </div>
        </div>

        {/* User Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Username</p>
            <p className="text-sm text-white font-semibold truncate">{systemUser.userName}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Status</p>
            <p className={`text-sm font-semibold ${systemUser.isActive ? 'text-green-400' : 'text-yellow-400'}`}>
              {systemUser.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>

        {/* Address */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Wallet Address</p>
          <p className="text-xs text-gray-300 font-mono break-all">{systemUser.address}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Direct Referrals</p>
            <p className="text-lg text-white font-bold">{systemUser.directReferrals}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Total Earned</p>
            <p className="text-lg text-white font-bold">
              ${(Number(systemUser.totalEarned) / 1e18).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3">
          <p className="text-xs text-blue-300">
            <i className="fas fa-info-circle mr-2"></i>
            <strong>How to use:</strong> Enter <strong className="text-blue-400">{systemUser.userId}</strong> as the sponsor ID when registering new users.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version for inline display
 */
export function SystemUserBadge() {
  const { provider } = useWallet();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      if (!provider) return;
      
      try {
        const contract = getReadContract(provider);
        const totalUsers = await contract.totalUsers();
        
        if (Number(totalUsers) > 0) {
          const userAddress = await contract.getUserAddressById(BigInt(1));
          if (userAddress && userAddress !== '0x0000000000000000000000000000000000000000') {
            setUserId(1);
          }
        }
      } catch (err) {
        console.error('Error fetching user ID:', err);
      }
    };

    fetchUserId();
  }, [provider]);

  if (!userId) return null;

  return (
    <div className="inline-flex items-center bg-cyan-500/20 border border-cyan-400/30 rounded-lg px-3 py-1.5">
      <i className="fas fa-user-shield text-cyan-400 mr-2"></i>
      <span className="text-sm text-cyan-300">
        Use Sponsor ID: <strong className="text-cyan-400 font-bold">{userId}</strong>
      </span>
    </div>
  );
}
