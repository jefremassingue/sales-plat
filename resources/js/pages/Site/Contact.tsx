import React, { useState, FormEvent } from 'react';
import SiteLayout from '@/layouts/site-layout';
import { Head, useForm, UseFormReturn } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Send,
    CheckCircle2,
    HelpCircle, // Para FAQ
    Building, // Para Endereço
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"; // Assumindo que você tem shadcn/ui Accordion

// --- ZOD SCHEMA E TIPOS ---
const ContactFormSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres.").max(100, "Máximo de 100 caracteres."),
    email: z.string().email("Por favor, insira um email válido."),
    phone: z.string()
        .optional()
        .refine(value => !value || /^\+?[0-9\s-()]{7,20}$/.test(value), {
            message: "Número de telefone inválido.",
        })
        .transform(value => value === "" ? undefined : value), // Garante que string vazia seja undefined
    subject: z.string().min(5, "O assunto deve ter pelo menos 5 caracteres.").max(150, "Máximo de 150 caracteres."),
    message: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres.").max(1000, "Máximo de 1000 caracteres."),
});

type ContactFormValues = z.infer<typeof ContactFormSchema>;

interface ContactInfoItemData {
    icon: React.ReactNode;
    title: string;
    details: string[];
    href?: string;
}

interface FaqData {
    id: string; // Para o Accordion
    question: string;
    answer: string;
}

// --- DADOS ESTÁTICOS ---
const contactInfoData: ContactInfoItemData[] = [
    {
        icon: <Building size={22} className="text-orange-600" />,
        title: "Nosso Escritório",
        details: ["Av. Ahmed sekou toure n° 3007", "Maputo, Moçambique"]
    },
    {
        icon: <Phone size={22} className="text-orange-600" />,
        title: "Ligue para Nós",
        details: ["+258 87 115 4336", "+258 87 0884 336"],
        href: "tel:+258871154336"
    },
    {
        icon: <Mail size={22} className="text-orange-600" />,
        title: "Envie um Email",
        details: ["geral@matonyservicos.com", "suporte@matonyservicos.com"],
        href: "mailto:geral@matonyservicos.com"
    },
    {
        icon: <Clock size={22} className="text-orange-600" />,
        title: "Horário de Atendimento",
        details: ["Seg - Sex: 8h às 17h", "Sábado: 9h às 13h"]
    }
];

const faqData: FaqData[] = [
    {
        id: "faq-1",
        question: "Como posso fazer um pedido?",
        answer: "Você pode fazer pedidos diretamente pelo nosso site, adicionando produtos ao carrinho e finalizando a compra. Também aceitamos pedidos por telefone e e-mail para compras corporativas."
    },
    {
        id: "faq-2",
        question: "Quais são as formas de pagamento aceitas?",
        answer: "Aceitamos pagamentos via cartão de crédito, transferência bancária, e M-Pesa. Para compras corporativas, oferecemos condições especiais mediante aprovação de cadastro."
    },
    {
        id: "faq-3",
        question: "Qual é o prazo de entrega?",
        answer: "O prazo de entrega varia conforme sua localização. Para Maputo, geralmente entregamos em 1-2 dias úteis. Para outras províncias, o prazo pode variar entre 3-7 dias úteis."
    },
    {
        id: "faq-4",
        question: "Vocês oferecem treinamento para uso dos equipamentos?",
        answer: "Sim, oferecemos treinamentos especializados para o uso correto dos equipamentos de proteção. Entre em contato conosco para mais informações sobre nossos programas de treinamento."
    }
];

// --- COMPONENTES INTERNOS ---

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
    titleClassName?: string;
    subtitleClassName?: string;
    centered?: boolean;
    as?: 'h1' | 'h2' | 'h3'; // Para semântica correta
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    className = "mb-10 md:mb-12",
    titleClassName = "text-3xl md:text-4xl font-bold text-slate-800 mb-3",
    subtitleClassName = "text-lg text-slate-600 max-w-2xl",
    centered = true,
    as: TitleTag = 'h2',
}) => {
    return (
        <div className={`${className} ${centered ? 'text-center mx-auto' : ''}`}>
            <TitleTag className={titleClassName}>{title}</TitleTag>
            {subtitle && <p className={`${subtitleClassName} ${centered ? 'mx-auto' : ''}`}>{subtitle}</p>}
        </div>
    );
};

interface ContactInfoCardProps {
    item: ContactInfoItemData;
}

const ContactInfoCard: React.FC<ContactInfoCardProps> = ({ item }) => {
    const CardContent = () => (
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1 bg-orange-100 p-3 rounded-full">
                {item.icon}
            </div>
            <div>
                <h3 className="font-semibold text-slate-800 text-lg mb-1">{item.title}</h3>
                {item.details.map((detail, idx) => (
                    <p key={idx} className="text-sm text-slate-500">{detail}</p>
                ))}
            </div>
        </div>
    );

    const baseClasses = "p-5 rounded-lg bg-white transition-all duration-300";
    const interactiveClasses = "hover:shadow-lg hover:border-orange-300/50 hover:scale-[1.02]";

    if (item.href) {
        return (
            <a
                href={item.href}
                className={`${baseClasses} ${interactiveClasses} block border border-slate-200/80`}
                target={item.href.startsWith('http') ? "_blank" : undefined}
                rel={item.href.startsWith('http') ? "noopener noreferrer" : undefined}
            >
                <CardContent />
            </a>
        );
    }

    return (
        <div className={`${baseClasses} border border-slate-200/80`}>
            <CardContent />
        </div>
    );
};

