"use client";

import React, { useEffect, useState, useRef } from "react";
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useWallet } from "@/lib/wallet";
import { useActivateAccount } from "@/lib/hooks/useActivateAccount";
import { useToast } from "@/components/ui/use-toast";
import { useUserInfo } from "@/lib/hooks/useUserInfo";
import { Contract } from "ethers";
import { ADDRESSES } from "@/lib/contracts/addresses";

const USDT_ABI = [
  "function balanceOf(address owner) public view returns (uint256)",
  "function decimals() public view returns (uint8)"
];

export default function ActivatePage() {
  const router = useRouter();
  const { signer, address, connect, isConnecting } = useWallet();
  const { toast } = useToast();
  const [usdtBalance, setUsdtBalance] = useState<null | number>(null);
  const [loading, setLoading] = useState(false);
  const rainContainerRef = useRef<HTMLDivElement | null>(null);
  const rainIntervalRef = useRef<number | null>(null);
  const removeTimeoutsRef = useRef<number[]>([]);
  const [decimals, setDecimals] = useState<number>(18);


  const activateMutation = useActivateAccount();
  const { data: userInfo, isLoading: loadingUserInfo } = useUserInfo(address || undefined);

  // Fetch USDT balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!signer || !address) {
        setUsdtBalance(null);
        return;
      }
      // Only allow valid hex addresses (no ENS, no empty, no null)
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        setUsdtBalance(null);
        toast({
          title: "Invalid Wallet Address",
          description: "ENS names are not supported on BSC. Please connect with a valid hexadecimal address.",
          variant: "destructive",
        });
        return;
      }

      // Additional check: ensure we're on BSC network (chainId 97 or 56)
      // This prevents ENS resolution attempts on non-ENS networks
      try {
        const network = await signer.provider?.getNetwork();
        if (network && (network.chainId === BigInt(97) || network.chainId === BigInt(56))) {
          // BSC network - ENS not supported, but ethers might still try
          // We'll proceed but catch any ENS-related errors
        }
      } catch (networkError) {
        console.warn('Could not verify network:', networkError);
      }
      setLoading(true);
      try {
        const usdt = new Contract(ADDRESSES.USDT, USDT_ABI, signer);
         try {
           const bal = await usdt.balanceOf(address);
           const dec = await usdt.decimals();
           setDecimals(Number(dec));
           setUsdtBalance(Number(bal) / 10 ** Number(dec));
         } catch (contractError: unknown) {
           console.error('Contract error:', contractError);
           throw contractError;
         }
      } catch (e) {
        setUsdtBalance(null);
        console.error('Error fetching USDT balance:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, [signer, address, toast]);

  const handleActivate = async () => {
    activateMutation.mutate();
  };

  // Redirect if no wallet connected
  useEffect(() => {
    if (!address) {
      router.push('/wallet');
    }
  }, [address, router]);

  // Redirect if user is already activated
  useEffect(() => {
    if (userInfo && userInfo.isActive && userInfo.activationTimestamp && Number(userInfo.activationTimestamp) > 0) {
      // Check if profile is complete
      if (!userInfo.userName || !userInfo.contactNumber) {
        router.push('/profile?setup=true');
      } else {
        router.push('/');
      }
    }
  }, [userInfo, router]);

  // Redirect to profile after successful activation
  useEffect(() => {
    if (activateMutation.isSuccess) {
      setTimeout(() => {
        router.push('/profile?setup=true');
      }, 2000);
    }
  }, [activateMutation.isSuccess, router]);

  // Create animated rain effect
  useEffect(() => {
    const container = rainContainerRef.current;
    if (!container) return;

    const symbols = ['₮', 'U', '$', '₮', 'T'];

    rainIntervalRef.current = window.setInterval(() => {
      const drop = document.createElement('div');
      drop.className = 'rain-drop';
      drop.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      drop.style.left = Math.random() * 100 + '%';
      drop.style.animationDuration = (Math.random() * 3 + 5) + 's';
      drop.style.animationDelay = Math.random() * 2 + 's';

      container.appendChild(drop);

      const removeTimeout = window.setTimeout(() => {
        if (container.contains(drop)) container.removeChild(drop);
      }, 10000);
      removeTimeoutsRef.current.push(removeTimeout);
    }, 300);

    return () => {
      if (rainIntervalRef.current) window.clearInterval(rainIntervalRef.current);
      removeTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
      removeTimeoutsRef.current = [];
    };
  }, []);

  const minRequired = 25; // Minimum $25 USD worth of USDT

  const goBack = () => {
    window.history.back();
  };

  if (!address) {
    return null; // Will redirect in useEffect
  }

  if (loadingUserInfo) {
    return (
      <div className="relative z-10 min-h-screen">
        <div className="rain-animation" id="rain-container"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
              <i className="fas fa-spinner fa-spin text-2xl text-cyan-400"></i>
            </div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Account Activation - USDT Rain</title>
      </Head>

      <div className="relative z-10 min-h-screen">
        {/* Animated USDT Rain Background */}
        <div ref={rainContainerRef} className="rain-animation" />

        {/* Header */}
        <header className="px-4 py-4 border-b border-gray-800/50 backdrop-blur-lg bg-black/20">
          <div className="flex items-center justify-between">
            <button onClick={goBack} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
              <i className="fas fa-arrow-left text-cyan-400"></i>
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold orbitron gradient-text">Account Activation</h1>
              <p className="text-gray-400 text-xs">Activate with USDT deposit</p>
            </div>
            <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
              <i className="fas fa-coins text-cyan-400"></i>
            </div>
          </div>
        </header>

        {/* Activation Interface */}
        <section className="px-4 py-6">
          <div className="max-w-md mx-auto">
            <div className="glass-card rounded-2xl p-6 slide-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                  <i className="fas fa-rocket text-2xl text-green-400"></i>
                </div>
                <h2 className="text-xl font-bold text-white orbitron mb-2">Activate Your Account</h2>
                <p className="text-gray-400 text-sm">Deposit 25 USDT to unlock all features</p>
              </div>

              {/* Balance Display */}
              <div className="mb-6">
                <div className="glass-card rounded-xl p-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Current USDT Balance</div>
                    <div className="text-2xl font-bold gradient-text orbitron">
                      {loading ? 'Loading...' : usdtBalance !== null ? `$${usdtBalance.toFixed(2)}` : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Required for Activation</div>
                    <div className="text-2xl font-bold text-cyan-400 orbitron">$25.00 USDT</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{usdtBalance !== null ? Math.min((usdtBalance / 25) * 100, 100).toFixed(0) : 0}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      usdtBalance !== null && usdtBalance >= 25 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-cyan-400 to-cyan-600'
                    }`}
                    style={{ width: `${usdtBalance !== null ? Math.min((usdtBalance / 25) * 100, 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Activation Button */}
              <button
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg orbitron transition-all duration-300 mb-4 ${
                  usdtBalance !== null && usdtBalance >= minRequired
                    ? 'bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
                onClick={handleActivate}
                disabled={
                  usdtBalance === null ||
                  usdtBalance < minRequired ||
                  activateMutation.isPending
                }
              >
                {activateMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Activating Account...
                  </span>
                ) : usdtBalance !== null && usdtBalance >= minRequired ? (
                  '🚀 Activate Account'
                ) : (
                  'Insufficient USDT Balance'
                )}
              </button>

              {/* Deposit Actions */}
              {usdtBalance !== null && usdtBalance < minRequired && (
                <div className="space-y-3">
                  <div className="glass-card rounded-xl p-4 bg-orange-500/10 border border-orange-400/20">
                    <div className="text-center">
                      <i className="fas fa-exclamation-triangle text-orange-400 text-xl mb-2"></i>
                      <h3 className="text-orange-400 font-semibold mb-1">Deposit Required</h3>
                      <p className="text-gray-300 text-sm">You need ${(25 - usdtBalance).toFixed(2)} more USDT to activate</p>
                    </div>
                  </div>

                  <button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
                    onClick={() => {
                      if (window.ethereum) {
                        window.ethereum.request({
                          method: 'wallet_watchAsset',
                          params: {
                            type: 'ERC20',
                            options: {
                              address: ADDRESSES.USDT,
                              symbol: 'USDT',
                              decimals: 18,
                            },
                          },
                        } as any).catch((error: any) => {
                          console.log('Failed to trigger wallet for deposit:', error);
                        });
                      }
                    }}
                  >
                    <i className="fas fa-wallet mr-2"></i>
                    Deposit USDT
                  </button>

                  <button
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                    onClick={() => {
                      if (window.ethereum) {
                        window.ethereum.request({
                          method: 'wallet_watchAsset',
                          params: {
                            type: 'ERC20',
                            options: {
                              address: ADDRESSES.USDT,
                              symbol: 'USDT',
                              decimals: 18,
                            },
                          },
                        } as any).catch((error: any) => {
                          console.log('Failed to add USDT to wallet:', error);
                        });
                      }
                    }}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add USDT Token
                  </button>
                </div>
              )}

              {/* Success State */}
              {activateMutation.isSuccess && (
                <div className="glass-card rounded-xl p-4 bg-green-500/10 border border-green-400/20">
                  <div className="text-center">
                    <i className="fas fa-check-circle text-green-400 text-2xl mb-2"></i>
                    <h3 className="text-green-400 font-semibold mb-1">Account Activated!</h3>
                    <p className="text-gray-300 text-sm">Redirecting to dashboard...</p>
                  </div>
                </div>
              )}

              {/* Connected Wallet Info */}
              <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-400/20 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Connected Wallet</div>
                  <div className="text-cyan-400 font-mono font-semibold">{`${address.slice(0, 6)}...${address.slice(-4)}`}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-4 py-6">
          <div className="max-w-md mx-auto">
            <div className="glass-card rounded-2xl p-6 slide-in" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-lg font-semibold text-white mb-4 text-center">Activation Benefits</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-chart-line text-green-400"></i>
                  </div>
                  <div>
                    <div className="text-white font-medium">Level Income</div>
                    <div className="text-gray-400">Earn from your network</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-globe text-blue-400"></i>
                  </div>
                  <div>
                    <div className="text-white font-medium">Global Pool</div>
                    <div className="text-gray-400">Share in platform rewards</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-users text-purple-400"></i>
                  </div>
                  <div>
                    <div className="text-white font-medium">Referral Bonuses</div>
                    <div className="text-gray-400">Earn from team growth</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-withdraw text-cyan-400"></i>
                  </div>
                  <div>
                    <div className="text-white font-medium">Withdrawals</div>
                    <div className="text-gray-400">Access your earnings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}