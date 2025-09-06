import SiteLayout from '@/layouts/site-layout';
import { Head } from '@inertiajs/react';
import { ArrowRight, BookOpen, ChevronDown, ChevronUp, HelpCircle, ShieldCheck, ThumbsUp, Truck, Wrench } from 'lucide-react';
import React, { useState } from 'react';
import CategorySection from './_components/CategorySection';
import HeroSlider from './_components/HeroSlider';
import ProductSection from './_components/ProductSection';

// Types
interface ImageVersion {
    id: string | number;
    url: string;
    version: string;
}
interface ProductFromServer {
    id: string;
    name: string;
    slug: string;
    price: number | string;
    old_price?: number | string | null; // backend usa old_price
    category?: { id: string; name: string } | null;
    main_image?: { id: string | number; versions?: ImageVersion[]; url: string } | null;
    brand?: string | null;
    isNew?: boolean;
}
interface InlineImage {
    id: string | number;
    url?: string;
    versions?: { id: string | number; url: string; version: string }[];
}

interface Category {
    name: string;
    imageUrl: string;
    link: string;
    items: number;
}

interface FaqItem {
    question: string;
    answer: string;
}

interface BlogPost {
    id: string | number;
    title: string;
    date: string;
    excerpt: string;
    imageUrl: string;
    link: string;
    category?: string;
    author?: string;
}

interface HomeProps {
    featuredProducts: ProductFromServer[] | null;
    popularProducts: ProductFromServer[] | null;
    newProducts: ProductFromServer[] | null;
    _categories: Category[] | null;
    blogPosts?: BlogPost[] | null;
    heroSlides?: any[];
}

// --- DADOS MOCKADOS INTERNOS PARA AS NOVAS SEÇÕES (TEMA CLARO) ---

const featuresData = [
    {
        icon: <ShieldCheck size={36} className="text-orange-600" />,
        title: 'Certificação Garantida',
        description: 'Todos os EPIs seguem as normas de segurança mais rigorosas.',
    },
    {
        icon: <Truck size={36} className="text-green-600" />,
        title: 'Entrega Rápida',
        description: 'Receba seus equipamentos com agilidade em todo o país.',
    },
    {
        icon: <Wrench size={36} className="text-orange-500" />,
        title: 'Suporte Especializado',
        description: 'Nossa equipe está pronta para te ajudar a escolher o EPI ideal.',
    },
    {
        icon: <ThumbsUp size={36} className="text-purple-600" />,
        title: 'Satisfação Comprovada',
        description: 'Milhares de clientes confiam na nossa qualidade e serviço.',
    },
];

const faqData: FaqItem[] = [
    {
        question: 'Quais são os prazos de entrega?',
        answer: 'O prazo de entrega varia conforme a província e o tipo de transporte escolhido. Para Maputo, Matola e cidades próximas, normalmente é de 1 a 3 dias úteis. Para outras províncias, pode levar de 5 a 10 dias úteis. Você pode confirmar o prazo exato durante a finalização da compra.',
    },
    {
        question: 'Posso trocar um produto?',
        answer: 'Sim, pode solicitar a troca em até 7 dias corridos após a recepção, desde que o produto esteja em boas condições e com a embalagem original. Consulte a nossa política de trocas para mais detalhes.',
    },
    {
        question: 'Quais formas de pagamento são aceitas?',
        answer: 'Aceitamos cartões de crédito e débito (Visa, Mastercard), M-Pesa, E-Mola, e transferência bancária. O parcelamento depende do banco emissor do cartão.',
    },
    {
        question: 'Os produtos possuem garantia?',
        answer: 'Todos os nossos produtos têm garantia contra defeitos de fabrico. O período da garantia varia conforme o fabricante e o tipo de produto. Verifique na descrição do produto ou contacte-nos para informações específicas.',
    },
];

// Componente reutilizável para FAQ Item (interno)
const FaqItem: React.FC<{ faq: FaqItem; isOpen: boolean; onToggle: () => void }> = ({ faq, isOpen, onToggle }) => (
    <div className="border-b border-slate-200">
        <h2>
            <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg px-1 py-5 text-left font-medium text-slate-700 transition-colors hover:bg-slate-50"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <span>{faq.question}</span>
                {isOpen ? <ChevronUp size={20} className="text-orange-600" /> : <ChevronDown size={20} className="text-slate-500" />}
            </button>
        </h2>
        {isOpen && (
            <div className="animate-fadeIn px-1 py-5 pt-0">
                <p className="leading-relaxed text-slate-600">{faq.answer}</p>
            </div>
        )}
    </div>
);

