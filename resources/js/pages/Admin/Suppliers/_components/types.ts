export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Supplier {
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
    postal_code: string | null;
    country: string;
    notes: string | null;
    active: boolean;
    contact_person: string | null;
    billing_address: string | null;
    payment_terms: string | null;
    website: string | null;
    bank_name: string | null;
    bank_account: string | null;
    bank_branch: string | null;
    supplier_type: 'products' | 'services' | 'both';
    credit_limit: number | null;
    currency: string;
    user_id: number | null;
    user?: User;
    created_at: string;
    updated_at: string;
}

export interface SupplierFormValues {
    name: string;
    company_name: string | null;
    tax_id: string | null;
    email: string | null;
    phone: string | null;
    mobile: string | null;
    address: string | null;
    city: string | null;
    province: string | null;
    postal_code: string | null;
    country: string;
    notes: string | null;
    active: boolean;
    contact_person: string | null;
    billing_address: string | null;
    payment_terms: string | null;
    website: string | null;
    bank_name: string | null;
    bank_account: string | null;
    bank_branch: string | null;
    supplier_type: 'products' | 'services' | 'both';
    credit_limit: number | null;
    currency: string;
    user_id: number | null;
}
