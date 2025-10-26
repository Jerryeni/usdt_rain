'use client';

import { useWallet } from '@/lib/wallet';
import { useIsOwner } from '@/lib/hooks/useIsOwner';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { useState, useEffect } from 'react';
import { getReadContract } from '@/lib/contracts/USDTRain';

/**
 * Debug component to help troubleshoot admin access issues
 * Toggleable panel that can be shown/hidden
 */
export function AdminAccessDebug() {
  const { address, provider } = useWallet();
  const { data: isOwner, isLoading: isCheckingOwner } = useIsOwner();
  const { data: userInfo } = useUserInfo(address);
  const [contractOwner, setContractOwner] = useState<string>('');
  const [sponsorId, setSponsorId] = useState<number>(-1);
  const [userId, setUserId] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  // Keyboard shortcut: Ctrl/Cmd + Shift + D to toggle
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    async function fetchDebugInfo() {
      if (!provider || !address) return;

      try {
        const contract = getReadContract(provider);
        const owner = await contract.owner();
        setContractOwner(owner);

        try {
          const userInfo = await contract.getUserInfo(address);
          setUserId(Number(userInfo[0])); // userId at index 0
          setSponsorId(Number(userInfo[1])); // sponsorId at index 1
        } catch (error) {
          console.log('User not registered:', error);
          setUserId(0);
          setSponsorId(-1);
        }
      } catch (error) {
        console.error('Error fetching debug info:', error);
      }
    }

    fetchDebugInfo();
  }, [provider, address]);

  if (!address) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full glass-card flex items-center justify-center z-50 border-2 border-cyan-400/50 hover:scale-110 transition-transform group"
        title="Toggle Admin Debug Panel"
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-bug'} text-cyan-400 text-lg`}></i>
        <span className="absolute -top-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {isOpen ? 'Close' : 'Debug'} (Ctrl+Shift+D)
        </span>
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 glass-card rounded-xl p-4 max-w-md z-50 border-2 border-cyan-400/50 max-h-96 overflow-y-auto slide-in">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-cyan-400 font-bold flex items-center">
                <i className="fas fa-bug mr-2"></i>
                Admin Access Debug
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times text-gray-400 text-sm"></i>
              </button>
            </div>
            <p className="text-xs text-gray-500">Press Ctrl+Shift+D to toggle</p>
          </div>
      
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
          <div className="text-gray-400">Sponsor ID:</div>
          <div className="text-white font-bold">{sponsorId === -1 ? 'Not Registered' : sponsorId}</div>
        </div>

        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-gray-400">Is First User:</div>
          <div className={`font-bold ${sponsorId === 0 ? 'text-green-400' : 'text-red-400'}`}>
            {sponsorId === 0 ? '✅ YES (Sponsor ID 0)' : '❌ NO'}
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
              <li>First registered user (Sponsor ID 0) gets access</li>
              <li>Others are redirected</li>
            </ul>
          </div>
        </div>
      </div>
        </div>
      )}
    </>
  );
}
