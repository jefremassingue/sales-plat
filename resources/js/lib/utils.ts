import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  const { currency } = usePage<PageProps>().props;
  
  const formattedPrice = new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.decimal_places,
    maximumFractionDigits: currency.decimal_places,
  }).format(price);

  return formattedPrice.replace('MZN', currency.symbol);
}

export function can(permission: string): boolean {
    const { auth } = usePage<PageProps>().props;
    return auth.user.can?.includes(permission) || false;
}

export function canany(permissions: string[]): boolean {
    const { auth } = usePage<PageProps>().props;
    return permissions.some((permission) => auth.user.can?.includes(permission) ?? false);
}
