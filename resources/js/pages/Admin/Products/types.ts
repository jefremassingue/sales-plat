export interface Category {
    id: number;
    name: string;
}

export interface ProductColor {
    id?: number;
    name: string;
    hex_code: string;
    active: boolean;
    order: number;
    _tempId: string;
}

// ... outras interfaces existentes

export interface ProductFormData {
    name: string;
    slug: string;
    price: string;
    cost: string;
    sku: string;
    barcode: string;
    weight: string;
    stock: string;
    category_id: string;
    active: boolean;
    featured: boolean;
    certification: string;
    warranty: string;
    brand: string;
    origin_country: string;
    currency: string;
}
