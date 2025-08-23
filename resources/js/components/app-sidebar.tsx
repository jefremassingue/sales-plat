import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Building, Calculator, LayoutGrid, ListTree, Package, Settings, Shield, ShoppingCart, Tag, User, UserCog, Warehouse, BookOpen } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems = [
    {
        permissions: [],
        items: [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutGrid,
                activeRoutes: ['dashboard'],
                permission: '',
            },
        ],
    },
    {
        permissions: ['admin-quotation.index', 'admin-sale.index'],
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
                permission: 'admin-quotation.index',
            },
            {
                title: 'Vendas',
                href: '/admin/sales',
                icon: ShoppingCart,
                activeRoutes: ['admin.sales.index', 'admin.sales.create', 'admin.sales.edit', 'admin.sales.show'],
                permission: 'admin-sale.index',
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
        permissions: ['admin-category.index', 'admin-product.index', 'admin-inventory.index', 'admin-brand.index'],
        group: 'Produtos',
        items: [
            {
                title: 'Categorias',
                href: '/admin/categories',
                icon: ListTree,
                activeRoutes: ['admin.categories.index', 'admin.categories.create', 'admin.categories.edit', 'admin.categories.show'],
                permission: 'admin-category.index',
            },
            {
                title: 'Produtos',
                href: '/admin/products',
                icon: Tag,
                activeRoutes: ['admin.products.index', 'admin.products.create', 'admin.products.edit', 'admin.products.show'],
                permission: 'admin-product.index',
            },
            {
                title: 'Marcas',
                href: '/admin/brands',
                icon: Tag,
                activeRoutes: ['admin.brands.index', 'admin.brands.create', 'admin.brands.edit', 'admin.brands.show'],
                permission: 'admin-brand.index',
            },
            {
                title: 'Inventário',
                href: '/admin/inventories',
                icon: Package,
                activeRoutes: ['admin.inventories.index', 'admin.inventories.create', 'admin.inventories.edit', 'admin.inventories.show'],
                permission: 'admin-inventory.index',
            },
        ],
    },
    {
        permissions: ['admin-blogcategory.index', 'admin-blog.index'],
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
                permission: 'admin-blogcategory.index',
            },
            {
                title: 'Blog',
                href: '/admin/blog',
                icon: Tag,
                activeRoutes: ['admin.blog.index', 'admin.blog.create', 'admin.blog.edit', 'admin.blog.show'],
                permission: 'admin-blog.index',
            },
        ],
    },
    {
        permissions: ['admin-catalog.index'],
        group: 'Marketing',
        items: [
            {
                title: 'Catálogos',
                href: '/admin/catalogs',
                icon: BookOpen,
                activeRoutes: ['admin.catalogs.index', 'admin.catalogs.create', 'admin.catalogs.edit'],
                permission: 'admin-catalog.index',
            },
            {
                title: 'Hero Sliders',
                href: '/admin/hero-sliders',
                icon: BookOpen,
                activeRoutes: ['admin.hero-sliders.index', 'admin.hero-sliders.create', 'admin.hero-sliders.edit'],
                permission: 'admin-heroslider.index',
            },
        ],
    },

    {
        permissions: [
            'admin-user.index',
            'admin-role.index',
            'admin-permission.index',
            'admin-sale.index',
            'admin-warehouse.index',
            'admin-supplier.index',
            'admin-sale.index',
            'admin-sale.index',
            'admin-customer.index',
        ],
        group: 'Entidades',
        items: [
            {
                title: 'Utilizadores',
                href: '/admin/users',
                icon: UserCog,
                activeRoutes: ['admin.users.index', 'admin.users.create', 'admin.users.edit', 'admin.users.show'],
                permission: 'admin-user.index',
            },
            {
                title: 'Funções',
                href: '/admin/roles',
                icon: Shield,
                activeRoutes: ['admin.roles.index', 'admin.roles.create', 'admin.roles.edit', 'admin.roles.show'],
                permission: 'admin-role.index',
            },
            {
                title: 'Permissões',
                href: '/admin/permissions',
                icon: Settings,
                activeRoutes: ['admin.permissions.index', 'admin.permissions.create', 'admin.permissions.edit', 'admin.permissions.show'],
                permission: 'admin-permission.index',
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
            // permission: 'admin-sale.index',
            // },

            {
                title: 'Armazéns',
                href: '/admin/warehouses',
                icon: Warehouse,
                activeRoutes: ['admin.warehouses.index', 'admin.warehouses.create', 'admin.warehouses.edit', 'admin.warehouses.show'],
                permission: 'admin-warehouse.index',
            },
            {
                title: 'Fornecedores',
                href: '/admin/suppliers',
                icon: Building,
                activeRoutes: ['admin.suppliers.index', 'admin.suppliers.create', 'admin.suppliers.edit', 'admin.suppliers.show'],
                permission: 'admin-supplier.index',
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
            //     ],
            // permission: 'admin-sale.index',

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
            //     ],
            // permission: 'admin-sale.index',
            // },
            {
                title: 'Clientes',
                href: '/admin/customers',
                icon: User,
                activeRoutes: ['admin.customers.index', 'admin.customers.create', 'admin.customers.edit', 'admin.customers.show'],
                permission: 'admin-customer.index',
            },
        ],
    },
    // {
    // permissions: ['admin-quotation.index', 'admin-sale.index'],
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
    // permission: 'admin-sale.index',
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
    //             ],
    // permission: 'admin-sale.index',

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
        href: 'admin/sales',
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
