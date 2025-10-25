import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

export interface LeaderboardEntry {
  userId: bigint;
  address: string;
  userName: string;
  totalEarned: bigint;
  totalEarnedUSD: string;
  directReferrals: number;
  achieverLevel: number;
  rank: number;
}

/**
 * Hook to fetch leaderboard data
 */
export function useLeaderboard(limit: number = 50) {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'leaderboard', limit],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      if (!provider) {
        return [];
      }

      try {
        const contract = getReadContract(provider);
        
        // Use the optimized getTopEarners function from the contract
        // This returns addresses, userIds, and earnings already sorted by earnings
        const topEarners = await contract.getTopEarners(BigInt(limit));
        
        const userAddresses = topEarners[0];
        const userIds = topEarners[1];
        const earnings = topEarners[2];
        
        const leaderboard: LeaderboardEntry[] = [];
        
        console.log(`Fetching leaderboard data for ${userAddresses.length} users`);
        
        // Fetch additional user info for each top earner
        for (let i = 0; i < userAddresses.length; i++) {
          try {
            const userAddress = userAddresses[i];
            
            if (userAddress && userAddress !== '0x0000000000000000000000000000000000000000') {
              const userInfo = await contract.getUserInfo(userAddress);
              
              const entry = {
                userId: userIds[i],
                address: userAddress,
                userName: userInfo[9] || `User #${userIds[i]}`,
                totalEarned: earnings[i],
                totalEarnedUSD: (Number(earnings[i]) / 1e18).toFixed(2),
                directReferrals: Number(userInfo[2]),
                achieverLevel: Number(userInfo[8]),
                rank: i + 1, // Rank is based on position in the sorted array
              };
              
              leaderboard.push(entry);
              console.log(`Leaderboard entry ${i + 1}:`, {
                rank: entry.rank,
                userName: entry.userName,
                totalEarned: entry.totalEarnedUSD,
                directReferrals: entry.directReferrals,
                achieverLevel: entry.achieverLevel
              });
            }
          } catch (error) {
            console.warn(`Could not fetch user info for address ${userAddresses[i]}:`, error);
          }
        }
        
        console.log(`Leaderboard loaded with ${leaderboard.length} entries`);
        return leaderboard;
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }
    },
    enabled: !!provider,
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // Refetch every 2 minutes
  });
}
