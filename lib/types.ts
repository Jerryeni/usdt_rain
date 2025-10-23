export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface ICOStats {
  usdtRaised: number;
  listingDate: string;
  holders: number;
  currentPhase: number;
  tokenPrice: number;
  totalTokensSold: number;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  icon: string;
  decimals: number;
}

export interface SaleTransaction {
  fromAmount: string;
  fromCurrency: string;
  toAmount: string;
  timestamp: number;
  txHash: string;
}

export interface TradingStats {
  monthsInDevelopment: number;
  totalModels: number;
  activeUsers: number;
  averageReturn: number;
}

export interface ICOPhase {
  id: number;
  name: string;
  price: number;
  minPurchase: number;
  maxPurchase: number;
  hardCap: number;
  startDate: string;
  endDate: string;
  nextPhaseIncrease: number;
}

export interface DistributionCategory {
  category: string;
  percentage: number;
  amount: number;
}

export interface TokenDistribution {
  totalSupply: number;
  distribution: DistributionCategory[];
}

export interface VestingParams {
  cliff: number;    
  duration: number; 
  tge: number;      
}

export interface VestingSchedule {
  publicSale: VestingParams;
  team: VestingParams;
  advisors: VestingParams;
  development: VestingParams;
  marketing: VestingParams;
}

export interface NetworkConfig {
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
}

export interface ICOConfig {
  name: string;
  symbol: string;
  decimals: number;
  contractAddress: {
    bsc: string;
    ethereum: string;
  };
  referralBonus: number;
  phases: ICOPhase[];
  tokenDistribution: TokenDistribution;
  vestingSchedule: VestingSchedule;
  networks: {
    bsc: NetworkConfig;
    ethereum: NetworkConfig;
  };
  socials: {
    telegram: string;
    twitter: string;
    medium: string;
    github: string;
  };
}

export type TokenSale = {
  id: string;
  fromAmount: string;
  fromCurrency: string;
  toAmount: string;
  timeAgo: string;
};

export type UCCInfo = {
  totalInvestmentsUSDT:number;
  totalInvestmentsBNB:number;
  totalUsers:number;
  priceUSDT:number;
  priceBNB:number;
  totalTokensToBEDistributed:number;
}

export type UserUCCInfo = {
  userId: number;
  usersInfo: {
    totalTokens: bigint;
    totalInvestmentsUSDT: bigint;
    totalInvestmentsBNB: bigint;
    refCount: bigint;
    referrer: string;
    lastActivity: bigint;
  } | null;
  recentActivities: Array<{
    id: bigint;
    userId: bigint;
    activityType: number;
    amount: bigint;
    timestamp: bigint;
    txHash: string;
  }>;
  activityLength: number;
}