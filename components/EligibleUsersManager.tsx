'use client';

import { useState, useEffect } from 'react';
import { useGlobalPool } from '@/lib/hooks/useGlobalPool';
import { useAdminActions } from '@/lib/hooks/useAdminActions';
import { useToast } from '@/components/ui/use-toast';
import { backendApi } from '@/lib/services/backendApi';

export function EligibleUsersManager() {
  const { data: globalPool, refetch, isLoading } = useGlobalPool();
  const { addEligibleUser, removeEligibleUser } = useAdminActions();
  const { toast } = useToast();
  const [newUserAddress, setNewUserAddress] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [removingAddress, setRemovingAddress] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [useBackend, setUseBackend] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);
  
  // Check backend availability on mount
  useEffect(() => {
    const checkBackend = async () => {
      const available = await backendApi.isAvailable();
      setBackendAvailable(available);
      if (available) {
        console.log('✅ Backend API is available');
      } else {
        console.log('⚠️ Backend API is not available - using direct contract calls');
      }
    };
    checkBackend();
  }, []);

  // Debug logging
  console.log('🎨 EligibleUsersManager render:', {
    isLoading,
    globalPool,
    eligibleUsersCount: globalPool?.eligibleUsersCount,
    eligibleUsersLength: globalPool?.eligibleUsers?.length,
    backendAvailable,
    useBackend,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: 'Refreshed',
        description: 'Eligible users list has been refreshed',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserAddress) return;
    
    setIsAdding(true);
    try {
      if (useBackend && backendAvailable) {
        // Use backend API
        console.log('🔄 Adding user via backend API:', newUserAddress);
        const response = await backendApi.addEligibleUser(newUserAddress);
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to add user via backend');
        }
        
        toast({
          title: 'User Added (Backend)',
          description: response.data?.alreadyEligible 
            ? `${newUserAddress} is already eligible`
            : `${newUserAddress} has been added to the eligible list`,
          variant: 'success',
        });
        
        if (response.data?.transaction?.hash) {
          console.log('✅ Transaction hash:', response.data.transaction.hash);
        }
      } else {
        // Use direct contract call
        console.log('🔄 Adding user via direct contract call:', newUserAddress);
        await addEligibleUser.mutateAsync(newUserAddress);
        toast({
          title: 'User Added (Contract)',
          description: `${newUserAddress} has been added to the eligible list`,
          variant: 'success',
        });
      }
      
      setNewUserAddress('');
      // Refresh the data after adding
      setTimeout(() => refetch(), 2000);
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
      if (useBackend && backendAvailable) {
        // Use backend API
        console.log('🔄 Removing user via backend API:', address);
        const response = await backendApi.removeEligibleUser(address);
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to remove user via backend');
        }
        
        toast({
          title: 'User Removed (Backend)',
          description: `${address} has been removed from the eligible list`,
          variant: 'success',
        });
        
        if (response.data?.transaction?.hash) {
          console.log('✅ Transaction hash:', response.data.transaction.hash);
        }
      } else {
        // Use direct contract call
        console.log('🔄 Removing user via direct contract call:', address);
        await removeEligibleUser.mutateAsync(address);
        toast({
          title: 'User Removed (Contract)',
          description: `${address} has been removed from the eligible list`,
          variant: 'success',
        });
      }
      
      // Refresh the data after removing
      setTimeout(() => refetch(), 2000);
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
              Backend will validate users automatically (registered, activated, 10+ referrals)
            </p>
          )}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-400 mb-2">Eligible Users Count</div>
          <div className="text-3xl font-bold text-cyan-400 orbitron">
            {isLoading ? (
              <i className="fas fa-spinner fa-spin text-2xl"></i>
            ) : (
              globalPool?.eligibleUsersCount || 0
            )}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
          title="Refresh eligible users list"
        >
          <i className={`fas fa-sync-alt ${isRefreshing ? 'fa-spin' : ''}`}></i>
        </button>
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
