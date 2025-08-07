import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export function usePermission() {
    const { auth } = usePage<PageProps>().props;

    const can = (permission: string): boolean => {

        console.log(permission, auth.user.can.includes(permission));
        
        return auth.user.can.includes(permission);
    };

    const canany = (permissions: string[]): boolean => {

        return permissions.some((permission) => auth.user.can.includes(permission) );
    };

    return { can, canany };
}
