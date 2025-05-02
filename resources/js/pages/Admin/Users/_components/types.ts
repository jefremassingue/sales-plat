export interface Role {
    id: number;
    name: string;
    guard_name: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    roles?: Role[];
    created_at: string;
    updated_at: string;
}

export interface UserFormValues {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    roles: number[];
}
