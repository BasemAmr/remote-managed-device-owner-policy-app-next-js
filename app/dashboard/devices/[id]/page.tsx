'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDevices } from '@/context/DeviceContext';
import { deviceApi, getErrorMessage } from '@/lib/api';
import { formatRelativeTime, formatAbsoluteTime } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Smartphone, Shield, Clock, Package, Link as LinkIcon, Settings, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { App } from '@/lib/types';

export default function DeviceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const deviceId = params.id as string;
    const { getDeviceById } = useDevices();

    const [apps, setApps] = useState<App[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const device = getDeviceById(deviceId);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError('');

            try {
                const appsResponse = await deviceApi.getApps(deviceId);

                setApps(appsResponse.apps);
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setIsLoading(false);
            }
        };

        if (deviceId) {
            fetchData();
        }
    }, [deviceId]);

    if (!device && !isLoading) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Device Not Found
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    The device you're looking for doesn't exist.
                </p>
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

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Loading device details..." />
            </div>
        );
    }

    const isOnline = device && new Date(device.last_seen).getTime() > Date.now() - 5 * 60 * 1000;
    const blockedApps = apps.filter(app => app.is_blocked).length;
    const lockedApps = apps.filter(app => app.is_uninstallable).length;

    return (
        <div className="space-y-6">
            {/* Back button */}
            <Link
                href="/dashboard/devices"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Devices
            </Link>

            {/* Device header */}
            {device && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-lg ${device.is_restricted ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'}`}>
                                <Smartphone className={`w-10 h-10 ${device.is_restricted ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {device.device_name}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 font-mono mt-1">
                                    {device.android_id}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {isOnline ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href={`/dashboard/apps/${deviceId}`}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                            >
                                <Package className="w-5 h-5" />
                                Manage Apps
                            </Link>
                            <Link
                                href={`/dashboard/urls/${deviceId}`}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                            >
                                <LinkIcon className="w-5 h-5" />
                                Manage URLs
                            </Link>
                            <Link
                                href={`/dashboard/settings/${deviceId}`}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                            >
                                <Settings className="w-5 h-5" />
                                Settings
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-red-800 dark:text-red-300">Error loading device data</p>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Apps</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{apps.length}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Blocked Apps</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{blockedApps}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Locked Apps</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{lockedApps}</p>
                </div>
            </div>

            {/* Device info */}
            {device && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Device Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Last Seen</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatRelativeTime(device.last_seen)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                {formatAbsoluteTime(device.last_seen)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Policy Version</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                v{device.policy_version}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Restriction Status</p>
                            <p className={`text-lg font-semibold ${device.is_restricted ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                {device.is_restricted ? 'Active' : 'Inactive'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Registered</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatAbsoluteTime(device.created_at)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
