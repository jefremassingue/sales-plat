// Indique que este é um Componente do Cliente
// 'use client';

import React, { useState, useEffect } from 'react';
import SiteLayout from '@/layouts/site-layout';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { Tag, Calendar, Search, Newspaper, Clock, UserCircle, Filter, SearchX } from 'lucide-react';
import { format } from 'date-fns';

// --- Componente Interno Reutilizável para Card do Post ---
type BlogPost = {
    id: string;
    slug: string;
    title: string;
    excerpt?: string;
    published_at?: string | null;
    created_at?: string | null;
    read_time?: number | null;
    blog_category?: { id: string; name: string } | null;
    category?: { id: string; name: string } | null;
    author?: { name?: string; avatar?: string | null } | null;
    image?: {
        url?: string;
        versions?: { version: string; url: string }[];
    } | null;
};

const BlogPostCard = ({ post }: { post: BlogPost }) => (
    <Link
        href={`/blog/${post.slug}`}
        preserveScroll
        prefetch
        className="group bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-lg flex flex-col transition-all duration-300 hover:-translate-y-0.5"
    >
        {/* Imagem com Aspect Ratio Consistente */}
        <div className="aspect-video overflow-hidden">
            <img
                src={
                    post.image?.versions?.find((image) => image.version === 'md')?.url ||
                    post.image?.versions?.find((image) => image.version === 'lg')?.url ||
                    post.image?.url ||
                    '/og-image.png' // Imagem placeholder
                }
                alt={`Imagem para ${post.title}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
        </div>
        <div className="p-5 flex flex-col flex-grow">
            {/* Metadata Superior (Categoria e Data) */}
            <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-medium">
                    <Tag size={12} className="mr-1.5 opacity-80" /> {(post.blog_category?.name ?? post.category?.name) || 'Sem categoria'}
                </span>
          
            </div>
            {/* Título */}
            <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                {post.title}
            </h3>
            {/* Excerto */}
            <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3 flex-grow">
                {post.excerpt}
            </p>
            {/* Metadata Inferior (Autor e Tempo de Leitura) */}
            <div className="mt-auto flex justify-between items-center text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex items-center">
                    {post.author?.avatar ? (
                        <img src={post.author.avatar} alt={post.author.name} className="w-5 h-5 rounded-full mr-1.5" />
                    ) : (
                        <UserCircle size={18} className="mr-1.5 text-slate-400" />
                    )}
                    <span className="font-medium text-slate-600">{post.author?.name || 'Equipe EPI Segura'}</span>
                </div>
                <span className="inline-flex items-center">
                    <Clock size={12} className="mr-1.5 opacity-80" /> {format(post.published_at || post.created_at || new Date(), 'PPp')}
                </span>
            </div>
        </div>
    </Link>
);

// --- Componente Principal da Página do Blog ---
export default function BlogIndexPage() {
    type Category = { id: string; name: string };
    type LocalProps = {
        blogs: {
            data: BlogPost[];
            links?: { url: string | null; label: string; active: boolean }[];
        };
        _categories: Category[];
        filters: { search?: string; category_id?: string };
    };

    const { blogs, _categories, filters } = usePage().props as unknown as LocalProps;

    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || 'all');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(filters.search || '');

    // Debounce para a busca
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Atualizar a URL quando os filtros mudarem
    useEffect(() => {
        if (debouncedSearchTerm === filters.search && selectedCategory === filters.category_id) {
            return;
        }

        const params: Record<string, string> = {};
        if (debouncedSearchTerm) params.search = debouncedSearchTerm;
        if (selectedCategory !== 'all') params.category_id = selectedCategory;

        router.get('/blog', params, {
            preserveState: true,
            replace: true,
            preserveScroll: true
        });
    }, [debouncedSearchTerm, selectedCategory, filters.search, filters.category_id]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategory(categoryId);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
    };

    // Adicionar categoria "Todos" ao início da lista
    type CategoryItem = { id: string; name: string; icon?: React.ReactNode };
    const allCategories: CategoryItem[] = [
        { id: 'all', name: 'Todos', icon: <Filter size={14} className="mr-1.5" /> },
        ..._categories.map((c) => ({ id: c.id, name: c.name })),
    ];

    return (
        <SiteLayout>

            <Head title="Blog da Matony - Novidades e Dicas" />
            {/* Cabeçalho da Página do Blog */}
            <section className="bg-gradient-to-b from-orange-50 to-white pt-20 pb-16 border-b border-slate-200/70">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Newspaper size={48} className="text-orange-500 mx-auto mb-4 opacity-90" />
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 tracking-tight">Blog</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Informação e conhecimento para um ambiente de trabalho mais seguro.
                    </p>
                </div>
            </section>

            {/* Filtros e Busca */}
            <section className="sticky top-0 z-30 py-4 bg-white/95 backdrop-blur-sm border-b border-slate-200/70">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                        {/* Filtro de Categorias */}
                        <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                            <div className="flex items-center space-x-2 whitespace-nowrap py-1">
                                {allCategories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategoryChange(category.id)}
                                        className={`flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border
                                            ${selectedCategory === category.id
                                                ? 'bg-orange-100 text-orange-700 border-orange-200 '
                                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                            }`}
                                    >
                                        {category.icon}
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Barra de Busca */}
                        <div className="relative w-full md:w-auto md:min-w-[280px]">
                            <input
                                type="text"
                                placeholder="Buscar artigos..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:border-orange-500"
                            />
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Grade de Posts */}
            <section className="py-12 md:py-16 lg:py-20 bg-slate-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {blogs.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {blogs.data.map((post: BlogPost) => (
                                    <BlogPostCard key={post.id} post={post as BlogPost} />
                                ))}
                            </div>

                            {/* Paginação */}
                            {blogs.links && blogs.links.length > 3 && (
                                <div className="mt-12 flex justify-center">
                                    <nav className="flex items-center space-x-1">
                                        {blogs.links!.map((link: { url: string | null; label: string; active: boolean }, index: number) => {
                                            // Ignorar os links "prev" e "next"
                                            if (link.label === "&laquo; Previous" || link.label === "Next &raquo;") {
                                                return null;
                                            }

                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    preserveScroll
                                                    prefetch
                                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${link.active ? 'bg-orange-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </nav>
                                </div>
                            )}
                        </>
                    ) : (
                        // Estado "Sem Resultados"
                        <div className="text-center py-16 md:py-24 flex flex-col items-center">
                            <SearchX size={64} className="text-slate-400 mb-6" />
                            <h3 className="text-2xl font-semibold text-slate-700 mb-2">Nenhum artigo encontrado</h3>
                            <p className="text-slate-500 max-w-md mx-auto">
                                {searchTerm
                                    ? 'Sua busca não retornou resultados. Tente usar outros termos ou verifique a ortografia.'
                                    : 'Não encontramos artigos nesta categoria no momento. Tente selecionar "Todos" ou volte mais tarde.'}
                            </p>
                            {(searchTerm || selectedCategory !== 'all') && (
                                <button
                                    onClick={handleClearFilters}
                                    className="mt-6 inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                >
                                    Limpar Filtros e Busca
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </SiteLayout>
    );
}
