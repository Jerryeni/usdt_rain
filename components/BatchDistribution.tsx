'use client';

import { useState, useEffect } from 'react';
import { useAdminActions } from '@/lib/hooks/useAdminActions';
import { useDistributionProgress } from '@/lib/hooks/useDistributionProgress';
import { useToast } from '@/components/ui/use-toast';
import { backendApi } from '@/lib/services/backendApi';

export function BatchDistribution() {
  const { distributeGlobalPoolBatch } = useAdminActions();
  const { data: progress } = useDistributionProgress();
  const { toast } = useToast();
  const [useBackend, setUseBackend] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

  // Check backend availability on mount
  useEffect(() => {
    const checkBackend = async () => {
      const available = await backendApi.isAvailable();
      setBackendAvailable(available);
      if (available) {
        console.log('✅ Backend API is available for distribution');
      }
    };
    checkBackend();
  }, []);

  const handleDistributeBatch = async () => {
    setIsDistributing(true);
    try {
      if (useBackend && backendAvailable) {
        // Use backend API
        console.log('🔄 Distributing global pool via backend API');
        const response = await backendApi.distributeGlobalPool();
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to distribute via backend');
        }
        
        toast({
          title: 'Pool Distributed (Backend)',
          description: response.data 
            ? `Distributed ${response.data.distribution.totalDistributed.usdt} USDT to ${response.data.distribution.eligibleUsers} users`
            : 'Global pool has been distributed successfully',
          variant: 'success',
        });
        
        if (response.data?.transaction?.hash) {
          console.log('✅ Transaction hash:', response.data.transaction.hash);
        }
      } else {
        // Use direct contract call
        console.log('🔄 Distributing global pool via direct contract call');
        await distributeGlobalPoolBatch.mutateAsync();
        toast({
          title: 'Batch Distributed (Contract)',
          description: 'Global pool batch has been distributed successfully',
          variant: 'success',
        });
      }
    } catch (error: any) {
      console.error('Failed to distribute batch:', error);
      toast({
        title: 'Distribution Failed',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDistributing(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Backend Status Banner */}
      {backendAvailable && (
        <div className="mb-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2"></div>
              <span className="text-sm text-green-300 font-semibold">Backend API Connected</span>
            </div>
            <button
              onClick={() => setUseBackend(!useBackend)}
              className={`text-xs px-3 py-1 rounded-lg transition-all ${
                useBackend
                  ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                  : 'bg-gray-700/50 text-gray-400 border border-gray-600/30'
              }`}
            >
              {useBackend ? 'Using Backend' : 'Using Contract'}
            </button>
          </div>
          {useBackend && (
            <p className="text-xs text-green-400/70 mt-2">
              <i className="fas fa-info-circle mr-1"></i>
              Backend will distribute to all eligible users in one transaction
            </p>
          )}
        </div>
      )}

      <h3 className="text-white font-semibold mb-4 flex items-center">
        <i className="fas fa-share-alt text-cyan-400 mr-2"></i>
        {useBackend && backendAvailable ? 'Global Pool Distribution' : 'Batch Distribution'}
      </h3>

      {/* Distribution Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">Batch Size</div>
          <div className="text-xl font-bold text-cyan-400 orbitron">
            {progress?.batchSize || 0}
          </div>
        </div>
        <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">Distributed</div>
          <div className="text-xl font-bold text-blue-400 orbitron">
            {progress?.lastIndex || 0}
          </div>
        </div>
        <div className="bg-purple-500/10 border border-purple-400/20 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">Total Eligible</div>
          <div className="text-xl font-bold text-purple-400 orbitron">
            {progress?.totalEligible || 0}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {progress && progress.totalEligible > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Distribution Progress</span>
            <span>{progress.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${progress.progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{progress.lastIndex} users</span>
            <span>{progress.totalEligible} users</span>
          </div>
        </div>
      )}

      {/* Status Message */}
      {progress?.isComplete ? (
        <div className="mb-4 bg-green-500/10 border border-green-400/20 rounded-xl p-3">
          <p className="text-sm text-green-300 text-center">
            <i className="fas fa-check-circle mr-2"></i>
            Distribution complete! All eligible users have received their share.
          </p>
        </div>
      ) : progress && progress.lastIndex > 0 ? (
        <div className="mb-4 bg-blue-500/10 border border-blue-400/20 rounded-xl p-3">
          <p className="text-sm text-blue-300 text-center">
            <i className="fas fa-info-circle mr-2"></i>
            Distribution in progress. Click below to continue distributing to the next batch.
          </p>
        </div>
      ) : null}

      {/* Distribute Button */}
      <button
        onClick={handleDistributeBatch}
        disabled={isDistributing || distributeGlobalPoolBatch.isPending || (progress?.isComplete && progress.totalEligible > 0)}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDistributing || distributeGlobalPoolBatch.isPending ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            {useBackend && backendAvailable ? 'Distributing Pool...' : 'Processing Batch...'}
          </>
        ) : progress?.isComplete ? (
          <>
            <i className="fas fa-check mr-2"></i>
            Distribution Complete
          </>
        ) : progress && progress.lastIndex > 0 ? (
          <>
            <i className="fas fa-arrow-right mr-2"></i>
            {useBackend && backendAvailable ? 'Distribute Global Pool' : 'Distribute Next Batch'}
          </>
        ) : (
          <>
            <i className="fas fa-share-alt mr-2"></i>
            {useBackend && backendAvailable ? 'Distribute Global Pool' : 'Start Batch Distribution'}
          </>
        )}
      </button>

      {/* Info Box */}
      <div className="mt-4 bg-blue-500/10 border border-blue-400/20 rounded-lg p-3">
        <p className="text-sm text-blue-300">
          <i className="fas fa-info-circle mr-2"></i>
          {useBackend && backendAvailable 
            ? 'Backend distribution processes all eligible users in one transaction.'
            : `Batch distribution processes ${progress?.batchSize || 0} users at a time. Click multiple times to distribute to all eligible users.`
          }
        </p>
      </div>

      {/* Last Distribution Time */}
      {progress && progress.lastDistributionTimestamp > 0 && (
        <div className="mt-3 text-center text-xs text-gray-400">
          Last distribution: {new Date(progress.lastDistributionTimestamp * 1000).toLocaleString()}
        </div>
      )}
    </div>
  );
}
