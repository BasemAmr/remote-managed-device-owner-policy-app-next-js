'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { deviceApi, getErrorMessage } from '@/lib/api';
import { useAuth } from './AuthContext';
import type { Device } from '@/lib/types';

interface DeviceContextType {
    devices: Device[];
    isLoading: boolean;
    error: string | null;
    fetchDevices: () => Promise<void>;
    refreshDevices: () => Promise<void>;
    getDeviceById: (id: string) => Device | undefined;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const [devices, setDevices] = useState<Device[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isLoadingRef = React.useRef(false);

    const fetchDevices = useCallback(async () => {
        // Don't fetch if already loading
        if (isLoadingRef.current) return;

        isLoadingRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
            const response = await deviceApi.getDevices();
            setDevices(response.devices);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            console.error('Failed to fetch devices:', errorMessage);
        } finally {
            isLoadingRef.current = false;
            setIsLoading(false);
        }
    }, []);

    // Fetch devices automatically when authenticated
    useEffect(() => {
        if (isAuthenticated && !isAuthLoading && devices.length === 0) {
            fetchDevices();
        }
    }, [isAuthenticated, isAuthLoading, fetchDevices, devices.length]);

    const refreshDevices = useCallback(async () => {
        isLoadingRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
            const response = await deviceApi.getDevices();
            setDevices(response.devices);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            console.error('Failed to refresh devices:', errorMessage);
        } finally {
            isLoadingRef.current = false;
            setIsLoading(false);
        }
    }, []);

    const getDeviceById = useCallback((id: string): Device | undefined => {
        return devices.find(device => device.id === id);
    }, [devices]);

    const value: DeviceContextType = {
        devices,
        isLoading,
        error,
        fetchDevices,
        refreshDevices,
        getDeviceById,
    };

    return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
};

// Custom hook to use device context
export const useDevices = (): DeviceContextType => {
    const context = useContext(DeviceContext);
    if (context === undefined) {
        throw new Error('useDevices must be used within a DeviceProvider');
    }
    return context;
};
