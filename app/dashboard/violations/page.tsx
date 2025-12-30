'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useDevices } from '@/context/DeviceContext';
import { violationApi, getErrorMessage } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AlertTriangle, RefreshCw, Filter } from 'lucide-react';
import type { Violation } from '@/lib/types';
import { formatRelativeTime, formatAbsoluteTime, formatViolationType, safeJsonParse } from '@/lib/utils';

export default function ViolationsPage() {
    const { devices, isLoading: isDevicesLoading } = useDevices();
    const [violations, setViolations] = useState<Violation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [deviceFilter, setDeviceFilter] = useState<string | 'all'>('all');

    const fetchViolations = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const deviceId = deviceFilter === 'all' ? undefined : deviceFilter;
            const response = await violationApi.getViolations(deviceId);
            setViolations(response.violations);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }, [deviceFilter]);

    useEffect(() => {
        fetchViolations();
    }, [fetchViolations]);

    const getViolationIcon = (type: string) => {
        return <AlertTriangle className="w-5 h-5" />;
    };

    const getViolationColor = (type: string) => {
        const colorMap: Record<string, string> = {
            blocked_app_attempt: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
            blocked_url_attempt: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
            uninstall_attempt: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
            settings_change_attempt: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
        };
        return colorMap[type] || 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400';
    };

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Violation Logs
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Monitor policy violations across all devices
                    </p>
                </div>

                <button
                    onClick={fetchViolations}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Stats and filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Violations</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {violations.length}
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
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Filter by Device</p>
                            <select
                                value={deviceFilter}
                                onChange={(e) => setDeviceFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Devices</option>
                                {devices.map(device => (
                                    <option key={device.id} value={device.id}>
                                        {device.device_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 dark:text-red-300">{error}</p>
                </div>
            )}

            {/* Loading state */}
            {isLoading && (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" text="Loading violations..." />
                </div>
            )}

            {/* Empty state */}
            {!isLoading && violations.length === 0 && (
                <div className="text-center py-12">
                    <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No violations recorded
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {deviceFilter === 'all'
                            ? 'Policy violations will appear here when they occur.'
                            : 'This device has no recorded violations.'
                        }
                    </p>
                </div>
            )}

            {/* Violations list */}
            {!isLoading && violations.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {violations.map((violation) => {
                            const details = safeJsonParse(violation.details, {});

                            return (
                                <div key={violation.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={`p-3 rounded-lg ${getViolationColor(violation.violation_type)}`}>
                                            {getViolationIcon(violation.violation_type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {formatViolationType(violation.violation_type)}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {violation.device_name}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {formatRelativeTime(violation.created_at)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                                        {formatAbsoluteTime(violation.created_at)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            {Object.keys(details).length > 0 && (
                                                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                        Details:
                                                    </p>
                                                    <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                                                        {JSON.stringify(details, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
