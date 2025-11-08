'use client';

import { useContractConfig } from '@/lib/hooks/useContractConfig';

export function ContractConfigDisplay() {
  const { data: config, isLoading } = useContractConfig();

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-pulse">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-700/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <i className="fas fa-exclamation-circle text-gray-400 text-3xl mb-2"></i>
        <p className="text-gray-400">Unable to load contract configuration</p>
      </div>
    );
  }

  const isManagerSet = config.manager && config.manager !== '0x0000000000000000000000000000000000000000';

  return (
    <div className="space-y-4">
      {/* Distribution Percentages */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <i className="fas fa-percentage text-cyan-400 mr-2"></i>
          Distribution Percentages
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-400 mb-1">Level Income</div>
            <div className="text-2xl font-bold text-blue-400 orbitron">
              {config.levelIncomePercentage}%
            </div>
          </div>
          <div className="bg-purple-500/10 border border-purple-400/20 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-400 mb-1">Global Pool</div>
            <div className="text-2xl font-bold text-purple-400 orbitron">
              {config.globalPoolPercentage}%
            </div>
          </div>
          <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-400 mb-1">Reserve</div>
            <div className="text-2xl font-bold text-green-400 orbitron">
              {config.reservePercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Fees and Rewards */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <i className="fas fa-dollar-sign text-green-400 mr-2"></i>
          Fees & Rewards
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Activation Fee</div>
            <div className="text-xl font-bold text-cyan-400 orbitron">
              ${config.activationFeeUSD} USDT
            </div>
          </div>
          <div className="bg-orange-500/10 border border-orange-400/20 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Non-Working Reward</div>
            <div className="text-xl font-bold text-orange-400 orbitron">
              ${config.nonWorkingRewardUSD} USDT
            </div>
          </div>
          <div className="bg-pink-500/10 border border-pink-400/20 rounded-xl p-4 col-span-2">
            <div className="text-xs text-gray-400 mb-1">Non-Working Duration</div>
            <div className="text-xl font-bold text-pink-400 orbitron">
              {config.nonWorkingDurationDays} Days
              <span className="text-sm text-gray-400 ml-2">
                ({config.nonWorkingDuration.toLocaleString()} seconds)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Addresses */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <i className="fas fa-address-card text-purple-400 mr-2"></i>
          Contract Addresses
        </h3>
        <div className="space-y-3">
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Owner</div>
            <div className="text-white font-mono text-sm break-all">{config.owner}</div>
          </div>
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Manager</div>
            <div className="text-white font-mono text-sm break-all">
              {isManagerSet ? config.manager : 'Not set'}
            </div>
          </div>
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Reserve Wallet</div>
            <div className="text-white font-mono text-sm break-all">{config.reserveWallet}</div>
          </div>
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">USDT Token</div>
            <div className="text-white font-mono text-sm break-all">{config.usdtToken}</div>
          </div>
        </div>
      </div>

      {/* Level Percentages */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <i className="fas fa-layer-group text-blue-400 mr-2"></i>
          Level Income Percentages
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {config.levelPercentages.map((percentage, index) => (
            <div
              key={index}
              className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3 text-center"
            >
              <div className="text-xs text-gray-400 mb-1">L{index + 1}</div>
              <div className="text-lg font-bold text-blue-400 orbitron">
                {percentage / 100}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achiever Level Requirements */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <i className="fas fa-award text-pink-400 mr-2"></i>
          Achiever Level Requirements
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {config.achieverLevels.map((requirement, index) => (
            <div
              key={index}
              className="bg-pink-500/10 border border-pink-400/20 rounded-xl p-4 text-center"
            >
              <div className="text-xs text-gray-400 mb-1">Level {index + 1}</div>
              <div className="text-2xl font-bold text-pink-400 orbitron">
                {requirement}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {index === 0 ? 'Direct' : `L${index + 1}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contract State */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <i className="fas fa-info-circle text-cyan-400 mr-2"></i>
          Contract State
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Status</div>
            <div className={`text-lg font-bold orbitron ${config.paused ? 'text-red-400' : 'text-green-400'}`}>
              {config.paused ? (
                <>
                  <i className="fas fa-pause-circle mr-2"></i>
                  Paused
                </>
              ) : (
                <>
                  <i className="fas fa-play-circle mr-2"></i>
                  Active
                </>
              )}
            </div>
          </div>
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Batch Size</div>
            <div className="text-lg font-bold text-cyan-400 orbitron">
              {config.batchSize} users
            </div>
          </div>
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Total Users</div>
            <div className="text-lg font-bold text-white orbitron">
              {config.totalUsers.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Active Users</div>
            <div className="text-lg font-bold text-white orbitron">
              {config.totalActivatedUsers.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Next User ID</div>
            <div className="text-lg font-bold text-gray-300 orbitron">
              {config.nextUserId.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Next Transaction ID</div>
            <div className="text-lg font-bold text-gray-300 orbitron">
              {config.nextTransactionId.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4">
        <p className="text-sm text-blue-300 text-center">
          <i className="fas fa-info-circle mr-2"></i>
          This configuration is read-only and shows the current contract settings. Some values can be updated by the owner through admin actions.
        </p>
      </div>
    </div>
  );
}
