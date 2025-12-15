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
    email_verified_at: string;
    employee?: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        commission_rate: number | null;
    };
    avatar?: string;
    created_at: string;
    updated_at: string;
    can: { [key: string]: boolean };
    [key: string]: unknown;
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

export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    read: boolean;
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
    sku?: string;
    unit?: string;
    description?: string;
    main_image?: {
        url: string;
        versions?: Array<{ url: string; version: string }>;
    } | null;
    colors?: Array<{ id: string | number; name: string; hex_code?: string | null; images?: Array<{ id: number; name: string; original_name: string; url: string; version?: string; versions?: Array<{ url: string; version: string }> }> }>;
    sizes?: Array<{ id: string | number; name: string; code?: string | null }>;
    variants?: ProductVariant[];
    [key: string]: unknown;
}

export interface Customer {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
}

export type SaleStatus = 'draft' | 'pending' | 'paid' | 'partial' | 'canceled' | 'overdue' | 'sent' | 'approved' | 'rejected' | 'cancel' | 'cancelled';

export type QuotationStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'converted';

export interface Quotation {
    id: string;
    quotation_number: string;
    customer_id?: string;
    user_id?: string;
    issue_date: string;
    expiry_date?: string;
    status: QuotationStatus;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total: number;
    currency_code: string;
    exchange_rate: number;
    notes?: string;
    terms?: string;
    customer_name?: string; // Kept for compatibility if used
    amount_paid?: string; // Optional if needed for shared components
    customer?: Customer;
    user?: User;
    items?: QuotationItem[];
    [key: string]: unknown;
}

export interface QuotationItem {
    id?: string;
    quotation_id?: string;
    product_id?: string;
    product_variant_id?: string;
    warehouse_id?: string;
    name: string;
    description?: string | null;
    quantity: number;
    unit?: string | null;
    unit_price: number;
    discount_percentage?: number;
    discount_amount?: number;
    tax_percentage?: number;
    tax_amount?: number;
    subtotal?: number;
    total?: number;
    sort_order?: number;
    available_quantity?: number;
    product?: Product;
    productVariant?: ProductVariant;
    warehouse?: Warehouse;
    // flattened optional fields for frontend forms
    product_color_id?: string;
    product_size_id?: string;
}

export interface Sale {
    id: string;
    sale_number: string;
    customer_id: number | null | string;
    user_id: number | null | string;
    issue_date: string;
    due_date: string | null;
    status: SaleStatus;
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
    customer?: Customer;
    user?: User;
    currency?: Currency;
    items: SaleItem[];
    payments?: Payment[];
    delivery_guides: DeliveryGuide[];
    quotation?: {
        id: string;
        quotation_number: string;
        issue_date: string;
    };
    commission_rate?: number;
}

export interface SaleItem {
    id: string;
    sale_id: string;
    product_id: string | null; 
    product_variant_id: string | null;
    warehouse_id: number | null | string;
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
    // flattened optional fields for frontend forms
    product_color_id?: string;
    product_size_id?: string;
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
    label?: string; // Added for frontend compatibility
}

export interface Unit {
    value: string;
    label: string;
}

export interface DiscountType {
    value: string;
    label: string;
}

export interface QuotationStatusOption {
    value: string;
    label: string;
    color?: string;
}

export interface PageProps {
  auth: {
    user: {
      id: string;
      name: string;
      email: string;
      email_verified_at: string;
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
