import SiteLayout from '@/layouts/site-layout';
import HeroSlider from './_components/HeroSlider';
import {
    ShieldCheck, Wrench, Truck, ThumbsUp, ChevronDown, ChevronUp, ArrowRight, HelpCircle, BookOpen,
} from 'lucide-react';
import React, { useState } from 'react';
import ProductSection from './_components/ProductSection';
import CategorySection from './_components/CategorySection';
import { Head } from '@inertiajs/react';

// Types
interface ImageVersion { id: string | number; url: string; version: string }
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
interface InlineImage { id: string | number; url?: string; versions?: { id: string | number; url: string; version: string }[] }

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
    { icon: <ShieldCheck size={36} className="text-orange-600" />, title: 'Certificação Garantida', description: 'Todos os EPIs seguem as normas de segurança mais rigorosas.' },
    { icon: <Truck size={36} className="text-green-600" />, title: 'Entrega Rápida', description: 'Receba seus equipamentos com agilidade em todo o país.' },
    { icon: <Wrench size={36} className="text-orange-500" />, title: 'Suporte Especializado', description: 'Nossa equipe está pronta para te ajudar a escolher o EPI ideal.' },
    { icon: <ThumbsUp size={36} className="text-purple-600" />, title: 'Satisfação Comprovada', description: 'Milhares de clientes confiam na nossa qualidade e serviço.' },
];

const faqData: FaqItem[] = [
    { question: 'Quais são os prazos de entrega?', answer: 'O prazo de entrega varia conforme a sua localidade e a modalidade de frete escolhida. Em geral, para capitais, o prazo é de 3 a 7 dias úteis. Você pode calcular o prazo exato na página do produto ou no carrinho.' },
    { question: 'Posso trocar um produto?', answer: 'Sim, você pode solicitar a troca do produto em até 7 dias corridos após o recebimento, desde que o produto esteja em perfeitas condições e com a embalagem original. Consulte nossa política de trocas para mais detalhes.' },
    { question: 'Quais formas de pagamento são aceitas?', answer: 'Aceitamos cartões de crédito (Visa, Mastercard, Elo, Amex), boleto bancário e PIX. O parcelamento no cartão de crédito pode ser feito em até 10x sem juros, dependendo do valor da compra.' },
    { question: 'Os produtos possuem garantia?', answer: 'Todos os nossos produtos possuem garantia contra defeitos de fabricação. O período de garantia varia conforme o fabricante e o tipo de produto. Verifique a descrição do produto ou entre em contato conosco para informações específicas.' },
];

// Componente reutilizável para FAQ Item (interno)
const FaqItem: React.FC<{ faq: FaqItem; isOpen: boolean; onToggle: () => void }> = ({ faq, isOpen, onToggle }) => (
    <div className="border-b border-slate-200">
        <h2>
            <button
                type="button"
                className="flex items-center justify-between w-full py-5 px-1 text-left font-medium text-slate-700 hover:bg-slate-50 transition-colors rounded-lg"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <span>{faq.question}</span>
                {isOpen ? <ChevronUp size={20} className="text-orange-600" /> : <ChevronDown size={20} className="text-slate-500" />}
            </button>
        </h2>
        {isOpen && (
            <div className="py-5 px-1 pt-0 animate-fadeIn">
                <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
            </div>
        )}
    </div>
);

export default function Home({ featuredProducts, popularProducts, newProducts, _categories, blogPosts, heroSlides }: HomeProps) {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <SiteLayout>
            <Head title="Venda e Consultoria de EPI's" />

            {/* Hero Section with improved spacing */}
            <div className="bg-gradient-to-b  py-6 md:py-8">
                <div className="container mx-auto px-4">
                    <HeroSlider slides={heroSlides} />
                </div>
            </div>

            {/* Features (Diferenciais/Benefícios) */}
            <section className=" ">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuresData.map((feature) => (
                            <div
                                key={feature.title}
                                className="flex flex-col items-center text-center p-6 rounded-4xl border border-slate-200 transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="p-3 bg-orange-100 rounded-full mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Produtos em Destaque */}
            <ProductSection title="Produtos em Destaque" products={featuredProducts?.map(p => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                category: p.category ? { name: p.category.name } : { name: '' },
                price: String(p.price ?? ''),
                old_price: p.old_price ? String(p.old_price) : null,
                isNew: p.isNew,
                main_image: p.main_image as unknown as InlineImage
            }))} bgColor="bg-white" />

            {/* Slide categories / Categorias em Destaque */}
            <CategorySection categories={_categories} />

            {/* Produtos Populares */}
            <ProductSection title="Mais Populares" products={popularProducts?.map(p => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                category: p.category ? { name: p.category.name } : { name: '' },
                price: String(p.price ?? ''),
                old_price: p.old_price ? String(p.old_price) : null,
                isNew: p.isNew,
                main_image: p.main_image as unknown as InlineImage
            }))} bgColor="bg-white" />

            {/* Novos Produtos */}
            <ProductSection title="Novidades na Loja" products={newProducts?.map(p => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                category: p.category ? { name: p.category.name } : { name: '' },
                price: String(p.price ?? ''),
                old_price: p.old_price ? String(p.old_price) : null,
                isNew: p.isNew,
                main_image: p.main_image as unknown as InlineImage
            }))} bgColor="bg-slate-50" />

            {/* Blog */}
            <section className="py-16 md:py-24 bg-slate-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Fique por Dentro</h2>
                        <p className="text-lg text-slate-600 max-w-xl mx-auto">Artigos, dicas e novidades do mundo da segurança no trabalho.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {(blogPosts || []).map((post) => (
                            <a
                                key={post.id}
                                href={post.link}
                                className="group bg-white rounded-xl border border-zinc-200 hover:shadow-xl overflow-hidden flex flex-col transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="overflow-hidden">
                                    <img
                                        src={post.imageUrl}
                                        alt={post.title}
                                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <p className="text-xs text-slate-500 mb-1">{post.date}</p>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-orange-600 transition-colors flex-grow">{post.title}</h3>
                                    <p className="text-sm text-slate-600 mb-4 leading-relaxed line-clamp-3">{post.excerpt}</p>
                                    <span className="mt-auto text-sm font-medium text-orange-600 hover:text-orange-700 inline-flex items-center">
                                        Ler Artigo <ArrowRight size={16} className="ml-1.5" />
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <a
                            href="/blog"
                            className="inline-flex items-center justify-center px-7 py-3 border border-slate-300 text-base font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-100 transition-all duration-300 transform hover:scale-105 active:scale-95"
                        >
                            Ver Todos os Artigos <BookOpen size={18} className="ml-2" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Perguntas Frequentes */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-12 md:mb-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                                <HelpCircle size={32} className="text-orange-600" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Perguntas Frequentes</h2>
                            <p className="text-lg text-slate-600">Tire suas dúvidas sobre nossos produtos e serviços.</p>
                        </div>
                        <div className="space-y-1 bg-white rounded-xl border border-slate-200 p-4">
                            {faqData.map((faq, index) => (
                                <FaqItem
                                    key={index}
                                    faq={faq}
                                    isOpen={openFaqIndex === index}
                                    onToggle={() => toggleFaq(index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
