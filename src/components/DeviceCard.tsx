import React from 'react';
import Link from 'next/link';
import { Smartphone, Clock, Shield, ChevronRight } from 'lucide-react';
import type { Device } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';

interface DeviceCardProps {
    device: Device;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
    const isOnline = new Date(device.last_seen).getTime() > Date.now() - 5 * 60 * 1000; // Online if seen in last 5 minutes

    return (
        <Link href={`/dashboard/devices/${device.id}`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer group">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${device.is_restricted ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'}`}>
                            <Smartphone className={`w-6 h-6 ${device.is_restricted ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {device.device_name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                {device.android_id}
                            </p>
                        </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Status indicators */}
                <div className="space-y-3">
                    {/* Online status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            {formatRelativeTime(device.last_seen)}
                        </div>
                    </div>

                    {/* Restriction status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Restriction
                            </span>
                        </div>
                        <span className={`text-sm font-semibold ${device.is_restricted ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {device.is_restricted ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {/* Policy version */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Policy Version
                        </span>
                        <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            v{device.policy_version}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default DeviceCard;
