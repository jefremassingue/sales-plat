import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AdditionalInfoTab,
    ContactsTab,
    GeneralDataTab,
    PaymentInfoTab,
    SupplierFormValues,
    supplierSchema,
    type User,
} from './_components';

interface Props {
    users: User[];
    errors: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Fornecedores',
        href: '/admin/suppliers',
    },
    {
        title: 'Novo Fornecedor',
        href: '/admin/suppliers/create',
    },
];

export default function Create({ users, errors }: Props) {
    const { toast } = useToast();

    // Valores padrão para o formulário
    const defaultValues: SupplierFormValues = {
        name: '',
        company_name: '',
        tax_id: '',
        email: '',
        phone: '',
        mobile: '',
        website: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        country: 'Mozambique',
        active: true,
        contact_person: '',
        billing_address: '',
        payment_terms: '',
        bank_name: '',
        bank_account: '',
        bank_branch: '',
        supplier_type: 'products',
        credit_limit: null,
        currency: 'MZN',
        notes: '', // Inicializa vazio para o editor
        user_id: null,
    };

    // Configurar formulário com React Hook Form e validação Zod
    const form = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema),
        defaultValues,
    });

    // Configurar os erros vindos do backend
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([key, value]) => {
                form.setError(key as any, {
                    type: 'manual',
                    message: value,
                });
            });

            toast({
                title: 'Erro de validação',
                description: 'Por favor verifique os campos do formulário e corrija os erros.',
                variant: 'destructive',
            });
        }
    }, [errors, form, toast]);

    // Função para lidar com a submissão do formulário
    function onSubmit(data: SupplierFormValues) {
        try {
            router.post('/admin/suppliers', data);
        } catch (error) {
            console.error('Erro ao submeter o formulário:', error);
            toast({
                title: 'Erro',
                description: 'Ocorreu um erro ao criar o fornecedor. Por favor tente novamente.',
                variant: 'destructive',
            });
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Criar Novo Fornecedor" />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="hidden md:flex">
                            <Link href="/admin/suppliers">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">Criar Novo Fornecedor</h1>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="mt-6">
                            <Tabs defaultValue="general" className="w-full">
                                <TabsList className="grid grid-cols-2 md:grid-cols-4">
                                    <TabsTrigger value="general">Dados Gerais</TabsTrigger>
                                    <TabsTrigger value="contacts">Contactos</TabsTrigger>
                                    <TabsTrigger value="payment">Pagamento</TabsTrigger>
                                    <TabsTrigger value="additional">Informações Adicionais</TabsTrigger>
                                </TabsList>

                                <TabsContent value="general">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Dados Gerais</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <GeneralDataTab form={form} users={users} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="contacts">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Informação de Contacto</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ContactsTab form={form} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="payment">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Informação de Pagamento</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <PaymentInfoTab form={form} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="additional">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Informações Adicionais</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <AdditionalInfoTab form={form} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/admin/suppliers">Cancelar</Link>
                            </Button>
                            <Button type="submit">
                                <Save className="mr-2 h-4 w-4" />
                                Guardar Fornecedor
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
