import { type LucideIcon } from 'lucide-react';
import { type Config } from 'ziggy-js';


export interface Warehouse {
    id: string;
    name: string;
    code: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    province: string | null;
    postal_code: string | null;
    country: string;
    active: boolean;
    is_main: boolean;
    description: string | null;
    manager_id: number | null;
    manager?: User;
    created_at: string;
    updated_at: string;
}

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title?: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    permission?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    can: { [key: string]: boolean };
    [key: string]: unknown; // This allows for additional properties...
}

export interface Catalog {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    cover: string | null;
    cover_url: string | null;
    file: string;
    file_url: string | null;
    status: 'available' | 'unavailable';
    version: string | null;
    publish_year: number | null;
    user_id: number | null;
    user?: User;
    created_at: string;
    updated_at: string;
}

export interface HeroSlider {
    id: number;
    supertitle: string | null;
    title: string;
    subtitle: string | null;
    cta_text: string | null;
    cta_link: string | null;
    text_position: 'left' | 'right' | 'center';
    text_color: string;
    overlay_color: string;
    active: boolean;
    order: number;
    image_url: string | null;
    image?: Image;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    [key: string]: unknown;
}

export interface Quotation {
    id: string;
    customer_name: string;
    status: string;
    total_amount: number;
    [key: string]: unknown;
}

export interface Sale {
    id: string;
    sale_number: string;
    customer_id: number | null;
    user_id: number | null;
    issue_date: string;
    due_date: string | null;
    status: 'draft' | 'pending' | 'paid' | 'partial' | 'canceled' | 'overdue';
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    shipping_amount: number;
    total: number;
    amount_paid: string;
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
    quotation_id: number | null;
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
    currency?: Currency;
    items: SaleItem[];
    payments?: Payment[];
    delivery_guides: DeliveryGuide[];
    quotation?: {
        id: string;
        quotation_number: string;
        issue_date: string;
    };
}

export interface SaleItem {
    id: string;
    sale_id: string;
    product_id: number | null;
    product_variant_id: number | null;
    warehouse_id: number | null;
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
    product?: Product;
    productVariant?: ProductVariant;
    warehouse?: Warehouse;
    available_quantity?: number;
}

export interface Payment {
    id: string;
    sale_id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference: string | null;
    notes: string | null;
}

export interface PaymentMethod {
    value: string;
    label: string;
}

export interface DeliveryGuideItem {
    id: string;
    delivery_guide_id: string;
    sale_item_id: string;
    quantity: number;
    sale_item?: SaleItem;
}

export interface DeliveryGuide {
    id: string;
    sale_id: string;
    delivery_number: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    items: DeliveryGuideItem[];
}

export interface ProductVariant {
    id: string;
    product_id: string;
    color_id: number | null;
    size_id: number | null;
    sku: string | null;
    barcode: string | null;
    price: number;
    cost: number;
    quantity: number;
    color?: {
        id: string;
        name: string;
        hex_code: string;
    };
    size?: {
        id: string;
        name: string;
    };
}

export interface Currency {
    code: string;
    name: string;
    symbol: string;
    exchange_rate: number;
    decimal_separator: string;
    thousand_separator: string;
    decimal_places: number;
    is_default?: boolean;
}

export interface TaxRate {
    id: string;
    name: string;
    value: number;
    is_default: boolean;
}

export interface Unit {
    value: string;
    label: string;
}

export interface PageProps {
  auth: {
    user: {
      id: string;
      name: string;
      email: string;
    } | null;
  };
  defaultWarehouse: Warehouse,
  categories: {
    id: string;
    name: string;
    href: string;
  }[] | null;
  currency: {
    code: string;
    name: string;
    symbol: string;
    exchange_rate: number;
    decimal_separator: string;
    thousand_separator: string;
    decimal_places: number;
  };
  flash: {
    success: string | null;
    error: string | null;
  };
}

declare module '@inertiajs/core' {
    interface PageProps extends PageProps, SharedData {}
}
