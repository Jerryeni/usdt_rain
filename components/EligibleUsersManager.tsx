'use client';

import { useState } from 'react';
import { useGlobalPool } from '@/lib/hooks/useGlobalPool';
import { useAdminActions } from '@/lib/hooks/useAdminActions';
import { useToast } from '@/components/ui/use-toast';

export function EligibleUsersManager() {
  const { data: globalPool } = useGlobalPool();
  const { addEligibleUser, removeEligibleUser } = useAdminActions();
  const { toast } = useToast();
  const [newUserAddress, setNewUserAddress] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [removingAddress, setRemovingAddress] = useState<string | null>(null);

  const handleAddUser = async () => {
    if (!newUserAddress) return;
    
    setIsAdding(true);
    try {
      await addEligibleUser.mutateAsync(newUserAddress);
      setNewUserAddress('');
      toast({
        title: 'User Added',
        description: `${newUserAddress} has been added to the eligible list`,
        variant: 'success',
      });
    } catch (error: any) {
      console.error('Failed to add user:', error);
      toast({
        title: 'Failed to Add User',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveUser = async (address: string) => {
    if (!confirm(`Remove ${address} from eligible list?`)) return;
    
    setRemovingAddress(address);
    try {
      await removeEligibleUser.mutateAsync(address);
      toast({
        title: 'User Removed',
        description: `${address} has been removed from the eligible list`,
        variant: 'success',
      });
    } catch (error: any) {
      console.error('Failed to remove user:', error);
      toast({
        title: 'Failed to Remove User',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setRemovingAddress(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-2">Eligible Users Count</div>
        <div className="text-3xl font-bold text-cyan-400 orbitron">
          {globalPool?.eligibleUsersCount || 0}
        </div>
      </div>

      {/* Add User Form */}
      <div className="mb-6">
        <h3 className="text-white font-semibold mb-3">Add Eligible User</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="User address (0x...)"
            value={newUserAddress}
            onChange={(e) => setNewUserAddress(e.target.value)}
            className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={handleAddUser}
            disabled={!newUserAddress || isAdding}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Adding...
              </>
            ) : (
              'Add'
            )}
          </button>
        </div>
      </div>

      {/* Eligible Users List */}
      <div>
        <h3 className="text-white font-semibold mb-3">Current Eligible Users</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {globalPool?.eligibleUsers && globalPool.eligibleUsers.length > 0 ? (
            globalPool.eligibleUsers.map((address: string) => (
              <div
                key={address}
                className="flex items-center justify-between bg-gray-800/30 border border-gray-700/50 rounded-lg p-3"
              >
                <span className="text-white font-mono text-sm">{address}</span>
                <button
                  onClick={() => handleRemoveUser(address)}
                  disabled={removingAddress === address}
                  className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  {removingAddress === address ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-times"></i>
                  )}
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <i className="fas fa-users text-3xl mb-2"></i>
              <p>No eligible users yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
