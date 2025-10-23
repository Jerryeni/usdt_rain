'use client';

import { useState } from 'react';
import { useWallet } from '@/lib/wallet';
import { getReadContract } from '@/lib/contracts/USDTRain';
import { ADDRESSES } from '@/lib/contracts/addresses';

/**
 * Verify contract deployment and configuration
 */
export function ContractVerification() {
  const { provider, address } = useWallet();
  const [verifying, setVerifying] = useState(false);
  const [results, setResults] = useState<any>(null);

  const verify = async () => {
    if (!provider) {
      alert('Please connect your wallet first');
      return;
    }

    setVerifying(true);
    const checks: any = {
      contractAddress: ADDRESSES.USDTRAIN,
      network: null,
      owner: null,
      totalUsers: null,
      nextUserId: null,
      activationFee: null,
      usdtToken: null,
      errors: [],
    };

    try {
      // Get network
      const network = await provider.getNetwork();
      checks.network = {
        chainId: Number(network.chainId),
        name: network.name,
      };

      const contract = getReadContract(provider);

      // Check contract functions
      try {
        checks.owner = await contract.owner();
      } catch (e) {
        checks.errors.push('Cannot read owner() - contract might not be deployed');
      }

      try {
        checks.totalUsers = Number(await contract.totalUsers());
      } catch (e) {
        checks.errors.push('Cannot read totalUsers()');
      }

      try {
        checks.nextUserId = Number(await contract.nextUserId());
      } catch (e) {
        checks.errors.push('Cannot read nextUserId()');
      }

      try {
        checks.activationFee = await contract.ACTIVATION_FEE();
      } catch (e) {
        checks.errors.push('Cannot read ACTIVATION_FEE()');
      }

      try {
        checks.usdtToken = await contract.usdtToken();
      } catch (e) {
        checks.errors.push('Cannot read usdtToken()');
      }

      // Check if connected wallet is owner
      if (address && checks.owner) {
        checks.isOwner = address.toLowerCase() === checks.owner.toLowerCase();
      }

      setResults(checks);
    } catch (err: any) {
      checks.errors.push(`Verification failed: ${err.message}`);
      setResults(checks);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Contract Verification</h3>
          <p className="text-sm text-gray-400">Verify contract deployment and configuration</p>
        </div>
        <button
          onClick={verify}
          disabled={verifying || !provider}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50"
        >
          {verifying ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Verifying...
            </>
          ) : (
            <>
              <i className="fas fa-check-circle mr-2"></i>
              Verify
            </>
          )}
        </button>
      </div>

      {results && (
        <div className="space-y-3">
          {/* Errors */}
          {results.errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-4">
              <p className="text-red-400 font-semibold mb-2">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Issues Found:
              </p>
              {results.errors.map((error: string, i: number) => (
                <p key={i} className="text-red-300 text-sm ml-6">• {error}</p>
              ))}
            </div>
          )}

          {/* Contract Address */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Contract Address</p>
            <p className="text-xs text-white font-mono break-all">{results.contractAddress}</p>
          </div>

          {/* Network */}
          {results.network && (
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Network</p>
              <p className="text-sm text-white">
                {results.network.name} (Chain ID: {results.network.chainId})
              </p>
            </div>
          )}

          {/* Owner */}
          {results.owner && (
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Contract Owner</p>
              <p className="text-xs text-white font-mono break-all">{results.owner}</p>
              {results.isOwner !== undefined && (
                <p className={`text-xs mt-1 ${results.isOwner ? 'text-green-400' : 'text-yellow-400'}`}>
                  {results.isOwner ? '✓ You are the owner' : '✗ You are not the owner'}
                </p>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {results.totalUsers !== null && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Total Users</p>
                <p className="text-2xl text-white font-bold">{results.totalUsers}</p>
              </div>
            )}
            {results.nextUserId !== null && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Next User ID</p>
                <p className="text-2xl text-white font-bold">{results.nextUserId}</p>
              </div>
            )}
          </div>

          {/* USDT Token */}
          {results.usdtToken && (
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">USDT Token Address</p>
              <p className="text-xs text-white font-mono break-all">{results.usdtToken}</p>
            </div>
          )}

          {/* Activation Fee */}
          {results.activationFee && (
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Activation Fee</p>
              <p className="text-sm text-white">
                {(Number(results.activationFee) / 1e18).toFixed(2)} USDT
              </p>
            </div>
          )}

          {/* Diagnosis */}
          {results.errors.length === 0 && (
            <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
              <p className="text-green-400 font-semibold mb-2">
                <i className="fas fa-check-circle mr-2"></i>
                Contract Verified Successfully
              </p>
              {results.totalUsers === 0 && (
                <p className="text-green-300 text-sm">
                  Contract is deployed but not initialized. Use the "Initialize Contract" button above.
                </p>
              )}
              {results.totalUsers > 0 && (
                <p className="text-green-300 text-sm">
                  Contract has {results.totalUsers} user(s). Use "Scan Users" to find their IDs.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {!results && !verifying && (
        <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            <i className="fas fa-info-circle mr-2"></i>
            Click "Verify" to check contract deployment and configuration.
          </p>
        </div>
      )}
    </div>
  );
}
