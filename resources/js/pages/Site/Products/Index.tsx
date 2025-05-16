import React, { useState, useEffect, useMemo, useCallback } from 'react';
import SiteLayout from '@/layouts/site-layout';
import {
    SlidersHorizontal, Search, ChevronDown, ChevronUp, X, Star, ShoppingBag, ArrowUpDown, Grip, ListFilter, FilterX, Minus, Plus
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import ProductCard from '@/pages/Site/_components/ProductCard';


interface Category {
    id: number;
    name: string;
    slug: string;
    parent: Category | null;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    technical_details: string | null;
    features: string | null;
    price: number;
    old_price?: number;
    cost: number | null;
    sku: string | null;
    barcode: string | null;
    weight: number | null;
    category_id: number;
    stock: number;
    active: boolean;
    featured: boolean;
    certification: string | null;
    warranty: string | null;
    brand: string | null;
    origin_country: string | null;
    currency: string;
    created_at: string;
    updated_at: string;
    category: Category;
}

interface Props {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
    }
    categories: Category[]
    brands: string[]
    filters: {
        categories: number[]
        brands: string[]
        price_min: string
        price_max: string
        search: string
        c: string
        sort: string
        order: string
        page: number
    }
}

// --- Componente Principal da Página da Loja (Refatorado) ---
export default function ShopPage({ products, categories, brands, filters }: Props) {
    const [isFiltersOpenMobile, setIsFiltersOpenMobile] = useState(false);
    const [openFilterSections, setOpenFilterSections] = useState({
        categories: true,
        brands: true,
        price: true,
    });

    // Estado local para gerenciar os filtros
    const [filterData, setFilterData] = useState({
        categories: filters.categories || [],
        brands: filters.brands || [],
        price_min: filters.price_min || '',
        price_max: filters.price_max || '',
        search: filters.search || '',
        c: filters.c || '',
        sort: filters.sort || 'created_at',
        order: filters.order || 'desc',
        page: filters.page || 1,
    });

    // Calcular faixas de preço com base nos produtos disponíveis
    const priceRanges = useMemo(() => {
        if (!products.data || products.data.length === 0) return { min: 0, max: 1000 };
        const prices = products.data.map(p => parseFloat(p.price?.toString()));
        return {
            min: Math.floor(Math.min(...prices)),
            max: Math.ceil(Math.max(...prices)),
        };
    }, [products]);

    // Handler para mudanças nos filtros de texto/preço com debounce
    const handleFilterChange = (filterName: string, value) => {
        setFilterData(prev => ({
            ...prev,
            [filterName]: value,
            // Resetar página ao alterar filtros
            page: filterName !== 'page' ? 1 : prev.page
        }));
    };

    // Debounce para pesquisa ao digitar
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (filterData.search !== filters.search) {
                applyFilters();
            }
        }, 500); // 500ms de delay para o debounce

        return () => clearTimeout(delayDebounceFn);
    }, [filterData.search]);

    // Handler específico para checkboxes (categorias e marcas)
    const handleCheckboxChange = (filterType, id) => {
        const currentValues = filterData[filterType] || [];
        let newValues;

        if (currentValues.includes(id)) {
            // Remove se já existe (desmarcar)
            newValues = currentValues.filter(value => value !== id);
        } else {
            // Adiciona se não existe (marcar)
            newValues = [...currentValues, id];
        }

        // Criar um novo objeto de estado atualizado
        const updatedFilterData = {
            ...filterData,
            [filterType]: newValues,
            page: 1 // Resetar para a primeira página ao alterar filtros
        };

        // Atualizar o estado
        setFilterData(updatedFilterData);

        // Aplicar filtros com o estado ATUALIZADO, não o anterior
        setTimeout(() => {
            // Remover valores vazios para não poluir a URL
            const params = Object.fromEntries(
                Object.entries(updatedFilterData).filter(([_, value]) => {
                    if (Array.isArray(value)) return value.length > 0;
                    return value !== '' && value !== null && value !== undefined;
                })
            );

            router.get('/products', params, {
                preserveState: true,
                preserveScroll: false,
                replace: true
            });
        }, 0);
    };

    const handlePriceInputChange = (e) => {
        const { name, value } = e.target;
        const sanitizedValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        handleFilterChange(name, sanitizedValue);
    };

    const applyFilters = useCallback(() => {
        // Remover valores vazios para não poluir a URL
        const params = Object.fromEntries(
            Object.entries(filterData).filter(([_, value]) => {
                if (Array.isArray(value)) return value.length > 0;
                return value !== '' && value !== null && value !== undefined;
            })
        );

        router.get('/products', params, {
            preserveState: true,
            preserveScroll: false,
            replace: true
        });

        setIsFiltersOpenMobile(false);
    }, [filterData]);

    const clearFilters = () => {
        setFilterData({
            categories: [],
            brands: [],
            price_min: '',
            price_max: '',
            search: '',
            c: '',
            sort: 'created_at',
            order: 'desc',
            page: 1,
        });

        router.get('/products', {}, {
            preserveState: true,
            preserveScroll: false,
            replace: true
        });

        setIsFiltersOpenMobile(false);
    };

    // Toggle para abrir/fechar seções de filtro na sidebar
    const toggleFilterSection = (section) => {
        setOpenFilterSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Aplicar filtros quando o usuário pressionar Enter no campo de busca
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    // Alterar a ordenação
    const handleSortChange = (sortOption) => {
        let sortField, sortOrder;

        switch (sortOption) {
            case 'price_asc':
                sortField = 'price';
                sortOrder = 'asc';
                break;
            case 'price_desc':
                sortField = 'price';
                sortOrder = 'desc';
                break;
            case 'newest':
                sortField = 'created_at';
                sortOrder = 'desc';
                break;
            case 'name_asc':
                sortField = 'name';
                sortOrder = 'asc';
                break;
            default:
                sortField = 'created_at';
                sortOrder = 'desc';
                break;
        }

        // Criar um novo objeto de estado atualizado
        const updatedFilterData = {
            ...filterData,
            sort: sortField,
            order: sortOrder,
            page: 1 // Resetar para a primeira página ao mudar a ordenação
        };

        // Atualizar o estado
        setFilterData(updatedFilterData);

        // Aplicar filtros com o estado ATUALIZADO, não o anterior
        setTimeout(() => {
            // Remover valores vazios para não poluir a URL
            const params = Object.fromEntries(
                Object.entries(updatedFilterData).filter(([_, value]) => {
                    if (Array.isArray(value)) return value.length > 0;
                    return value !== '' && value !== null && value !== undefined;
                })
            );

            router.get('/products', params, {
                preserveState: true,
                preserveScroll: false,
                replace: true
            });
        }, 0);
    };

    // Função para navegar entre páginas
    const handlePageChange = (page: number) => {
        handleFilterChange('page', page);

        // Aplicar filtros com a nova página
        setTimeout(() => {
            // Remover valores vazios para não poluir a URL
            const params = Object.fromEntries(
                Object.entries({
                    ...filterData,
                    page
                }).filter(([_, value]) => {
                    if (Array.isArray(value)) return value.length > 0;
                    return value !== '' && value !== null && value !== undefined;
                })
            );

            router.get('/products', params, {
                preserveState: true,
                preserveScroll: true,
                replace: true
            });

            // Scroll para o topo da lista de produtos
            window.scrollTo({
                top: document.querySelector('.products-grid')?.offsetTop - 100 || 0,
                behavior: 'smooth'
            });
        }, 0);
    };

    return (
        <SiteLayout>
            {/* Cabeçalho da Loja */}
            <header className="bg-gradient-to-r from-orange-50 via-white to-amber-50 py-8 border-b border-slate-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">Loja de EPIs</h1>
                    <p className="text-slate-600">Encontre os melhores equipamentos de proteção individual.</p>
                </div>
            </header>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Botão Filtros Mobile */}
                    <div className="lg:hidden mb-4 flex justify-between items-center">
                        <button
                            onClick={() => setIsFiltersOpenMobile(!isFiltersOpenMobile)}
                            className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
                        >
                            <SlidersHorizontal size={16} className="mr-2" />
                            Filtros {isFiltersOpenMobile ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
                        </button>
                        {/* Botão Limpar Filtros Mobile */}
                        {(filterData.categories.length > 0 || filterData.brands.length > 0 || filterData.price_min || filterData.price_max || filterData.search) && (
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-red-600"
                                title="Limpar todos os filtros"
                            >
                                <FilterX size={14} className="mr-1" /> Limpar Filtros
                            </button>
                        )}
                    </div>

                    {/* Sidebar de Filtros */}
                    <aside className={`lg:w-1/4 ${isFiltersOpenMobile ? 'block animate-fade-in-down' : 'hidden'} lg:block`}>
                        <div className="space-y-0 bg-white p-5 rounded-lg border border-slate-200 lg:sticky lg:top-24">

                            {/* Cabeçalho da Sidebar com Limpar */}
                            <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 inline-flex items-center">
                                    <ListFilter size={18} className="mr-2" /> Filtros
                                </h3>
                                {(filterData.categories.length > 0 || filterData.brands.length > 0 || filterData.price_min || filterData.price_max || filterData.search) && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs font-medium text-slate-500 hover:text-red-600 flex items-center"
                                        title="Limpar todos os filtros"
                                    >
                                        <FilterX size={14} className="mr-1" /> Limpar Tudo
                                    </button>
                                )}
                            </div>

                            {/* Filtro de Busca */}
                            <div className="relative mb-5">
                                <input
                                    type="text"
                                    placeholder="Buscar por nome, marca..."
                                    value={filterData.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    className="text-zinc-800 w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                                />
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Seção de Categorias */}
                            <div className="py-3 border-t border-slate-200">
                                <button
                                    onClick={() => toggleFilterSection('categories')}
                                    className="flex justify-between items-center w-full mb-2"
                                    aria-expanded={openFilterSections.categories}
                                >
                                    <h4 className="font-semibold text-slate-700">Categorias</h4>
                                    {openFilterSections.categories ? <Minus size={16} className="text-slate-500" /> : <Plus size={16} className="text-slate-500" />}
                                </button>
                                {openFilterSections.categories && (
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                                        {categories.map(parentCat => (
                                            <div key={parentCat.id} className="ml-1">
                                                <span className="font-medium text-sm text-slate-600 block mb-1">{parentCat.name}</span>
                                                <div className="space-y-1.5 ml-2">
                                                    {parentCat.subcategories.map(subCat => (
                                                        <label key={subCat.id} className="flex items-center space-x-2 cursor-pointer text-sm text-slate-600 hover:text-orange-600">
                                                            <input
                                                                type="checkbox"
                                                                value={subCat.id}
                                                                checked={filterData.categories.includes(subCat.id)}
                                                                onChange={() => handleCheckboxChange('categories', subCat.id)}
                                                                className="text-zinc-800 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                                            />
                                                            <span>{subCat.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Seção de Marcas */}
                            <div className="py-3 border-t border-slate-200">
                                <button
                                    onClick={() => toggleFilterSection('brands')}
                                    className="flex justify-between items-center w-full mb-2"
                                    aria-expanded={openFilterSections.brands}
                                >
                                    <h4 className="font-semibold text-slate-700">Marcas</h4>
                                    {openFilterSections.brands ? <Minus size={16} className="text-slate-500" /> : <Plus size={16} className="text-slate-500" />}
                                </button>
                                {openFilterSections.brands && (
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                                        {brands.map(brand => (
                                            <label key={brand.id} className="flex items-center space-x-2 cursor-pointer text-sm text-slate-600 hover:text-orange-600">
                                                <input
                                                    type="checkbox"
                                                    value={brand.id}
                                                    checked={filterData.brands.includes(brand.id)}
                                                    onChange={() => handleCheckboxChange('brands', brand.id)}
                                                    className="text-zinc-800 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                                />
                                                <span>{brand.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Seção de Preço */}
                            <div className="py-3 border-t border-slate-200">
                                <button
                                    onClick={() => toggleFilterSection('price')}
                                    className="flex justify-between items-center w-full mb-2"
                                    aria-expanded={openFilterSections.price}
                                >
                                    <h4 className="font-semibold text-slate-700">Preço</h4>
                                    {openFilterSections.price ? <Minus size={16} className="text-slate-500" /> : <Plus size={16} className="text-slate-500" />}
                                </button>
                                {openFilterSections.price && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <label htmlFor="priceMin" className="text-xs text-slate-500 mb-1 block">Mínimo</label>
                                                <input
                                                    id="priceMin"
                                                    type="text"
                                                    placeholder={`MT ${priceRanges.min}`}
                                                    value={filterData.price_min}
                                                    name="price_min"
                                                    onChange={handlePriceInputChange}
                                                    className="text-zinc-800 w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label htmlFor="priceMax" className="text-xs text-slate-500 mb-1 block">Máximo</label>
                                                <input
                                                    id="priceMax"
                                                    type="text"
                                                    placeholder={`MT ${priceRanges.max}`}
                                                    value={filterData.price_max}
                                                    name="price_max"
                                                    onChange={handlePriceInputChange}
                                                    className="text-zinc-800 w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={applyFilters}
                                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-1.5 px-3 rounded-md text-xs transition-colors duration-300"
                                        >
                                            Aplicar Filtro de Preço
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Botão Aplicar Filtros (Visível apenas no Mobile) */}
                            <div className="mt-5 lg:hidden">
                                <button
                                    onClick={() => {
                                        applyFilters();
                                        setIsFiltersOpenMobile(false);
                                    }}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors duration-300"
                                >
                                    Aplicar Filtros
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Conteúdo Principal */}
                    <div className="flex-1">
                        {/* Barra de Controles (Ordenação, Visualização, etc) */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">Ordenar por:</span>
                                <select
                                    value={`${filterData.sort}_${filterData.order}`}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="bg-white border border-slate-300 text-slate-700 text-sm rounded-md focus:ring-orange-500 focus:border-orange-500 block p-2"
                                >
                                    <option value="created_at_desc">Mais Recentes</option>
                                    <option value="price_asc">Menor Preço</option>
                                    <option value="price_desc">Maior Preço</option>
                                    <option value="name_asc">Nome (A-Z)</option>
                                </select>
                            </div>
                            <div className="text-sm text-slate-500">
                                Mostrando <span className="font-medium text-slate-700">{products.from}-{products.to}</span> de <span className="font-medium text-slate-700">{products.total}</span> produtos
                            </div>
                        </div>

                        {/* Grid de Produtos */}
                        {products.data && products.data.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 products-grid">
                                    {products.data.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {/* Paginação */}
                                {products.last_page > 1 && (
                                    <div className="mt-8 flex justify-center">
                                        <nav className="flex items-center gap-1">
                                            {/* Botão Anterior */}
                                            <button
                                                onClick={() => products.prev_page_url && handlePageChange(products.current_page - 1)}
                                                disabled={!products.prev_page_url}
                                                className={`px-3 py-1.5 rounded-md text-sm font-medium ${products.prev_page_url
                                                    ? 'text-slate-700 hover:bg-slate-100'
                                                    : 'text-slate-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                Anterior
                                            </button>

                                            {/* Números das Páginas */}
                                            {Array.from({ length: products.last_page }, (_, i) => i + 1).map(page => {
                                                // Mostrar apenas algumas páginas para não sobrecarregar a UI
                                                if (
                                                    page === 1 ||
                                                    page === products.last_page ||
                                                    (page >= products.current_page - 1 && page <= products.current_page + 1)
                                                ) {
                                                    return (
                                                        <button
                                                            key={page}
                                                            onClick={() => handlePageChange(page)}
                                                            className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium ${page === products.current_page
                                                                ? 'bg-orange-500 text-white'
                                                                : 'text-slate-700 hover:bg-slate-100'
                                                                }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    );
                                                } else if (
                                                    (page === products.current_page - 2 && products.current_page > 3) ||
                                                    (page === products.current_page + 2 && products.current_page < products.last_page - 2)
                                                ) {
                                                    // Mostrar reticências para indicar páginas omitidas
                                                    return <span key={page} className="px-1.5">...</span>;
                                                }
                                                return null;
                                            })}

                                            {/* Botão Próximo */}
                                            <button
                                                onClick={() => products.next_page_url && handlePageChange(products.current_page + 1)}
                                                disabled={!products.next_page_url}
                                                className={`px-3 py-1.5 rounded-md text-sm font-medium ${products.next_page_url
                                                    ? 'text-slate-700 hover:bg-slate-100'
                                                    : 'text-slate-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                Próximo
                                            </button>
                                        </nav>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">Nenhum produto encontrado</h3>
                                <p className="text-slate-500 mb-6">Tente ajustar seus filtros ou buscar por outro termo.</p>
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
                                >
                                    <FilterX size={16} className="mr-2" /> Limpar Filtros
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SiteLayout>
    );
}

// Adicione estas classes ao seu CSS global ou tailwind.config.js se não existirem
// .scrollbar-thin { scrollbar-width: thin; }
// .scrollbar-thumb-slate-200::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 4px; }
// .scrollbar-thumb-slate-200 { scrollbar-color: #e2e8f0 transparent; }
// .animate-fade-in-down { animation: fadeInDown 0.3s ease-out forwards; }
// @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
