'use client';

import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ArrowLeft, Calendar, Tag, Clock, UserCircle, Share2 } from 'lucide-react';
// import Head from '@/components/head';

type BlogPost = {
    id: string;
    slug: string;
    title: string;
    excerpt?: string;
    content: string;
    published_at?: string | null;
    read_time?: number | null;
    blog_category?: { id: string; name: string } | null;
    category?: { id: string; name: string } | null;
    author?: { name?: string; avatar?: string | null } | null;
    image?: {
        url?: string;
        versions?: { version: string; url: string }[];
    } | null;
};

export default function BlogShowPage() {
    type LocalProps = { blog: BlogPost; relatedPosts: BlogPost[] };
    const { blog, relatedPosts } = usePage().props as unknown as LocalProps;
    const [shareSuccess, setShareSuccess] = useState(false);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: blog.title,
                text: blog.excerpt,
                url: window.location.href,
            })
                .catch((error) => console.log('Erro ao compartilhar:', error));
        } else {
            // Fallback para navegadores que não suportam a API Web Share
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    setShareSuccess(true);
                    setTimeout(() => setShareSuccess(false), 3000);
                })
                .catch((err) => console.error('Erro ao copiar link:', err));
        }
    };

    return (
        <SiteLayout>
            <Head title={blog.title} />

            {/* Cabeçalho do Artigo */}
            <div className="bg-gradient-to-b from-orange-50 to-white pt-20 pb-10 border-b border-slate-200/70">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Link
                            href="/blog"
                            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-orange-600 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>

                        {shareSuccess && (
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm animate-fade-in-out">
                                Link copiado!
                            </div>
                        )}
                    </div>

                    <div className="max-w-3xl mx-auto">
            {(blog.blog_category || blog.category) && (
                            <Link
                href={`/blog?category_id=${(blog.blog_category?.id ?? blog.category?.id) as string}`}
                                className="inline-flex items-center bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium mb-4"
                            >
                                <Tag size={14} className="mr-1.5 opacity-80" />
                {blog.blog_category?.name ?? blog.category?.name}
                            </Link>
                        )}

                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                            {blog.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-6">
                            {blog.published_at && (
                                <span className="inline-flex items-center">
                                    <Calendar size={16} className="mr-1.5 opacity-80" />
                                    {format(new Date(blog.published_at), "dd 'de' MMMM 'de' yyyy", { locale: pt })}
                                </span>
                            )}

                            {blog.read_time && (
                                <span className="inline-flex items-center">
                                    <Clock size={16} className="mr-1.5 opacity-80" />
                                    {blog.read_time} min de leitura
                                </span>
                            )}

                            {blog.author && (
                                <span className="inline-flex items-center">
                                    {blog.author.avatar ? (
                                        <img src={blog.author.avatar} alt={blog.author.name} className="w-5 h-5 rounded-full mr-1.5" />
                                    ) : (
                                        <UserCircle size={16} className="mr-1.5 opacity-80" />
                                    )}
                                    {blog.author.name}
                                </span>
                            )}

                            <button
                                onClick={handleShare}
                                className="inline-flex items-center text-orange-600 hover:text-orange-700"
                            >
                                <Share2 size={16} className="mr-1.5" />
                                Compartilhar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conteúdo do Artigo */}
            <div className="py-10 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        {blog.image && (
                            <div className="mb-8">
                                <img
                                    src={
                                        blog.image?.versions?.find((image) => image.version === 'lg')?.url ||
                                        blog.image?.url
                                    }
                                    alt={blog.title}
                                    className="w-full h-auto rounded-xl shadow-md object-cover max-h-[500px]"
                                />
                            </div>
                        )}

                        {blog.excerpt && (
                            <div className="mb-8">
                                <p className="text-lg text-slate-700 font-medium italic border-l-4 border-orange-500 pl-4 py-2 bg-slate-50 rounded-r-md">
                                    {blog.excerpt}
                                </p>
                            </div>
                        )}

                        <div className="prose prose-slate prose-lg max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Artigos Relacionados */}
            {relatedPosts.length > 0 && (
                <div className="py-12 bg-slate-50 border-t border-slate-200">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Artigos Relacionados</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedPosts.map(post => (
                                    <Link
                                        key={post.id}
                                        href={`/blog/${post.slug}`}
                                        className="group bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
                                        preserveScroll={true}
                                    >
                                        {post.image && (
                                            <div className="aspect-video overflow-hidden">
                                                <img
                                                    src={
                                                        post.image?.versions?.find((image) => image.version === 'sm')?.url ||
                                                        post.image?.versions?.find((image) => image.version === 'md')?.url ||
                                                        post.image?.url
                                                    }
                                                    alt={post.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 line-clamp-2">
                                                {post.excerpt}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SiteLayout>
    );
}
