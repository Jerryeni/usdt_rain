'use client';

import { useState } from 'react';
import { useWallet } from '@/lib/wallet';
import { getWriteContract } from '@/lib/contracts/USDTRain';
import { useToast } from '@/components/ui/use-toast';

/**
 * Component to bootstrap the contract owner as the first user
 * This creates user ID 1 which can then be used as a sponsor
 */
export function BootstrapOwner() {
  const { signer, address } = useWallet();
  const { toast } = useToast();
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  const handleBootstrap = async () => {
    if (!signer || !address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    setIsBootstrapping(true);

    try {
      const contract = getWriteContract(signer);
      
      toast({
        title: 'Initializing Contract',
        description: 'Creating system user (ID 1)...',
        variant: 'info',
      });

      // Call bootstrapOwner to create the first user
      const tx = await contract.bootstrapOwner();
      
      toast({
        title: 'Transaction Sent',
        description: 'Waiting for confirmation...',
        variant: 'info',
      });

      await tx.wait();

      setIsBootstrapped(true);
      
      toast({
        title: 'Contract Initialized!',
        description: 'System user (ID 1) created successfully. You can now register users.',
        variant: 'success',
      });

    } catch (error: any) {
      console.error('Bootstrap failed:', error);
      
      const errorMessage = error?.message || '';
      
      if (errorMessage.includes('Already bootstrapped')) {
        toast({
          title: 'Already Initialized',
          description: 'The contract has already been bootstrapped. User ID 1 exists.',
          variant: 'info',
        });
        setIsBootstrapped(true);
      } else if (errorMessage.includes('Ownable')) {
        toast({
          title: 'Permission Denied',
          description: 'Only the contract owner can bootstrap. Please use the owner wallet.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Bootstrap Failed',
          description: errorMessage.length > 100 ? 'An error occurred. Check console for details.' : errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsBootstrapping(false);
    }
  };

  if (isBootstrapped) {
    return (
      <div className="glass-card rounded-2xl p-6 bg-green-500/10 border border-green-400/20">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <i className="fas fa-check text-2xl text-green-400"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Contract Initialized!</h3>
          <p className="text-gray-300 mb-4">
            System user (ID 1) has been created. Users can now register with sponsor ID 1.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-xl transition-all"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 bg-blue-500/10 border border-blue-400/20">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
          <i className="fas fa-rocket text-2xl text-blue-400"></i>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Initialize Contract</h3>
        <p className="text-gray-300 mb-4">
          The contract needs to be initialized first. This will create the system user (ID 1) that can be used as a sponsor for new registrations.
        </p>
        <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-xl p-4 mb-4">
          <p className="text-sm text-yellow-300">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            <strong>Important:</strong> Only the contract owner can perform this action. Make sure you're connected with the owner wallet.
          </p>
        </div>
        <button
          onClick={handleBootstrap}
          disabled={isBootstrapping || !address}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBootstrapping ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Initializing...
            </>
          ) : (
            <>
              <i className="fas fa-rocket mr-2"></i>
              Initialize Contract
            </>
          )}
        </button>
        {!address && (
          <p className="mt-3 text-sm text-gray-400">
            Please connect your wallet first
          </p>
        )}
      </div>
    </div>
  );
}
