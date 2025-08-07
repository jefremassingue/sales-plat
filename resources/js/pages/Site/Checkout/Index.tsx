import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout'; // Assumindo que SiteLayout existe
import { useCart } from '@/contexts/CartContext'; // Assumindo que CartContext existe
import {
    ShoppingBag,
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard, // Ícone genérico para pagamento
    Landmark, // Ícone para banco
    Package,
    CheckCircle,
    ArrowLeft,
    ArrowRight,
    AlertCircle,
    Upload,
    ChevronDown,
    ChevronUp,
    Truck
} from 'lucide-react';
import { z } from 'zod';

// --- Dados Bancários e Métodos de Pagamento ---
const BANK_DETAILS = {
    bankName: "Banco ABC Moçambique",
    accountHolder: "Sua Empresa Online Lda.",
    accountNumber: "1234567890",
    nib: "0001 0002 0003 0004 0005 1",
    swift: "ABCBMZMX",
};

const PAYMENT_METHODS_DATA = [
    {
        id: 'mpesa',
        name: 'M-Pesa',
        icon: <Phone className="w-5 h-5 mr-3 text-orange-600" />,
        description: 'Pague de forma rápida e segura com M-Pesa.',
        instructions: (
            <div className="text-sm text-gray-600 space-y-2">
                <p>Ao finalizar o pedido, você receberá instruções detalhadas para o pagamento via M-Pesa.</p>
                <p>Número para pagamento: <strong>+258 84 XXX XXXX</strong> (Este é um exemplo)</p>
                <p>Por favor, use o ID do seu pedido como referência.</p>
            </div>
        ),
        requiresProof: true,
    },
    {
        id: 'bank_transfer',
        name: 'Transferência Bancária',
        icon: <Landmark className="w-5 h-5 mr-3 text-orange-600" />,
        description: 'Realize o pagamento por transferência para nossa conta bancária.',
        instructions: (
            <div className="text-sm text-gray-600 space-y-3">
                <p>Por favor, transfira o valor total para a seguinte conta:</p>
                <ul className="list-disc list-inside pl-4 space-y-1 bg-gray-50 p-3 rounded-md">
                    <li><strong>Banco:</strong> {BANK_DETAILS.bankName}</li>
                    <li><strong>Titular:</strong> {BANK_DETAILS.accountHolder}</li>
                    <li><strong>Nº da Conta:</strong> {BANK_DETAILS.accountNumber}</li>
                    <li><strong>NIB:</strong> {BANK_DETAILS.nib}</li>
                </ul>
                <p>Use o ID do seu pedido como referência da transferência.</p>
                <p className="font-semibold">Anexe o comprovativo abaixo para agilizar o processo.</p>
            </div>
        ),
        requiresProof: true,
    },
    {
        id: 'credit_card_on_delivery',
        name: 'Pagamento na Entrega',
        icon: <CreditCard className="w-5 h-5 mr-3 text-orange-600" />,
        description: 'Pague em especie ou com cartão de crédito ou débito no momento da entrega.',
        instructions: (
            <p className="text-sm text-gray-600">
                Tenha seu cartão pronto. Nosso entregador levará uma máquina POS.
            </p>
        )
    }
];

// --- Esquema de Validação com Zod ---
const phoneRegex = /^(?:\+?258\s?)?(8[2-7])\s?(\d{3})\s?(\d{4})$/; // Regex para telefones de Moçambique

const quotationSchema = z.object({
    fullName: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres.").max(100, "Nome muito longo."),
    phone: z.string().regex(phoneRegex, "Formato de telefone inválido (ex: 841234567 ou +258 841234567)."),
    email: z.string().email("Formato de email inválido."),
    city: z.string().min(2, "Cidade é obrigatória."),
    neighborhood: z.string().min(3, "Bairro é obrigatório."),
    streetAndNumber: z.string().min(5, "Endereço (rua e número) é obrigatório e deve ter pelo menos 5 caracteres."),
    notes: z.string().max(500, "Notas não podem exceder 500 caracteres.").optional(),
    paymentMethod: z.string({ required_error: "Selecione um método de pagamento." }).min(1, "Selecione um método de pagamento."),
    paymentProof: z.instanceof(File).optional(),
})
    .refine(data => {
        const selectedMethod = PAYMENT_METHODS_DATA.find(m => m.id === data.paymentMethod);
        if (selectedMethod?.requiresProof && !data.paymentProof) {
            return false;
        }
        return true;
    }, {
        message: "Comprovativo de transferência é obrigatório para este método.",
        path: ["paymentProof"], // Campo que falhou
    });