interface SubmissionSuccessProps {
    onReset: () => void;
}

const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({ onReset }) => {
    return (
        <div className="text-center py-10 md:py-16 flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Mensagem Enviada com Sucesso!</h3>
            <p className="text-slate-600 mb-8 max-w-sm">
                Agradecemos seu contato. Nossa equipe analisará sua mensagem e responderá o mais breve possível.
            </p>
            <Button onClick={onReset} variant="outline" size="lg" className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700">
                Enviar Nova Mensagem
            </Button>
        </div>
    );
};

interface ContactFormFieldsProps {
    form: UseFormReturn<ContactFormValues>;
    onSubmit: (e: FormEvent) => void;
    frontendErrors: Partial<Record<keyof ContactFormValues, string | undefined>>;
}

const FormInputGroup: React.FC<{
    id: keyof ContactFormValues;
    label: string;
    placeholder: string;
    form: UseFormReturn<ContactFormValues>;
    frontendErrors: Partial<Record<keyof ContactFormValues, string | undefined>>;
    type?: string;
    required?: boolean;
    isTextarea?: boolean;
}> = ({ id, label, placeholder, form: inertiaForm, frontendErrors, type = "text", required = false, isTextarea = false }) => {
    const error = frontendErrors[id] || inertiaForm.errors[id];
    const value = inertiaForm.data[id] || "";

    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="font-medium text-slate-700">
                {label} {required && <span className="text-orange-600">*</span>}
            </Label>
            {isTextarea ? (
                <Textarea
                    id={id}
                    value={value as string}
                    onChange={e => inertiaForm.setData(id, e.target.value)}
                    placeholder={placeholder}
                    rows={5}
                    required={required}
                    className={`!bg-slate-50 border-slate-300 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
            ) : (
                <Input
                    id={id}
                    type={type}
                    value={value as string}
                    onChange={e => inertiaForm.setData(id, e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    className={`bg-slate-50 border-slate-300 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
            )}
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
    );
};


