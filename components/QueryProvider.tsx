"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

/**
 * Optimized QueryClient configuration for USDT Rain
 * 
 * Configuration rationale:
 * - staleTime: 30s for most queries (blockchain data doesn't change instantly)
 * - cacheTime: 5 minutes (keep data in cache for quick navigation)
 * - refetchOnWindowFocus: false (avoid unnecessary refetches)
 * - retry: 2 attempts (balance between reliability and performance)
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 30 seconds
            staleTime: 30 * 1000,
            // Keep unused data in cache for 5 minutes
            gcTime: 5 * 60 * 1000,
            // Don't refetch on window focus (blockchain data doesn't change that fast)
            refetchOnWindowFocus: false,
            // Retry failed requests twice
            retry: 2,
            // Exponential backoff for retries
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Retry mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Query key factory for consistent cache management
 * Use these keys across all hooks for better cache invalidation
 */
export const queryKeys = {
  usdtrain: {
    all: ['usdtrain'] as const,
    userInfo: (address?: string | null) => ['usdtrain', 'userInfo', address] as const,
    levelIncome: (address?: string | null) => ['usdtrain', 'levelIncome', address] as const,
    referrals: (userId?: bigint | null) => ['usdtrain', 'referrals', userId?.toString()] as const,
    transactions: (userId?: bigint | null, page?: number) => 
      ['usdtrain', 'transactions', userId?.toString(), page] as const,
    contractStats: () => ['usdtrain', 'contractStats'] as const,
  },
};