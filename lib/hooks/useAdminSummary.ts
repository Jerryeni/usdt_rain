import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

export interface AdminSummaryData {
  totalUsers: number;
  activeUsers: number;
  globalPoolBalance: bigint;
  totalDistributed: bigint;
  eligibleUsers: number;
  contractBalance: bigint;
}

/**
 * Hook to fetch admin summary statistics
 */
export function useAdminSummary() {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'adminSummary'],
    queryFn: async (): Promise<AdminSummaryData | null> => {
      if (!provider) {
        return null;
      }

      try {
        const contract = getReadContract(provider);
        
        const summary = await contract.getAdminSummary();

        return {
          totalUsers: Number(summary[0]),
          activeUsers: Number(summary[1]),
          globalPoolBalance: summary[2],
          totalDistributed: summary[3],
          eligibleUsers: Number(summary[4]),
          contractBalance: summary[5],
        };
      } catch (error) {
        console.error('Error fetching admin summary:', error);
        return null;
      }
    },
    enabled: !!provider,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}
