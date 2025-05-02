export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at?: string;
    updated_at?: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions?: Permission[];
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    roles?: Role[];
}

export interface RoleFormValues {
    name: string;
    permissions: number[];
}
