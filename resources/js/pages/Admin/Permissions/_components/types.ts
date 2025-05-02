export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    roles?: Role[];
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
}

export interface PermissionFormValues {
    name: string;
    guard_name: string;
}
