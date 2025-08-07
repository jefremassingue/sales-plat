import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { type BreadcrumbItem, Product, Quotation, Sale, PageProps } from '@/types';
import StatCard from './Admin/Dashboard/StatCard';
import { Package, ShoppingCart, Users, Warehouse, User, FileText, Folder } from 'lucide-react';
import RecentSales from './Admin/Dashboard/RecentSales';
import RecentProducts from './Admin/Dashboard/RecentProducts';
import RecentQuotations from './Admin/Dashboard/RecentQuotations';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
];

interface DashboardProps extends PageProps {
    stats: {
        products: number;
        quotations: number;
        sales: number;
        customers: number;
        suppliers: number;
        warehouses: number;
        users: number;
        posts: number;
        categories: number;
    };
    recentProducts: Product[];
    recentQuotations: Quotation[];
    recentSales: Sale[];
}

export default function Dashboard() {
    const { stats, recentProducts, recentQuotations, recentSales } = usePage<DashboardProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                    <StatCard title="Total de Vendas" value={stats.sales.toString()} icon={ShoppingCart} href={route('admin.sales.index')} color="blue" />
                    <StatCard title="Total de Produtos" value={stats.products.toString()} icon={Package} href={route('admin.products.index')} color="green" />
                    <StatCard title="Total de Cotações" value={stats.quotations.toString()} icon={FileText} href={route('admin.quotations.index')} color="yellow" />
                    <StatCard title="Total de Clientes" value={stats.customers.toString()} icon={Users} href={route('admin.customers.index')} color="purple" />
                    <StatCard title="Total de Fornecedores" value={stats.suppliers.toString()} icon={Users} href={route('admin.suppliers.index')} color="pink" />
                    <StatCard title="Total de Armazéns" value={stats.warehouses.toString()} icon={Warehouse} href={route('admin.warehouses.index')} color="red" />
                    <StatCard title="Total de Usuários" value={stats.users.toString()} icon={User} href={route('admin.users.index')} color="indigo" />
                    <StatCard title="Total de Posts" value={stats.posts.toString()} icon={FileText} href={route('admin.blog.index')} color="gray" />
                    <StatCard title="Total de Categorias" value={stats.categories.toString()} icon={Folder} href={route('admin.categories.index')} color="orange" />
                </div>
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <RecentSales sales={recentSales} />
                    </div>
                    <RecentProducts products={recentProducts} />
                </div>
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <RecentQuotations quotations={recentQuotations} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
