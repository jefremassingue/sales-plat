import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { ClientForm, type Client } from './_components';

interface Props {
    client: Client;
}

export default function Edit({ client }: Props) {
    const { toast } = useToast();

    // Preparar breadcrumbs para a navegação
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
            title: `Editar ${client.name}`,
            href: `/admin/clients/${client.id}/edit`,
        },
    ];

    const handleSuccess = (message: string) => {
        toast({
            title: "Cliente atualizado",
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
            <Head title={`Editar ${client.name}`} />

            <div className="container px-4 py-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/clients/${client.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Editar Cliente: {client.name}</h1>
                </div>

                <div className="mt-6">
                    <ClientForm
                        client={client}
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
