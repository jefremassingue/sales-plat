import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { formatDate } from '@/utils';
import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';

export default function Index({ blogs, categories, filters }) {
    const [searchParams, setSearchParams] = useState({
        search: filters.search || '',
        status: filters.status || '',
        category_id: filters.category_id || ''
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.blogs.index'), searchParams);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    const handleDelete = (id) => {
        if (confirm('Tem certeza que deseja eliminar este post?')) {
            router.delete(route('admin.blogs.destroy', id));
        }
    };

    const clearFilters = () => {
        setSearchParams({
            search: '',
            status: '',
            category_id: ''
        });
        router.get(route('admin.blogs.index'));
    };

    return (
        <AdminLayout>
            <Head title="Gestão de Blog" />

            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Gestão de Blog</h1>
                    <Link
                        href={route('admin.blogs.create')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Novo Post
                    </Link>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700">Pesquisar</label>
                                <input
                                    type="text"
                                    id="search"
                                    name="search"
                                    value={searchParams.search}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Título, slug ou conteúdo"
                                />
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={searchParams.status}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Todos</option>
                                    <option value="true">Publicado</option>
                                    <option value="false">Rascunho</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Categoria</label>
                                <select
                                    id="category_id"
                                    name="category_id"
                                    value={searchParams.category_id}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Todas</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Limpar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Filtrar
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tabela de Posts */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Publicação</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {blogs.data.length > 0 ? (
                                blogs.data.map(blog => (
                                    <tr key={blog.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                                            <div className="text-sm text-gray-500">{blog.slug}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{blog.category ? blog.category.name : 'Sem categoria'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{blog.user ? blog.user.name : 'Desconhecido'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${blog.status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {blog.status ? 'Publicado' : 'Rascunho'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {blog.published_at ? formatDate(blog.published_at) : 'Não publicado'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Link href={route('admin.blogs.show', blog.id)} className="text-indigo-600 hover:text-indigo-900">
                                                    <FaEye className="h-5 w-5" />
                                                </Link>
                                                <Link href={route('admin.blogs.edit', blog.id)} className="text-yellow-600 hover:text-yellow-900">
                                                    <FaEdit className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(blog.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <FaTrash className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                        Nenhum post encontrado
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                <div className="mt-4">
                    <Pagination links={blogs.links} />
                </div>
            </div>
        </AdminLayout>
    );
}
