import { useQuery } from '@tanstack/react-query';
import { getReadContract } from '../contracts/USDTRain';
import { useWallet } from '../wallet';

export interface Referral {
  userId: bigint;
  address: string;
  userName: string;
  contactNumber: string;
  joinDate: Date;
  isActive: boolean;
  directReferrals: number;
  totalEarned: bigint;
  level: number; // Level in tree relative to viewer
}

export interface LevelReferrals {
  level: number;
  count: number;
  income: bigint;
  incomeUSD: string;
}

export interface ReferralData {
  direct: {
    count: number;
    userIds: bigint[];
    referrals: Referral[];
  };
  byLevel: LevelReferrals[];
  teamStats: {
    totalMembers: number;
    activeMembers: number;
    teamVolume: bigint;
    teamVolumeUSD: string;
  };
}

/**
 * Formats a bigint amount to USD string
 */
function formatToUSD(amount: bigint): string {
  const value = Number(amount) / 1e18;
  return value.toFixed(2);
}

/**
 * Hook to fetch referral network data
 * 
 * Fetches:
 * - Direct referrals with details
 * - Referrals organized by level
 * - Team statistics
 * 
 * @param userId - The user's ID in the contract
 * @returns Query result with referral data
 */
export function useReferrals(userId?: bigint | null) {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'referrals', userId?.toString()],
    queryFn: async (): Promise<ReferralData | null> => {
      if (!userId || userId === BigInt(0) || !provider) {
        return null;
      }

      try {
        const contract = getReadContract(provider);

        // Fetch direct referral IDs
        const referralIds = await contract.getUserReferrals(userId);
        const directCount = referralIds.length;

        // If no referrals, return empty data
        if (directCount === 0) {
          return {
            direct: {
              count: 0,
              userIds: [],
              referrals: [],
            },
            byLevel: Array.from({ length: 10 }, (_, i) => ({
              level: i + 1,
              count: 0,
              income: BigInt(0),
              incomeUSD: '0.00',
            })),
            teamStats: {
              totalMembers: 0,
              activeMembers: 0,
              teamVolume: BigInt(0),
              teamVolumeUSD: '0.00',
            },
          };
        }

        // Fetch detailed info for direct referrals
        const referralDetailsPromises = referralIds.map(async (refId: bigint) => {
          try {
            // Get user address
            const address = await contract.getUserAddressById(refId);
            
            // Get user info
            const userInfo = await contract.getUserInfo(address);
            
            // Get contact info - try getUserProfile first (has named fields)
            let userName = '';
            let contactNumber = '';
            try {
              const profile = await contract.getUserProfile(address);
              userName = profile.userName || profile[0] || '';
              contactNumber = profile.contactNumber || profile[1] || '';
            } catch (e) {
              // If getUserProfile fails, try getUserContactById
              try {
                const contactInfo = await contract.getUserContactById(refId);
                // getUserContactById returns: [address, userName, contactNumber, profileUpdatedAt]
                userName = contactInfo[1] || '';
                contactNumber = contactInfo[2] || '';
              } catch (e2) {
                // Contact info might not be set
                console.warn(`No contact info for user ${refId}`);
              }
            }

            return {
              userId: refId,
              address,
              userName,
              contactNumber,
              joinDate: new Date(Number(userInfo.activationTimestamp) * 1000),
              isActive: userInfo.isActive,
              directReferrals: Number(userInfo.directReferrals),
              totalEarned: userInfo.totalEarned,
              level: 1, // Direct referrals are level 1
            } as Referral;
          } catch (error) {
            console.error(`Error fetching referral ${refId}:`, error);
            return null;
          }
        });

        const referralDetails = (await Promise.all(referralDetailsPromises)).filter(
          (ref): ref is Referral => ref !== null
        );

        // Calculate team statistics
        const activeMembers = referralDetails.filter(ref => ref.isActive).length;
        const teamVolume = referralDetails.reduce((sum, ref) => sum + ref.totalEarned, BigInt(0));

        // Fetch level income
        const userAddress = await contract.getUserAddressById(userId);
        const levelIncome = await contract.getUserLevelIncome(userAddress);

        // Calculate network levels using BFS (Breadth-First Search)
        // Optimized: Only traverse first 3 levels for faster loading
        const levelCounts = new Map<number, number>();
        let currentLevelUsers = referralIds; // Start with direct referrals
        let totalMembers = directCount;

        // Set Level 1 count
        levelCounts.set(1, directCount);

        // Traverse levels 2-3 only (for performance)
        for (let level = 2; level <= 3 && currentLevelUsers.length > 0; level++) {
          const nextLevelUsers: bigint[] = [];
          
          // Limit to first 20 users per level for performance
          const batchSize = Math.min(currentLevelUsers.length, 20);
          
          // Fetch in parallel for better performance
          const fetchPromises = currentLevelUsers.slice(0, batchSize).map(async (refId: bigint) => {
            try {
              return await contract.getUserReferrals(refId);
            } catch (error) {
              console.warn(`Error fetching referrals for user ${refId}:`, error);
              return [];
            }
          });
          
          const results = await Promise.all(fetchPromises);
          results.forEach(refs => nextLevelUsers.push(...refs));
          
          levelCounts.set(level, nextLevelUsers.length);
          totalMembers += nextLevelUsers.length;
          currentLevelUsers = nextLevelUsers;
        }

        // Build level referrals data with accurate counts
        const byLevel: LevelReferrals[] = Array.from({ length: 10 }, (_, i) => {
          const income = levelIncome[i];
          const count = levelCounts.get(i + 1) || 0;
          
          return {
            level: i + 1,
            count,
            income,
            incomeUSD: formatToUSD(income),
          };
        });

        return {
          direct: {
            count: directCount,
            userIds: referralIds,
            referrals: referralDetails,
          },
          byLevel,
          teamStats: {
            totalMembers,
            activeMembers,
            teamVolume,
            teamVolumeUSD: formatToUSD(teamVolume),
          },
        };
      } catch (error) {
        console.error('Error fetching referrals:', error);
        throw error;
      }
    },
    enabled: !!userId && userId !== BigInt(0) && !!provider,
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // Refetch every 2 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch a paginated list of referrals
 * Useful for displaying large referral lists
 * 
 * @param userId - The user's ID
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of referrals per page
 */
