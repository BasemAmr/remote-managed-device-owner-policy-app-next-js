'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useDevices } from '@/context/DeviceContext';
import { policyApi, getErrorMessage } from '@/lib/api';
import { ArrowLeft, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';

export default function UrlsManagementPage() {
    const params = useParams();
    const deviceId = parseInt(params.device_id as string);
    const { getDeviceById } = useDevices();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Form state
    const [urlPattern, setUrlPattern] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const device = getDeviceById(deviceId);

    const handleAddUrl = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await policyApi.addUrl({
                device_id: deviceId,
                url_pattern: urlPattern,
                description: description || undefined,
            });

            setSuccessMessage('URL added to blacklist successfully');
            setUrlPattern('');
            setDescription('');

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsSubmitting(false);
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
                    URL Blacklist
                </h1>
                {device && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {device.device_name} - Manage blocked URLs
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
                    <div>
                        <p className="text-red-800 dark:text-red-300">{error}</p>
                    </div>
                </div>
            )}

            {/* Add URL form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Add URL to Blacklist
                </h2>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                        Note: Listing and removing blocked URLs is currently not supported by the server. You can only add new rules.
                    </p>
                </div>
                <form onSubmit={handleAddUrl} className="space-y-4">
                    <div>
                        <label htmlFor="url-pattern" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            URL Pattern *
                        </label>
                        <input
                            id="url-pattern"
                            type="text"
                            value={urlPattern}
                            onChange={(e) => setUrlPattern(e.target.value)}
                            required
                            placeholder="e.g., reddit.com, *.gambling.*, facebook.com/*"
                            className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Use * as wildcard. Examples: reddit.com, *.gambling.*, facebook.com/*
                        </p>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description (optional)
                        </label>
                        <input
                            id="description"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., Social media distraction"
                            className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Plus className="w-5 h-5" />
                        )}
                        <span>{isSubmitting ? 'Adding...' : 'Add URL'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
