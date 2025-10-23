'use client';

import Link from 'next/link';
import { useUserFlowState, useUserFlowProgress, getUserFlowMessage } from '@/lib/hooks/useUserFlow';

/**
 * User flow progress indicator component
 * Shows users where they are in the onboarding process
 */
export function UserFlowProgress() {
  const state = useUserFlowState();
  const progress = useUserFlowProgress();
  const flowMessage = getUserFlowMessage(state);

  // Don't show for fully activated users
  if (state === 'activated' || state === 'loading') {
    return null;
  }

  return (
    <div className="mb-6 px-4 sm:px-6">
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Account Setup Progress</span>
            <span className="text-sm font-bold text-cyan-400">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className={`text-center ${progress >= 33 ? 'text-cyan-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${
              progress >= 33 ? 'bg-cyan-500/20' : 'bg-gray-800'
            }`}>
              {progress >= 33 ? (
                <i className="fas fa-check text-sm"></i>
              ) : (
                <span className="text-xs">1</span>
              )}
            </div>
            <span className="text-xs">Connect</span>
          </div>
          <div className={`text-center ${progress >= 66 ? 'text-cyan-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${
              progress >= 66 ? 'bg-cyan-500/20' : 'bg-gray-800'
            }`}>
              {progress >= 66 ? (
                <i className="fas fa-check text-sm"></i>
              ) : (
                <span className="text-xs">2</span>
              )}
            </div>
            <span className="text-xs">Register</span>
          </div>
          <div className={`text-center ${progress >= 100 ? 'text-cyan-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${
              progress >= 100 ? 'bg-cyan-500/20' : 'bg-gray-800'
            }`}>
              {progress >= 100 ? (
                <i className="fas fa-check text-sm"></i>
              ) : (
                <span className="text-xs">3</span>
              )}
            </div>
            <span className="text-xs">Activate</span>
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <h3 className="text-white font-semibold mb-1">{flowMessage.title}</h3>
          <p className="text-sm text-gray-300 mb-3">{flowMessage.message}</p>
          <Link href={flowMessage.actionLink}>
            <button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-2 px-6 rounded-xl transition-all">
              {flowMessage.action}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version for header/navbar
 */
export function UserFlowProgressCompact() {
  const state = useUserFlowState();
  const progress = useUserFlowProgress();

  if (state === 'activated' || state === 'loading') {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-gray-400">{progress}%</span>
    </div>
  );
}
