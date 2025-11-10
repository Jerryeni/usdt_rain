/**
 * Backend API Service
 * Handles all communication with the USDT Rain backend server
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const API_PREFIX = '/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_BACKEND_API_KEY;

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  type?: string;
}

interface EligibleUser {
  address: string;
  userId: string;
  directReferrals: string;
  isActive: boolean;
  userName: string | null;
}

interface GlobalPoolStats {
  totalAllocated: { wei: string; usdt: string };
  totalClaimed: { wei: string; usdt: string };
  totalPending: { wei: string; usdt: string };
  eligibleCount: string;
  currentBalance: { wei: string; usdt: string };
  eligibleUsers: number;
  lastUpdated: string;
}

interface ContractStats {
  users: {
    total: string;
    activated: string;
    eligible: string;
  };
  globalPool: {
    balance: { wei: string; usdt: string };
    totalDistributed: { wei: string; usdt: string };
    totalAllocated: { wei: string; usdt: string };
    totalPending: { wei: string; usdt: string };
  };
  network: {
    name: string;
    chainId: number;
  };
  lastUpdated: string;
}

class BackendApiService {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = `${BACKEND_URL}${API_PREFIX}`;
    this.apiKey = API_KEY;
  }

  /**
   * Make a request to the backend API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add API key if configured
    // if (this.apiKey) {
    //   headers['X-API-Key'] = this.apiKey;
    // }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error: any) {
      console.error(`Backend API Error [${endpoint}]:`, error);
      return {
        success: false,
        error: error.message || 'Failed to connect to backend server',
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<ApiResponse> {
    return this.request('/status');
  }

  /**
   * Get contract statistics
   */
  async getContractStats(): Promise<ApiResponse<ContractStats>> {
    return this.request<ContractStats>('/stats');
  }

  /**
   * Get all eligible users
   */
  async getEligibleUsers(): Promise<ApiResponse<{ eligibleUsers: EligibleUser[]; totalCount: string }>> {
    return this.request('/eligible-users');
  }

  /**
   * Check if a user is eligible
   */
  async checkEligibility(address: string): Promise<ApiResponse<{
    address: string;
    userId: string;
    isEligible: boolean;
    directReferrals: string;
    isActive: boolean;
    userName: string | null;
  }>> {
    return this.request(`/eligible-users/check/${address}`);
  }

  /**
   * Add a user to the eligible list
   */
  async addEligibleUser(address: string): Promise<ApiResponse<{
    address: string;
    userId: string;
    userName: string | null;
    directReferrals: number;
    alreadyEligible?: boolean;
    transaction: {
      hash: string;
      blockNumber: number;
      gasUsed: string;
    };
  }>> {
    return this.request('/eligible-users/add', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  }

  /**
   * Remove a user from the eligible list
   */
  async removeEligibleUser(address: string): Promise<ApiResponse<{
    address: string;
    userId: string;
    userName: string | null;
    transaction: {
      hash: string;
      blockNumber: number;
      gasUsed: string;
    };
  }>> {
    return this.request('/eligible-users/remove', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  }

  /**
   * Get global pool statistics
   */
  async getGlobalPoolStats(): Promise<ApiResponse<GlobalPoolStats>> {
    return this.request<GlobalPoolStats>('/global-pool/stats');
  }

  /**
   * Distribute global pool to all eligible users
   */
  async distributeGlobalPool(): Promise<ApiResponse<{
    distribution: {
      eligibleUsers: number;
      totalDistributed: { wei: string; usdt: string };
      perUser: { wei: string; usdt: string };
    };
    before: {
      totalAllocated: string;
      totalPending: string;
    };
    after: {
      totalAllocated: string;
      totalPending: string;
    };
    transaction: {
      hash: string;
      blockNumber: number;
      gasUsed: string;
    };
  }>> {
    return this.request('/global-pool/distribute', {
      method: 'POST',
    });
  }

  /**
   * Check if backend is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.healthCheck();
      return response.success === true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const backendApi = new BackendApiService();

// Export types
export type {
  ApiResponse,
  EligibleUser,
  GlobalPoolStats,
  ContractStats,
};
