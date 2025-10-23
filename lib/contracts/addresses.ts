import { getConfig } from '../config/env';

/**
 * Contract addresses and network configuration
 * Uses centralized environment configuration
 * 
 * Note: This is initialized lazily to avoid issues during build time
 */
function getAddresses() {
  const config = getConfig();
  return {
    USDTRAIN: config.contracts.usdtRain,
    USDT: config.contracts.usdt,
    CHAIN_ID: config.network.chainId,
    RPC_URL: config.network.rpcUrl,
    BLOCK_EXPLORER: config.network.blockExplorer,
  } as const;
}

// Export as a getter to avoid initialization issues
export const ADDRESSES = new Proxy({} as ReturnType<typeof getAddresses>, {
  get(target, prop) {
    // Lazy initialize on first access
    if (Object.keys(target).length === 0) {
      Object.assign(target, getAddresses());
    }
    return target[prop as keyof typeof target];
  }
});
