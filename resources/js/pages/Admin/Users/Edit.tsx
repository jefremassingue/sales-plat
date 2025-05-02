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
import { BasicInfoTab, RolesTab, Role, User } from './_components';

// Schema de validação do formulário para edição
const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres",
  }),
  email: z.string().email({
    message: "Digite um email válido",
  }),
  password: z.string().min(8, {
    message: "A senha deve ter pelo menos 8 caracteres",
  }).optional().or(z.literal('')),
  password_confirmation: z.string().optional().or(z.literal('')),
  roles: z.array(z.number()).default([]),
}).refine((data) => !data.password || data.password === data.password_confirmation, {
  message: "As senhas não coincidem",
  path: ["password_confirmation"],
});

type FormValues = z.infer<typeof formSchema>;

// Definir as etapas do formulário
type FormStep = 'basic-info' | 'roles';

interface Props {
  user: User;
  roles: Role[];
  userRoles: number[];
}

export default function Edit({ user, roles, userRoles }: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState<FormStep>('basic-info');
  const { errors } = usePage().props as any;

  // Preparar breadcrumbs para a navegação
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Utilizadores',
      href: '/admin/users',
    },
    {
      title: `Editar ${user.name}`,
      href: `/admin/users/${user.id}/edit`,
    },
  ];

  // Inicializar o formulário com os dados do utilizador
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      roles: userRoles,
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

    const fieldsInBasicInfo = ['name', 'email', 'password', 'password_confirmation'];
    const fieldsInRoles = ['roles'];

    let fieldsToCheck: string[] = [];

    if (tab === 'basic-info') fieldsToCheck = fieldsInBasicInfo;
    else if (tab === 'roles') fieldsToCheck = fieldsInRoles;

    return fieldsToCheck.some(field => field in formState.errors);
  };

  // Função para submeter o formulário
  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Atualizar utilizador existente
      router.put(`/admin/users/${user.id}`, values, {
        onSuccess: () => {
          setIsSubmitting(false);
          toast({
            title: "Utilizador atualizado",
            description: "O utilizador foi atualizado com sucesso.",
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
      console.error('Erro ao processar utilizador:', error);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar ${user.name}`} />

      <div className="container px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Editar Utilizador: {user.name}</h1>
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
                  value="roles"
                  className={cn(hasErrorsInTab('roles') && "border-red-500 border")}
                >
                  Funções
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic-info" className="space-y-4">
                <BasicInfoTab form={form as any} isEditMode={true} />
              </TabsContent>

              <TabsContent value="roles" className="space-y-4">
                <RolesTab form={form as any} roles={roles} />
              </TabsContent>
            </Tabs>

            <div className="sticky bottom-0 p-4 border-t shadow-lg flex justify-end items-center mt-8 bg-background">
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
