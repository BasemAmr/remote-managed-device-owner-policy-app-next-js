'use client';

import React, { useState } from 'react';
import { Lock, LockOpen, Ban, Check, Shield } from 'lucide-react';
import type { App } from '@/lib/types';

interface AppRowProps {
    app: App;
    onToggleBlock: (app: App, isBlocked: boolean) => Promise<void>;
    onToggleLock: (app: App, isUninstallable: boolean) => Promise<void>;
    onActivateRedShield: (app: App) => Promise<void>;
}

export const AppRow: React.FC<AppRowProps> = ({ app, onToggleBlock, onToggleLock, onActivateRedShield }) => {
    const [isBlockLoading, setIsBlockLoading] = useState(false);
    const [isLockLoading, setIsLockLoading] = useState(false);

    const handleToggleBlock = async () => {
        setIsBlockLoading(true);
        try {
            await onToggleBlock(app, !app.is_blocked);
        } finally {
            setIsBlockLoading(false);
        }
    };

    const handleToggleLock = async () => {
        setIsLockLoading(true);
        try {
            await onToggleLock(app, !app.is_uninstallable);
        } finally {
            setIsLockLoading(false);
        }
    };

    return (
        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            {/* App name */}
            <td className="px-6 py-4">
                <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                        {app.app_name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {app.package_name}
                    </div>
                </div>
            </td>

            {/* Version */}
            <td className="px-6 py-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {app.version_name} ({app.version_code})
                </div>
            </td>

            {/* Block status */}
            <td className="px-6 py-4">
                {app.is_irrevocable ? (
                    <span className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium opacity-70 cursor-not-allowed ${
                        app.is_blocked
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                        {app.is_blocked ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        <span>{app.is_blocked ? 'Blocked' : 'Allowed'}</span>
                    </span>
                ) : (
                <button
                    onClick={handleToggleBlock}
                    disabled={isBlockLoading}
                    className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${app.is_blocked
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                            : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                        }
            ${isBlockLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
                >
                    {isBlockLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : app.is_blocked ? (
                        <Ban className="w-4 h-4" />
                    ) : (
                        <Check className="w-4 h-4" />
                    )}
                    <span>{app.is_blocked ? 'Blocked' : 'Allowed'}</span>
                </button>
                )}
            </td>

            {/* Lock status */}
            <td className="px-6 py-4">
                {app.is_irrevocable ? (
                    <span className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium opacity-70 cursor-not-allowed ${
                        app.is_uninstallable
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                        {app.is_uninstallable ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                        <span>{app.is_uninstallable ? 'Locked' : 'Unlocked'}</span>
                    </span>
                ) : (
                <button
                    onClick={handleToggleLock}
                    disabled={isLockLoading}
                    className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${app.is_uninstallable
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }
            ${isLockLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
                >
                    {isLockLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : app.is_uninstallable ? (
                        <Lock className="w-4 h-4" />
                    ) : (
                        <LockOpen className="w-4 h-4" />
                    )}
                    <span>{app.is_uninstallable ? 'Locked' : 'Unlocked'}</span>
                </button>
                )}
            </td>

            {/* Last updated */}
            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {new Date(app.updated_at).toLocaleDateString()}
            </td>

            {/* Actions (Red Shield) */}
            <td className="px-6 py-4">
                {app.is_irrevocable ? (
                    <div className="flex items-center p-2" title="Permanently Locked">
                        <Shield className="w-5 h-5 text-red-600" />
                    </div>
                ) : (
                    <button
                        onClick={() => onActivateRedShield(app)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Activate Red Shield (Permanent Lock)"
                    >
                        <Shield className="w-5 h-5" />
                    </button>
                )}
            </td>
        </tr>
    );
};

export default AppRow;
