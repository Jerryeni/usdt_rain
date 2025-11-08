import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

export interface DistributionProgress {
  lastIndex: number;
  totalEligible: number;
  isComplete: boolean;
  progressPercentage: number;
  lastDistributionTimestamp: number;
  batchSize: number;
}

/**
 * Hook to get global pool distribution progress
 */
export function useDistributionProgress() {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'distributionProgress'],
    queryFn: async (): Promise<DistributionProgress | null> => {
      if (!provider) return null;

      try {
        const contract = getReadContract(provider);

        // Get distribution progress
        const progress = await contract.getDistributionProgress();
        const lastIndex = Number(progress[0]);
        const totalEligible = Number(progress[1]);
        const isComplete = progress[2];

        // Get last distribution timestamp
        const lastTimestamp = await contract.lastDistributionTimestamp();

        // Get batch size
        const batchSize = await contract.batchSize();

        const progressPercentage = totalEligible > 0 
          ? Math.round((lastIndex / totalEligible) * 100)
          : 0;

        return {
          lastIndex,
          totalEligible,
          isComplete,
          progressPercentage,
          lastDistributionTimestamp: Number(lastTimestamp),
          batchSize: Number(batchSize),
        };
      } catch (error) {
        console.error('Error fetching distribution progress:', error);
        return null;
      }
    },
    enabled: !!provider,
    staleTime: 5000, // 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}
