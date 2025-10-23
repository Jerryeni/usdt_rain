import { ethers } from 'ethers';
import { ADDRESSES } from '../contracts/addresses';

// Type-safe request parameters for Ethereum providers
interface EthereumRequestParams {
  method: string;
  params?: readonly unknown[];
}

// Type-safe response from Ethereum providers

export class WalletNotInstalledError extends Error {
  constructor() {
    super('No Web3 wallet detected. Please install MetaMask or another Web3 wallet to continue.');
    this.name = 'WalletNotInstalledError';
  }
}

export class NetworkSwitchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkSwitchError';
  }
}

/**
 * Checks if a Web3 wallet is available in the browser
 * @returns Promise<boolean> - True if wallet is available
 */
export function isWalletAvailable(): boolean {
  return typeof window !== 'undefined' &&
         ((window as typeof window & { ethereum?: { request?: unknown } }).ethereum !== undefined ||
          (window as typeof window & { web3?: { currentProvider?: unknown } }).web3 !== undefined);
}

/**
 * Gets available Web3 provider with fallback options
 * @returns ethers.BrowserProvider or null if no provider available
 */
export function getWeb3ProviderSync(): ethers.BrowserProvider | null {
  if (typeof window === 'undefined') return null;

  // Check for modern ethereum providers (MetaMask, etc.)
  const windowWithEthereum = window as typeof window & { ethereum?: { request?: (args: EthereumRequestParams) => Promise<unknown> } };
  if (windowWithEthereum.ethereum && typeof windowWithEthereum.ethereum.request === 'function') {
    return new ethers.BrowserProvider(windowWithEthereum.ethereum as ethers.Eip1193Provider);
  }

  // Check for legacy web3 providers
  const windowWithWeb3 = window as typeof window & { web3?: { currentProvider?: ethers.Eip1193Provider } };
  if (windowWithWeb3.web3 && windowWithWeb3.web3.currentProvider) {
    return new ethers.BrowserProvider(windowWithWeb3.web3.currentProvider);
  }

  return null;
}

/**
 * Prompts user to install a Web3 wallet
 */
export function promptWalletInstallation(): void {
  const walletUrl = 'https://metamask.io/download/';
  if (confirm('A Web3 wallet is required to use this application. Would you like to install MetaMask?')) {
    window.open(walletUrl, '_blank');
  }
}

/**
 * Switches to BSC network with proper error handling
 */
