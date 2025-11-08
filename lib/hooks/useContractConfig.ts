import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

export interface ContractConfig {
  // Distribution Percentages
  levelIncomePercentage: number;
  globalPoolPercentage: number;
  reservePercentage: number;
  
  // Addresses
  reserveWallet: string;
  usdtToken: string;
  owner: string;
  manager: string;
  
  // Fees and Rewards
  activationFee: bigint;
  activationFeeUSD: string;
  nonWorkingReward: bigint;
  nonWorkingRewardUSD: string;
  nonWorkingDuration: number;
  nonWorkingDurationDays: number;
  
  // Achiever Levels
  achieverLevels: number[];
  
  // Level Percentages
  levelPercentages: number[];
  
  // Batch Configuration
  batchSize: number;
  
  // Contract State
  paused: boolean;
  totalUsers: number;
  totalActivatedUsers: number;
  nextUserId: number;
  nextTransactionId: number;
}

/**
 * Hook to fetch complete contract configuration
 * Shows all contract settings for transparency
 */
export function useContractConfig() {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'contractConfig'],
    queryFn: async (): Promise<ContractConfig | null> => {
      if (!provider) return null;

      try {
        const contract = getReadContract(provider);

        // Fetch all configuration data in parallel
        const [
          levelIncomePercentage,
          globalPoolPercentage,
          reservePercentage,
          reserveWallet,
          usdtToken,
          owner,
          manager,
          activationFee,
          nonWorkingReward,
          nonWorkingDuration,
          batchSize,
          paused,
          totalUsers,
          totalActivatedUsers,
          nextUserId,
          nextTransactionId,
        ] = await Promise.all([
          contract.levelIncomePercentage(),
          contract.globalPoolPercentage(),
          contract.reservePercentage(),
          contract.reserveWallet(),
          contract.usdtToken(),
          contract.owner(),
          contract.manager(),
          contract.ACTIVATION_FEE(),
          contract.NON_WORKING_REWARD(),
          contract.NON_WORKING_DURATION(),
          contract.batchSize(),
          contract.paused(),
          contract.totalUsers(),
          contract.totalActivatedUsers(),
          contract.nextUserId(),
          contract.nextTransactionId(),
        ]);

        // Fetch achiever levels array
        const achieverLevelsPromises = [];
        for (let i = 0; i < 5; i++) {
          achieverLevelsPromises.push(contract.ACHIEVER_LEVELS(i));
        }
        const achieverLevelsRaw = await Promise.all(achieverLevelsPromises);
        const achieverLevels = achieverLevelsRaw.map((level: bigint) => Number(level));

        // Fetch level percentages array
        const levelPercentagesPromises = [];
        for (let i = 0; i < 10; i++) {
          levelPercentagesPromises.push(contract.LEVEL_PERCENTAGES(i));
        }
        const levelPercentagesRaw = await Promise.all(levelPercentagesPromises);
        const levelPercentages = levelPercentagesRaw.map((pct: bigint) => Number(pct));

        return {
          // Distribution Percentages
          levelIncomePercentage: Number(levelIncomePercentage),
          globalPoolPercentage: Number(globalPoolPercentage),
          reservePercentage: Number(reservePercentage),
          
          // Addresses
          reserveWallet,
          usdtToken,
          owner,
          manager,
          
          // Fees and Rewards
          activationFee,
          activationFeeUSD: (Number(activationFee) / 1e18).toFixed(2),
          nonWorkingReward,
          nonWorkingRewardUSD: (Number(nonWorkingReward) / 1e18).toFixed(2),
          nonWorkingDuration: Number(nonWorkingDuration),
          nonWorkingDurationDays: Number(nonWorkingDuration) / 86400, // Convert seconds to days
          
          // Achiever Levels
          achieverLevels,
          
          // Level Percentages
          levelPercentages,
          
          // Batch Configuration
          batchSize: Number(batchSize),
          
          // Contract State
          paused,
          totalUsers: Number(totalUsers),
          totalActivatedUsers: Number(totalActivatedUsers),
          nextUserId: Number(nextUserId),
          nextTransactionId: Number(nextTransactionId),
        };
      } catch (error) {
        console.error('Error fetching contract config:', error);
        return null;
      }
    },
    enabled: !!provider,
    staleTime: 300000, // 5 minutes
    refetchInterval: 600000, // Refetch every 10 minutes
  });
}
