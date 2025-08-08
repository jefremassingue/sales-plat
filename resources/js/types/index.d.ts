import { type LucideIcon } from 'lucide-react';
import { type Config } from 'ziggy-js';


export interface Warehouse {
    id: number;
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
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    can: { [key: string]: boolean };
    [key: string]: unknown; // This allows for additional properties...
}

export interface Product {
    id: number;
    name: string;
    price: number;
    [key: string]: unknown;
}

export interface Quotation {
    id: number;
    customer_name: string;
    status: string;
    total_amount: number;
    [key: string]: unknown;
}

export interface Sale {
    id: number;
    customer: { name: string };
    status: string;
    total_amount: number;
    [key: string]: unknown;
}

export interface PageProps {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
    } | null;
  };
  defaultWarehouse: Warehouse,
  categories: {
    id: number;
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
