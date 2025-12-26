import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import Header from '@/components/Header';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                {/* Sidebar */}
                <Navigation />

                {/* Main content */}
                <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
