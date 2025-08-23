import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ContactMessage } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Trash } from 'lucide-react';

interface Props {
    message: ContactMessage;
}

export default function Show({ message }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Mensagens de Contato',
            href: '/admin/contact-messages',
        },
        {
            title: message.subject,
            href: `/admin/contact-messages/${message.id}`,
        },
    ];

    function destroy(message: ContactMessage) {
        if (confirm('Tem certeza que deseja remover esta mensagem?')) {
            router.delete(route('admin.contact-messages.destroy', message.id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={message.subject} />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={route('admin.contact-messages.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">{message.subject}</h1>
                    </div>
                    <Button variant="destructive" onClick={() => destroy(message)}>
                        <Trash className="h-4 w-4 mr-2" />
                        Eliminar
                    </Button>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Detalhes da Mensagem</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Nome</h3>
                            <p>{message.name}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Email</h3>
                            <p>{message.email}</p>
                        </div>
                        {message.phone && (
                            <div>
                                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Telefone</h3>
                                <p>{message.phone}</p>
                            </div>
                        )}
                        <div>
                            <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Assunto</h3>
                            <p>{message.subject}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Mensagem</h3>
                            <p>{message.message}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Data de Envio</h3>
                            <p>{new Date(message.created_at).toLocaleDateString()} {new Date(message.created_at).toLocaleTimeString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
