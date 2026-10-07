import { ProductVersionEntity } from "./product-version.contract";

export interface PlanEntity {
    id: number;
    app_id: number;
    name: string;
    qr_image_url: string;
    price_cents: number;
    formatted_price: string; // ej. "499.00 USD"
    currency: string;
    duration_days: number | null; // null = vitalicio
    is_lifetime: boolean;
    is_trial: boolean;
    is_free: boolean;
    max_devices: number;
    stripe_price_id: string | null;
    is_active: boolean;

    product_version_id: number | null;
    product_version: ProductVersionEntity | null;
    updates_until_version: string | null;

    created_at: string;
    updated_at: string;
}

export interface AppEntity {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    plans_count?: number;
    licenses_count?: number;
    plans?: PlanEntity[];
    product_versions?: ProductVersionEntity[];
    created_at: string;
    updated_at: string;
}

export interface AppFormData {
    name: string;
    slug: string;
    description: string;
}

export interface PlanFormData {
    name: string;
    price: string | number;
    duration_days: string | number | null;
    max_devices: number;
    is_trial: boolean;
    qr_image: File | null;
    stripe_price_id: string | null;
    product_version_id: number | null;
    updates_until_version: string;
    is_active: boolean;
}
