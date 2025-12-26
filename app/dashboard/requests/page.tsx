'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { requestApi, getErrorMessage } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import RequestCard from '@/components/RequestCard';
import { ClipboardCheck, AlertCircle, RefreshCw, Filter } from 'lucide-react';
import type { ApprovalRequest, RequestStatus } from '@/lib/types';

export default function RequestsPage() {
    const [requests, setRequests] = useState<ApprovalRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<ApprovalRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');

    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await requestApi.getRequests();
            setRequests(response.requests);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();

        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchRequests, 10000);

        return () => clearInterval(interval);
    }, [fetchRequests]);

    // Filter requests based on status
    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredRequests(requests);
        } else {
            setFilteredRequests(requests.filter(req => req.status === statusFilter));
        }
    }, [statusFilter, requests]);

    const handleApprove = async (id: number, notes?: string) => {
        try {
            await requestApi.updateRequest(id, {
                status: 'approved',
                notes,
            });

            // Remove from list (optimistic update)
            setRequests(prevRequests => prevRequests.filter(req => req.id !== id));

            setSuccessMessage('Request approved successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(getErrorMessage(err));
            setTimeout(() => setError(''), 5000);
        }
    };

    const handleDeny = async (id: number, notes?: string) => {
        try {
            await requestApi.updateRequest(id, {
                status: 'denied',
                notes,
            });

            // Remove from list (optimistic update)
            setRequests(prevRequests => prevRequests.filter(req => req.id !== id));

            setSuccessMessage('Request denied successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(getErrorMessage(err));
            setTimeout(() => setError(''), 5000);
        }
    };

    const pendingCount = requests.filter(req => req.status === 'pending').length;

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Approval Requests
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Review and manage device approval requests
                    </p>
                </div>

                <button
                    onClick={fetchRequests}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                            <ClipboardCheck className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {pendingCount}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <ClipboardCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {requests.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <Filter className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Filter by Status</p>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as RequestStatus | 'all')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="denied">Denied</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success message */}
            {successMessage && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-green-800 dark:text-green-300">{successMessage}</p>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 dark:text-red-300">{error}</p>
                </div>
            )}

            {/* Loading state */}
            {isLoading && requests.length === 0 && (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" text="Loading requests..." />
                </div>
            )}

            {/* Empty state */}
            {!isLoading && filteredRequests.length === 0 && (
                <div className="text-center py-12">
                    <ClipboardCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {statusFilter === 'all' ? 'No requests yet' : `No ${statusFilter} requests`}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {statusFilter === 'all'
                            ? 'Approval requests from devices will appear here.'
                            : `There are no ${statusFilter} requests at the moment.`
                        }
                    </p>
                </div>
            )}

            {/* Requests grid */}
            {filteredRequests.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredRequests.map((request) => (
                        <RequestCard
                            key={request.id}
                            request={request}
                            onApprove={handleApprove}
                            onDeny={handleDeny}
                        />
                    ))}
                </div>
            )}

            {/* Auto-refresh indicator */}
            <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Auto-refreshing every 10 seconds
                </p>
            </div>
        </div>
    );
}
