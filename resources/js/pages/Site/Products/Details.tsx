// Indique que este é um Componente do Cliente para usar useState
'use client';

import React, { useState, useEffect } from 'react';
import SiteLayout from '@/layouts/site-layout';
import {
    Star, ShoppingBag, ShieldCheck, Zap, Truck, RotateCcw, MessageSquare, ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, CheckCircle, CreditCard
} from 'lucide-react';
import { Head, Link } from '@inertiajs/react';

// Interfaces para os tipos de dados
interface Image {
    id: number;
    name: string;
    original_name: string;
    size: number;
    is_main?: boolean;
    url: string;
    versions?: Image[];
    version: string;
}

interface Color {
    id: number;
    name: string;
    hex_code: string | null;
    active: boolean;
    order: number;
    created_at: string;
    updated_at: string;
    images?: Image[];
}

interface Size {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
    available: boolean;
    order: number;
    created_at: string;
    updated_at: string;
}

interface Attribute {
    id: number;
    name: string;
    value: string;
    description: string | null;
    type: string;
    filterable: boolean;
    visible: boolean;
    order: number;
    created_at: string;
    updated_at: string;
}

interface Variant {
    id: number;
    product_id: number;
    product_color_id: number | null;
    product_size_id: number | null;
    sku: string | null;
    barcode: string | null;
    price: number | null;
    stock: number;
    active: boolean;
    attributes: any;
    created_at: string;
    updated_at: string;
    color?: Color;
    size?: Size;
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Inventory {
    id: number;
    warehouse: {
        name: string;
    };
    location: string | null;
    quantity: number;
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
    images: Image[];
    colors: Color[];
    sizes: Size[];
    attributes: Attribute[];
    variants: Variant[];
    total_stock: number;
    inventories: Inventory[];
}

interface Props {
    product: Product;
}

// Componente principal da página de detalhes do produto
export default function ProductDetails({ product }: Props) {
    // Estado para controlar a imagem selecionada
    const [selectedImage, setSelectedImage] = useState<Image | null>(null);
    const [selectedColor, setSelectedColor] = useState<Color | null>(null);
    const [selectedSize, setSelectedSize] = useState<Size | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');

    // Encontrar a imagem principal ou usar a primeira imagem
    useEffect(() => {
        if (product && product.images && product.images.length > 0) {
            const mainImage = product.images.find(img => img.is_main) || product.images[0];
            setSelectedImage(mainImage);

            if (product.colors && product.colors.length > 0) {
                setSelectedColor(product.colors[0]);

                // Se a primeira cor tiver imagens associadas, selecione a primeira
                const firstColor = product.colors[0];
                if (firstColor.images && firstColor.images.length > 0) {
                    setSelectedImage(firstColor.images[0]);
                }
            }

            if (product.sizes && product.sizes.length > 0) {
                setSelectedSize(product.sizes[0]);
            }
        }
    }, [product]);

    // Função para selecionar uma cor e mostrar a imagem associada
    const handleColorSelect = (color: Color) => {
        setSelectedColor(color);

        // Se a cor tiver imagens associadas, selecione a primeira
        if (color.images && color.images.length > 0) {
            setSelectedImage(color.images[0]);
        } else {
            // Se não tiver imagens específicas, volte para a imagem principal
            const mainImage = product.images.find(img => img.is_main) || product.images[0];
            setSelectedImage(mainImage);
        }
    };

    // Função para alterar a quantidade
    const handleQuantityChange = (amount: number) => {
        setQuantity(prev => Math.max(1, prev + amount)); // Mínimo de 1
    };

    // Função para adicionar ao carrinho
    const handleAddToCart = () => {
        console.log({
            productId: product.id,
            name: product.name,
            color: selectedColor?.name,
            size: selectedSize?.name,
            quantity,
            price: product.price,
        });
        // Lógica para adicionar ao carrinho aqui
        alert(`Adicionado ao carrinho: ${quantity}x ${product.name} ${selectedColor ? `(${selectedColor.name}` : ''}${selectedSize ? `, ${selectedSize.name})` : ''}`);
    };

    // Função para comprar agora
    const handleBuyNow = () => {
        // Adiciona ao carrinho e redireciona para o checkout
        handleAddToCart();
        // Aqui você pode redirecionar para a página de checkout
        // window.location.href = '/checkout';
        alert('Redirecionando para o checkout...');
    };

    // Função para formatar preço
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: product.currency || 'MZN',
        }).format(value);
    };

    // Verificar se o produto está em estoque
    const isInStock = product.total_stock > 0;

    if (!product) {
        return (
            <SiteLayout>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h1 className="text-3xl font-bold text-slate-800 mb-4">Produto Não Encontrado</h1>
                    <p className="text-slate-600 mb-8">O produto que você procura não existe ou foi movido.</p>
                    <Link href="/products" className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700">
                        <ArrowLeft size={18} className="mr-2" /> Voltar para a Loja
                    </Link>
                </div>
            </SiteLayout>
        );
    }

    return (
        <SiteLayout>
            <Head title={product.name} />

            <div className="bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    {/* Breadcrumbs */}
                    <nav className="text-sm mb-6 text-slate-500">
                        <Link href="/" className="hover:text-orange-600">Início</Link>
                        <span className="mx-2">/</span>
                        <Link href="/products" className="hover:text-orange-600">Produtos</Link>
                        <span className="mx-2">/</span>
                        <Link href={`/products?categoria=${product.category.id}`} className="hover:text-orange-600">{product.category.name}</Link>
                        <span className="mx-2">/</span>
                        <span className="text-slate-700 font-medium">{product.name}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                        {/* Galeria de Imagens */}
                        <div className="space-y-4">
                            <div className="relative aspect-square border border-slate-200 rounded-lg overflow-hidden">
                                {selectedImage && (
                                    <img
                                        src={selectedImage.url}
                                        alt={product.name}
                                        className="w-full h-full object-contain p-2"
                                    />
                                )}

                            </div>

                            {product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-3">
                                    {product.images.map(img => (
                                        <button
                                            key={img.id}
                                            onClick={() => setSelectedImage(img)}
                                            className={`aspect-square border rounded-md overflow-hidden transition-all duration-150
                                                ${selectedImage?.id === img.id ? 'border-orange-500 ring-2 ring-orange-500 ring-offset-1' : 'border-slate-200 hover:border-orange-400'}`}
                                        >
                                            <img
                                                src={img.url}
                                                alt={`Miniatura ${product.name}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Informações do Produto e Ações */}
                        <div className="space-y-6">
                            <div>
                                {product.brand && (
                                    <p className="text-sm text-orange-600 font-semibold uppercase tracking-wide">{product.brand}</p>
                                )}
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-1 mb-2">{product.name}</h1>

                                <div className="flex items-center space-x-2 mb-3">
                                    {product.certification && (
                                        <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                            {product.certification}
                                        </span>
                                    )}
                                    {product.featured && (
                                        <span className="text-sm bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                                            Destaque
                                        </span>
                                    )}
                                </div>

                                {product.description && (
                                    <div
                                        className="text-sm text-slate-600 leading-relaxed line-clamp-3"
                                        dangerouslySetInnerHTML={{ __html: product.description.substring(0, 200) + '...' }}
                                    />
                                )}
                            </div>

                            {/* Preço */}
                            <div className="flex items-baseline gap-3 pb-4 border-b border-slate-200">
                                <span className="text-3xl font-bold text-slate-800">{formatCurrency(product.price)}</span>
                                {product.old_price && (
                                    <span className="text-lg text-slate-400 line-through">{formatCurrency(product.old_price)}</span>
                                )}
                                {product.old_price && (
                                    <span className="text-sm font-semibold text-red-500 bg-red-100 px-2 py-0.5 rounded-md">
                                        {Math.round(((product.old_price - product.price) / product.old_price) * 100)}% OFF
                                    </span>
                                )}
                            </div>

                            {/* Opções de Cor */}
                            {product.colors && product.colors.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">
                                        Cor: <span className="font-semibold">{selectedColor?.name}</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {product.colors.map(color => (
                                            <button
                                                key={color.id}
                                                onClick={() => handleColorSelect(color)}
                                                title={color.name}
                                                className={`w-8 h-8 border-zinc-500 rounded-full border-2 transition-all duration-150
                                                    ${selectedColor?.id === color.id ? 'ring-2 ring-orange-500 ring-offset-1' : 'border-transparent hover:opacity-80'}`}
                                                style={{ backgroundColor: color.hex_code || '#ccc' }}
                                                aria-label={`Selecionar cor ${color.name}`}
                                            >
                                                {selectedColor?.id === color.id && <CheckCircle size={16} className="text-white opacity-75 m-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Opções de Tamanho */}
                            {product.sizes && product.sizes.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">Tamanho:</label>
                                    <div className="flex flex-wrap gap-2">
                                        {product.sizes.map(size => (
                                            <button
                                                key={size.id}
                                                onClick={() => setSelectedSize(size)}
                                                className={`px-4 py-1.5 border rounded-md text-sm font-medium transition-colors duration-150
                                                    ${selectedSize?.id === size.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-700 border-slate-300 hover:border-orange-400 hover:text-orange-600'}`}
                                            >
                                                {size.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantidade e Botões de Ação */}
                            <div className="space-y-4 pt-4 border-t border-slate-200">
                                <div className="flex items-center gap-4">
                                    <label className="block text-sm font-medium text-slate-700">Quantidade:</label>
                                    <div className="flex items-center border border-slate-300 rounded-md">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-l-md transition-colors"
                                            aria-label="Diminuir quantidade"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            readOnly
                                            value={quantity}
                                            min="1"
                                            className="w-12 text-center border-x border-slate-300 py-2 text-sm font-medium text-slate-700 focus:outline-none"
                                            aria-label="Quantidade"
                                        />
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-r-md transition-colors"
                                            aria-label="Aumentar quantidade"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAddToCart}

                                        className={`cursor-pointer font-semibold py-3 px-6 rounded-md text-base transition-colors duration-300 flex items-center justify-center gap-2 bg-zinc-600 hover:bg-zinc-700 text-white`}
                                    >
                                        <ShoppingBag size={20} />
                                        Adicionar ao Carrinho
                                    </button>

                                    <button
                                        onClick={handleBuyNow}

                                        className="cursor-pointer font-semibold py-3 px-6 rounded-md text-base transition-colors duration-300 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                                    >
                                        <CreditCard size={20} />
                                        Comprar Agora
                                    </button>
                                </div>
                            </div>

                            {/* Informações Adicionais */}
                            <div className="space-y-3 pt-4 text-sm text-slate-600">
                                {product.warranty && (
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={18} className="text-green-500" />
                                        <span>Garantia: {product.warranty}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Truck size={18} className="text-orange-500" />
                                    <span>Entrega para todo o país. Calcule o frete no carrinho.</span>
                                </div>
                                {/* <div className="flex items-center gap-2">
                                    <RotateCcw size={18} className="text-sky-500" />
                                    <span>Política de troca e devolução facilitada.</span>
                                </div> */}
                            </div>
                        </div>
                    </div>

                    {/* Abas: Descrição, Especificações, Avaliações */}
                    <div className="mt-12 md:mt-16 pt-8 border-t border-slate-200">
                        {/* Navegação das Abas */}
                        <div className="border-b border-slate-200 mb-8">
                            <nav className="flex flex-wrap -mb-px">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`mr-8 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'description'
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    Descrição
                                </button>

                                {product.technical_details && (
                                    <button
                                        onClick={() => setActiveTab('technical')}
                                        className={`mr-8 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'technical'
                                            ? 'border-orange-500 text-orange-600'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                            }`}
                                    >
                                        Detalhes Técnicos
                                    </button>
                                )}

                                {product.features && (
                                    <button
                                        onClick={() => setActiveTab('features')}
                                        className={`mr-8 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'features'
                                            ? 'border-orange-500 text-orange-600'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                            }`}
                                    >
                                        Características
                                    </button>
                                )}

                                {product.attributes && product.attributes.length > 0 && (
                                    <button
                                        onClick={() => setActiveTab('attributes')}
                                        className={`mr-8 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'attributes'
                                            ? 'border-orange-500 text-orange-600'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                            }`}
                                    >
                                        Especificações
                                    </button>
                                )}
                            </nav>
                        </div>

                        {/* Conteúdo das Abas */}
                        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                            {/* Descrição Completa */}
                            {activeTab === 'description' && product.description && (
                                <div dangerouslySetInnerHTML={{ __html: product.description }} />
                            )}

                            {/* Detalhes Técnicos */}
                            {activeTab === 'technical' && product.technical_details && (
                                <div dangerouslySetInnerHTML={{ __html: product.technical_details }} />
                            )}

                            {/* Características */}
                            {activeTab === 'features' && product.features && (
                                <div dangerouslySetInnerHTML={{ __html: product.features }} />
                            )}

                            {/* Atributos */}
                            {activeTab === 'attributes' && product.attributes && product.attributes.length > 0 && (
                                <div className="overflow-hidden bg-white border border-slate-200 rounded-lg">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <tbody className="divide-y divide-slate-200">
                                            {product.attributes.map(attr => (
                                                <tr key={attr.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700 bg-slate-50 w-1/3">
                                                        {attr.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-normal text-sm text-slate-600">
                                                        {attr.value}
                                                    </td>
                                                </tr>
                                            ))}
                                            {product.weight && (
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700 bg-slate-50 w-1/3">
                                                        Peso
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-normal text-sm text-slate-600">
                                                        {product.weight} kg
                                                    </td>
                                                </tr>
                                            )}
                                            {product.origin_country && (
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700 bg-slate-50 w-1/3">
                                                        País de Origem
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-normal text-sm text-slate-600">
                                                        {product.origin_country}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SiteLayout>
    );
}
