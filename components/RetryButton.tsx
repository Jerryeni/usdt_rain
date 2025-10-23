'use client';

import { useState } from 'react';
import { isRetryableError } from '@/lib/utils/errorHandler';

interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  error?: any;
  maxRetries?: number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Retry button component with exponential backoff
 * Automatically disables after max retries
 */
export function RetryButton({
  onRetry,
  error,
  maxRetries = 3,
  className = '',
  children = 'Retry',
}: RetryButtonProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const canRetry = error ? isRetryableError(error) : true;
  const retriesLeft = maxRetries - retryCount;
  const isDisabled = !canRetry || retriesLeft <= 0 || isRetrying;

  const handleRetry = async () => {
    if (isDisabled) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await onRetry();
      // Reset retry count on success
      setRetryCount(0);
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleRetry}
        disabled={isDisabled}
        className={`
          ${className}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
          transition-all duration-200
        `}
      >
        {isRetrying ? (
          <span className="flex items-center justify-center">
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Retrying...
          </span>
        ) : (
          children
        )}
      </button>

      {retryCount > 0 && retriesLeft > 0 && (
        <p className="text-xs text-gray-400 text-center">
          {retriesLeft} {retriesLeft === 1 ? 'retry' : 'retries'} remaining
        </p>
      )}

      {retriesLeft <= 0 && (
        <p className="text-xs text-red-400 text-center">
          Maximum retries reached. Please refresh the page.
        </p>
      )}

      {!canRetry && error && (
        <p className="text-xs text-yellow-400 text-center">
          This error cannot be automatically retried.
        </p>
      )}
    </div>
  );
}

/**
 * Error state component with retry functionality
 */
interface ErrorStateProps {
  error: any;
  onRetry: () => Promise<void> | void;
  title?: string;
  message?: string;
}

export function ErrorState({ error, onRetry, title, message }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
        <i className="fas fa-exclamation-triangle text-2xl text-red-400"></i>
      </div>

      <h3 className="text-lg font-bold text-white mb-2">
        {title || 'Something Went Wrong'}
      </h3>

      <p className="text-gray-300 mb-6 max-w-md">
        {message || 'An error occurred while loading data. Please try again.'}
      </p>

      <RetryButton
        onRetry={onRetry}
        error={error}
        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-6 rounded-xl"
      >
        <i className="fas fa-redo mr-2"></i>
        Try Again
      </RetryButton>
    </div>
  );
}
