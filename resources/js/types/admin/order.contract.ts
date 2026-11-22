import { BadgeColor } from '@/components/ui/badge';

type OrderStatus = 'pending' | 'paid' | 'expired' | 'refunded';

export type ISODateString = string;

export type ClientOrderSummary = {
    id: number;
    name: string;
    email: string;
    phone: string;
    company_name: string;
};

export type PlanOrderSummary = {
    id: number;
    name: string;
    max_devices: number;
    is_lifetime: boolean;
};

export type LicenseOrderDetail = {
    id: number;
    license_key: string;
    status: string;
    expires_at: ISODateString | null;
};

export type StatusOptions = {
    value: string;
    label: string;
    color: string;
};

export type OrderEntity = {
    id: number;
    order_number: string;
    status: OrderStatus;
    status_label: string;
    status_color: BadgeColor;
    amount: string;
    client: ClientOrderSummary;
    plan: PlanOrderSummary;
    created_at: ISODateString;
    paid_at: ISODateString;
};

export type OrderDetailEntity = {
    id: number;
    order_number: string;
    status: OrderStatus;
    status_label: string;
    status_color: BadgeColor;

    amount: number;

    payment_reference: string | null;

    created_at: ISODateString;
    paid_at: ISODateString | null;
    expires_at: ISODateString | null;

    client: ClientOrderSummary;
    plan: PlanOrderSummary;
    license: LicenseOrderDetail | null;
};
