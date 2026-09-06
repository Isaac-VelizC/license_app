import { ClientEntity } from './client.contract';
import type { AppEntity, PlanEntity } from './app.contract';
import type { BadgeColor } from '@/components/ui/badge';

export type LicenseStatus = 'active' | 'suspended' | 'expired' | 'revoked';

export interface LicenseEntity {
    id: number;
    license_key: string;
    status: LicenseStatus;
    status_label: string;
    status_color: BadgeColor;
    is_valid: boolean;
    starts_at: string | null;
    expires_at: string | null;
    is_lifetime: boolean;
    is_trial: boolean;
    max_devices: number;
    devices_used?: number;
    activations?: ActivationEntity[];
    revoked_at: string | null;
    revoked_reason: string | null;
    app?: AppEntity;
    plan?: PlanEntity;
    client?: ClientEntity;
    created_at: string;
}

export interface ActivationEntity {
    id: number;
    hwid: string;
    device_id: string;
    device_name: string;
    ip_address: string;
    app_version: string;
    last_seen_at: string | null;
    activated_at: string | null;
    deactivated_at: string | null;
    is_active: boolean;
}

export interface LicenseFormData {
    client_id: string;
    app_id: string;
    plan_id: string;
}

export interface LicenseFilters {
    search?: string;
    app_id?: string | number;
    client_id?: string | number;
    status?: string;
}

export interface LicenseLogEntity {
    id: number;
    event: string;
    ip_address: string | null;
    meta: Record<string, unknown> | null;
    license: {
        id: number;
        license_key: string;
        client_name: string | null;
        app_name: string | null;
    };
    created_at: string;
}