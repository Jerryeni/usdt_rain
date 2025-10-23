"use client";

import React from 'react';

export function TransactionCardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="glass-card rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-gray-700/50 mr-3"></div>
              <div>
                <div className="h-4 bg-gray-700/50 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-700/50 rounded w-24"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-5 bg-gray-700/50 rounded w-20 mb-2 ml-auto"></div>
              <div className="h-3 bg-gray-700/50 rounded w-16 ml-auto"></div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-700/30">
            <div className="h-3 bg-gray-700/50 rounded w-28"></div>
            <div className="h-3 bg-gray-700/50 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TransactionCardSkeleton;
