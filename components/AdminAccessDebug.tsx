'use client';

import { useWallet } from '@/lib/wallet';
import { useIsOwner } from '@/lib/hooks/useIsOwner';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { useState, useEffect } from 'react';
import { getReadContract } from '@/lib/contracts/USDTRain';

/**
 * Debug component to help troubleshoot admin access issues
 * Add this to the admin page temporarily to see what's happening
 */
export function AdminAccessDebug() {
  const { address, provider } = useWallet();
  const { data: isOwner, isLoading: isCheckingOwner } = useIsOwner();
  const { data: userInfo } = useUserInfo(address);
  const [contractOwner, setContractOwner] = useState<string>('');
  const [userId, setUserId] = useState<number>(0);

  useEffect(() => {
    async function fetchDebugInfo() {
      if (!provider || !address) return;

      try {
        const contract = getReadContract(provider);
        const owner = await contract.owner();
        setContractOwner(owner);

        try {
          const id = await contract.getUserIdByAddress(address);
          setUserId(Number(id));
        } catch (error) {
          console.log('User not registered:', error);
          setUserId(0);
        }
      } catch (error) {
        console.error('Error fetching debug info:', error);
      }
    }

    fetchDebugInfo();
  }, [provider, address]);

  if (!address) {
    return (
      <div className="fixed bottom-4 right-4 glass-card rounded-xl p-4 max-w-md z-50 border-2 border-yellow-400/50">
        <h3 className="text-yellow-400 font-bold mb-2">🔍 Admin Access Debug</h3>
        <p className="text-white text-sm">No wallet connected</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 glass-card rounded-xl p-4 max-w-md z-50 border-2 border-cyan-400/50 max-h-96 overflow-y-auto">
      <h3 className="text-cyan-400 font-bold mb-3 flex items-center">
        <i className="fas fa-bug mr-2"></i>
        Admin Access Debug
      </h3>
      
      <div className="space-y-2 text-xs">
        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-gray-400">Connected Address:</div>
          <div className="text-white font-mono break-all">{address}</div>
        </div>

        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-gray-400">Contract Owner:</div>
          <div className="text-white font-mono break-all">{contractOwner || 'Loading...'}</div>
        </div>

        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-gray-400">Is Owner Match:</div>
          <div className={`font-bold ${contractOwner.toLowerCase() === address.toLowerCase() ? 'text-green-400' : 'text-red-400'}`}>
            {contractOwner.toLowerCase() === address.toLowerCase() ? '✅ YES' : '❌ NO'}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-gray-400">User ID:</div>
          <div className="text-white font-bold">{userId === 0 ? 'Not Registered' : userId}</div>
        </div>

        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-gray-400">Is First User:</div>
          <div className={`font-bold ${userId === 1 ? 'text-green-400' : 'text-red-400'}`}>
            {userId === 1 ? '✅ YES' : '❌ NO'}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-gray-400">Checking Owner:</div>
          <div className="text-white">{isCheckingOwner ? '⏳ Loading...' : '✅ Complete'}</div>
        </div>

        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-gray-400">Has Admin Access:</div>
          <div className={`font-bold text-lg ${isOwner ? 'text-green-400' : 'text-red-400'}`}>
            {isOwner === undefined ? '⏳ Checking...' : isOwner ? '✅ YES - ACCESS GRANTED' : '❌ NO - ACCESS DENIED'}
          </div>
        </div>

        {userInfo && (
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-gray-400">User Info:</div>
            <div className="text-white">
              <div>ID: {userInfo.userId}</div>
              <div>Active: {userInfo.isActive ? '✅' : '❌'}</div>
              <div>Sponsor: {userInfo.sponsorId}</div>
            </div>
          </div>
        )}

        <div className="bg-blue-500/10 border border-blue-400/20 rounded p-2 mt-3">
          <div className="text-blue-300 text-xs">
            <strong>Access Rules:</strong>
            <ul className="list-disc list-inside mt-1">
              <li>Contract owner gets access</li>
              <li>First user (ID 1) gets access</li>
              <li>Others are redirected</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
