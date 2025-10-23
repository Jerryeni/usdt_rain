import { ethers } from 'ethers';
import { ADDRESSES } from '../src/lib/contracts/addresses';

export async function switchToBNBChain() {
  if (!window.ethereum) throw new Error("No Web3 Provider found");
  try {
    console.log("requesting")
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${ADDRESSES.CHAIN_ID.toString(16)}` }],
    });
    console.log("finished")
  } catch (error: any) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${ADDRESSES.CHAIN_ID.toString(16)}`,
          name: 'BNB Smart Chain',
          network: 'bsc',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
          },
          rpcUrls: ['https://bsc-dataseed.binance.org/'],
          blockExplorerUrls: ['https://bscscan.com']
        }]
      });
    }
  }
}

export async function getWeb3Provider() {
  if (!window.ethereum) throw new Error("No Web3 Provider found");

  await switchToBNBChain();
  return new ethers.BrowserProvider(window.ethereum);
}