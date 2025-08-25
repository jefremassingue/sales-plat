import { Head, Link, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { z } from 'zod';

// Layouts e Contextos
import { useCart } from '@/contexts/CartContext';
import SiteLayout from '@/layouts/site-layout';

// UI Components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

// Icons
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, Loader2, Package, ShoppingBag, User } from 'lucide-react';

// ===== TYPES & INTERFACES =====
interface InputFieldProps {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string | null;
}

type FormData = {
    fullName: string;
    phone: string;
    email: string;
    companyName: string;
    neighborhood: string;
    streetAndNumber: string;
    notes: string;
    paymentMethod?: string | null;
    items?: Array<{
        product_id: string;
        product_variant_id?: string | null;
        color_id?: string | null;
        size_id?: string | null;
        variant_sku?: string | null;
        quantity: number;
        name: string;
    }>;
    _token?: string;
};

// ===== VALIDATION SCHEMA =====
// const phoneRegex = /^(?:\+?258\s?)?(8[2-7])\s?(\d{3})\s?(\d{4})$/;

const quotationSchema = z.object({
    fullName: z.string().min(3, 'Nome completo deve ter pelo menos 3 caracteres.').max(100, 'Nome muito longo.'),
    phone: z.string().optional(),
    email: z.string().email('Formato de email inválido.'),
    city: z.string().min(2, 'Cidade é obrigatória.').optional().or(z.literal('')),
    neighborhood: z.string().min(3, 'Bairro é obrigatório.').optional().or(z.literal('')),
    streetAndNumber: z.string().min(5, 'Endereço (rua e número) é obrigatório e deve ter pelo menos 5 caracteres.').optional().or(z.literal('')),
    notes: z.string().max(500, 'Notas não podem exceder 500 caracteres.').optional(),
    paymentMethod: z.string().optional().or(z.literal('')),
});

