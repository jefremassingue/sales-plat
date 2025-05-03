// filepath: /Users/macair/projects/laravel/matony/resources/js/pages/Admin/Inventories/_components/types.ts
export interface Product {
    id: number;
    name: string;
    sku: string;
    variants?: ProductVariant[];
}

export interface ProductVariant {
    id: number;
    product_id: number;
    sku: string;
    name: string;
    color?: {
        id: number;
        name: string;
    };
    size?: {
        id: number;
        name: string;
    };
}

export interface Warehouse {
    id: number;
    name: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Supplier {
    id: number;
    name: string;
    company_name?: string;
}

export interface InventoryAdjustment {
    id: number;
    inventory_id: number;
    quantity: number;
    type: 'addition' | 'subtraction' | 'correction' | 'transfer' | 'loss' | 'damaged' | 'expired' | 'initial';
    reference_number: string | null;
    supplier_id: number | null;
    reason: string | null;
    notes: string | null;
    user_id: number;
    created_at: string;
    updated_at: string;
    supplier?: Supplier;
    user?: User;
}

export interface AdjustmentType {
    value: string;
    label: string;
    description: string;
}

export interface Inventory {
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
    status: 'active' | 'reserved' | 'damaged' | 'expired';
    notes: string | null;
    user_id: number | null;
    created_at: string;
    updated_at: string;
    product?: Product;
    productVariant?: ProductVariant;
    warehouse?: Warehouse;
    user?: User;
    adjustments?: InventoryAdjustment[];
}