export async function switchToBNBChain(): Promise<void> {
  if (!isWalletAvailable()) {
    throw new WalletNotInstalledError();
  }

  const provider = getWeb3ProviderSync();
  if (!provider) {
    throw new WalletNotInstalledError();
  }

  try {
    // Check if already on the correct network
    const network = await provider.getNetwork();
    const targetChainId = BigInt(ADDRESSES.CHAIN_ID);

    if (network.chainId === targetChainId) {
      console.log(`Already on BSC ${ADDRESSES.CHAIN_ID === 97 ? 'Testnet' : 'Mainnet'}`);
      return;
    }

    console.log(`Requesting network switch to BSC ${ADDRESSES.CHAIN_ID === 97 ? 'Testnet' : 'Mainnet'}...`);

    // Try to switch to BSC network
    const windowWithEthereum = window as typeof window & { ethereum?: { request: (args: EthereumRequestParams) => Promise<unknown> } };
    await windowWithEthereum.ethereum!.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${ADDRESSES.CHAIN_ID.toString(16)}` }],
    });

    console.log(`Successfully switched to BSC ${ADDRESSES.CHAIN_ID === 97 ? 'Testnet' : 'Mainnet'}`);
  } catch (error: unknown) {
    console.error('Network switch error:', error);

    const web3Error = error as { code?: number; message?: string };
    // Handle case where network doesn't exist in wallet
    if (web3Error.code === 4902 || web3Error.code === -32603) {
      try {
        console.log(`Adding BSC ${ADDRESSES.CHAIN_ID === 97 ? 'Testnet' : 'Mainnet'} to wallet...`);
        const windowWithEthereum = window as typeof window & { ethereum?: { request: (args: EthereumRequestParams) => Promise<unknown> } };
        await windowWithEthereum.ethereum!.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${ADDRESSES.CHAIN_ID.toString(16)}`,
            chainName: ADDRESSES.CHAIN_ID === 97 ? 'BNB Smart Chain Testnet' : 'BNB Smart Chain',
            nativeCurrency: {
              name: 'BNB',
              symbol: 'BNB',
              decimals: 18,
            },
            rpcUrls: ADDRESSES.CHAIN_ID === 97
              ? [
                  'https://data-seed-prebsc-1-s1.bnbchain.org:8545/',
                  'https://bsc-testnet-dataseed1.binance.org/',
                  'https://bsc-testnet-dataseed2.binance.org/',
                  'https://bsc-testnet-dataseed3.binance.org/'
                ]
              : ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: ADDRESSES.CHAIN_ID === 97
              ? ['https://testnet.bscscan.com']
              : ['https://bscscan.com']
          }]
        });
        console.log(`BSC ${ADDRESSES.CHAIN_ID === 97 ? 'Testnet' : 'Mainnet'} added successfully`);
      } catch (addError: unknown) {
        console.error('Failed to add BSC network:', addError);
        throw new NetworkSwitchError(`Failed to add BSC ${ADDRESSES.CHAIN_ID === 97 ? 'Testnet' : 'Mainnet'} to your wallet. Please add it manually.`);
      }
    } else if (web3Error.code === 4001) {
      throw new NetworkSwitchError('Network switch cancelled by user.');
    } else if (web3Error.code === -32002) {
      throw new NetworkSwitchError('A request is already pending in your wallet. Please check your wallet and try again.');
    } else {
      throw new NetworkSwitchError(`Failed to switch network: ${web3Error.message || 'Unknown error'}`);
    }
  }
}

/**
 * Gets Web3 provider with comprehensive error handling
 * @returns Promise<ethers.BrowserProvider>
 * @throws WalletNotInstalledError if no wallet available
 * @throws NetworkSwitchError if network switch fails
 */
export async function getWeb3Provider(): Promise<ethers.BrowserProvider> {
  // Check if wallet is available
  if (!isWalletAvailable()) {
    promptWalletInstallation();
    throw new WalletNotInstalledError();
  }

  const provider = getWeb3ProviderSync();
  if (!provider) {
    promptWalletInstallation();
    throw new WalletNotInstalledError();
  }

  try {
    // Test the connection
    const network = await provider.getNetwork();

    // Disable ENS resolution for BSC networks to avoid errors
    if (network.chainId === BigInt(97) || network.chainId === BigInt(56)) {
      // BSC testnet or mainnet - ENS not supported
      // This prevents ethers from attempting ENS resolution
    }
  } catch (error: unknown) {
    console.error('Provider connection test failed:', error);
    const web3Error = error as { code?: number };
    if (web3Error.code === -32002) {
      throw new NetworkSwitchError('A request is already pending in your wallet. Please check your wallet and try again.');
    }
    throw new WalletNotInstalledError();
  }

  // Switch to BSC network
  await switchToBNBChain();

  return provider;
}

/**
 * Gets user's wallet address with error handling
 * @returns Promise<string | null>
 */
export async function getWalletAddress(): Promise<string | null> {
  try {
    const provider = await getWeb3Provider();
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch (error) {
    console.error('Failed to get wallet address:', error);
    return null;
  }
}

/**
 * Checks if user is connected to the correct network
 * @returns Promise<boolean>
 */
export async function isCorrectNetwork(): Promise<boolean> {
  try {
    const provider = getWeb3ProviderSync();
    if (!provider) return false;

    const network = await provider.getNetwork();
    return network.chainId === BigInt(ADDRESSES.CHAIN_ID);
  } catch (error) {
    console.error('Network check failed:', error);
    return false;
  }
}