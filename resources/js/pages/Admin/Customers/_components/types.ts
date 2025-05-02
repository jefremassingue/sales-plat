export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Client {
    id: number;
    name: string;
    company_name: string | null;
    tax_id: string | null;
    email: string | null;
    phone: string | null;
    mobile: string | null;
    address: string | null;
    city: string | null;
    province: string | null;
    country: string;
    postal_code: string | null;
    notes: string | null;
    active: boolean;
    birth_date: string | null;
    contact_person: string | null;
    billing_address: string | null;
    shipping_address: string | null;
    website: string | null;
    client_type: 'individual' | 'company';
    user_id: number | null;
    user?: User;
    created_at: string;
    updated_at: string;
}
