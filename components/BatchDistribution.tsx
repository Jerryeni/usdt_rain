'use client';

import { useAdminActions } from '@/lib/hooks/useAdminActions';
import { useDistributionProgress } from '@/lib/hooks/useDistributionProgress';
import { useToast } from '@/components/ui/use-toast';

export function BatchDistribution() {
  const { distributeGlobalPoolBatch } = useAdminActions();
  const { data: progress } = useDistributionProgress();
  const { toast } = useToast();

  const handleDistributeBatch = async () => {
    try {
      await distributeGlobalPoolBatch.mutateAsync();
      toast({
        title: 'Batch Distributed',
        description: 'Global pool batch has been distributed successfully',
        variant: 'success',
      });
    } catch (error: any) {
      console.error('Failed to distribute batch:', error);
      toast({
        title: 'Distribution Failed',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-4 flex items-center">
        <i className="fas fa-share-alt text-cyan-400 mr-2"></i>
        Batch Distribution
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
        disabled={distributeGlobalPoolBatch.isPending || (progress?.isComplete && progress.totalEligible > 0)}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {distributeGlobalPoolBatch.isPending ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Processing Batch...
          </>
        ) : progress?.isComplete ? (
          <>
            <i className="fas fa-check mr-2"></i>
            Distribution Complete
          </>
        ) : progress && progress.lastIndex > 0 ? (
          <>
            <i className="fas fa-arrow-right mr-2"></i>
            Distribute Next Batch
          </>
        ) : (
          <>
            <i className="fas fa-share-alt mr-2"></i>
            Start Batch Distribution
          </>
        )}
      </button>

      {/* Info Box */}
      <div className="mt-4 bg-blue-500/10 border border-blue-400/20 rounded-lg p-3">
        <p className="text-sm text-blue-300">
          <i className="fas fa-info-circle mr-2"></i>
          Batch distribution processes {progress?.batchSize || 0} users at a time. Click multiple times to distribute to all eligible users.
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
