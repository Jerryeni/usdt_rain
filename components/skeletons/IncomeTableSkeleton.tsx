"use client";

import React from 'react';

export function IncomeTableSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {/* Header */}
      <div className="grid grid-cols-5 gap-2 mb-4 pb-3 border-b border-gray-700/50">
        <div className="h-4 bg-gray-700/50 rounded w-12"></div>
        <div className="h-4 bg-gray-700/50 rounded w-16 mx-auto"></div>
        <div className="h-4 bg-gray-700/50 rounded w-20 ml-auto"></div>
        <div className="h-4 bg-gray-700/50 rounded w-20 ml-auto"></div>
        <div className="h-4 bg-gray-700/50 rounded w-16 mx-auto"></div>
      </div>

      {/* Rows */}
      {[...Array(10)].map((_, index) => (
        <div key={index} className="grid grid-cols-5 gap-2 py-3 px-2 rounded-lg bg-gray-800/20">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-gray-700/50 mr-2"></div>
          </div>
          <div className="flex items-center justify-center">
            <div className="h-4 bg-gray-700/50 rounded w-12"></div>
          </div>
          <div className="flex items-center justify-end">
            <div className="h-4 bg-gray-700/50 rounded w-16"></div>
          </div>
          <div className="flex items-center justify-end">
            <div className="h-4 bg-gray-700/50 rounded w-16"></div>
          </div>
          <div className="flex items-center justify-center">
            <div className="h-8 bg-gray-700/50 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default IncomeTableSkeleton;
