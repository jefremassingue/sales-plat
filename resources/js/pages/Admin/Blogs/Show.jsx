import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate } from '@/utils';

export default function Show({ blog }) {
    return (
        <AdminLayout>
            <Head title={`Blog - ${blog.title}`} />

            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">{blog.title}</h1>
                    <div className="flex space-x-2">
                        <Link
                            href={route('admin.blogs.edit', blog.id)}
                            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                            Editar
                        </Link>
                        <Link
                            href={route('admin.blogs.index')}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Voltar
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    {/* Informações do Post */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${blog.status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {blog.status ? 'Publicado' : 'Rascunho'}
                                </span>
                                {blog.category && (
                                    <span className="ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {blog.category.name}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-500">
                                {blog.published_at ? (
                                    <span>Publicado em: {formatDate(blog.published_at)}</span>
                                ) : (
                                    <span>Não publicado</span>
                                )}
                            </div>
                        </div>

                        {blog.featured_image && (
                            <div className="mb-4">
                                <img
                                    src={blog.featured_image}
                                    alt={blog.title}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            </div>
                        )}

                        {blog.excerpt && (
                            <div className="mb-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Resumo</h3>
                                <p className="text-gray-700 italic">{blog.excerpt}</p>
                            </div>
                        )}

                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Conteúdo</h3>
                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
                        </div>

                        <div className="border-t pt-4 mt-6">
                            <div className="flex justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Autor</h3>
                                    <p className="text-sm text-gray-500">{blog.user ? blog.user.name : 'Desconhecido'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Slug</h3>
                                    <p className="text-sm text-gray-500">{blog.slug}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Criado em</h3>
                                    <p className="text-sm text-gray-500">{formatDate(blog.created_at)}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Atualizado em</h3>
                                    <p className="text-sm text-gray-500">{formatDate(blog.updated_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
