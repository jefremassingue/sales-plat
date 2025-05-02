import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralDataTab } from './GeneralDataTab';
import { ContactsTab } from './ContactsTab';
import { AddressesTab } from './AddressesTab';
import { AccountNotesTab } from './AccountNotesTab';
import { Client } from './types';

interface ClientFormProps {
    client?: Client;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
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
    create_user: z.boolean().default(false),
    user_email: z.string().email({
        message: "Por favor, insira um email válido",
    }).optional().or(z.literal('')),
    user_password: z.string().min(8, {
        message: "A senha deve ter pelo menos 8 caracteres",
    }).optional(),
});

export type ClientFormValues = z.infer<typeof formSchema>;

// Definir as etapas do formulário
type FormStep = 'dados-gerais' | 'contactos' | 'moradas' | 'conta';

export function ClientForm({ client, onSuccess, onError }: ClientFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentTab, setCurrentTab] = useState<FormStep>('dados-gerais');
    const { errors } = usePage().props as any;
    const isEditMode = !!client;

    // Converter data de nascimento de string para objeto Date, se existir
    const birthDate = client?.birth_date ? new Date(client.birth_date) : null;

    // Inicializar o formulário com dados existentes do cliente ou valores padrão para novo cliente
    const form = useForm<ClientFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: client ? {
            client_type: client.client_type,
            name: client.name,
            company_name: client.company_name || '',
            tax_id: client.tax_id || '',
            email: client.email || '',
            phone: client.phone || '',
            mobile: client.mobile || '',
            website: client.website || '',
            contact_person: client.contact_person || '',
            birth_date: birthDate,
            active: client.active,
            address: client.address || '',
            city: client.city || '',
            province: client.province || '',
            postal_code: client.postal_code || '',
            country: client.country,
            billing_address: client.billing_address || '',
            shipping_address: client.shipping_address || '',
            notes: client.notes || '',
            create_user: !!client.user_id,
            user_email: client.user?.email || '',
            user_password: '',
        } : {
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
            create_user: false,
            user_email: '',
            user_password: '',
        },
        mode: 'onChange'
    });

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
        const fieldsInConta = ['create_user', 'user_email', 'user_password', 'notes'];

        let fieldsToCheck: string[] = [];

        if (tab === 'dados-gerais') fieldsToCheck = fieldsInDadosGerais;
        else if (tab === 'contactos') fieldsToCheck = fieldsInContactos;
        else if (tab === 'moradas') fieldsToCheck = fieldsInMoradas;
        else if (tab === 'conta') fieldsToCheck = fieldsInConta;

        return fieldsToCheck.some(field => field in formState.errors);
    };

    // Função para submeter o formulário com correção para o erro de IO
    function onSubmit(values: ClientFormValues) {
        setIsSubmitting(true);
        try {
            // Conteúdo da submissão
            const submissionData = { ...values };

            // Tratando possíveis erros de serialização com datas
            if (submissionData.birth_date instanceof Date) {
                submissionData.birth_date = submissionData.birth_date.toISOString().split('T')[0];
            }

            if (isEditMode) {
                // Atualizar cliente existente
                router.put(`/admin/clients/${client.id}`, submissionData as any, {
                    onSuccess: () => {
                        setIsSubmitting(false);
                        onSuccess("O cliente foi atualizado com sucesso.");
                    },
                    onError: () => {
                        setIsSubmitting(false);
                        onError("Verifique os erros no formulário.");
                    },
                    preserveState: false // Corrige problemas de estado no localStorage
                });
            } else {
                // Criar novo cliente
                router.post('/admin/clients', submissionData as any, {
                    onSuccess: () => {
                        setIsSubmitting(false);
                        onSuccess("O cliente foi criado com sucesso.");
                    },
                    onError: () => {
                        setIsSubmitting(false);
                        onError("Verifique os erros no formulário.");
                    },
                    preserveState: false // Corrige problemas de estado no localStorage
                });
            }
        } catch (error) {
            setIsSubmitting(false);
            onError("Ocorreu um erro ao processar o pedido.");
            console.error('Erro ao processar cliente:', error);
        }
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as FormStep)}>
                        <TabsList className="grid grid-cols-4 mb-8">
                            <TabsTrigger
                                value="dados-gerais"
                                className={cn(hasErrorsInTab('dados-gerais') && "border-red-500 border")}
                            >
                                Dados Gerais
                            </TabsTrigger>
                            <TabsTrigger
                                value="contactos"
                                className={cn(hasErrorsInTab('contactos') && "border-red-500 border")}
                            >
                                Contactos
                            </TabsTrigger>
                            <TabsTrigger
                                value="moradas"
                                className={cn(hasErrorsInTab('moradas') && "border-red-500 border")}
                            >
                                Moradas
                            </TabsTrigger>
                            <TabsTrigger
                                value="conta"
                                className={cn(hasErrorsInTab('conta') && "border-red-500 border")}
                            >
                                Conta & Notas
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="dados-gerais" className="space-y-4">
                            <GeneralDataTab form={form} />
                        </TabsContent>

                        <TabsContent value="contactos" className="space-y-4">
                            <ContactsTab form={form} />
                        </TabsContent>

                        <TabsContent value="moradas" className="space-y-4">
                            <AddressesTab form={form} />
                        </TabsContent>

                        <TabsContent value="conta" className="space-y-4">
                            <AccountNotesTab form={form} isEditMode={isEditMode} />
                        </TabsContent>
                    </Tabs>

                    <div className="sticky bottom-0 bg-white dark:bg-gray-950 p-4 border-t shadow-lg flex justify-end items-center mt-8">
                        <Button type="submit" disabled={isSubmitting} className="ml-auto">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isEditMode ? 'A guardar...' : 'A criar...'}
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    {isEditMode ? 'Guardar Alterações' : 'Criar Cliente'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
}
