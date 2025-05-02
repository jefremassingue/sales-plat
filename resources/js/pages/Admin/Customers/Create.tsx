import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { User } from './_components/types';

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
        title: 'Novo Cliente',
        href: '/admin/customers/create',
    },
];

export default function Create() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentTab, setCurrentTab] = useState<FormStep>('general-data');
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const { errors } = usePage().props as any;

    // Inicializar o formulário com valores padrão
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            client_type: 'individual',
            name: '',
            company_name: '',
            tax_id: '',
            email: '',
            phone: '',
            mobile: '',
            website: '',
            contact_person: '',
            birth_date: null,
            active: true,
            address: '',
            city: '',
            province: '',
            postal_code: '',
            country: 'Moçambique',
            billing_address: '',
            shipping_address: '',
            notes: '',
            connect_user: false,
            user_id: null,
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

        const fieldsInDadosGerais = ['client_type', 'name', 'company_name', 'email', 'tax_id', 'active'];
        const fieldsInContactos = ['phone', 'mobile', 'website', 'contact_person', 'birth_date'];
        const fieldsInMoradas = ['address', 'city', 'province', 'postal_code', 'country', 'billing_address', 'shipping_address'];
        const fieldsInConta = ['connect_user', 'user_id', 'notes'];

        let fieldsToCheck: string[] = [];

        if (tab === 'general-data') fieldsToCheck = fieldsInDadosGerais;
        else if (tab === 'contacts') fieldsToCheck = fieldsInContactos;
        else if (tab === 'addresses') fieldsToCheck = fieldsInMoradas;
        else if (tab === 'account') fieldsToCheck = fieldsInConta;

        return fieldsToCheck.some(field => field in formState.errors);
    };

    // Função para buscar utilizadores pelo termo de pesquisa
    const searchUsers = async (term: string) => {
        if (!term || term.length < 2) return;

        setIsSearching(true);
        try {
            // O caminho correto para a API de busca de utilizadores
            const response = await fetch(`/admin/api/users/search?term=${encodeURIComponent(term)}`);
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
            // Preparar os dados para submissão
            const submissionData = { ...values };

            // Tratando datas para evitar erros de serialização
            if (submissionData.birth_date instanceof Date) {
                submissionData.birth_date = submissionData.birth_date.toISOString().split('T')[0];
            }

            // Criar novo cliente
            router.post('/admin/customers', submissionData as any, {
                onSuccess: () => {
                    setIsSubmitting(false);
                    toast({
                        title: "Cliente criado",
                        description: "O cliente foi criado com sucesso.",
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
            <Head title="Novo Cliente" />

            <div className="container px-4 py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/customers">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Novo Cliente</h1>
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
                                <AccountNotesTab form={form as any} isEditMode={false} />
                            </TabsContent>
                        </Tabs>

                        <div className="sticky bottom-0 p-4 border-t shadow-lg flex justify-end items-center mt-8">
                            <Button type="submit" disabled={isSubmitting} className="ml-auto">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        A criar...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Criar Cliente
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
