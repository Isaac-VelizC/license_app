import { LicenseEntity } from './license.contract';

export interface ClientEntity {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    company_name?: string | null;
    notes?: string | null;
    licenses_count?: number;
    licenses?: LicenseEntity[];
    created_at: string;
}

export interface ClientFormData {
    name: string;
    email: string;
    phone: string;
    company_name: string;
    notes: string;
}
