export interface User {
    id: number;
    name: string;
    email: string;
}

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

export interface WarehouseFormValues {
    name: string;
    code: string | null;
    email: string | null;
    phone: string | null;
    active: boolean;
    is_main: boolean;
    address: string | null;
    city: string | null;
    province: string | null;
    postal_code: string | null;
    country: string;
    manager_id: number | null;
    description: string | null;
}
