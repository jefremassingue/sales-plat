import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export function usePermission() {
    const { auth } = usePage<PageProps>().props;

    const can = (permission: string): boolean => {
        return auth.user.can[permission] ?? false;
    };

    const canany = (permissions: string[]): boolean => {
        return permissions.some((permission) => auth.user.can[permission] ?? false);
    };

    return { can, canany };
}
