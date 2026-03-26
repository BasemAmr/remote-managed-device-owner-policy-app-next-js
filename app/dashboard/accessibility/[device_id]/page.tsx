'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { accessibilityApi, getErrorMessage } from '@/lib/api';
import { Shield, Lock, Unlock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface AccessibilityService {
    id: number;
    service_id: string;
    package_name: string;
    service_name: string;
    label: string;
    is_enabled: boolean;
    is_locked: boolean;
    locked_by?: string;
    locked_at?: string;
    is_irrevocable?: boolean;
}

export default function AccessibilityServicesPage() {
    const params = useParams();
    const deviceId = params.device_id as string;

    const [services, setServices] = useState<AccessibilityService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fetchServices = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await accessibilityApi.getAccessibilityServices(deviceId);
            setServices(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, [deviceId]);

    const handleToggleLock = async (serviceId: string, currentLockState: boolean) => {
        try {
            await accessibilityApi.setAccessibilityServiceLock(deviceId, serviceId, !currentLockState);
            await fetchServices(); // Refresh
        } catch (err) {
            alert(getErrorMessage(err));
        }
    };

    const handleActivateRedShield = async (serviceId: string) => {
        if (!confirm('Are you sure you want to permanently lock this service? This action cannot be undone.')) return;
        
        setError('');
        try {
            await accessibilityApi.activateAccessibilityRedShield({
                device_id: deviceId,
                service_id: serviceId
            });
            setSuccessMessage('Service is now permanently locked (Red Shield activated)');
            await fetchServices();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-lg">Loading accessibility services...</span>
            </div>
        );
    }

    const lockedServices = services.filter(s => s.is_locked);
    const enabledLockedServices = lockedServices.filter(s => s.is_enabled);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Accessibility Services
                </h1>
                <button
                    onClick={fetchServices}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
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

            {/* Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-6 h-6 text-blue-600" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Services</p>
                    </div>
                    <p className="text-3xl font-bold">{services.length}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Lock className="w-6 h-6 text-orange-600" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Locked Services</p>
                    </div>
                    <p className="text-3xl font-bold">{lockedServices.length}</p>
                </div>

                <div className={`rounded-xl shadow-lg p-6 ${enabledLockedServices.length === lockedServices.length
                        ? 'bg-green-100 dark:bg-green-900'
                        : 'bg-red-100 dark:bg-red-900'
                    }`}>
                    <div className="flex items-center gap-3 mb-2">
                        {enabledLockedServices.length === lockedServices.length ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        )}
                        <p className="text-sm">Enforcement Status</p>
                    </div>
                    <p className="text-3xl font-bold">
                        {enabledLockedServices.length}/{lockedServices.length}
                    </p>
                    <p className="text-sm mt-1">Locked services enabled</p>
                </div>
            </div>

            {/* Services List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Service
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Package
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {services.map((service) => (
                            <tr key={service.id}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {service.is_locked && service.is_enabled && (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        )}
                                        {service.is_locked && !service.is_enabled && (
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                        )}
                                        <div>
                                            <p className="font-medium">{service.label}</p>
                                            <p className="text-sm text-gray-500">{service.service_name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {service.package_name}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {service.is_locked && (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                Locked
                                            </span>
                                        )}
                                        {service.is_enabled && (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                Enabled
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {service.is_irrevocable ? (
                                            <span className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium bg-red-100 text-red-800">
                                                <Shield className="w-4 h-4" /> Permanently Locked
                                            </span>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleToggleLock(service.service_id, service.is_locked)}
                                                    className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${service.is_locked
                                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                        }`}
                                                >
                                                    {service.is_locked ? (
                                                        <>
                                                            <Unlock className="w-4 h-4" />
                                                            Unlock
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock className="w-4 h-4" />
                                                            Lock
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleActivateRedShield(service.service_id)}
                                                    className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                    title="Activate Red Shield (Permanent Lock)"
                                                >
                                                    <Shield className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
