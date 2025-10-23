"use client";

import React from 'react';
import { getTransactionUrl } from '@/lib/config/env';

export type TransactionStatus = 
  | 'idle'
  | 'estimating'
  | 'signing'
  | 'pending'
  | 'confirming'
  | 'confirmed'
  | 'failed';

export interface TransactionModalProps {
  isOpen: boolean;
  status: TransactionStatus;
  txHash?: string;
  error?: string;
  onClose: () => void;
  title?: string;
  description?: string;
  confirmations?: number;
  requiredConfirmations?: number;
}

export function TransactionModal({
  isOpen,
  status,
  txHash,
  error,
  onClose,
  title = 'Transaction',
  description,
  confirmations = 0,
  requiredConfirmations = 1,
}: TransactionModalProps) {
  if (!isOpen) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'estimating':
      case 'signing':
      case 'pending':
      case 'confirming':
        return (
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
            <i className="fas fa-spinner fa-spin text-3xl text-cyan-400"></i>
          </div>
        );
      case 'confirmed':
        return (
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
            <i className="fas fa-check-circle text-3xl text-green-400"></i>
          </div>
        );
      case 'failed':
        return (
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
            <i className="fas fa-times-circle text-3xl text-red-400"></i>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'estimating':
        return 'Estimating gas...';
      case 'signing':
        return 'Waiting for signature...';
      case 'pending':
        return 'Transaction pending...';
      case 'confirming':
        return `Confirming... (${confirmations}/${requiredConfirmations})`;
      case 'confirmed':
        return 'Transaction confirmed!';
      case 'failed':
        return 'Transaction failed';
      default:
        return '';
    }
  };

  const getStatusDescription = () => {
    if (description) return description;

    switch (status) {
      case 'estimating':
        return 'Calculating gas fees for your transaction...';
      case 'signing':
        return 'Please confirm the transaction in your wallet';
      case 'pending':
        return 'Your transaction has been submitted to the blockchain';
      case 'confirming':
        return 'Waiting for block confirmations...';
      case 'confirmed':
        return 'Your transaction has been successfully confirmed';
      case 'failed':
        return error || 'An error occurred while processing your transaction';
      default:
        return '';
    }
  };

  const canClose = status === 'confirmed' || status === 'failed';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
        onClick={canClose ? onClose : undefined}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-6 max-w-md w-full mx-auto slide-in">
          {/* Close button (only if transaction is complete) */}
          {canClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg glass-card flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <i className="fas fa-times text-gray-400"></i>
            </button>
          )}

          {/* Status Icon */}
          {getStatusIcon()}

          {/* Title */}
          <h2 className="text-xl font-bold text-white text-center mb-2 orbitron">
            {title}
          </h2>

          {/* Status Text */}
          <p className="text-cyan-400 text-center font-semibold mb-4">
            {getStatusText()}
          </p>

          {/* Description */}
          <p className="text-gray-400 text-sm text-center mb-6">
            {getStatusDescription()}
          </p>

          {/* Transaction Hash */}
          {txHash && (
            <div className="mb-6">
              <div className="glass-card rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-2">Transaction Hash</div>
                <div className="text-cyan-400 font-mono text-xs break-all mb-3">
                  {txHash}
                </div>
                <a
                  href={getTransactionUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <span>View on BSCScan</span>
                  <i className="fas fa-external-link-alt text-xs"></i>
                </a>
              </div>
            </div>
          )}

          {/* Progress Bar (for confirming status) */}
          {status === 'confirming' && (
            <div className="mb-6">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(confirmations / requiredConfirmations) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Error Details */}
          {status === 'failed' && error && (
            <div className="mb-6">
              <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-4">
                <div className="text-xs text-red-400 font-mono break-all">
                  {error}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {canClose && (
            <button
              onClick={onClose}
              className={`w-full py-3 px-6 rounded-xl font-bold transition-all ${
                status === 'confirmed'
                  ? 'bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white'
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white'
              }`}
            >
              {status === 'confirmed' ? 'Done' : 'Close'}
            </button>
          )}

          {/* Loading indicator for pending states */}
          {!canClose && status !== 'idle' && (
            <div className="text-center text-gray-400 text-sm">
              <i className="fas fa-circle-notch fa-spin mr-2"></i>
              Please wait...
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default TransactionModal;
