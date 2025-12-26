'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Smartphone,
    AppWindow,
    Link as LinkIcon,
    ClipboardCheck,
    AlertTriangle,
    Settings,
    Menu,
    X,
} from 'lucide-react';

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
}

const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Devices', href: '/dashboard/devices', icon: Smartphone },
    { name: 'Approval Requests', href: '/dashboard/requests', icon: ClipboardCheck },
    { name: 'Violations', href: '/dashboard/violations', icon: AlertTriangle },
];

export const Navigation: React.FC = () => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
            >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <nav
                className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-gray-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
            >
                {/* Logo */}
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold">Self-Control</h2>
                    <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
                </div>

                {/* Navigation items */}
                <div className="flex-1 overflow-y-auto py-6">
                    <ul className="space-y-2 px-3">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-all duration-200
                      ${active
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                            }
                    `}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800">
                    <p className="text-xs text-gray-400 text-center">
                        Device Owner Management v1.0
                    </p>
                </div>
            </nav>
        </>
    );
};

export default Navigation;
