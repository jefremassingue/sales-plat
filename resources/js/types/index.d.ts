import { type LucideIcon } from 'lucide-react';
import { type Config } from 'ziggy-js';

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

export interface PageProps {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
    } | null;
  };
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
