import axios, { AxiosInstance, AxiosError } from 'axios';
import { auth } from './auth';
import type {
    LoginResponse,
    RegisterResponse,
    VerifyResponse,
    DevicesResponse,
    AppsResponse,
    UrlsResponse,
    RequestsResponse,
    ViolationsResponse,
    AppPolicyRequest,
    AddUrlRequest,
    UpdateRequestRequest,
    DeviceSettings,
} from './types';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = auth.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Auto-logout on 401 Unauthorized
        if (error.response?.status === 401) {
            auth.clearAuth();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Helper function to extract error message
export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.response?.data?.error || error.message || 'An error occurred';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred';
};

// ============================================
// AUTHENTICATION API
// ============================================

export const authApi = {
    register: async (email: string, password: string): Promise<RegisterResponse> => {
        const response = await apiClient.post<RegisterResponse>('/api/auth/register', { email, password });
        return response.data;
    },

    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/api/auth/login', { email, password });
        return response.data;
    },

    verify: async (): Promise<VerifyResponse> => {
        const response = await apiClient.post<VerifyResponse>('/api/auth/verify');
        return response.data;
    },
};

// ============================================
// DEVICE MANAGEMENT API
// ============================================

export const deviceApi = {
    getDevices: async (): Promise<DevicesResponse> => {
        const response = await apiClient.get<DevicesResponse>('/api/management/devices');
        return response.data;
    },

    getApps: async (deviceId: number): Promise<AppsResponse> => {
        const response = await apiClient.get<AppsResponse>(`/api/management/devices/${deviceId}/apps`);
        return response.data;
    },
};

// ============================================
// POLICY MANAGEMENT API
// ============================================

export const policyApi = {
    updateAppPolicy: async (policy: AppPolicyRequest): Promise<{ message: string; policy: any }> => {
        const response = await apiClient.post('/api/management/policies/apps', policy);
        return response.data;
    },

    addUrl: async (urlData: AddUrlRequest): Promise<{ message: string; url: any }> => {
        const response = await apiClient.post('/api/management/policies/urls', urlData);
        return response.data;
    },

    deleteUrl: async (id: number): Promise<{ message: string }> => {
        const response = await apiClient.delete(`/api/management/policies/urls/${id}`);
        return response.data;
    },
};

// ============================================
// APPROVAL REQUEST API
// ============================================

export const requestApi = {
    getRequests: async (): Promise<RequestsResponse> => {
        const response = await apiClient.get<RequestsResponse>('/api/management/requests');
        return response.data;
    },

    updateRequest: async (id: number, data: UpdateRequestRequest): Promise<{ message: string; request: any }> => {
        const response = await apiClient.put(`/api/management/requests/${id}`, data);
        return response.data;
    },
};

// ============================================
// VIOLATION LOG API
// ============================================

export const violationApi = {
    getViolations: async (deviceId?: number): Promise<ViolationsResponse> => {
        const url = deviceId ? `/api/management/violations?device_id=${deviceId}` : '/api/management/violations';
        const response = await apiClient.get<ViolationsResponse>(url);
        return response.data;
    },
};

// ============================================
// DEVICE SETTINGS API
// ============================================

export const settingsApi = {
    updateSettings: async (deviceId: number, settings: Partial<DeviceSettings>): Promise<{ message: string; settings: DeviceSettings }> => {
        const response = await apiClient.put(`/api/management/devices/${deviceId}/settings`, settings);
        return response.data;
    },
};

export default apiClient;
