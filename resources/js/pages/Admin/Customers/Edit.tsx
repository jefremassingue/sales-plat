import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Importando os componentes de tabs
import { GeneralDataTab } from './_components/GeneralDataTab';
import { ContactsTab } from './_components/ContactsTab';
import { AddressesTab } from './_components/AddressesTab';
import { AccountNotesTab } from './_components/AccountNotesTab';
import { Customer, User } from './_components/types';

interface Props {
    customer: Customer;
}

// Schema de validação do formulário
const formSchema = z.object({
    // Dados do cliente
    client_type: z.enum(['individual', 'company'], {
        required_error: "Por favor, selecione o tipo de cliente",
    }),
    name: z.string().min(2, {
        message: "O nome deve ter pelo menos 2 caracteres",
    }),
    company_name: z.string().optional(),
    tax_id: z.string().optional(),
    email: z.string().email({
        message: "Por favor, insira um email válido",
    }).optional().or(z.literal('')),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    website: z.string().optional(),
    contact_person: z.string().optional(),
    birth_date: z.date().optional().nullable(),
    active: z.boolean().default(true),

    // Endereço
    address: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().default('Moçambique'),
    billing_address: z.string().optional(),
    shipping_address: z.string().optional(),

    // Notas
    notes: z.string().optional(),

    // Dados do utilizador (opcional)
    connect_user: z.boolean().default(false),
    user_id: z.number().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

// Definir as etapas do formulário
type FormStep = 'general-data' | 'contacts' | 'addresses' | 'account';

export default function Edit({ customer }: Props) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentTab, setCurrentTab] = useState<FormStep>('general-data');
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(customer.user || null);
    const [isSearching, setIsSearching] = useState(false);
    const { errors } = usePage().props as any;

    // Converter data de nascimento de string para objeto Date, se existir
    const birthDate = customer?.birth_date ? new Date(customer.birth_date) : null;

    // Preparar breadcrumbs para a navegação
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Clientes',
            href: '/admin/customers',
        },
        {
            title: `Editar ${customer.name}`,
            href: `/admin/customers/${customer.id}/edit`,
        },
    ];

    // Inicializar o formulário com dados do cliente
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            client_type: customer.client_type,
            name: customer.name,
            company_name: customer.company_name || '',
            tax_id: customer.tax_id || '',
            email: customer.email || '',
            phone: customer.phone || '',
            mobile: customer.mobile || '',
            website: customer.website || '',
            contact_person: customer.contact_person || '',
            birth_date: birthDate,
            active: customer.active,
            address: customer.address || '',
            city: customer.city || '',
            province: customer.province || '',
            postal_code: customer.postal_code || '',
            country: customer.country,
            billing_address: customer.billing_address || '',
            shipping_address: customer.shipping_address || '',
            notes: customer.notes || '',
            connect_user: !!customer.user_id,
            user_id: customer.user_id || null,
        },
        mode: 'onChange'
    });

    // Monitorar mudanças no tipo de cliente e conexão de utilizador
    const clientType = form.watch('client_type');
    const connectUser = form.watch('connect_user');

    // Mapear erros do Laravel para os erros do formulário
    useEffect(() => {
        if (errors) {
            Object.keys(errors).forEach(key => {
                form.setError(key as any, {
                    type: 'manual',
                    message: errors[key],
                });
            });
        }
    }, [errors, form]);

    // Verificar se tem erros na etapa atual
    const hasErrorsInTab = (tab: FormStep): boolean => {
        const formState = form.formState;

        if (!formState.errors || Object.keys(formState.errors).length === 0) {
            return false;
        }

        const fieldsInGeneralData = ['client_type', 'name', 'company_name', 'email', 'tax_id', 'active'];
        const fieldsInContacts = ['phone', 'mobile', 'website', 'contact_person', 'birth_date'];
        const fieldsInAddresses = ['address', 'city', 'province', 'postal_code', 'country', 'billing_address', 'shipping_address'];
        const fieldsInAccount = ['connect_user', 'user_id', 'notes'];

        let fieldsToCheck: string[] = [];

        if (tab === 'general-data') fieldsToCheck = fieldsInGeneralData;
        else if (tab === 'contacts') fieldsToCheck = fieldsInContacts;
        else if (tab === 'addresses') fieldsToCheck = fieldsInAddresses;
        else if (tab === 'account') fieldsToCheck = fieldsInAccount;

        return fieldsToCheck.some(field => field in formState.errors);
    };

    // Função para buscar utilizadores pelo termo de pesquisa
    const searchUsers = async (term: string) => {
        if (!term || term.length < 2) return;

        setIsSearching(true);
        try {
            const response = await fetch(`/api/users/search?term=${encodeURIComponent(term)}`);
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Erro ao buscar utilizadores:', error);
            toast({
                title: "Erro",
                description: "Não foi possível buscar utilizadores",
                variant: "destructive",
            });
        } finally {
            setIsSearching(false);
        }
    };

    // Função para selecionar um utilizador
    const selectUser = (user: User) => {
        setSelectedUser(user);
        form.setValue('user_id', user.id);
    };

    // Função para submeter o formulário
    const onSubmit = (values: FormValues) => {
        setIsSubmitting(true);
        try {
            // Conteúdo da submissão
            const submissionData = { ...values };

            // Tratando possíveis erros de serialização com datas
            if (submissionData.birth_date instanceof Date) {
                submissionData.birth_date = submissionData.birth_date.toISOString().split('T')[0];
            }

            // Atualizar cliente existente
            router.put(`/admin/customers/${customer.id}`, submissionData as any, {
                onSuccess: () => {
                    setIsSubmitting(false);
                    toast({
                        title: "Cliente atualizado",
                        description: "O cliente foi atualizado com sucesso.",
                        variant: "success",
                    });
                },
                onError: () => {
                    setIsSubmitting(false);
                    toast({
                        title: "Erro",
                        description: "Verifique os erros no formulário.",
                        variant: "destructive",
                    });
                },
                preserveState: false // Corrige problemas de estado no localStorage
            });
        } catch (error) {
            setIsSubmitting(false);
            toast({
                title: "Erro",
                description: "Ocorreu um erro ao processar o pedido.",
                variant: "destructive",
            });
            console.error('Erro ao processar cliente:', error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${customer.name}`} />

            <div className="container px-4 py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/customers/${customer.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Editar Cliente: {customer.name}</h1>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as FormStep)}>
                            <TabsList className="grid grid-cols-4 mb-8">
                                <TabsTrigger
                                    value="general-data"
                                    className={cn(hasErrorsInTab('general-data') && "border-red-500 border")}
                                >
                                    Dados Gerais
                                </TabsTrigger>
                                <TabsTrigger
                                    value="contacts"
                                    className={cn(hasErrorsInTab('contacts') && "border-red-500 border")}
                                >
                                    Contactos
                                </TabsTrigger>
                                <TabsTrigger
                                    value="addresses"
                                    className={cn(hasErrorsInTab('addresses') && "border-red-500 border")}
                                >
                                    Moradas
                                </TabsTrigger>
                                <TabsTrigger
                                    value="account"
                                    className={cn(hasErrorsInTab('account') && "border-red-500 border")}
                                >
                                    Conta & Notas
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="general-data" className="space-y-4">
                                <GeneralDataTab form={form as any} />
                            </TabsContent>

                            <TabsContent value="contacts" className="space-y-4">
                                <ContactsTab form={form as any} />
                            </TabsContent>

                            <TabsContent value="addresses" className="space-y-4">
                                <AddressesTab form={form as any} />
                            </TabsContent>

                            <TabsContent value="account" className="space-y-4">
                                <AccountNotesTab form={form as any} isEditMode={true} />
                            </TabsContent>
                        </Tabs>

                        <div className="sticky bottom-0  p-4 border-t shadow-lg flex justify-end items-center mt-8">
                            <Button type="submit" disabled={isSubmitting} className="ml-auto">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        A guardar...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Guardar Alterações
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
