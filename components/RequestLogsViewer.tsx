'use client';

import { useState, useEffect } from 'react';
import { backendApi } from '@/lib/services/backendApi';

interface LogStats {
  total: number;
  successful: number;
  failed: number;
  averageDuration: number;
  endpoints: Record<string, { count: number; failed: number }>;
}

interface RequestLog {
  requestId: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode?: number;
  duration?: string;
  body?: any;
  ip?: string;
}

export default function RequestLogsViewer() {
  const [activeTab, setActiveTab] = useState<'recent' | 'failed' | 'stats'>('recent');
  const [recentLogs, setRecentLogs] = useState<RequestLog[]>([]);
  const [failedLogs, setFailedLogs] = useState<RequestLog[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await backendApi.getRecentLogs(50);
      if (response.success && response.data) {
        setRecentLogs(response.data.requests);
      } else {
        setError(response.error || 'Failed to fetch logs');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFailedLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await backendApi.getFailedLogs(50);
      if (response.success && response.data) {
        setFailedLogs(response.data.requests);
      } else {
        setError(response.error || 'Failed to fetch failed logs');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await backendApi.getLogStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || 'Failed to fetch stats');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'recent') {
      fetchRecentLogs();
    } else if (activeTab === 'failed') {
      fetchFailedLogs();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (statusCode?: number) => {
    if (!statusCode) return 'text-gray-400';
    if (statusCode < 300) return 'text-green-400';
    if (statusCode < 400) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">📋 Request Logs</h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('recent')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'recent'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Recent Requests
        </button>
        <button
          onClick={() => setActiveTab('failed')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'failed'
              ? 'text-red-400 border-b-2 border-red-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Failed Requests
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'stats'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Statistics
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading logs...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-400">❌ {error}</p>
        </div>
      )}

      {/* Recent Logs Tab */}
      {!loading && activeTab === 'recent' && (
        <div className="space-y-2">
          {recentLogs.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No recent requests found</p>
          ) : (
            recentLogs.map((log) => (
              <div
                key={log.requestId}
                className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-blue-400">{log.method}</span>
                    <span className="text-white">{log.path}</span>
                    {log.statusCode && (
                      <span className={`font-mono text-sm ${getStatusColor(log.statusCode)}`}>
                        {log.statusCode}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">{formatTimestamp(log.timestamp)}</span>
                </div>
                {log.duration && (
                  <div className="text-sm text-gray-400">
                    Duration: {log.duration}
                  </div>
                )}
                {log.body && (
                  <details className="mt-2">
                    <summary className="text-sm text-gray-400 cursor-pointer hover:text-white">
                      View Details
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-900 p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.body, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Failed Logs Tab */}
      {!loading && activeTab === 'failed' && (
        <div className="space-y-2">
          {failedLogs.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No failed requests found</p>
          ) : (
            failedLogs.map((log) => (
              <div
                key={log.requestId}
                className="bg-red-900/20 border border-red-500/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-blue-400">{log.method}</span>
                    <span className="text-white">{log.path}</span>
                    <span className="font-mono text-sm text-red-400">{log.statusCode}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{formatTimestamp(log.timestamp)}</span>
                </div>
                {log.body && (
                  <div className="mt-2">
                    <pre className="text-xs bg-gray-900 p-2 rounded overflow-x-auto text-red-300">
                      {JSON.stringify(log.body, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {!loading && activeTab === 'stats' && stats && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Total Requests</div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Successful</div>
              <div className="text-2xl font-bold text-green-400">{stats.successful}</div>
              <div className="text-xs text-gray-400 mt-1">
                {stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0}%
              </div>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Failed</div>
              <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
              <div className="text-xs text-gray-400 mt-1">
                {stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0}%
              </div>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Avg Duration</div>
              <div className="text-2xl font-bold text-blue-400">{stats.averageDuration}ms</div>
            </div>
          </div>

          {/* Endpoints Stats */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Endpoints</h3>
            <div className="space-y-2">
              {Object.entries(stats.endpoints).map(([endpoint, data]) => (
                <div key={endpoint} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-mono text-sm">{endpoint}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 text-sm">{data.count} requests</span>
                      {data.failed > 0 && (
                        <span className="text-red-400 text-sm">{data.failed} failed</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            if (activeTab === 'recent') fetchRecentLogs();
            else if (activeTab === 'failed') fetchFailedLogs();
            else if (activeTab === 'stats') fetchStats();
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}
