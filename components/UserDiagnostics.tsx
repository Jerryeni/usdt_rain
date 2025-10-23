'use client';

import { useState } from 'react';
import { useWallet } from '@/lib/wallet';
import { getReadContract } from '@/lib/contracts/USDTRain';

/**
 * Diagnostic tool to find all existing users in the contract
 * Helps identify which user IDs actually exist
 */
export function UserDiagnostics() {
  const { provider } = useWallet();
  const [scanning, setScanning] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [nextUserId, setNextUserId] = useState<number>(0);
  const [error, setError] = useState('');

  const scanUsers = async () => {
    if (!provider) {
      setError('Please connect your wallet first');
      return;
    }

    setScanning(true);
    setError('');
    setUsers([]);

    try {
      const contract = getReadContract(provider);
      
      // Get contract stats
      const total = await contract.totalUsers();
      const nextId = await contract.nextUserId();
      
      setTotalUsers(Number(total));
      setNextUserId(Number(nextId));

      console.log('Contract Stats:', {
        totalUsers: Number(total),
        nextUserId: Number(nextId),
      });

      // Scan for users - check IDs from 1 to nextUserId
      const foundUsers: any[] = [];
      const maxId = Math.max(Number(nextId), 10); // Check at least up to 10

      for (let id = 1; id < maxId; id++) {
        try {
          const userAddress = await contract.getUserAddressById(BigInt(id));
          
          if (userAddress && userAddress !== '0x0000000000000000000000000000000000000000') {
            // User exists, get full info
            const userInfo = await contract.getUserInfo(userAddress);
            
            foundUsers.push({
              userId: id,
              address: userAddress,
              userName: userInfo.userName || `User #${id}`,
              sponsorId: Number(userInfo.sponsorId),
              directReferrals: Number(userInfo.directReferrals),
              totalEarned: userInfo.totalEarned,
              isActive: userInfo.isActive,
            });
            
            console.log(`Found user ID ${id}:`, userAddress);
          }
        } catch (err) {
          // User doesn't exist, continue
          console.log(`User ID ${id} not found`);
        }
      }

      setUsers(foundUsers);

      if (foundUsers.length === 0) {
        setError('No users found in the contract. Contract may need to be initialized.');
      }

    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err.message || 'Failed to scan users');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">User Diagnostics</h3>
          <p className="text-sm text-gray-400">Find all existing users in the contract</p>
        </div>
        <button
          onClick={scanUsers}
          disabled={scanning || !provider}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {scanning ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Scanning...
            </>
          ) : (
            <>
              <i className="fas fa-search mr-2"></i>
              Scan Users
            </>
          )}
        </button>
      </div>

      {/* Contract Stats */}
      {totalUsers > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Total Users</p>
            <p className="text-2xl text-white font-bold">{totalUsers}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Next User ID</p>
            <p className="text-2xl text-white font-bold">{nextUserId}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-4 mb-4">
          <p className="text-red-300 text-sm">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </p>
        </div>
      )}

      {/* Found Users */}
      {users.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-white">Found {users.length} User(s)</h4>
            <span className="text-xs text-green-400">
              <i className="fas fa-check-circle mr-1"></i>
              Ready to use
            </span>
          </div>

          {users.map((user) => (
            <div
              key={user.userId}
              className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-400/20 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">User ID</span>
                    {user.userId === 1 && (
                      <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
                        System User
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-bold text-green-400 orbitron">{user.userId}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user.userId.toString());
                    alert(`User ID ${user.userId} copied!`);
                  }}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1.5 rounded-lg transition-all text-sm"
                >
                  <i className="fas fa-copy mr-1"></i>
                  Copy ID
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <p className="text-xs text-gray-400">Username</p>
                  <p className="text-sm text-white font-semibold truncate">{user.userName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <p className={`text-sm font-semibold ${user.isActive ? 'text-green-400' : 'text-yellow-400'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-2 mb-2">
                <p className="text-xs text-gray-400 mb-1">Wallet Address</p>
                <p className="text-xs text-gray-300 font-mono break-all">{user.address}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-400">Sponsor ID</p>
                  <p className="text-sm text-white font-semibold">{user.sponsorId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Referrals</p>
                  <p className="text-sm text-white font-semibold">{user.directReferrals}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Earned</p>
                  <p className="text-sm text-white font-semibold">
                    ${(Number(user.totalEarned) / 1e18).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-green-400/20">
                <p className="text-xs text-green-300">
                  <i className="fas fa-check-circle mr-1"></i>
                  <strong>Use this ID:</strong> Enter <strong>{user.userId}</strong> as sponsor ID when registering
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {!scanning && users.length === 0 && !error && (
        <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            <i className="fas fa-info-circle mr-2"></i>
            Click "Scan Users" to find all existing users in the contract and get their IDs.
          </p>
        </div>
      )}
    </div>
  );
}
