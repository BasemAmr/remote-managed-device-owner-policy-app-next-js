'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useDevices } from '@/context/DeviceContext';
import { deviceApi, accessibilityApi, accessibilityFallbackApi, getErrorMessage } from '@/lib/api';
import { ArrowLeft, AlertCircle, Plus, Trash2, Shield, EyeOff, Globe, AppWindow, CheckCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import type { App, AccessibilityFallback, FallbackTargetType } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AccessibilityServiceOption {
    service_id: string;
    package_name: string;
    label: string;
}

export default function AccessibilityFallbacksPage() {
    const params = useParams();
    const deviceId = params.device_id as string;
    const { getDeviceById, isLoading: isDevicesLoading } = useDevices();

    const [fallbacks, setFallbacks] = useState<AccessibilityFallback[]>([]);
    const [installedApps, setInstalledApps] = useState<App[]>([]);
    const [services, setServices] = useState<AccessibilityServiceOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Form state
    const [servicePackageName, setServicePackageName] = useState('');
    const [customServicePackage, setCustomServicePackage] = useState('');
    const [targetType, setTargetType] = useState<FallbackTargetType>('app');
    const [targetAppPackage, setTargetAppPackage] = useState('');
    const [customAppPackage, setCustomAppPackage] = useState('');
    const [targetWebsiteUrl, setTargetWebsiteUrl] = useState('');
    const [label, setLabel] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const device = getDeviceById(deviceId);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const [fallbacksData, appsData, servicesData] = await Promise.all([
                accessibilityFallbackApi.getFallbacks(deviceId),
                deviceApi.getApps(deviceId).catch(() => ({ apps: [] })),
                accessibilityApi.getAccessibilityServices(deviceId).catch(() => [])
            ]);
            setFallbacks(fallbacksData || []);
            setInstalledApps(appsData.apps || []);
            setServices(servicesData || []);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }, [deviceId]);

    useEffect(() => {
        if (deviceId) {
            fetchData();
        }
    }, [deviceId, fetchData]);

    const handleAddFallback = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const finalService = servicePackageName === '__custom__' ? customServicePackage.trim() : servicePackageName;

        if (!finalService) {
            setError('Please select or specify a locked accessibility service package');
            setIsSubmitting(false);
            return;
        }

        let finalTargetValue = '';
        if (targetType === 'app') {
            finalTargetValue = targetAppPackage === '__custom__' ? customAppPackage.trim() : targetAppPackage;
            if (!finalTargetValue) {
                setError('Please select or enter the application package to hide');
                setIsSubmitting(false);
                return;
            }
        } else {
            finalTargetValue = targetWebsiteUrl.trim();
            if (!finalTargetValue) {
                setError('Please enter the website/URL pattern to block');
                setIsSubmitting(false);
                return;
            }
        }

        try {
            await accessibilityFallbackApi.addFallback(deviceId, {
                service_package_name: finalService,
                target_type: targetType,
                target_value: finalTargetValue,
                label: label.trim() || undefined,
            });

            setSuccessMessage(`Fallback ${targetType === 'app' ? 'app to hide' : 'website to block'} added successfully!`);
            setTargetAppPackage('');
            setCustomAppPackage('');
            setTargetWebsiteUrl('');
            setLabel('');
            fetchData();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteFallback = async (id: number) => {
        if (!confirm('Are you sure you want to remove this fallback rule?')) return;

        setDeletingId(id);
        setError('');

        try {
            await accessibilityFallbackApi.removeFallback(deviceId, id);
            setFallbacks(fallbacks.filter(f => f.id !== id));
            setSuccessMessage('Fallback rule removed successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setDeletingId(null);
        }
    };

    const handleActivateRedShield = async (id: number) => {
        if (!confirm('Are you sure you want to permanently lock this fallback rule? Under Red Shield, this rule CANNOT be removed or edited.')) return;

        setError('');
        try {
            await accessibilityFallbackApi.activateRedShield(deviceId, id);
            setSuccessMessage('Red Shield activated! Fallback rule is now irrevocable.');
            fetchData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const getAppDisplayName = (pkg: string) => {
        const found = installedApps.find(a => a.package_name === pkg);
        return found ? `${found.app_name} (${pkg})` : pkg;
    };

    if (isLoading || isDevicesLoading) {
        return <LoadingSpinner text="Loading accessibility fallback rules..." />;
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
            {/* Header */}
            <div>
                <Link
                    href={`/dashboard/devices/${deviceId}`}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Device
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <EyeOff className="w-7 h-7 text-rose-600" />
                            Apps to Hide & Fallback Restrictions
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Configure applications to automatically hide and websites to block whenever a locked accessibility service (e.g. AppBlock) is stopped on{' '}
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {device?.device_name || deviceId}
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4 rounded-r-lg">
                    <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                        <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
                    </div>
                </div>
            )}

            {/* Add Rule Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-rose-600" />
                    Add Fallback Rule (App to Hide or Website to Block)
                </h2>
                <form onSubmit={handleAddFallback} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Locked Service Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                When This Accessibility Service is Disabled: *
                            </label>
                            <select
                                value={servicePackageName}
                                onChange={(e) => setServicePackageName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:text-white text-sm"
                                required
                            >
                                <option value="">-- Select Accessibility Service --</option>
                                {services.map((svc) => (
                                    <option key={svc.service_id} value={svc.package_name}>
                                        {svc.label} ({svc.package_name})
                                    </option>
                                ))}
                                <option value="cz.mobilesoft.appblock">AppBlock (cz.mobilesoft.appblock)</option>
                                <option value="__custom__">Custom Service Package...</option>
                            </select>
                        </div>

                        {servicePackageName === '__custom__' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Service Package Name *
                                </label>
                                <input
                                    type="text"
                                    value={customServicePackage}
                                    onChange={(e) => setCustomServicePackage(e.target.value)}
                                    placeholder="e.g. cz.mobilesoft.appblock"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:text-white text-sm"
                                    required
                                />
                            </div>
                        )}

                        {/* Target Type Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Restriction Type to Trigger: *
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setTargetType('app')}
                                    className={`py-2 px-3 text-sm font-medium rounded-lg flex items-center justify-center gap-2 border transition-colors ${
                                        targetType === 'app'
                                            ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-900/30 dark:border-rose-600 dark:text-rose-300'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <AppWindow className="w-4 h-4" />
                                    Hide Application
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTargetType('website')}
                                    className={`py-2 px-3 text-sm font-medium rounded-lg flex items-center justify-center gap-2 border transition-colors ${
                                        targetType === 'website'
                                            ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-900/30 dark:border-rose-600 dark:text-rose-300'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <Globe className="w-4 h-4" />
                                    Block Website
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Target Inputs depending on type */}
                    {targetType === 'app' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Application to Hide at OS Level *
                                </label>
                                <select
                                    value={targetAppPackage}
                                    onChange={(e) => setTargetAppPackage(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:text-white text-sm"
                                    required
                                >
                                    <option value="">-- Select App to Hide --</option>
                                    {installedApps.map((app) => (
                                        <option key={app.package_name} value={app.package_name}>
                                            {app.app_name} ({app.package_name})
                                        </option>
                                    ))}
                                    <option value="__custom__">Custom Package Name...</option>
                                </select>
                            </div>

                            {targetAppPackage === '__custom__' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Custom Package Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={customAppPackage}
                                        onChange={(e) => setCustomAppPackage(e.target.value)}
                                        placeholder="e.g. com.android.chrome"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:text-white text-sm"
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Website / Domain to Block *
                            </label>
                            <input
                                type="text"
                                value={targetWebsiteUrl}
                                onChange={(e) => setTargetWebsiteUrl(e.target.value)}
                                placeholder="e.g. youtube.com or *.reddit.com"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:text-white text-sm"
                                required
                            />
                        </div>
                    )}

                    {/* Label */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Friendly Label / Description (Optional)
                        </label>
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="e.g. Hide Chrome when AppBlock is disabled"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 text-sm font-medium shadow-sm transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {isSubmitting ? 'Adding...' : 'Add Fallback Rule'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Fallbacks Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Configured Fallback Protections ({fallbacks.length})
                    </h2>
                </div>

                {fallbacks.length === 0 ? (
                    <div className="text-center py-12">
                        <EyeOff className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">No fallback rules configured</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                            Add rules above so that if a locked accessibility service is disabled, specified apps disappear from the phone and websites are blocked immediately.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Locked Service
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Action / Target
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Label
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Protection (Red Shield)
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {fallbacks.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                                            {item.service_package_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {item.target_type === 'app' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                                    <AppWindow className="w-3 h-3 mr-1" />
                                                    Hide App
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
                                                    <Globe className="w-3 h-3 mr-1" />
                                                    Block Website
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                            {item.target_type === 'app'
                                                ? getAppDisplayName(item.target_value)
                                                : item.target_value}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {item.label || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {item.is_irrevocable ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-300 dark:border-red-700">
                                                    <Shield className="w-3.5 h-3.5 mr-1 text-red-600 fill-red-500" />
                                                    Red Shield (Permanent)
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleActivateRedShield(item.id)}
                                                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-700 transition-colors"
                                                    title="Lock permanently with Red Shield"
                                                >
                                                    <Shield className="w-3.5 h-3.5 mr-1" />
                                                    Activate Red Shield
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            {item.is_irrevocable ? (
                                                <span className="text-xs text-gray-400 italic">Irrevocable</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleDeleteFallback(item.id)}
                                                    disabled={deletingId === item.id}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Delete fallback rule"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
