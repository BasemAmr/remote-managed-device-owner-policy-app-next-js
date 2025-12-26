'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDevices } from '@/context/DeviceContext';
import { settingsApi, getErrorMessage } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, AlertCircle, Settings as SettingsIcon, Save } from 'lucide-react';
import Link from 'next/link';

export default function DeviceSettingsPage() {
    const params = useParams();
    const deviceId = parseInt(params.device_id as string);
    const { getDeviceById } = useDevices();

    const [cooldownHours, setCooldownHours] = useState(24);
    const [requireAdminApproval, setRequireAdminApproval] = useState(true);
    const [vpnAlwaysOn, setVpnAlwaysOn] = useState(false);
    const [preventFactoryReset, setPreventFactoryReset] = useState(true);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const device = getDeviceById(deviceId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccessMessage('');

        try {
            await settingsApi.updateSettings(deviceId, {
                cooldown_hours: cooldownHours,
                require_admin_approval: requireAdminApproval,
                vpn_always_on: vpnAlwaysOn,
                prevent_factory_reset: preventFactoryReset,
            });

            setSuccessMessage('Settings updated successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsSaving(false);
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
                    Device Settings
                </h1>
                {device && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {device.device_name} - Configure device policies
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

            {/* Settings form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                    <SettingsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Policy Configuration
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Cooldown hours */}
                    <div>
                        <label htmlFor="cooldown-hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cooldown Period (hours)
                        </label>
                        <input
                            id="cooldown-hours"
                            type="number"
                            min="1"
                            max="168"
                            value={cooldownHours}
                            onChange={(e) => setCooldownHours(parseInt(e.target.value))}
                            required
                            className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Time period after an approved request before another can be made (1-168 hours)
                        </p>
                    </div>

                    {/* Require admin approval */}
                    <div className="flex items-start gap-3">
                        <div className="flex items-center h-6">
                            <input
                                id="require-approval"
                                type="checkbox"
                                checked={requireAdminApproval}
                                onChange={(e) => setRequireAdminApproval(e.target.checked)}
                                className="w-5 h-5 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="require-approval" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Require Admin Approval
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                All restriction changes must be approved by an administrator
                            </p>
                        </div>
                    </div>

                    {/* VPN always on */}
                    <div className="flex items-start gap-3">
                        <div className="flex items-center h-6">
                            <input
                                id="vpn-always-on"
                                type="checkbox"
                                checked={vpnAlwaysOn}
                                onChange={(e) => setVpnAlwaysOn(e.target.checked)}
                                className="w-5 h-5 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="vpn-always-on" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                VPN Always On
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Enforce VPN connection at all times (requires VPN configuration)
                            </p>
                        </div>
                    </div>

                    {/* Prevent factory reset */}
                    <div className="flex items-start gap-3">
                        <div className="flex items-center h-6">
                            <input
                                id="prevent-reset"
                                type="checkbox"
                                checked={preventFactoryReset}
                                onChange={(e) => setPreventFactoryReset(e.target.checked)}
                                className="w-5 h-5 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="prevent-reset" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Prevent Factory Reset
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Block factory reset attempts to prevent policy bypass
                            </p>
                        </div>
                    </div>

                    {/* Submit button */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Save Settings</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Info card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    Important Notes
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
                    <li>Settings changes take effect immediately on the device</li>
                    <li>The device must be online to receive policy updates</li>
                    <li>Cooldown period applies to all approval request types</li>
                    <li>Factory reset prevention requires Device Owner mode</li>
                </ul>
            </div>
        </div>
    );
}
