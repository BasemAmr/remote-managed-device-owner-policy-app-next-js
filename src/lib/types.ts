// Authentication Types
export interface Admin {
    id: number;
    email: string;
    created_at: string;
}

export interface LoginResponse {
    token: string;
    admin: Admin;
}

export interface RegisterResponse {
    message: string;
    admin_id: number;
}

export interface VerifyResponse {
    valid: boolean;
    admin: Admin;
}

// Device Types
export interface Device {
    id: string;
    device_name: string;
    android_id: string;
    last_seen: string;
    policy_version: number;
    is_restricted: boolean;
    created_at: string;
}

export interface DeviceSettings {
    id: number;
    device_id: string;
    cooldown_hours: number;
    require_admin_approval: boolean;
    vpn_always_on: boolean;
    prevent_factory_reset: boolean;
    updated_at: string;
}

// App Types
export interface App {
    id: number;
    device_id: string;
    package_name: string;
    app_name: string;
    version_code: number;
    version_name: string;
    is_blocked: boolean;
    is_uninstallable: boolean;
    created_at: string;
    updated_at: string;
}

export interface AppPolicyRequest {
    device_id: string;
    package_name: string;
    app_name: string;
    is_blocked: boolean;
    is_uninstallable: boolean;
}

// URL Blacklist Types
export interface BlacklistedUrl {
    id: number;
    device_id: string;
    url_pattern: string;
    description: string | null;
    created_at: string;
}

export interface AddUrlRequest {
    device_id: string;
    url_pattern: string;
    description?: string;
}

// Approval Request Types
export type RequestStatus = 'pending' | 'approved' | 'denied';
export type RequestType = 'disable_restriction' | 'uninstall_app' | 'change_settings';

export interface ApprovalRequest {
    id: number;
    device_id: string;
    device_name: string;
    request_type: RequestType;
    target_data: string; // JSON string
    status: RequestStatus;
    requested_at: string;
    cooldown_until: string | null;
    notes: string | null;
}

export interface UpdateRequestRequest {
    status: 'approved' | 'denied';
    notes?: string;
}

// Violation Types
export type ViolationType = 'blocked_app_attempt' | 'blocked_url_attempt' | 'uninstall_attempt' | 'settings_change_attempt';

export interface Violation {
    id: number;
    device_id: string;
    device_name: string;
    violation_type: ViolationType;
    details: string; // JSON string
    created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
    data?: T;
    message?: string;
    error?: string;
}

export interface DevicesResponse {
    devices: Device[];
}

export interface AppsResponse {
    apps: App[];
}

export interface UrlsResponse {
    urls: BlacklistedUrl[];
}

export interface RequestsResponse {
    requests: ApprovalRequest[];
}

export interface ViolationsResponse {
    violations: Violation[];
}
