/**
 * Environment Configuration Module
 * 
 * Centralizes and validates all environment variables used in the application.
 * Ensures that all required configuration is present and valid before the app starts.
 */

export interface EnvConfig {
  contracts: {
    usdtRain: string;
    usdt: string;
  };
  network: {
    chainId: number;
    rpcUrl: string;
    name: string;
    blockExplorer: string;
  };
  features: {
    enableDevTools: boolean;
  };
}

/**
 * Validates that a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Gets an optional environment variable with a default value
 */
function getEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

// Cache the config to avoid re-parsing
let cachedConfig: EnvConfig | null = null;

/**
 * Validates and returns the environment configuration
 * Uses fallbacks for build time when env vars might not be available
 */
export function getConfig(): EnvConfig {
  // Return cached config if available
  if (cachedConfig) {
    return cachedConfig;
  }

  // Get contract addresses with fallback for build time
  const usdtRainAddress = process.env.NEXT_PUBLIC_USDTRAIN_CONTRACT_ADDRESS || '';
  const usdtAddress = process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS || '';

  // Only validate if we have values (skip during build)
  if (usdtRainAddress && !isValidAddress(usdtRainAddress)) {
    console.warn(
      `Invalid NEXT_PUBLIC_USDTRAIN_CONTRACT_ADDRESS: ${usdtRainAddress}\n` +
      `Must be a valid Ethereum address (0x followed by 40 hex characters)`
    );
  }

  if (usdtAddress && !isValidAddress(usdtAddress)) {
    console.warn(
      `Invalid NEXT_PUBLIC_USDT_CONTRACT_ADDRESS: ${usdtAddress}\n` +
      `Must be a valid Ethereum address (0x followed by 40 hex characters)`
    );
  }

  // Get network configuration
  const chainIdStr = process.env.NEXT_PUBLIC_CHAIN_ID || '97';
  const chainId = parseInt(chainIdStr, 10);

  if (isNaN(chainId)) {
    console.warn(
      `Invalid NEXT_PUBLIC_CHAIN_ID: ${chainIdStr}\n` +
      `Must be a valid number (97 for BSC Testnet, 56 for BSC Mainnet)`
    );
  }

  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://data-seed-prebsc-1-s1.bnbchain.org:8545/';
  const networkName = getEnv('NEXT_PUBLIC_NETWORK', chainId === 97 ? 'bsc-testnet' : 'bsc-mainnet');

  // Determine block explorer based on chain ID
  const blockExplorer = chainId === 97
    ? 'https://testnet.bscscan.com'
    : 'https://bscscan.com';

  // Get feature flags
  const enableDevTools = getEnv('NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS', 'false') === 'true';

  cachedConfig = {
    contracts: {
      usdtRain: usdtRainAddress,
      usdt: usdtAddress,
    },
    network: {
      chainId,
      rpcUrl,
      name: networkName,
      blockExplorer,
    },
    features: {
      enableDevTools,
    },
  };

  return cachedConfig;
}

/**
 * Validates environment configuration on app startup
 * Call this in your root layout or app component
 */
export function validateEnv(): void {
  try {
    const config = getConfig();

    // Only log if we're in the browser (not during build)
    if (typeof window !== 'undefined') {
      console.log('✅ Environment configuration validated successfully');
      console.log(`📍 Network: ${config.network.name} (Chain ID: ${config.network.chainId})`);

      if (config.contracts.usdtRain) {
        console.log(`📝 USDTRain Contract: ${config.contracts.usdtRain}`);
      }

      if (config.contracts.usdt) {
        console.log(`💰 USDT Contract: ${config.contracts.usdt}`);
      }
    }
  } catch (error) {
    console.error('❌ Environment configuration validation failed:');
    console.error(error);
    // Don't throw during build - just warn
    if (typeof window !== 'undefined') {
      console.warn('Some environment variables may be missing. Please check your .env.local file.');
    }
  }
}

/**
 * Formats an address for display (0x1234...5678)
 */
export function formatAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address || address.length < startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Generates a block explorer URL for a transaction
 */
export function getTransactionUrl(txHash: string): string {
  const config = getConfig();
  return `${config.network.blockExplorer}/tx/${txHash}`;
}

/**
 * Generates a block explorer URL for an address
 */
export function getAddressUrl(address: string): string {
  const config = getConfig();
  return `${config.network.blockExplorer}/address/${address}`;
}

/**
 * Checks if the current network matches the configured network
 */
export function isCorrectNetwork(currentChainId: number): boolean {
  const config = getConfig();
  return currentChainId === config.network.chainId;
}

/**
 * Gets the network name for display
 */
export function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 56:
      return 'BSC Mainnet';
    case 97:
      return 'BSC Testnet';
    default:
      return `Unknown Network (${chainId})`;
  }
}