export function useReferralsPaginated(
  userId?: bigint | null,
  page: number = 1,
  pageSize: number = 20
) {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'referralsPaginated', userId?.toString(), page, pageSize],
    queryFn: async () => {
      if (!userId || userId === BigInt(0) || !provider) {
        return null;
      }

      try {
        const contract = getReadContract(provider);

        // Fetch all referral IDs
        const allReferralIds = await contract.getUserReferrals(userId);
        const totalCount = allReferralIds.length;

        // Calculate pagination
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalCount);
        const paginatedIds = allReferralIds.slice(startIndex, endIndex);

        // Fetch details for paginated referrals
        const referralDetailsPromises = paginatedIds.map(async (refId: bigint) => {
          try {
            const address = await contract.getUserAddressById(refId);
            const userInfo = await contract.getUserInfo(address);
            
            let userName = '';
            let contactNumber = '';
            try {
              const profile = await contract.getUserProfile(address);
              userName = profile.userName || profile[0] || '';
              contactNumber = profile.contactNumber || profile[1] || '';
            } catch (e) {
              // If getUserProfile fails, try getUserContactById
              try {
                const contactInfo = await contract.getUserContactById(refId);
                // getUserContactById returns: [address, userName, contactNumber, profileUpdatedAt]
                userName = contactInfo[1] || '';
                contactNumber = contactInfo[2] || '';
              } catch (e2) {
                // Contact info might not be set
              }
            }

            return {
              userId: refId,
              address,
              userName,
              contactNumber,
              joinDate: new Date(Number(userInfo.activationTimestamp) * 1000),
              isActive: userInfo.isActive,
              directReferrals: Number(userInfo.directReferrals),
              totalEarned: userInfo.totalEarned,
              level: 1,
            } as Referral;
          } catch (error) {
            console.error(`Error fetching referral ${refId}:`, error);
            return null;
          }
        });

        const referrals = (await Promise.all(referralDetailsPromises)).filter(
          (ref): ref is Referral => ref !== null
        );

        return {
          referrals,
          pagination: {
            page,
            pageSize,
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
            hasMore: endIndex < totalCount,
          },
        };
      } catch (error) {
        console.error('Error fetching paginated referrals:', error);
        throw error;
      }
    },
    enabled: !!userId && userId !== BigInt(0) && !!provider,
    staleTime: 60000,
    retry: 2,
  });
}

/**
 * Hook to fetch referral count only (lightweight)
 * Useful when you only need the count without full details
 * 
 * @param userId - The user's ID
 */
export function useReferralCount(userId?: bigint | null) {
  const { provider } = useWallet();

  return useQuery({
    queryKey: ['usdtrain', 'referralCount', userId?.toString()],
    queryFn: async () => {
      if (!userId || userId === BigInt(0) || !provider) {
        return 0;
      }

      try {
        const contract = getReadContract(provider);
        const referralIds = await contract.getUserReferrals(userId);
        return referralIds.length;
      } catch (error) {
        console.error('Error fetching referral count:', error);
        return 0;
      }
    },
    enabled: !!userId && userId !== BigInt(0) && !!provider,
    staleTime: 30000,
    retry: 2,
  });
}
