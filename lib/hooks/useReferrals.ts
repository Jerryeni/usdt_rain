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

        console.log('🔄 Fetching referrals for user:', userId.toString());
        
        // Fetch direct referral IDs
        const referralIds = await contract.getUserReferrals(userId);
        const directCount = referralIds.length;
        
        console.log(`📊 Found ${directCount} direct referrals`);

        // If no referrals, return empty data immediately
        if (directCount === 0) {
          console.log('ℹ️ No referrals found, returning empty data');
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

        // Fetch detailed info for direct referrals (optimized)
        console.log(`📥 Fetching details for ${directCount} direct referrals...`);
        const referralDetailsPromises = referralIds.map(async (refId: bigint) => {
          try {
            // Get user address
            const address = await contract.getUserAddressById(refId);
            
            // Get user info
            const userInfo = await contract.getUserInfo(address);
            
            // Get contact info - simplified to reduce calls
            let userName = '';
            let contactNumber = '';
            try {
              const contactInfo = await contract.getUserContactById(refId);
              userName = contactInfo[1] || '';
              contactNumber = contactInfo[2] || '';
            } catch (e) {
              // Contact info might not be set - skip silently
            }

            return {
              userId: refId,
              address,
              userName,
              contactNumber,
              joinDate: new Date(Number(userInfo.activationTimestamp) * 1000),
              isActive: userInfo.isActive,
              directReferrals: Number(userInfo.directReferrals),
              totalEarned: BigInt(userInfo.totalEarned || 0), // Ensure BigInt
              level: 1, // Direct referrals are level 1
            } as Referral;
          } catch (error) {
            console.error(`❌ Error fetching referral ${refId}:`, error);
            return null;
          }
        });

        const referralDetails = (await Promise.all(referralDetailsPromises)).filter(
          (ref): ref is Referral => ref !== null
        );
        console.log(`✅ Fetched ${referralDetails.length} referral details`);

        // Calculate team statistics
        const activeMembers = referralDetails.filter(ref => ref.isActive).length;
        const teamVolume = referralDetails.reduce((sum, ref) => {
          // Ensure totalEarned is BigInt
          const earned = typeof ref.totalEarned === 'bigint' ? ref.totalEarned : BigInt(ref.totalEarned || 0);
          return sum + earned;
        }, BigInt(0));
        
        console.log('👥 Team stats:', {
          directCount,
          activeMembers,
          teamVolume: teamVolume.toString(),
          teamVolumeUSD: formatToUSD(teamVolume),
        });

        // Fetch level income using the correct function
        // getLevelIncomeStatsById returns: [earned[10], withdrawn[10], available[10], totalEarned, totalWithdrawn, totalAvailable]
        let levelIncome: bigint[] = [];
        try {
          const levelIncomeStats = await contract.getLevelIncomeStatsById(userId);
          // Extract the 'earned' array (first element of the returned tuple)
          levelIncome = levelIncomeStats[0]; // earned[10]
          console.log('💰 Level income (earned):', levelIncome.map((income: bigint, i: number) => `L${i+1}: ${formatToUSD(income)}`));
          console.log('💰 Total earned from all levels:', formatToUSD(levelIncomeStats[3]));
        } catch (error) {
          console.warn('⚠️ Could not fetch level income stats, using zeros:', error);
          // Fallback to zeros if function doesn't exist or fails
          levelIncome = Array.from({ length: 10 }, () => BigInt(0));
        }

        // Use new contract function to get accurate level counts for all 10 levels
        let levelCountsArray: bigint[] = [];
        let totalMembers = directCount;
        
        console.log('📊 Fetching level counts for user:', userId.toString());
        try {
          // Try the new getUserLevelCounts10ById function
          levelCountsArray = await contract.getUserLevelCounts10ById(userId);
          console.log('✅ Level counts from contract:', levelCountsArray.map(c => c.toString()));
          // Calculate total from all levels
          totalMembers = levelCountsArray.reduce((sum, count) => sum + Number(count), 0);
          console.log('📈 Total members calculated:', totalMembers);
        } catch (error) {
          console.warn('⚠️ getUserLevelCounts10ById not available, using fallback');
          // Fallback: only count direct referrals
          levelCountsArray = Array.from({ length: 10 }, (_, i) => i === 0 ? BigInt(directCount) : BigInt(0));
        }
        
        // Note: getUserTotalNetworkCountById doesn't exist in contract
        // Using calculated total from level counts
        const accurateTotalMembers = totalMembers;
        console.log('🎯 Final total members:', accurateTotalMembers);

        // Build level referrals data with accurate counts from contract
        const byLevel: LevelReferrals[] = Array.from({ length: 10 }, (_, i) => {
          const income = levelIncome[i];
          const count = Number(levelCountsArray[i] || 0);
          
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
            totalMembers: accurateTotalMembers,
            activeMembers,
            teamVolume,
            teamVolumeUSD: formatToUSD(teamVolume),
          },
        };
      } catch (error: any) {
        console.error('❌ Error fetching referrals:', error);
        console.error('Error details:', {
          message: error.message,
          userId: userId?.toString(),
        });
        
        // Return empty data instead of throwing to prevent infinite loading
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
    },
    enabled: !!userId && userId !== BigInt(0) && !!provider,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1, // Reduce retries from 2 to 1 for faster failure
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
