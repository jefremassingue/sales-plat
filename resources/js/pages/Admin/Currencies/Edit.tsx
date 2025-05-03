import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Currency } from './_components/types';

interface Props {
  currency: Currency;
}

const formSchema = z.object({
  code: z.string().min(1, "O código é obrigatório").max(3, "O código deve ter no máximo 3 caracteres"),
  name: z.string().min(1, "O nome é obrigatório"),
  symbol: z.string().min(1, "O símbolo é obrigatório"),
  exchange_rate: z.string().min(1, "A taxa de câmbio é obrigatória")
    .refine(val => !isNaN(parseFloat(val)), { message: "A taxa deve ser um valor numérico válido" })
    .refine(val => parseFloat(val) > 0, { message: "A taxa deve ser maior que zero" }),
  is_default: z.boolean().default(false),
  is_active: z.boolean().default(true),
  decimal_separator: z.string().min(1, "O separador decimal é obrigatório").max(1, "Digite apenas um caractere"),
  thousand_separator: z.string().min(1, "O separador de milhares é obrigatório").max(1, "Digite apenas um caractere"),
  decimal_places: z.string()
    .min(1, "O número de casas decimais é obrigatório")
    .refine(val => !isNaN(parseInt(val)), { message: "Deve ser um número válido" })
    .refine(val => parseInt(val) >= 0 && parseInt(val) <= 4, { message: "Deve estar entre 0 e 4" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Edit({ currency }: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors } = usePage().props as any;

  // Breadcrumbs dinâmicos
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Moedas',
      href: '/admin/currencies',
    },
    {
      title: currency.name,
      href: `/admin/currencies/${currency.id}`,
    },
    {
      title: 'Editar',
      href: `/admin/currencies/${currency.id}/edit`,
    },
  ];

  // Inicializar o formulário com valores existentes
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      exchange_rate: currency.exchange_rate.toString(),
      is_default: currency.is_default,
      is_active: currency.is_active,
      decimal_separator: currency.decimal_separator,
      thousand_separator: currency.thousand_separator,
      decimal_places: currency.decimal_places.toString(),
    },
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

  // Preview da formatação da moeda
  const formatPreview = () => {
    const values = form.getValues();
    const symbol = values.symbol || '?';
    const decimalSeparator = values.decimal_separator || ',';
    const thousandSeparator = values.thousand_separator || '.';
    const decimalPlaces = parseInt(values.decimal_places) || 2;

    const value = 1234567.89;
    const formattedValue = new Intl.NumberFormat('pt-PT', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(value).replace(/\./g, '#').replace(/,/g, '$')
      .replace(/#/g, thousandSeparator)
      .replace(/\$/g, decimalSeparator);

    return `${symbol} ${formattedValue}`;
  };

  // Função para submeter o formulário
  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);

    // Converter tipos de dados
    const data = {
      ...values,
      exchange_rate: parseFloat(values.exchange_rate),
      decimal_places: parseInt(values.decimal_places),
      _method: 'PUT',
    };

    router.post(`/admin/currencies/${currency.id}`, data, {
      onSuccess: () => {
        setIsSubmitting(false);
        toast({
          title: "Moeda atualizada",
          description: "A moeda foi atualizada com sucesso.",
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
      }
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar Moeda - ${currency.name}`} />

      <div className="container px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/currencies">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Editar Moeda</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Moeda</CardTitle>
                  <CardDescription>
                    Edite os dados básicos da moeda
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código da Moeda <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: MZN, USD, EUR" {...field} />
                          </FormControl>
                          <FormDescription>
                            Código ISO de 3 letras (ex: MZN)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Nome <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Metical Moçambicano" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="symbol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Símbolo <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: MT, $, €" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="exchange_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxa de Câmbio <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input type="number" step="0.0001" min="0.0001" {...field} />
                          </FormControl>
                          <FormDescription>
                            Taxa de câmbio em relação à moeda padrão
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="is_default"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Moeda Padrão</FormLabel>
                            <FormDescription>
                              Definir como moeda padrão do sistema
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={currency.is_default}
                            />
                          </FormControl>
                          {currency.is_default && (
                            <FormDescription className="mt-0">
                              Esta é a moeda padrão atual
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Moeda Ativa</FormLabel>
                            <FormDescription>
                              Ativar ou desativar esta moeda no sistema
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={currency.is_default}
                            />
                          </FormControl>
                          {currency.is_default && (
                            <FormDescription className="mt-0">
                              A moeda padrão não pode ser desativada
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Formatação</CardTitle>
                  <CardDescription>
                    Configure como os valores monetários serão apresentados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="decimal_separator"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Separador Decimal <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input maxLength={1} {...field} />
                          </FormControl>
                          <FormDescription>
                            Caractere usado para separar decimais (tipicamente "," ou ".")
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="thousand_separator"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Separador de Milhares <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input maxLength={1} {...field} />
                          </FormControl>
                          <FormDescription>
                            Caractere usado para separar milhares (tipicamente "." ou ",")
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="decimal_places"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Casas Decimais <span className="text-destructive">*</span></FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o número de casas decimais" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">0 (Sem casas decimais)</SelectItem>
                            <SelectItem value="1">1 casa decimal</SelectItem>
                            <SelectItem value="2">2 casas decimais</SelectItem>
                            <SelectItem value="3">3 casas decimais</SelectItem>
                            <SelectItem value="4">4 casas decimais</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Número de casas decimais a exibir
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <div className="font-medium mb-2">Exemplo de Formatação:</div>
                    <div className="text-xl font-mono bg-muted p-4 rounded-md text-center">
                      {formatPreview()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="sticky bottom-0 p-4 bg-background border-t shadow-lg flex justify-end items-center mt-8">
              <Button variant="outline" asChild className="mr-2">
                <Link href="/admin/currencies">
                  Cancelar
                </Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A guardar...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Guardar Moeda
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
