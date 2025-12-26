'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User } from 'lucide-react';

export const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Device Management Dashboard
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Self-Control System Administration
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {user && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.email}
                            </span>
                        </div>
                    )}

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