const ContactFormRender: React.FC<ContactFormFieldsProps> = ({ form: inertiaForm, onSubmit, frontendErrors }) => {
    return (
        <>
            <SectionHeader
                title="Fale Conosco"
                subtitle="Preencha o formulário e nossa equipe retornará em breve."
                centered={false}
                className="mb-6"
                titleClassName="text-2xl md:text-3xl font-semibold text-slate-800 mb-1"
                subtitleClassName="text-base text-slate-500"
                as="h3"
            />
            <form onSubmit={onSubmit} className="space-y-5 dark:!text-zinc-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormInputGroup id="name" label="Nome Completo" placeholder="Seu nome" form={inertiaForm} frontendErrors={frontendErrors} required />
                    <FormInputGroup id="email" label="Seu Email" placeholder="voce@exemplo.com" type="email" form={inertiaForm} frontendErrors={frontendErrors} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormInputGroup id="phone" label="Telefone" placeholder="(Opcional) +258 8X XXX XXXX" form={inertiaForm} frontendErrors={frontendErrors} />
                    <FormInputGroup id="subject" label="Assunto" placeholder="Sobre o que gostaria de falar?" form={inertiaForm} frontendErrors={frontendErrors} required />
                </div>
                <FormInputGroup id="message" label="Sua Mensagem" placeholder="Detalhe sua solicitação aqui..." form={inertiaForm} frontendErrors={frontendErrors} required isTextarea />

                <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold tracking-wide"
                    disabled={inertiaForm.processing}
                    size="lg"
                >
                    <Send className="mr-2 h-5 w-5" />
                    {inertiaForm.processing ? 'Enviando Mensagem...' : 'Enviar Mensagem'}
                </Button>
            </form>
        </>
    );
};

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function Contact() {
    const { toast } = useToast();
    const [submitted, setSubmitted] = useState(false);
    const [frontendErrors, setFrontendErrors] = useState<Partial<Record<keyof ContactFormValues, string | undefined>>>({});

    const inertiaForm = useForm<ContactFormValues>({ // Renomeado para inertiaForm para clareza
        name: '',
        email: '',
        phone: undefined, // Zod transformará "" para undefined
        subject: '',
        message: ''
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setFrontendErrors({}); // Limpa erros anteriores do frontend

        const validationResult = ContactFormSchema.safeParse(inertiaForm.data);

        if (!validationResult.success) {
            const fieldErrors: Partial<Record<keyof ContactFormValues, string | undefined>> = {};
            validationResult.error.errors.forEach(err => {
                if (err.path[0]) {
                    fieldErrors[err.path[0] as keyof ContactFormValues] = err.message;
                }
            });
            setFrontendErrors(fieldErrors);
            toast({
                title: "Erro de Validação",
                description: "Por favor, corrija os campos destacados e tente novamente.",
                variant: "destructive",
            });
            const firstErrorKey = Object.keys(fieldErrors)[0] as keyof ContactFormValues;
            if (firstErrorKey) {
                document.getElementById(firstErrorKey)?.focus({ preventScroll: true });
                // Opcional: Rolar para o campo se estiver fora da tela
                // document.getElementById(firstErrorKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Se a validação do frontend passar, usa os dados validados (sanitizados/transformados)
        inertiaForm.post(route('contact.store'), {
            data: validationResult.data, // Envia os dados validados pelo Zod
            onSuccess: () => {
                setSubmitted(true);
                inertiaForm.reset();
                toast({
                    title: "Mensagem Enviada!",
                    description: "Agradecemos seu contato. Responderemos em breve.",
                    className: "bg-green-600 border-green-700 text-white",
                });
                // Rolar para o início do formulário ou da mensagem de sucesso
                const formContainer = document.getElementById('contact-form-container');
                formContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            },
            onError: (backendErrors) => { // Erros do backend
                toast({
                    title: "Erro ao Enviar",
                    description: "Houve um problema ao processar sua solicitação. Verifique os erros e tente novamente.",
                    variant: "destructive",
                });
                // Os erros do backend já são mapeados para inertiaForm.errors
            }
        });
    };

    return (
        <SiteLayout>
            <Head title="Contato - Fale com a Matony" />

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white py-20 md:py-28">
                <div className="container mx-auto px-4 text-center">
                    <SectionHeader
                        title="Estamos Prontos para Ajudar"
                        subtitle="Tem alguma dúvida, sugestão ou precisa de suporte especializado? Nossa equipe está à disposição para oferecer a melhor assistência."
                        className="mb-0"
                        titleClassName="text-4xl lg:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight"
                        subtitleClassName="text-xl text-slate-600 max-w-3xl"
                        as="h1"
                    />
                </div>
            </div>

            {/* Contact Section */}
            <section className="py-16 md:py-24 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">

                        {/* Contact Information & Map - Ocupa mais espaço */}
                        <div className="lg:col-span-3 space-y-10">
                            <div>
                                <SectionHeader
                                    title="Nossos Contatos Diretos"
                                    subtitle="Encontre-nos ou entre em contato usando os detalhes abaixo."
                                    centered={false}
                                    className="mb-6"
                                    titleClassName="text-2xl md:text-3xl font-semibold text-slate-800 mb-2"
                                    subtitleClassName="text-base text-slate-500"
                                    as="h2"
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {contactInfoData.map((item, index) => (
                                        <ContactInfoCard key={index} item={item} />
                                    ))}
                                </div>
                            </div>

                            {/* Map */}
                            <div className="rounded-xl overflow-hidden shadow-lg h-[350px] md:h-[400px] border border-slate-200/70">

                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3587.2091498295754!2d32.56538527615271!3d-25.961180177227092!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ee69ae3bae04f15%3A0x768945d8fbbe1403!2s3007%20Av.%20Ahmed%20Sekou%20Tour%C3%A9%2C%20Maputo!5e0!3m2!1spt-PT!2smz!4v1746789506129!5m2!1spt-PT!2smz"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    title="Localização da Matony"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>

                        {/* Contact Form - Ocupa menos espaço */}
                        <div id="contact-form-container" className="lg:col-span-2 bg-white rounded-xl shadow-xl shadow-slate-200/60 p-6 md:p-10 ring-1 ring-slate-200/80">
                            {submitted ? (
                                <SubmissionSuccess onReset={() => setSubmitted(false)} />
                            ) : (
                                <ContactFormRender form={inertiaForm} onSubmit={handleSubmit} frontendErrors={frontendErrors} />
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4">
                    <SectionHeader
                        title="Perguntas Frequentes (FAQ)"
                        subtitle="Encontre respostas rápidas para as dúvidas mais comuns sobre nossos serviços e processos."
                        as="h2"
                    />
                    <div className="max-w-3xl mx-auto">
                        <Accordion type="single" collapsible className="w-full">
                            {faqData.map((faq) => (
                                <AccordionItem value={faq.id} key={faq.id} className="border-b border-slate-200/90">
                                    <AccordionTrigger className="py-5 text-left hover:no-underline group">
                                        <span className="font-medium text-slate-700 group-hover:text-orange-600 transition-colors text-base md:text-lg flex items-center">
                                            <HelpCircle size={20} className="mr-3 text-orange-500 group-hover:text-orange-600 transition-colors flex-shrink-0" />
                                            {faq.question}
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-1 pb-5 text-slate-600 text-sm md:text-base leading-relaxed pl-[calc(20px+0.75rem+0.5rem)]"> {/* Ajuste de padding-left */}
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}