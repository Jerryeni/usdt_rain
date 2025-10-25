import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

export interface AchieverProgressData {
  currentLevel: number;
  currentCount: number; // For level 1: direct referrals, for others: count of users at previous level
  nextLevelRequirement: number;
  progressPercentage: number;
  requirements: number[];
}

/**
 * Hook to fetch achiever progress and requirements
 */
export function useAchieverProgress(userAddress?: string | null) {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'achieverProgress', userAddress],
    queryFn: async (): Promise<AchieverProgressData | null> => {
      if (!userAddress || !provider) {
        return null;
      }

      try {
        const contract = getReadContract(provider);
        
        // Get achiever progress
        const progress = await contract.getAchieverProgress(userAddress);
        
        // Get achiever requirements
        const requirements = await contract.getAchieverRequirements();

        return {
          currentLevel: Number(progress[0]),
          currentCount: Number(progress[1]), // currentCount from contract
          nextLevelRequirement: Number(progress[2]),
          progressPercentage: Number(progress[3]),
          requirements: requirements.map((r: bigint) => Number(r)),
        };
      } catch (error) {
        console.error('Error fetching achiever progress:', error);
        return null;
      }
    },
    enabled: !!userAddress && !!provider,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}