// ===== REUSABLE COMPONENTS =====
const InputField: React.FC<InputFieldProps> = ({ label, name, type = 'text', placeholder, value, onChange, error }) => (
    <div className="space-y-2">
        <Label htmlFor={name} className="text-sm font-medium text-gray-700">
            {label}
        </Label>
        <Input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={
                error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
            }
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

// ===== EMPTY CART COMPONENT =====
const EmptyCartView: React.FC = () => (
    <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-300" />
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Seu carrinho está vazio</h1>
        <p className="mb-8 text-gray-600">Adicione produtos ao carrinho para solicitar uma cotação.</p>
        <Link
            href="/products"
            className="inline-flex items-center rounded-md border border-transparent bg-orange-600 px-6 py-3 text-base font-medium text-white hover:bg-orange-700"
        >
            <ArrowLeft className="mr-2 h-5 w-5" /> Ir para Produtos
        </Link>
    </div>
);

// ===== SUCCESS ORDER COMPONENT =====
interface SuccessOrderViewProps {
    data: FormData;
    orderId: string | null;
}

const SuccessOrderView: React.FC<SuccessOrderViewProps> = ({ data, orderId }) => (
    <div className="container mx-auto px-4 py-16 text-center">
        <CheckCircle className="mx-auto mb-6 h-20 w-20 text-green-500" />
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Cotação Solicitada!</h1>
        <p className="mb-2 text-gray-700">Obrigado, {data.fullName.split(' ')[0]}.</p>
        {orderId && (
            <p className="mb-6 text-gray-700">
                Número da cotação: <span className="font-semibold text-orange-600">{orderId}</span>
            </p>
        )}
        <p className="mb-4 text-gray-600">
            Em breve entraremos em contacto através de <span className="font-semibold">{data.email}</span> ou telefone para confirmar detalhes.
        </p>
        <p className="mb-8 text-sm text-gray-500">(Guarde o número da sua cotação para referência.)</p>
        <div className="flex justify-center space-x-4">
            <Link
                href="/products"
                className="inline-flex items-center rounded-md border border-transparent bg-orange-600 px-6 py-3 text-base font-medium text-white hover:bg-orange-700"
            >
                <ShoppingBag className="mr-2 h-5 w-5" /> Ver mais Produtos
            </Link>
        </div>
    </div>
);

// ===== MAIN CHECKOUT COMPONENT =====
const CheckoutContent: React.FC = () => {
    // ===== HOOKS =====
    const { items, itemCount, clearCart } = useCart();
    const { toast } = useToast();
    const { data, setData, errors, setError, clearErrors, reset } = useForm<FormData>({
        fullName: '',
        phone: '',
        email: '',
        companyName: '',
        neighborhood: '',
        streetAndNumber: '',
        notes: '',
    });

    // ===== STATE =====
    const [selectedPaymentMethodId] = useState(''); // sem seleção de método no MVP
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ===== EVENT HANDLERS =====
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setData(name as keyof FormData, value as never);
        if (errors[name as keyof FormData]) {
            clearErrors(name as keyof FormData);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        const dataToValidate = {
            ...data,
            paymentMethod: selectedPaymentMethodId || undefined,
        };

        const validationResult = quotationSchema.safeParse(dataToValidate);

        if (!validationResult.success) {
            validationResult.error.errors.forEach((err: z.ZodIssue) => {
                if (err.path.length > 0) {
                    setError(err.path[0] as keyof FormData, err.message);
                }
            });

            // Focar no primeiro campo com erro
            const firstErrorKey = validationResult.error.errors[0]?.path?.[0] as string | undefined;
            if (firstErrorKey) {
                const errorElement = document.getElementsByName(firstErrorKey)[0];
                if (errorElement) errorElement.focus();
            }
            window.scrollTo(0, 0);
            return;
        }

        // Enviar para backend para criar cotação
        const postUrl = route('quotation.store');

        setIsSubmitting(true);

        // Usar router.post diretamente com todos os dados
        router.post(
            postUrl,
            {
                ...data,
                paymentMethod: selectedPaymentMethodId || null,
                items: items.map((i) => {
                    const baseName = i.name;
                    const colorName = i.color_name;
                    const sizeName = i.size_name;
                    let optSuffix = '';
                    if (colorName && sizeName) optSuffix = ` (Cor: ${colorName} / T: ${sizeName})`;
                    else if (colorName) optSuffix = ` (Cor: ${colorName})`;
                    else if (sizeName) optSuffix = ` (T: ${sizeName})`;
                    const skuPart = i.variant_sku ? ` [SKU: ${i.variant_sku}]` : '';
                    const formattedName = `${baseName}${optSuffix}${skuPart}`;
                    return {
                        product_id: i.id,
                        product_variant_id: i.variant_id,
                        color_id: i.color_id ?? null,
                        size_id: i.size_id ?? null,
                        variant_sku: i.variant_sku ?? null,
                        quantity: i.quantity,
                        name: formattedName,
                    };
                }),
            },
            {
                onSuccess: (page: unknown) => {
                    type InertiaLike = { props?: { flash?: Record<string, unknown>; quotation_number?: unknown } };
                    const inertiaPage = page as InertiaLike;
                    const qn = (inertiaPage.props?.flash?.quotation_number as string) || (inertiaPage.props?.quotation_number as string);
                    setOrderId(typeof qn === 'string' ? qn : null);
                    setOrderPlaced(true);
                    clearCart();
                    reset();
                    setIsSubmitting(false);
                    window.scrollTo(0, 0);
                },
                onError: (errors: Record<string, string>) => {
                    console.log('Errors:', errors);
                    setIsSubmitting(false);
                    window.scrollTo(0, 0);
                },
            },
        );
    };

    // ===== EFFECTS =====
    useEffect(() => {
        type FlashStruct = { toast?: { title?: string; description?: string }; success?: string; quotation_number?: string };
        const globalPage = (window as unknown as { __INERTIA_PAGE__?: { props?: { flash?: FlashStruct } } }).__INERTIA_PAGE__;
        const flash: FlashStruct | undefined = globalPage?.props?.flash;

        if (flash?.toast) {
            toast({
                title: flash.toast.title || 'Sucesso',
                description: flash.toast.description,
            });
        } else if (flash?.success) {
            toast({
                title: 'Sucesso',
                description: flash.success,
            });
        }
    }, [toast]);

    // ===== CONDITIONAL RENDERS =====
    if (itemCount === 0 && !orderPlaced) {
        return <EmptyCartView />;
    }

    if (orderPlaced) {
        return <SuccessOrderView data={data} orderId={orderId} />;
    }

    // ===== MAIN FORM RENDER =====
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6 flex items-center">
                <Link href="/cart" className="flex items-center text-orange-600 hover:text-orange-700">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Voltar a Cotação
                </Link>
            </div>

            <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 md:text-left">Solicitar Cotação</h1>

            {/* Error Messages */}
            {Object.keys(errors).length > 0 && (
                <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium">Por favor, corrija os erros indicados abaixo.</h3>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                    {/* Form Column */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* Customer Information Section */}
                        <section className="rounded-lg bg-white p-6 shadow-sm">
                            <h2 className="mb-6 flex items-center border-b pb-3 text-xl font-semibold text-gray-800">
                                <User className="mr-3 h-6 w-6 text-orange-600" />
                                Informações do cliente
                            </h2>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <InputField
                                    label="Nome Completo"
                                    name="fullName"
                                    value={data.fullName}
                                    onChange={handleChange}
                                    error={errors.fullName || null}
                                    placeholder="Seu nome completo"
                                />
                                <InputField
                                    label="Nome Da empresa"
                                    name="companyName"
                                    value={data.companyName}
                                    onChange={handleChange}
                                    error={errors.companyName || null}
                                    placeholder="Nome da empresa"
                                />
                                <InputField
                                    label="Telefone"
                                    name="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={handleChange}
                                    error={errors.phone || null}
                                    placeholder="8X XXX XXXX"
                                />
                                <InputField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={data.email}
                                    onChange={handleChange}
                                    error={errors.email || null}
                                    placeholder="seuemail@exemplo.com"
                                />
                            </div>

                            {/* Notes Field */}
                            <div className="mt-4 space-y-2 md:col-span-2">
                                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                                    Notas Adicionais <span className="text-xs text-gray-500">(Opcional)</span>
                                </Label>
                                <Textarea
                                    name="notes"
                                    id="notes"
                                    rows={3}
                                    value={data.notes}
                                    onChange={handleChange}
                                    placeholder="Ex: Deixar na portaria, ponto de referência..."
                                    className={
                                        errors.notes
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                                    }
                                />
                                {errors.notes && <p className="mt-1 text-xs text-red-500">{errors.notes}</p>}
                            </div>
                        </section>
                    </div>

                    {/* Order Summary Column */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 rounded-lg bg-white p-6 shadow-sm">
                            <h2 className="mb-6 flex items-center border-b pb-3 text-xl font-semibold text-gray-800">
                                <Package className="mr-3 h-6 w-6 text-orange-600" />
                                Resumo da Cotação
                            </h2>

                            {/* Items List */}
                            <div className="custom-scrollbar mb-6 max-h-60 space-y-3 overflow-y-auto pr-2">
                                {items.map((item, index) => (
                                    <div
                                        key={`${item.id}-${item.color_id}-${item.size_id}-${index}`}
                                        className="flex items-start justify-between border-b border-gray-100 py-2 last:border-b-0"
                                    >
                                        <div className="flex items-start">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="mr-3 h-14 w-14 rounded-md object-cover" />
                                            ) : (
                                                <div className="mr-3 flex h-14 w-14 items-center justify-center rounded-md bg-gray-100">
                                                    <ShoppingBag className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-sm leading-tight font-medium text-gray-800">{item.name}</h3>
                                                {item.variant_sku && <p className="text-xs text-gray-500">SKU: {item.variant_sku}</p>}
                                                <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                                                {(item.color_name || item.size_name) && (
                                                    <p className="text-xs text-gray-500">
                                                        {item.color_name && <span>Cor: {item.color_name}</span>}
                                                        {item.color_name && item.size_name && <span className="mx-1">/</span>}
                                                        {item.size_name && <span>Tamanho: {item.size_name}</span>}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Submit Button */}
                            <div className="mt-8">
                                <button
                                    type="submit"
                                    className="flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-orange-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                                    disabled={itemCount === 0 || isSubmitting}
                                    aria-busy={isSubmitting}
                                    aria-disabled={itemCount === 0 || isSubmitting}
                                >
                                    {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
                                    {isSubmitting ? 'Processando...' : 'Solicitar Cotação'}
                                    {!isSubmitting && <ArrowRight className="ml-1 h-5 w-5" />}
                                </button>
                            </div>

                            {/* Terms */}
                            <p className="mt-4 text-center text-xs text-gray-500">
                                Ao clicar em "Solicitar Cotação", você concorda com nossos{' '}
                                <Link href="/terms" className="underline hover:text-orange-600">
                                    Termos de Serviço
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

// ===== MAIN EXPORT COMPONENT =====
export default function Checkout() {
    return (
        <SiteLayout>
            <Head title="Solicitar Cotação" />
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #c7c7c7; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a3a3a3; }
            `}</style>
            <CheckoutContent />
        </SiteLayout>
    );
}
