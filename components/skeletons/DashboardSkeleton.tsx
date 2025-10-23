"use client";

import React from 'react';

export function DashboardCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 animate-pulse">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50"></div>
        <div className="h-6 bg-gray-700/50 rounded w-32 mx-auto mb-4"></div>
        <div className="h-10 bg-gray-700/50 rounded w-40 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-700/50 rounded w-16 mx-auto"></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="h-8 bg-gray-700/50 rounded w-16 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-700/50 rounded w-24 mx-auto"></div>
        </div>
        <div className="text-center">
          <div className="h-8 bg-gray-700/50 rounded w-20 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-700/50 rounded w-20 mx-auto"></div>
        </div>
      </div>

      <div className="h-12 bg-gray-700/50 rounded-xl"></div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-4 animate-pulse">
      <div className="h-6 bg-gray-700/50 rounded w-16 mx-auto mb-2"></div>
      <div className="h-3 bg-gray-700/50 rounded w-20 mx-auto"></div>
    </div>
  );
}

export default DashboardCardSkeleton;