export default function Home({ featuredProducts, popularProducts, mostViewedProducts, newProducts, _categories, blogPosts, heroSlides }: HomeProps) {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <SiteLayout>
            <Head title="Protegendo quem constrói o futuro - Matony Serviços" />

            {/* Hero Section with improved spacing */}
            <div className="bg-gradient-to-b py-6 md:py-8">
                <div className="container mx-auto px-4">
                    <HeroSlider slides={heroSlides} />
                </div>
            </div>

            {/* Features (Diferenciais/Benefícios) */}
            <section className=" ">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {featuresData.map((feature) => (
                            <div
                                key={feature.title}
                                className="flex transform flex-col items-center rounded-4xl border border-slate-200 p-6 text-center transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="mb-4 rounded-full bg-orange-100 p-3">{feature.icon}</div>
                                <h3 className="mb-2 text-xl font-semibold text-slate-800">{feature.title}</h3>
                                <p className="text-sm leading-relaxed text-slate-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Produtos em Destaque */}
            <ProductSection
                title="Produtos em Destaque"
                products={featuredProducts}
                bgColor="bg-white"
            />

            {/* Slide categories / Categorias em Destaque */}
            <CategorySection categories={_categories} />


            {/* Produtos Populares */}
            <ProductSection
                title="Mais Populares"
                products={popularProducts}
                bgColor="bg-white"
            />

            {/* Produtos mais visualizados */}
            <ProductSection
                title="Mais Visualizados"
                products={mostViewedProducts}
                bgColor="bg-white"
            />

            {/* Novos Produtos */}
            <ProductSection
                title="Novidades na Loja"
                products={newProducts}
                bgColor="bg-slate-50"
            />

            {/* Blog */}
            <section className="bg-slate-50 py-16 md:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center md:mb-16">
                        <h2 className="mb-4 text-3xl font-bold text-slate-800 md:text-4xl">Fique por Dentro</h2>
                        <p className="mx-auto max-w-xl text-lg text-slate-600">Artigos, dicas e novidades do mundo da segurança no trabalho.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {(blogPosts || []).map((post) => (
                            <a
                                key={post.id}
                                href={post.link}
                                className="group flex transform flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="overflow-hidden">
                                    <img
                                        src={
                                            post.image?.versions?.find((image) => image.version === 'md')?.url ||
                                            post.image?.versions?.find((image) => image.version === 'lg')?.url ||
                                            post.image?.url ||
                                            '/og-image.png' // Imagem placeholder
                                        }
                                        alt={post.title}
                                        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex flex-grow flex-col p-5">
                                    <p className="mb-1 text-xs text-slate-500">{post.date}</p>
                                    <h3 className="mb-2 flex-grow text-lg font-semibold text-slate-800 transition-colors group-hover:text-orange-600">
                                        {post.title}
                                    </h3>
                                    <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-600">{post.excerpt}</p>
                                    <span className="mt-auto inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700">
                                        Ler Artigo <ArrowRight size={16} className="ml-1.5" />
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                    <div className="mt-12 text-center">
                        <a
                            href="/blog"
                            className="inline-flex transform items-center justify-center rounded-lg border border-slate-300 bg-white px-7 py-3 text-base font-medium text-slate-700 transition-all duration-300 hover:scale-105 hover:bg-slate-100 active:scale-95"
                        >
                            Ver Todos os Artigos <BookOpen size={18} className="ml-2" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Perguntas Frequentes */}
            <section className="bg-white py-16 md:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl">
                        <div className="mb-12 text-center md:mb-16">
                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                                <HelpCircle size={32} className="text-orange-600" />
                            </div>
                            <h2 className="mb-4 text-3xl font-bold text-slate-800 md:text-4xl">Perguntas Frequentes</h2>
                            <p className="text-lg text-slate-600">Tire suas dúvidas sobre nossos produtos e serviços.</p>
                        </div>
                        <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-4">
                            {faqData.map((faq, index) => (
                                <FaqItem key={index} faq={faq} isOpen={openFaqIndex === index} onToggle={() => toggleFaq(index)} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
