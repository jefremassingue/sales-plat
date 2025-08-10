import { LucideIcon } from 'lucide-react';

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon;
    activeRoutes?: string[];
}



export interface SaleItem {
    id: string;
    sale_id: string;
    product_id: string | null;
    product_variant_id: string | null;
    warehouse_id: string | null;
    name: string;
    description: string | null;
    quantity: number;
    unit: string | null;
    unit_price: number;
    discount_percentage: number;
    discount_amount: number;
    tax_percentage: number;
    tax_amount: number;
    subtotal: number;
    total: number;
    product?: Record<string, unknown>;
    productVariant?: Record<string, unknown>;
    warehouse?: {
        id: string;
        name: string;
    };
    available_quantity?: number;
}

export interface Sale {
    id: string;
    sale_number: number;
    customer_id: string | null;
    user_id: string | null;
    issue_date: string;
    due_date: string | null;
    status: 'draft' | 'pending' | 'paid' | 'partial' | 'canceled' | 'overdue';
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    shipping_amount: number;
    total: number;
    amount_paid: number;
    amount_due: number;
    currency_code: string;
    exchange_rate: number;
    notes: string | null;
    terms: string | null;
    include_tax: boolean;
    shipping_address: string | null;
    billing_address: string | null;
    payment_method: string | null;
    reference: string | null;
    quotation_id: string | null;
    customer?: {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
    };
    user?: {
        id: string;
        name: string;
        email: string;
    };
    currency?: {
        code: string;
        name: string;
        symbol: string;
        decimal_places: number;
        decimal_separator: string;
        thousand_separator: string;
    };
    items: SaleItem[];
    payments?: Array<{
        id: string;
        sale_id: string;
        amount: number;
        payment_date: string;
        payment_method: string;
        reference: string | null;
        notes: string | null;
    }>;
    delivery_guides: Record<string, unknown>[];
    quotation?: {
        id: string;
        quotation_number: string;
        issue_date: string;
    };
}