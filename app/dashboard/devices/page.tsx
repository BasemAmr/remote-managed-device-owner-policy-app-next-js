'use client';

import React, { useEffect } from 'react';
import { useDevices } from '@/context/DeviceContext';
import DeviceCard from '@/components/DeviceCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Smartphone, AlertCircle, RefreshCw } from 'lucide-react';

export default function DevicesPage() {
    const { devices, isLoading, error, fetchDevices, refreshDevices } = useDevices();

    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        All Devices
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        View and manage all registered devices
                    </p>
                </div>

                <button
                    onClick={refreshDevices}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Error state */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-red-800 dark:text-red-300">Error loading devices</p>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Loading state */}
            {isLoading && devices.length === 0 && (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" text="Loading devices..." />
                </div>
            )}

            {/* Empty state */}
            {!isLoading && devices.length === 0 && !error && (
                <div className="text-center py-12">
                    <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No devices registered
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Devices will appear here once they register with the system.
                    </p>
                </div>
            )}

            {/* Device grid */}
            {devices.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devices.map((device) => (
                        <DeviceCard key={device.id} device={device} />
                    ))}
                </div>
            )}
        </div>
    );
}
