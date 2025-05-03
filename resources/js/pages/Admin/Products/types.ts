export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  subcategories?: Category[];
}

export interface ProductColor {
  id: number;
  name: string;
  hex_code: string | null;
  active: boolean;
  order: number;
  _tempId?: string;
}

export interface ProductSize {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  available: boolean;
  order: number;
  _tempId?: string;
}

export interface ProductAttribute {
  id: number;
  name: string;
  value: string;
  description: string | null;
  type: string;
  filterable: boolean;
  visible: boolean;
  order: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  product_color_id: number | null;
  product_size_id: number | null;
  sku: string | null;
  price: number | null;
  stock: number;
  active: boolean;
  color?: ProductColor;
  size?: ProductSize;
  _tempId?: string;
}

export interface Image {
  id: number;
  path: string;
  name: string;
  original_name: string;
  extension: string;
  size: number;
  is_main: boolean;
}

export interface Warehouse {
  id: number;
  name: string;
}

export interface InventoryItem {
  id: number;
  product_id: number;
  product_variant_id: number | null;
  warehouse_id: number;
  quantity: number;
  min_quantity: number;
  max_quantity: number | null;
  location: string | null;
  batch_number: string | null;
  expiry_date: string | null;
  unit_cost: number | null;
  status: "active" | "reserved" | "damaged" | "expired";
  notes: string | null;
  warehouse?: Warehouse;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  technical_details: string | null;
  features: string | null;
  price: number | null;
  cost: number | null;
  sku: string | null;
  barcode: string | null;
  weight: number | null;
  category_id: number;
  active: boolean;
  featured: boolean;
  certification: string | null;
  warranty: string | null;
  brand: string | null;
  origin_country: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  mainImage?: Image;
  images?: Image[];
  colors?: ProductColor[];
  sizes?: ProductSize[];
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  inventories?: InventoryItem[];
  total_stock?: number;
  inventory_price?: number;
}
