export interface Customer {
  id: string;
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
  id: string;
  name: string;
  email: string;
}

export interface Unit {
  value: string;
  label: string;

}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  unit: string;
  main_image?: {
    url: string;
    versions?: Array<{ url: string; version: string }>;
  } | null;
  // Optional variant-driving attributes
  colors?: Array<{ id: string | number; name: string; hex_code?: string | null; images?: Array<{ id: number; name: string; original_name: string; url: string; version?: string; versions?: Array<{ url: string; version: string }> }> }>;
  sizes?: Array<{ id: string | number; name: string; code?: string | null }>;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku?: string | null;
  name?: string;
  // Links to color/size when applicable
  product_color_id?: string | number | null;
  product_size_id?: string | number | null;
}

export interface Warehouse {
  id: string;
  name: string;
}

export interface QuotationItem {
  id?: string;
  quotation_id?: string;
  product_id?: string;
  product_variant_id?: string;
  warehouse_id?: string;
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
  id: string;
  quotation_number: string;
  customer_id?: string;
  user_id?: string;
  issue_date: string;
  expiry_date?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'converted';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  currency_id: string;
  exchange_rate: number;
  notes?: string;
  terms?: string;
  include_tax: boolean;
  converted_to_order_id?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  user?: User;
  currency?: Currency;
  items?: QuotationItem[];
  items_count?: number;
}

export interface TaxRate {
  id: string;
  value: number;
  label: string;
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
