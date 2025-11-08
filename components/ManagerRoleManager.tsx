'use client';

import { useState } from 'react';
import { useManager, useSetManager } from '@/lib/hooks/useManager';
import { useIsOwner } from '@/lib/hooks/useIsOwner';
import { useToast } from '@/components/ui/use-toast';

export function ManagerRoleManager() {
  const { data: manager } = useManager();
  const { data: isOwner } = useIsOwner();
  const setManager = useSetManager();
  const { toast } = useToast();
  const [newManagerAddress, setNewManagerAddress] = useState('');
  const [isSettingManager, setIsSettingManager] = useState(false);

  const handleSetManager = async () => {
    if (!newManagerAddress) {
      toast({
        title: 'Address Required',
        description: 'Please enter a manager address',
        variant: 'destructive',
      });
      return;
    }

    // Validate address format
    if (!newManagerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid Ethereum address',
        variant: 'destructive',
      });
      return;
    }

    // Confirm action
    if (!confirm(`Set ${newManagerAddress} as the new manager?\n\nThe manager will be able to perform certain admin tasks.`)) {
      return;
    }

    setIsSettingManager(true);
    try {
      await setManager.mutateAsync(newManagerAddress);
      setNewManagerAddress('');
      toast({
        title: 'Manager Updated',
        description: `${newManagerAddress} is now the manager`,
        variant: 'success',
      });
    } catch (error: any) {
      console.error('Failed to set manager:', error);
      toast({
        title: 'Failed to Set Manager',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSettingManager(false);
    }
  };

  const handleRemoveManager = async () => {
    if (!confirm('Remove the current manager?\n\nThis will revoke their admin permissions.')) {
      return;
    }

    setIsSettingManager(true);
    try {
      // Set manager to zero address to remove
      await setManager.mutateAsync('0x0000000000000000000000000000000000000000');
      toast({
        title: 'Manager Removed',
        description: 'The manager role has been removed',
        variant: 'success',
      });
    } catch (error: any) {
      console.error('Failed to remove manager:', error);
      toast({
        title: 'Failed to Remove Manager',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSettingManager(false);
    }
  };

  const isManagerSet = manager && manager !== '0x0000000000000000000000000000000000000000';

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Current Manager Display */}
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-2">Current Manager</div>
        {isManagerSet ? (
          <div className="bg-purple-500/10 border border-purple-400/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white font-mono text-sm break-all">
                  {manager}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  <i className="fas fa-shield-alt mr-1"></i>
                  Has admin permissions
                </div>
              </div>
              {isOwner && (
                <button
                  onClick={handleRemoveManager}
                  disabled={isSettingManager}
                  className="ml-3 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                  title="Remove manager"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 text-center">
            <i className="fas fa-user-slash text-gray-500 text-2xl mb-2"></i>
            <div className="text-gray-400 text-sm">No manager set</div>
          </div>
        )}
      </div>

      {/* Set Manager Form (Owner Only) */}
      {isOwner && (
        <div>
          <h3 className="text-white font-semibold mb-3">
            {isManagerSet ? 'Change Manager' : 'Set Manager'}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Manager address (0x...)"
              value={newManagerAddress}
              onChange={(e) => setNewManagerAddress(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 font-mono text-sm"
            />
            <button
              onClick={handleSetManager}
              disabled={!newManagerAddress || isSettingManager}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSettingManager ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-user-shield mr-2"></i>
                  {isManagerSet ? 'Change Manager' : 'Set Manager'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
        <h4 className="text-blue-300 font-semibold mb-2 flex items-center">
          <i className="fas fa-info-circle mr-2"></i>
          About Manager Role
        </h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li className="flex items-start">
            <i className="fas fa-check text-blue-400 mr-2 mt-1"></i>
            <span>Manager can perform certain admin tasks</span>
          </li>
          <li className="flex items-start">
            <i className="fas fa-check text-blue-400 mr-2 mt-1"></i>
            <span>Useful for delegating responsibilities</span>
          </li>
          <li className="flex items-start">
            <i className="fas fa-check text-blue-400 mr-2 mt-1"></i>
            <span>Only owner can set or remove manager</span>
          </li>
          <li className="flex items-start">
            <i className="fas fa-check text-blue-400 mr-2 mt-1"></i>
            <span>Manager cannot transfer ownership</span>
          </li>
        </ul>
      </div>

      {/* Not Owner Warning */}
      {!isOwner && (
        <div className="mt-4 bg-orange-500/10 border border-orange-400/20 rounded-lg p-3">
          <p className="text-sm text-orange-300 text-center">
            <i className="fas fa-lock mr-2"></i>
            Only the contract owner can manage the manager role
          </p>
        </div>
      )}
    </div>
  );
}
