'use client';

import React, { useState } from 'react';
import { Shield, Mail, Lock, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient, getErrorMessage } from '@/lib/api';

export default function PartnerPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [hours, setHours] = useState('1');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const res = await apiClient.post('/api/auth/partner/login', { email, password });
            const data = res.data;
            
            setToken(data.token);
            setSuccessMessage('Logged in successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsSubmitting(true);

        try {
            const res = await apiClient.post('/api/auth/partner/unlock', 
                { durationHours: parseInt(hours) },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const data = res.data;
            
            setSuccessMessage(`Success! Admin dashboard mapped. Unlocked until: ${new Date(data.unlocked_until).toLocaleString()}`);
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Accountability Partner
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Unlock Admin Access securely.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                        </div>
                    )}
                    
                    {successMessage && (
                        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                            <p className="text-sm text-green-800 dark:text-green-300">{successMessage}</p>
                        </div>
                    )}

                    {!token ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Partner Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                                        placeholder="partner@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg"
                            >
                                {isSubmitting ? 'Verifying...' : 'Login as Partner'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleUnlock} className="space-y-6 flex flex-col items-center">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white text-center">
                                Unlock Admin Dashboard
                            </h2>
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Duration (Hours)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Clock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        max="72"
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg"
                            >
                                {isSubmitting ? 'Unlocking...' : 'Approve Admin Access'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
