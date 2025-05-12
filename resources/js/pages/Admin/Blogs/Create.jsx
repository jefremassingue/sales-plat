import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import { Editor } from '@tinymce/tinymce-react';

export default function Create({ categories }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        featured_image: '',
        status: true,
        category_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.blogs.store'));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setData(name, type === 'checkbox' ? checked : value);
    };

    const handleEditorChange = (content) => {
        setData('content', content);
    };

    const generateSlug = () => {
        if (data.title) {
            const slug = data.title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setData('slug', slug);
        }
    };

    return (
        <AdminLayout>
            <Head title="Criar Novo Post" />

            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Criar Novo Post</h1>
                    <Link
                        href={route('admin.blogs.index')}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Voltar
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="title" value="Título" />
                            <TextInput
                                id="title"
                                name="title"
                                value={data.title}
                                className="mt-1 block w-full"
                                onChange={handleChange}
                                onBlur={generateSlug}
                                required
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="slug" value="Slug" />
                            <div className="flex items-center">
                                <TextInput
                                    id="slug"
                                    name="slug"
                                    value={data.slug}
                                    className="mt-1 block w-full"
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={generateSlug}
                                    className="ml-2 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Gerar
                                </button>
                            </div>
                            <InputError message={errors.slug} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="category_id" value="Categoria" />
                            <select
                                id="category_id"
                                name="category_id"
                                value={data.category_id}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Selecione uma categoria</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.category_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="excerpt" value="Resumo" />
                            <TextArea
                                id="excerpt"
                                name="excerpt"
                                value={data.excerpt}
                                className="mt-1 block w-full"
                                onChange={handleChange}
                                rows={3}
                            />
                            <InputError message={errors.excerpt} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="featured_image" value="URL da Imagem Destacada" />
                            <TextInput
                                id="featured_image"
                                name="featured_image"
                                value={data.featured_image}
                                className="mt-1 block w-full"
                                onChange={handleChange}
                            />
                            <InputError message={errors.featured_image} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="content" value="Conteúdo" />
                            <div className="mt-1">
                                <Editor
                                    apiKey="your-api-key"
                                    init={{
                                        height: 400,
                                        menubar: true,
                                        plugins: [
                                            'advlist autolink lists link image charmap print preview anchor',
                                            'searchreplace visualblocks code fullscreen',
                                            'insertdatetime media table paste code help wordcount'
                                        ],
                                        toolbar:
                                            'undo redo | formatselect | bold italic backcolor | \
                                            alignleft aligncenter alignright alignjustify | \
                                            bullist numlist outdent indent | removeformat | help'
                                    }}
                                    onEditorChange={handleEditorChange}
                                />
                            </div>
                            <InputError message={errors.content} className="mt-2" />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="status"
                                name="status"
                                type="checkbox"
                                checked={data.status}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <InputLabel htmlFor="status" value="Publicar imediatamente" className="ml-2" />
                            <InputError message={errors.status} className="mt-2" />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {processing ? 'A processar...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
