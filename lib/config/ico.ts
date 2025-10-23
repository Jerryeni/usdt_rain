import { ICOPhase, TokenDistribution, VestingSchedule } from '@/lib/types';

export const ICO_PHASES: ICOPhase[] = [
  {
    id: 1,
    name: 'Seed Round',
    price: 0.37,
    minPurchase: 100,
    maxPurchase: 50000,
    hardCap: 1000000,
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    nextPhaseIncrease: 10
  },
  {
    id: 2,
    name: 'Private Sale',
    price: 0.407,
    minPurchase: 500,
    maxPurchase: 100000,
    hardCap: 2000000,
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    nextPhaseIncrease: 10
  },
  {
    id: 3,
    name: 'Public Sale',
    price: 0.4477,
    minPurchase: 100,
    maxPurchase: 25000,
    hardCap: 3000000,
    startDate: '2024-04-01',
    endDate: '2024-04-30',
    nextPhaseIncrease: 10
  }
];

export const TOKEN_DISTRIBUTION: TokenDistribution = {
  totalSupply: 100000000,
  distribution: [
    { category: 'Public Sale', percentage: 30, amount: 30000000 },
    { category: 'Team', percentage: 15, amount: 15000000 },
    { category: 'Development', percentage: 20, amount: 20000000 },
    { category: 'Marketing', percentage: 10, amount: 10000000 },
    { category: 'Liquidity', percentage: 15, amount: 15000000 },
    { category: 'Advisors', percentage: 5, amount: 5000000 },
    { category: 'Reserve', percentage: 5, amount: 5000000 }
  ]
};

export const VESTING_SCHEDULE: VestingSchedule = {
  publicSale: {
    cliff: 0,
    duration: 0,
    tge: 100
  },
  team: {
    cliff: 12,
    duration: 24,
    tge: 0
  },
  advisors: {
    cliff: 6,
    duration: 18,
    tge: 0
  },
  development: {
    cliff: 3,
    duration: 24,
    tge: 10
  },
  marketing: {
    cliff: 1,
    duration: 12,
    tge: 10
  }
};

export const ICO_CONFIG = {
  name: 'UCC Network',
  symbol: 'UCC',
  decimals: 18,
  contractAddress: {
    bsc: '0x...',
    ethereum: '0x...'
  },
  referralBonus: 5, // 5%
  phases: ICO_PHASES,
  tokenDistribution: TOKEN_DISTRIBUTION,
  vestingSchedule: VESTING_SCHEDULE,
  networks: {
    bsc: {
      chainId: 56,
      rpcUrl: 'https://bsc-dataseed.binance.org',
      blockExplorer: 'https://bscscan.com'
    },
    ethereum: {
      chainId: 1,
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
      blockExplorer: 'https://etherscan.io'
    }
  },
  socials: {
    telegram: 'https://t.me/uccnetwork',
    twitter: 'https://twitter.com/uccnetwork',
    medium: 'https://medium.com/@uccnetwork',
    github: 'https://github.com/uccnetwork'
  }
};