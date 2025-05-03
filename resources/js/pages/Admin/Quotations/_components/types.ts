export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  decimal_places: number;
  decimal_separator: string;
  thousand_separator: string;
  is_default: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  name: string;
}

export interface Warehouse {
  id: number;
  name: string;
}

export interface QuotationItem {
  id?: number;
  quotation_id?: number;
  product_id?: number;
  product_variant_id?: number;
  warehouse_id?: number;
  name: string;
  description?: string;
  quantity: number;
  unit?: string;
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
}

export interface Quotation {
  id: number;
  quotation_number: string;
  customer_id?: number;
  user_id?: number;
  issue_date: string;
  expiry_date?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'converted';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  currency_id: number;
  exchange_rate: number;
  notes?: string;
  terms?: string;
  include_tax: boolean;
  converted_to_order_id?: number;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  user?: User;
  currency?: Currency;
  items?: QuotationItem[];
  items_count?: number;
}

export interface TaxRate {
  id: number;
  value: string;
  name: string;
  percentage: number;
  is_default?: boolean;
}

export interface DiscountType {
  value: string;
  label: string;
}

export interface QuotationStatus {
  value: string;
  label: string;
  color?: string;
}
