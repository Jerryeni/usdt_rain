"use client";

import React, { ReactNode } from 'react';

/**
 * PresaleProvider - Placeholder provider for backward compatibility
 * 
 * This provider has been simplified as part of the cleanup process.
 * The app now uses WalletProvider and USDTRain-specific hooks instead.
 * 
 * Keeping this as a pass-through provider to avoid breaking existing layout structure.
 * Can be removed entirely once all pages are updated to not depend on it.
 */
export const PresaleProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};
