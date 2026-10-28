'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useDevices } from '@/context/DeviceContext';
import { deviceApi, appKeywordApi, getErrorMessage } from '@/lib/api';
import { ArrowLeft, AlertCircle, Plus, Trash2, Shield, Search, CheckCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import type { App, AppKeyword } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AppKeywordsManagementPage() {
    const params = useParams();
    const deviceId = params.device_id as string;
    const { getDeviceById, isLoading: isDevicesLoading } = useDevices();

    const [keywords, setKeywords] = useState<AppKeyword[]>([]);
    const [installedApps, setInstalledApps] = useState<App[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Form state
    const [packageName, setPackageName] = useState('');
    const [customPackageName, setCustomPackageName] = useState('');
    const [keyword, setKeyword] = useState('');
    const [matchMode, setMatchMode] = useState<'contains' | 'exact'>('contains');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const device = getDeviceById(deviceId);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const [keywordsData, appsData] = await Promise.all([
                appKeywordApi.getKeywords(deviceId),
                deviceApi.getApps(deviceId).catch(() => ({ apps: [] }))
            ]);
            setKeywords(keywordsData || []);
            setInstalledApps(appsData.apps || []);
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

    const handleAddKeyword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const targetPackage = packageName === '__custom__' ? customPackageName.trim() : packageName;

        if (!targetPackage) {
            setError('Please select or specify a package name');
            setIsSubmitting(false);
            return;
        }

        if (!keyword.trim()) {
            setError('Keyword cannot be empty');
            setIsSubmitting(false);
            return;
        }

        try {
            await appKeywordApi.addKeyword(deviceId, {
                package_name: targetPackage,
                keyword: keyword.trim(),
                match_mode: matchMode,
                description: description.trim() || undefined,
            });

            setSuccessMessage('Keyword blocking rule added successfully');
            setKeyword('');
            setDescription('');
            fetchData();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteKeyword = async (id: number) => {
        if (!confirm('Are you sure you want to remove this keyword rule?')) return;

        setDeletingId(id);
        setError('');

        try {
            await appKeywordApi.removeKeyword(deviceId, id);
            setKeywords(keywords.filter(k => k.id !== id));
            setSuccessMessage('Keyword rule removed successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setDeletingId(null);
        }
    };

    const handleActivateRedShield = async (id: number) => {
        if (!confirm('Are you sure you want to permanently lock this keyword rule? Under Red Shield, this rule CANNOT be modified or deleted.')) return;

        setError('');
        try {
            await appKeywordApi.activateRedShield(deviceId, id);
            setSuccessMessage('Red Shield activated! This rule is now permanently locked.');
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
        return <LoadingSpinner text="Loading keyword blocking rules..." />;
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
                            <Search className="w-7 h-7 text-indigo-600" />
                            App-Specific Keyword Blocking
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Block specific search terms and content keywords inside chosen applications on{' '}
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
                    <Plus className="w-5 h-5 text-indigo-600" />
                    Add Keyword Rule
                </h2>
                <form onSubmit={handleAddKeyword} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Target Application */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Target Application *
                            </label>
                            <select
                                value={packageName}
                                onChange={(e) => setPackageName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                required
                            >
                                <option value="">-- Select Installed App --</option>
                                {installedApps.map((app) => (
                                    <option key={app.package_name} value={app.package_name}>
                                        {app.app_name} ({app.package_name})
                                    </option>
                                ))}
                                <option value="__custom__">Custom Package Name...</option>
                            </select>
                        </div>

                        {/* Custom Package Name if selected */}
                        {packageName === '__custom__' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Package Name *
                                </label>
                                <input
                                    type="text"
                                    value={customPackageName}
                                    onChange={(e) => setCustomPackageName(e.target.value)}
                                    placeholder="e.g. com.google.android.youtube"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                    required
                                />
                            </div>
                        )}

                        {/* Keyword */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Keyword / Phrase *
                            </label>
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="e.g. shorts, reels, gambling"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                required
                            />
                        </div>

                        {/* Match Mode */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Match Mode
                            </label>
                            <select
                                value={matchMode}
                                onChange={(e) => setMatchMode(e.target.value as 'contains' | 'exact')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                            >
                                <option value="contains">Contains (sub-string match)</option>
                                <option value="exact">Exact (strict word/phrase match)</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description / Reason (Optional)
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Block doom-scrolling feed in Youtube"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium shadow-sm transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {isSubmitting ? 'Adding...' : 'Add Keyword Rule'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Keyword Rules Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Active Keyword Rules ({keywords.length})
                    </h2>
                </div>

                {keywords.length === 0 ? (
                    <div className="text-center py-12">
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">No keyword rules configured</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Add a rule above to block unwanted keywords in specific apps.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Target App
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Keyword
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Match Mode
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Description
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
                                {keywords.map((rule) => (
                                    <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {getAppDisplayName(rule.package_name)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded font-mono font-semibold">
                                                {rule.keyword}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                rule.match_mode === 'exact'
                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                            }`}>
                                                {rule.match_mode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {rule.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {rule.is_irrevocable ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-300 dark:border-red-700">
                                                    <Shield className="w-3.5 h-3.5 mr-1 text-red-600 fill-red-500" />
                                                    Red Shield (Permanent)
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleActivateRedShield(rule.id)}
                                                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-700 transition-colors"
                                                    title="Lock permanently with Red Shield"
                                                >
                                                    <Shield className="w-3.5 h-3.5 mr-1" />
                                                    Activate Red Shield
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            {rule.is_irrevocable ? (
                                                <span className="text-xs text-gray-400 italic">Irrevocable</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleDeleteKeyword(rule.id)}
                                                    disabled={deletingId === rule.id}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Delete keyword rule"
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
