"use client";

import React from 'react';

export function ReferralCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gray-700/50 mr-3"></div>
              <div>
                <div className="h-4 bg-gray-700/50 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-700/50 rounded w-32"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-4 bg-gray-700/50 rounded w-20 mb-2 ml-auto"></div>
              <div className="h-3 bg-gray-700/50 rounded w-16 ml-auto"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReferralCardSkeleton;
