'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDevices } from '@/context/DeviceContext';
import { deviceApi, policyApi, getErrorMessage } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import AppRow from '@/components/AppRow';
import { ArrowLeft, AlertCircle, Package, Search } from 'lucide-react';
import Link from 'next/link';
import type { App } from '@/lib/types';

export default function AppsManagementPage() {
    const params = useParams();
    const deviceId = parseInt(params.device_id as string);
    const { getDeviceById } = useDevices();

    const [apps, setApps] = useState<App[]>([]);
    const [filteredApps, setFilteredApps] = useState<App[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const device = getDeviceById(deviceId);

    const fetchApps = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await deviceApi.getApps(deviceId);
            setApps(response.apps);
            setFilteredApps(response.apps);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }, [deviceId]);

    useEffect(() => {
        if (deviceId) {
            fetchApps();
        }
    }, [deviceId, fetchApps]);

    // Filter apps based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredApps(apps);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredApps(
                apps.filter(
                    app =>
                        app.app_name.toLowerCase().includes(query) ||
                        app.package_name.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, apps]);

    const handleToggleBlock = async (app: App, isBlocked: boolean) => {
        try {
            await policyApi.updateAppPolicy({
                device_id: deviceId,
                package_name: app.package_name,
                app_name: app.app_name,
                is_blocked: isBlocked,
                is_uninstallable: app.is_uninstallable,
            });

            // Optimistic update
            setApps(prevApps =>
                prevApps.map(a =>
                    a.id === app.id ? { ...a, is_blocked: isBlocked } : a
                )
            );

            setSuccessMessage(`${app.app_name} ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(getErrorMessage(err));
            setTimeout(() => setError(''), 5000);
        }
    };

    const handleToggleLock = async (app: App, isUninstallable: boolean) => {
        try {
            await policyApi.updateAppPolicy({
                device_id: deviceId,
                package_name: app.package_name,
                app_name: app.app_name,
                is_blocked: app.is_blocked,
                is_uninstallable: isUninstallable,
            });

            // Optimistic update
            setApps(prevApps =>
                prevApps.map(a =>
                    a.id === app.id ? { ...a, is_uninstallable: isUninstallable } : a
                )
            );

            setSuccessMessage(`${app.app_name} ${isUninstallable ? 'locked' : 'unlocked'} successfully`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(getErrorMessage(err));
            setTimeout(() => setError(''), 5000);
        }
    };

    if (!device && !isLoading) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Device Not Found
                </h2>
                <Link
                    href="/dashboard/devices"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Devices
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back button */}
            <Link
                href={`/dashboard/devices/${deviceId}`}
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Device
            </Link>

            {/* Page header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Manage Apps
                </h1>
                {device && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {device.device_name} - Block or lock apps
                    </p>
                )}
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

            {/* Search bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search apps by name or package..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" text="Loading apps..." />
                </div>
            )}

            {/* Empty state */}
            {!isLoading && apps.length === 0 && (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No apps found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        This device hasn't reported any installed apps yet.
                    </p>
                </div>
            )}

            {/* Apps table */}
            {!isLoading && filteredApps.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                        App Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                        Block Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                        Lock Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                        Last Updated
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApps.map((app) => (
                                    <AppRow
                                        key={app.id}
                                        app={app}
                                        onToggleBlock={handleToggleBlock}
                                        onToggleLock={handleToggleLock}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* No search results */}
            {!isLoading && apps.length > 0 && filteredApps.length === 0 && (
                <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No apps match your search
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Try a different search term
                    </p>
                </div>
            )}

            {/* Stats footer */}
            {!isLoading && apps.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Apps</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{apps.length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Blocked Apps</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {apps.filter(a => a.is_blocked).length}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Locked Apps</p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {apps.filter(a => a.is_uninstallable).length}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
