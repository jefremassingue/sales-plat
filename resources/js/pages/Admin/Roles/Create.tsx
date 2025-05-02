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
import { BasicInfoTab, PermissionsTab, Permission } from './_components';

// Schema de validação do formulário
const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres",
  }),
  permissions: z.array(z.number()).nonempty({
    message: "Selecione pelo menos uma permissão",
  }),
});

type FormValues = z.infer<typeof formSchema>;

// Definir as etapas do formulário
type FormStep = 'basic-info' | 'permissions';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Funções',
    href: '/admin/roles',
  },
  {
    title: 'Nova Função',
    href: '/admin/roles/create',
  },
];

interface Props {
  permissions: Permission[];
}

export default function Create({ permissions }: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState<FormStep>('basic-info');
  const { errors } = usePage().props as any;

  // Inicializar o formulário com valores padrão
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      permissions: [],
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

    const fieldsInBasicInfo = ['name'];
    const fieldsInPermissions = ['permissions'];

    let fieldsToCheck: string[] = [];

    if (tab === 'basic-info') fieldsToCheck = fieldsInBasicInfo;
    else if (tab === 'permissions') fieldsToCheck = fieldsInPermissions;

    return fieldsToCheck.some(field => field in formState.errors);
  };

  // Função para submeter o formulário
  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Criar nova função
      router.post('/admin/roles', values, {
        onSuccess: () => {
          setIsSubmitting(false);
          toast({
            title: "Função criada",
            description: "A função foi criada com sucesso.",
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
      console.error('Erro ao processar função:', error);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Nova Função" />

      <div className="container px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/roles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Nova Função</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as FormStep)}>
              <TabsList className="grid grid-cols-2 mb-8">
                <TabsTrigger
                  value="basic-info"
                  className={cn(hasErrorsInTab('basic-info') && "border-red-500 border")}
                >
                  Informações Básicas
                </TabsTrigger>
                <TabsTrigger
                  value="permissions"
                  className={cn(hasErrorsInTab('permissions') && "border-red-500 border")}
                >
                  Permissões
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic-info" className="space-y-4">
                <BasicInfoTab form={form as any} />
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4">
                <PermissionsTab form={form as any} permissions={permissions} />
              </TabsContent>
            </Tabs>

            <div className="sticky bottom-0 p-4 border-t shadow-lg flex justify-end items-center mt-8 bg-background">
              <Button type="submit" disabled={isSubmitting} className="ml-auto">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A criar...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Criar Função
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
