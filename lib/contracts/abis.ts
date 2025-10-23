import PRESALE_ABI from "./abi/USDTRain.json";
export { PRESALE_ABI };

export const ERC20_ABI =
[
  {
    "type": "constructor",
    "stateMutability": "nonpayable",
    "inputs": [
      {
        "internalType": "address",
        "name": "_usdtTokenAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_reserveWallet",
        "type": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "EnforcedPause",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ExpectedPause",
    "inputs": []
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
  },
  {
    "type": "event",
    "name": "GlobalPoolDistributed",
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "snapshotId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "eligibleUsers",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "event",
    "name": "LevelIncomePaid",
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "level",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "event",
    "name": "NonWorkingIncomeClaimed",
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ]
  },
  {
    "type": "event",
    "name": "Paused",
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ]
  },
  {
    "type": "event",
    "name": "ProfileUpdated",
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "userName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "contactNumber",
        "type": "string"
      }
    ]
  },
  {
    "type": "event",
    "name": "ReferralAdded",
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "referralId",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "event",
    "name": "Unpaused",
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ]
  },
  {
    "type": "event",
    "name": "UserActivated",
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ]
  },
  {
    "type": "event",
    "name": "UserRegistered",
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "sponsorId",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "ACHIEVER_LEVELS",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "ACTIVATION_FEE",
    "inputs": [],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "LEVEL_PERCENTAGES",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "MINIMUM_DIRECT_REFERRALS",
    "inputs": [],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "NON_WORKING_DURATION",
    "inputs": [],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "NON_WORKING_REWARD",
    "inputs": [],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "name": "activateAccount",
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "name": "bootstrapOwner",
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "name": "claimNonWorkingIncome",
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "name": "distributeGlobalPool",
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "name": "emergencyWithdraw",
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getAchieverProgress",
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "currentLevel",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "currentDirect",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nextLevelRequirement",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "progressPercentage",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getAchieverRequirements",
    "inputs": [],
    "outputs": [
      {
        "internalType": "uint256[5]",
        "name": "",
        "type": "uint256[5]"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getAdminSummary",
    "inputs": [],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalUsersCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "activeUsersCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "globalPoolBalanceAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalDistributedAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "eligibleUsersCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "contractBalance",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getContractStats",
    "inputs": [],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "_totalUsers",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_totalActivatedUsers",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_globalPoolBalance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_totalDistributed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_eligibleUsersCount",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getDistributionPercentages",
    "inputs": [],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "levelIncome",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "globalPool",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "reserve",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getLevelIncomeStats",
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "internalType": "uint256[10]",
        "name": "earned",
        "type": "uint256[10]"
      },
      {
        "internalType": "uint256[10]",
        "name": "withdrawn",
        "type": "uint256[10]"
      },
      {
        "internalType": "uint256[10]",
        "name": "available",
        "type": "uint256[10]"
      },
      {
        "internalType": "uint256",
        "name": "totalEarned",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalWithdrawn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalAvailable",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getNextAchieverLevel",
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getTopEarners",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "limit",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "address[]",
        "name": "userAddresses",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "userIds",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "earnings",
        "type": "uint256[]"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getUserAchieverInfo",
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "currentLevel",
        "type": "uint256"
      },
      {
        "internalType": "uint256[]",
        "name": "achievedLevels",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256",
        "name": "directReferrals",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getUserAddressById",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getUserAvailableLevelIncome",
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "internalType": "uint256[10]",
        "name": "",
        "type": "uint256[10]"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getUserContactById",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "userName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "contactNumber",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "profileUpdatedAt",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getUserIdByAddress",
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getUserInfo",
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "sponsorId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "directReferrals",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalEarned",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalWithdrawn",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "activationTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nonWorkingClaimed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "achieverLevel",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "userName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "contactNumber",
        "type": "string"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getUserLevelIncome",
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "internalType": "uint256[10]",
        "name": "",
        "type": "uint256[10]"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getUserLevelWithdrawn",
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "internalType": "uint256[10]",
        "name": "",
        "type": "uint256[10]"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getUserProfile",
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "internalType": "string",
        "name": "userName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "contactNumber",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "profileUpdatedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getUserRecentTransactions",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "count",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "struct USDTRain.Transaction[]",
        "name": "",
        "type": "tuple[]",
        "components": [
          {
            "internalType": "uint256",
            "name": "transactionId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "userAddress",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "transactionType",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "level",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getUserReferrals",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getUserTotalAvailable",
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getUserTransactions",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "struct USDTRain.Transaction[]",
        "name": "",
        "type": "tuple[]",
        "components": [
          {
            "internalType": "uint256",
            "name": "transactionId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "userAddress",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "transactionType",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "level",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getUsersByEarningsRange",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "minEarnings",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxEarnings",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "limit",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "address[]",
        "name": "userAddresses",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "userIds",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "earnings",
        "type": "uint256[]"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getUsersByIds",
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "userIds",
        "type": "uint256[]"
      }
    ],
    "outputs": [
      {
        "internalType": "address[]",
        "name": "userAddresses",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "sponsorIds",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "directReferralsCounts",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "totalEarnedAmounts",
        "type": "uint256[]"
      },
      {
        "internalType": "bool[]",
        "name": "isActiveStatuses",
        "type": "bool[]"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getUsersContactInfo",
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "userIds",
        "type": "uint256[]"
      }
    ],
    "outputs": [
      {
        "internalType": "address[]",
        "name": "userAddresses",
        "type": "address[]"
      },
      {
        "internalType": "string[]",
        "name": "userNames",
        "type": "string[]"
      },
      {
        "internalType": "string[]",
        "name": "contactNumbers",
        "type": "string[]"
      },
      {
        "internalType": "uint256[]",
        "name": "updatedTimestamps",
        "type": "uint256[]"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "getUsersPaginated",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "startId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "limit",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "address[]",
        "name": "userAddresses",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "userIds",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256",
        "name": "totalCount",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "globalPoolBalance",
    "inputs": [],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "globalPoolPercentage",
    "inputs": [],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "hasUserAchievedLevel",
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "level",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "levelIncomePercentage",
    "inputs": [],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "nextTransactionId",
    "inputs": [],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "nextUserId",
    "inputs": [],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "name": "pause",
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "paused",
    "inputs": [],
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "name": "registerUser",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "sponsorId",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "reservePercentage",
    "inputs": [],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "reserveWallet",
    "inputs": [],
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "searchUsersById",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "partialId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "limit",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "address[]",
        "name": "userAddresses",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "userIds",
        "type": "uint256[]"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "name": "setProfile",
    "inputs": [
      {
        "internalType": "string",
        "name": "userName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "contactNumber",
        "type": "string"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "totalActivatedUsers",
    "inputs": [],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "totalDistributed",
    "inputs": [],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "totalUsers",
    "inputs": [],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "name": "transferOwnership",
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "name": "unpause",
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "name": "updateDistributionPercentages",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_levelIncomePercentage",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_globalPoolPercentage",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_reservePercentage",
        "type": "uint256"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "name": "updateEligibleUsers",
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "name": "updateProfile",
    "inputs": [
      {
        "internalType": "string",
        "name": "userName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "contactNumber",
        "type": "string"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "name": "updateReserveWallet",
    "inputs": [
      {
        "internalType": "address",
        "name": "_newReserveWallet",
        "type": "address"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "usdtToken",
    "inputs": [],
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "usedUserIds",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "userIdExists",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "userIdToAddress",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "userReferrals",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "userTransactions",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "transactionId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "transactionType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "level",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "name": "users",
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "sponsorId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "directReferrals",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalEarned",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalWithdrawn",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "activationTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastNonWorkingClaim",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nonWorkingClaimed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "achieverLevel",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "userName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "contactNumber",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "profileUpdatedAt",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "name": "withdrawAllEarnings",
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "name": "withdrawEarnings",
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "name": "withdrawLevelEarnings",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "level",
        "type": "uint256"
      }
    ],
    "outputs": []
  }
]


