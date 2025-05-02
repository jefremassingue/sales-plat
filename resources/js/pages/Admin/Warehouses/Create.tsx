import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Importando os componentes de tabs
import { GeneralDataTab, LocationTab, ManagerTab, AdditionalInfoTab } from './_components';
import { User } from './_components/types';

// Schema de validação do formulário
const formSchema = z.object({
  // Dados gerais do armazém
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres",
  }),
  code: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email({
    message: "Por favor, insira um email válido",
  }).optional().nullable(),
  active: z.boolean().default(true),
  is_main: z.boolean().default(false),

  // Localização
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  country: z.string().default('Moçambique'),

  // Gestor
  manager_id: z.number().optional().nullable(),

  // Descrição adicional
  description: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

// Definir as etapas do formulário
type FormStep = 'general-data' | 'location' | 'manager' | 'additional-info';

interface Props {
  users?: User[];
  hasMainWarehouse?: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Armazéns',
    href: '/admin/warehouses',
  },
  {
    title: 'Novo Armazém',
    href: '/admin/warehouses/create',
  },
];

export default function Create({ users = [], hasMainWarehouse = false }: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState<FormStep>('general-data');
  const { errors } = usePage().props as any;

  // Inicializar o formulário com valores padrão
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      phone: '',
      email: '',
      active: true,
      is_main: false,
      address: '',
      city: '',
      province: '',
      postal_code: '',
      country: 'Moçambique',
      manager_id: null,
      description: '',
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

    const fieldsInGeneralData = ['name', 'code', 'email', 'phone', 'active', 'is_main'];
    const fieldsInLocation = ['address', 'city', 'province', 'postal_code', 'country'];
    const fieldsInManager = ['manager_id'];
    const fieldsInAdditionalInfo = ['description'];

    let fieldsToCheck: string[] = [];

    if (tab === 'general-data') fieldsToCheck = fieldsInGeneralData;
    else if (tab === 'location') fieldsToCheck = fieldsInLocation;
    else if (tab === 'manager') fieldsToCheck = fieldsInManager;
    else if (tab === 'additional-info') fieldsToCheck = fieldsInAdditionalInfo;

    return fieldsToCheck.some(field => field in formState.errors);
  };

  // Função para submeter o formulário
  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Criar novo armazém
      router.post('/admin/warehouses', values as any, {
        onSuccess: () => {
          setIsSubmitting(false);
          toast({
            title: "Armazém criado",
            description: "O armazém foi criado com sucesso.",
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
        preserveState: false
      });
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar o pedido.",
        variant: "destructive",
      });
      console.error('Erro ao processar armazém:', error);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Novo Armazém" />

      <div className="container px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/warehouses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Novo Armazém</h1>
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
                  value="location"
                  className={cn(hasErrorsInTab('location') && "border-red-500 border")}
                >
                  Localização
                </TabsTrigger>
                <TabsTrigger
                  value="manager"
                  className={cn(hasErrorsInTab('manager') && "border-red-500 border")}
                >
                  Gestor
                </TabsTrigger>
                <TabsTrigger
                  value="additional-info"
                  className={cn(hasErrorsInTab('additional-info') && "border-red-500 border")}
                >
                  Informações Adicionais
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general-data" className="space-y-4">
                <GeneralDataTab form={form as any} hasMainWarehouse={hasMainWarehouse} />
              </TabsContent>

              <TabsContent value="location" className="space-y-4">
                <LocationTab form={form as any} />
              </TabsContent>

              <TabsContent value="manager" className="space-y-4">
                <ManagerTab form={form as any} users={users} />
              </TabsContent>

              <TabsContent value="additional-info" className="space-y-4">
                <AdditionalInfoTab form={form as any} />
              </TabsContent>
            </Tabs>

            <div className="sticky bottom-0 bg-background p-4 border-t shadow-lg flex justify-end items-center mt-8">
              <Button type="submit" disabled={isSubmitting} className="ml-auto">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A criar...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Criar Armazém
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