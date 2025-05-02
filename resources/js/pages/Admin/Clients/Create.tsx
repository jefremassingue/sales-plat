import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { ClientForm } from './_components';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Clientes',
        href: '/admin/clients',
    },
    {
        title: 'Novo Cliente',
        href: '/admin/clients/create',
    },
];

export default function Create() {
    const { toast } = useToast();

    const handleSuccess = (message: string) => {
        toast({
            title: "Cliente criado",
            description: message,
            variant: "success",
        });
    };

    const handleError = (message: string) => {
        toast({
            title: "Erro",
            description: message,
            variant: "destructive",
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Novo Cliente" />

            <div className="container px-4 py-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/clients">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Novo Cliente</h1>
                </div>

                <div className="mt-6">
                    <ClientForm
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