// Componente principal de Checkout
export default function Checkout() {
    const CheckoutContent = () => {
        const { items, total: cartTotal, itemCount, clearCart } = useCart();
        const fileInputRef = useRef(null);

        const [formData, setFormData] = useState({
            fullName: '',
            phone: '',
            email: '',
            companyName: '',
            neighborhood: '',
            streetAndNumber: '',
            notes: '',
        });
        const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
        const [paymentProofFile, setPaymentProofFile] = useState(null);
        const [errors, setErrors] = useState({});
        const [orderPlaced, setOrderPlaced] = useState(false);
        const [orderId, setOrderId] = useState(null);
        const [activeAccordion, setActiveAccordion] = useState(null);

        const formatCurrency = (value) => {
            return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
        };

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: null }));
            }
        };

        const handleFileChange = (e) => {
            const file = e.target.files?.[0];
            if (file) {
                // Validação básica do arquivo (ex: tamanho, tipo) pode ser adicionada aqui
                if (file.size > 5 * 1024 * 1024) { // Max 5MB
                    setErrors(prev => ({ ...prev, paymentProof: "Arquivo muito grande (máx 5MB)." }));
                    setPaymentProofFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = ""; // Limpa o input
                    return;
                }
                const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
                if (!allowedTypes.includes(file.type)) {
                    setErrors(prev => ({ ...prev, paymentProof: "Tipo de arquivo inválido (permitido: JPG, PNG, PDF)." }));
                    setPaymentProofFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    return;
                }
                setPaymentProofFile(file);
                setErrors(prev => ({ ...prev, paymentProof: null }));
            } else {
                setPaymentProofFile(null);
            }
        };

        const handlePaymentMethodSelect = (methodId) => {
            setSelectedPaymentMethodId(methodId);
            setActiveAccordion(activeAccordion === methodId ? null : methodId); // Toggle accordion
            if (errors.paymentMethod) {
                setErrors(prev => ({ ...prev, paymentMethod: null }));
            }
            // Reset proof if method doesn't require it or changes
            const selectedMethod = PAYMENT_METHODS_DATA.find(m => m.id === methodId);
            if (!selectedMethod?.requiresProof) {
                setPaymentProofFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                setErrors(prev => ({ ...prev, paymentProof: null }));
            }
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            setErrors({}); // Limpa erros anteriores

            const dataToValidate = {
                ...formData,
                paymentMethod: selectedPaymentMethodId,
                paymentProof: paymentProofFile,
            };

            const validationResult = quotationSchema.safeParse(dataToValidate);

            if (!validationResult.success) {
                const formattedErrors = {};
                validationResult.error.errors.forEach(err => {
                    if (err.path.length > 0) {
                        formattedErrors[err.path[0]] = err.message;
                    }
                });
                setErrors(formattedErrors);
                // Focar no primeiro campo com erro (opcional, mas bom para UX)
                const firstErrorKey = Object.keys(formattedErrors)[0];
                if (firstErrorKey) {
                    const errorElement = document.getElementsByName(firstErrorKey)[0];
                    if (errorElement) errorElement.focus();
                }
                window.scrollTo(0, 0);
                return;
            }

            // Simular processamento do pedido
            const newOrderId = `ORD-MZ-${Date.now()}`;
            setOrderId(newOrderId);
            setOrderPlaced(true);
            if (typeof clearCart === 'function') {
                clearCart();
            } else {
                console.warn("clearCart function is not available. Cart will not be cleared.");
            }
            window.scrollTo(0, 0);
        };

        // useEffect(() => {
        //     if (itemCount === 0 && !orderPlaced) {
        //         router.visit('/cart');
        //     }
        // }, [itemCount, orderPlaced]);

        if (itemCount === 0 && !orderPlaced) {
            return (
                <div className="container mx-auto px-4 py-16 text-center">
                    <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Seu carrinho está vazio</h1>
                    <p className="text-gray-600 mb-8">Adicione produtos ao carrinho para finalizar a compra.</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" /> Ir para Produtos
                    </Link>
                </div>
            );
        }

        if (orderPlaced) {
            return (
                <div className="container mx-auto px-4 py-16 text-center">
                    <CheckCircle className="h-20 w-20 mx-auto text-green-500 mb-6" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Pedido Realizado com Sucesso!</h1>
                    <p className="text-gray-700 mb-2">Obrigado pela sua compra, {formData.fullName.split(' ')[0]}.</p>
                    <p className="text-gray-700 mb-6">Seu número de pedido é: <span className="font-semibold text-orange-600">{orderId}</span></p>
                    <p className="text-gray-600 mb-4">
                        Você receberá um email em <span className="font-semibold">{formData.email}</span> com os detalhes do pedido e informações de pagamento (se aplicável).
                    </p>
                    <p className="text-gray-500 text-sm mb-8">
                        (Esta é uma simulação. Nenhum produto será enviado e nenhum pagamento foi processado.)
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link
                            href="/products"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                        >
                            <ShoppingBag className="mr-2 h-5 w-5" /> Continuar Comprando
                        </Link>
                    </div>
                </div>
            );
        }

        const totalOrderAmount = cartTotal; // Entrega "A calcular", então não adicionamos ao total aqui

        const InputField = ({ label, name, type = "text", placeholder, icon, value, onChange, error, ...props }) => (
            <div>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="relative">
                    {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>}
                    <input
                        type={type}
                        name={name}
                        id={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        className={`w-full p-2 border rounded-md ${icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                        {...props}
                    />
                </div>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
        );

        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center mb-6">
                    <Link href="/cart" className="text-orange-600 hover:text-orange-700 flex items-center">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Voltar a Cotação
                    </Link>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center md:text-left">Solicitar Cotação</h1>

                {Object.keys(errors).length > 0 && !errors.paymentProof && !errors.paymentMethod && ( /* Não mostrar erro geral se for só de pagamento */
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
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

                <form onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-10">
                        {/* Coluna do Formulário */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Informações Pessoais */}
                            <section className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3 flex items-center">
                                    <User className="w-6 h-6 mr-3 text-orange-600" /> Informações do cliente
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Nome Completo" name="fullName" value={formData.fullName} onChange={handleChange} error={errors.fullName} placeholder="Seu nome completo" />
                                    <InputField label="Nome Da empresa" name="companyName" value={formData.companyName} onChange={handleChange} error={errors.fullName} placeholder="Seu nome completo" />
                                    <InputField label="Telefone" name="phone" type="tel" value={formData.phone} onChange={handleChange} error={errors.phone} placeholder="8X XXX XXXX" />
                                    <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="seuemail@exemplo.com" />
                                </div>
                                <div className="md:col-span-2 mt-4">
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notas Adicionais <span className="text-xs text-gray-500">(Opcional)</span></label>
                                        <textarea
                                            name="notes"
                                            id="notes"
                                            rows="3"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            placeholder="Ex: Deixar na portaria, ponto de referência..."
                                            className={`w-full p-2 border rounded-md ${errors.notes ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                                        ></textarea>
                                        {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes}</p>}
                                    </div>
                            </section>


                        </div>

                        {/* Coluna do Resumo do Pedido */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-28 bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3 flex items-center">
                                    <Package className="w-6 h-6 mr-3 text-orange-600" /> Resumo do Pedido
                                </h2>
                                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {items.map((item, index) => (
                                        <div key={`${item.id}-${item.color_id}-${item.size_id}-${index}`} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
                                            <div className="flex items-start">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="h-14 w-14 object-cover rounded-md mr-3" />
                                                ) : (
                                                    <div className="h-14 w-14 bg-gray-100 flex items-center justify-center rounded-md mr-3">
                                                        <ShoppingBag className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-800 leading-tight">{item.name}</h3>
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

                                <div className="mt-8">
                                    <button
                                        type="submit"
                                        className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                        disabled={itemCount === 0}
                                    >
                                        Finalizar Pedido <ArrowRight className="ml-2 h-5 w-5" />
                                    </button>
                                </div>
                                <p className="mt-4 text-xs text-gray-500 text-center">
                                    Ao clicar em "Finalizar Pedido", você concorda com nossos <Link href="/terms" className="underline hover:text-orange-600">Termos de Serviço</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <SiteLayout>
            <Head title="Finalizar Compra" />
            {/* Adicione um estilo global para scrollbar customizado se desejar, ou use classes do Tailwind se disponíveis */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #c7c7c7;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a3a3a3;
                }
            `}</style>
            <CheckoutContent />
        </SiteLayout>
    );
}
