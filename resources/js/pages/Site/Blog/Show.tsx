'use client';

import SiteLayout from '@/layouts/site-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ArrowLeft, Calendar, Clock, Share2, Tag, UserCircle } from 'lucide-react';
import { useState } from 'react';
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
            navigator
                .share({
                    title: blog.title,
                    text: blog.excerpt,
                    url: window.location.href,
                })
                .catch((error) => console.log('Erro ao compartilhar:', error));
        } else {
            // Fallback para navegadores que não suportam a API Web Share
            navigator.clipboard
                .writeText(window.location.href)
                .then(() => {
                    setShareSuccess(true);
                    setTimeout(() => setShareSuccess(false), 3000);
                })
                .catch((err) => console.error('Erro ao copiar link:', err));
        }
    };

    return (
        <SiteLayout>
            <Head>
                <title>{`${blog.title} - Matony Serviços`}</title>
                <meta name="description" content={blog.excerpt} />
                <meta property="og:title" content={`${blog.title} - Matony Serviços`} />
                <meta property="og:description" content={blog.excerpt} />
                <meta property="og:image" content={blog.image?.url} />
                <meta property="og:url" content={window.location.href} />
            </Head>

            {/* Cabeçalho do Artigo */}
            <div className="border-b border-slate-200/70 bg-gradient-to-b from-orange-50 to-white pt-20 pb-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center gap-4">
                        <Link
                            href="/blog"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 hover:text-orange-600"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>

                        {shareSuccess && (
                            <div className="animate-fade-in-out rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">Link copiado!</div>
                        )}
                    </div>

                    <div className="mx-auto max-w-3xl">
                        {(blog.blog_category || blog.category) && (
                            <Link
                                href={`/blog?category_id=${(blog.blog_category?.id ?? blog.category?.id) as string}`}
                                className="mb-4 inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700"
                            >
                                <Tag size={14} className="mr-1.5 opacity-80" />
                                {blog.blog_category?.name ?? blog.category?.name}
                            </Link>
                        )}

                        <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{blog.title}</h1>

                        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-600">
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
                                        <img src={blog.author.avatar} alt={blog.author.name} className="mr-1.5 h-5 w-5 rounded-full" />
                                    ) : (
                                        <UserCircle size={16} className="mr-1.5 opacity-80" />
                                    )}
                                    {blog.author.name}
                                </span>
                            )}

                            <button onClick={handleShare} className="inline-flex items-center text-orange-600 hover:text-orange-700">
                                <Share2 size={16} className="mr-1.5" />
                                Compartilhar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conteúdo do Artigo */}
            <div className="bg-white py-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl">
                        {blog.image && (
                            <div className="mb-8">
                                <img
                                    src={blog.image?.versions?.find((image) => image.version === 'lg')?.url || blog.image?.url}
                                    alt={blog.title}
                                    className="h-auto max-h-[500px] w-full rounded-xl object-cover shadow-md"
                                />
                            </div>
                        )}

                        {blog.excerpt && (
                            <div className="mb-8">
                                <p className="rounded-r-md border-l-4 border-orange-500 bg-slate-50 py-2 pl-4 text-lg font-medium text-slate-700 italic">
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
                <div className="border-t border-slate-200 bg-slate-50 py-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl">
                            <h2 className="mb-6 text-2xl font-bold text-slate-900">Artigos Relacionados</h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {relatedPosts.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/blog/${post.slug}`}
                                        className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
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
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h3 className="mb-1 line-clamp-2 font-semibold text-slate-800 transition-colors group-hover:text-orange-600">
                                                {post.title}
                                            </h3>
                                            <p className="line-clamp-2 text-sm text-slate-500">{post.excerpt}</p>
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
