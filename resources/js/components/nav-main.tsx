import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { usePermission } from '@/hooks/usePermission';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

interface NavItemExtended extends NavItem {
    activeRoutes?: string[];
}

export function NavMain({ items = [] }: { items: any[] }) {
    const page = usePage();
    const currentUrl = page.url;
    const currentRoute = page.props.route ? page.props.route : '';
    const { can, canany } = usePermission();

    // Função para verificar se um item deve estar ativo
    const isItemActive = (item: NavItemExtended) => {
        // Verificar primeiro se o URL corresponde exatamente
        if (item.href === currentUrl) return true;

        // Depois verificar se alguma das rotas ativas corresponde à rota atual
        if (item.activeRoutes && item.activeRoutes.length > 0) {
            return item.activeRoutes.some((routeName) => currentRoute === routeName);
        }

        return false;
    };

    return (
        <>
            {items.map(
                (section, index) =>
                    (section.permissions?.length == 0 || canany(section.permissions || [])) && (
                        <SidebarGroup key={index} className="px-2 py-0">
                            {section.group && <SidebarGroupLabel>{section.group}</SidebarGroupLabel>}
                            <SidebarMenu>
                                {section.items.map(
                                    (item: NavItemExtended) =>
                                        (!item.permission || can(item.permission || '')) && (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton asChild isActive={isItemActive(item)} tooltip={{ children: item.title }}>
                                                    <Link href={item.href} prefetch>
                                                        {item.icon && <item.icon />}
                                                        <span>{item.title}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ),
                                )}
                            </SidebarMenu>
                        </SidebarGroup>
                    ),
            )}
        </>
    );
}
