import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Building, Calculator, LayoutGrid, ListTree, Package, Settings, Shield, ShoppingCart, Tag, User, UserCog, Warehouse } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems = [
    {
        items: [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutGrid,
                activeRoutes: ['dashboard'],
            },
        ],
    },
    {
        group: 'Vendas',
        items: [
            // {
            //     title: "Encomendas (Online)",
            //     href: '/admin/orders',
            //     icon: ShoppingBag,
            //     activeRoutes: [
            //         'admin.orders.index',
            //         'admin.orders.create',
            //         'admin.orders.edit',
            //         'admin.orders.show'
            //     ]
            // },
            {
                title: 'Cotações',
                href: '/admin/quotations',
                icon: Calculator,
                activeRoutes: ['admin.quotations.index', 'admin.quotations.create', 'admin.quotations.edit', 'admin.quotations.show'],
            },
            {
                title: 'Vendas',
                href: '/admin/sales',
                icon: ShoppingCart,
                activeRoutes: ['admin.sales.index', 'admin.sales.create', 'admin.sales.edit', 'admin.sales.show'],
            },

            // {
            //     title: 'Devoluções',
            //     href: '/admin/returns',
            //     icon: FileCheck,
            //     activeRoutes: [
            //         'admin.returns.index',
            //         'admin.returns.create',
            //         'admin.returns.edit',
            //         'admin.returns.show'
            //     ]
            // },
        ],
    },
    {
        group: 'Produtos',
        items: [
            {
                title: 'Categorias',
                href: '/admin/categories',
                icon: ListTree,
                activeRoutes: ['admin.categories.index', 'admin.categories.create', 'admin.categories.edit', 'admin.categories.show'],
            },
            {
                title: 'Produtos',
                href: '/admin/products',
                icon: Tag,
                activeRoutes: ['admin.products.index', 'admin.products.create', 'admin.products.edit', 'admin.products.show'],
            },
            {
                title: 'Inventário',
                href: '/admin/inventories',
                icon: Package,
                activeRoutes: ['admin.inventories.index', 'admin.inventories.create', 'admin.inventories.edit', 'admin.inventories.show'],
            },
        ],
    },
    {
        group: 'Blog',
        items: [
            {
                title: 'Categorias',
                href: '/admin/categories',
                icon: ListTree,
                activeRoutes: [
                    'admin.blog-categories.index',
                    'admin.blog-categories.create',
                    'admin.blog-categories.edit',
                    'admin.blog-categories.show',
                ],
            },
            {
                title: 'Blog',
                href: '/admin/blog',
                icon: Tag,
                activeRoutes: ['admin.blog.index', 'admin.blog.create', 'admin.blog.edit', 'admin.blog.show'],
            },
        ],
    },

    {
        group: 'Entidades',
        items: [
            {
                title: 'Utilizadores',
                href: '/admin/users',
                icon: UserCog,
                activeRoutes: ['admin.users.index', 'admin.users.create', 'admin.users.edit', 'admin.users.show'],
            },
            {
                title: 'Funções',
                href: '/admin/roles',
                icon: Shield,
                activeRoutes: ['admin.roles.index', 'admin.roles.create', 'admin.roles.edit', 'admin.roles.show'],
            },
            {
                title: 'Permissões',
                href: '/admin/permissions',
                icon: Settings,
                activeRoutes: ['admin.permissions.index', 'admin.permissions.create', 'admin.permissions.edit', 'admin.permissions.show'],
            },
            // {
            //     title: 'Funcionários',
            //     href: '/admin/employees',
            //     icon: UserCircle,
            //     activeRoutes: [
            //         'admin.employees.index',
            //         'admin.employees.create',
            //         'admin.employees.edit',
            //         'admin.employees.show'
            //     ]
            // },

            {
                title: 'Armazéns',
                href: '/admin/warehouses',
                icon: Warehouse,
                activeRoutes: ['admin.warehouses.index', 'admin.warehouses.create', 'admin.warehouses.edit', 'admin.warehouses.show'],
            },
            {
                title: 'Fornecedores',
                href: '/admin/suppliers',
                icon: Building,
                activeRoutes: ['admin.suppliers.index', 'admin.suppliers.create', 'admin.suppliers.edit', 'admin.suppliers.show'],
            },
            // {
            //     title: 'Transportadoras',
            //     href: '/admin/carriers',
            //     icon: Truck,
            //     activeRoutes: [
            //         'admin.carriers.index',
            //         'admin.carriers.create',
            //         'admin.carriers.edit',
            //         'admin.carriers.show'
            //     ]
            // },
            // {
            //     title: 'Parceiros',
            //     href: '/admin/partners',
            //     icon: Store,
            //     activeRoutes: [
            //         'admin.partners.index',
            //         'admin.partners.create',
            //         'admin.partners.edit',
            //         'admin.partners.show'
            //     ]
            // },
            {
                title: 'Clientes',
                href: '/admin/customers',
                icon: User,
                activeRoutes: ['admin.customers.index', 'admin.customers.create', 'admin.customers.edit', 'admin.customers.show'],
            },
        ],
    },
    // {
    //     group: 'Gestão',
    //     items: [
    //         // {
    //         //     title: 'Configurações',
    //         //     href: '/admin/settings',
    //         //     icon: Settings,
    //         //     activeRoutes: [
    //         //         'admin.settings.index',
    //         //         'admin.settings.create',
    //         //         'admin.settings.edit',
    //         //         'admin.settings.show'
    //         //     ]
    //         // },
    //         {
    //             title: 'Relatórios',
    //             href: '/admin/reports',
    //             icon: BarChart,
    //             activeRoutes: [
    //                 'admin.reports.index',
    //                 'admin.reports.create',
    //                 'admin.reports.edit',
    //                 'admin.reports.show'
    //             ]
    //         },
    //     ]
    // }
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    {
        title: 'PDV',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: ShoppingCart,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
