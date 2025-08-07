'use client'

import React, { useState, useEffect } from 'react';
import SiteLayout from '@/layouts/site-layout';
import {
    Star, ShoppingBag, ShieldCheck, Zap, Truck, RotateCcw, MessageSquare, ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, CheckCircle, CreditCard, X, ImageIcon,
    ShoppingCart,
    List
} from 'lucide-react';
import { Head, Link, router } from '@inertiajs/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Zoom } from 'swiper/modules';
import type { Swiper as SwiperCore } from 'swiper/types'; // Importado para tipagem
import { useCart, CartProvider } from '@/contexts/CartContext';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';
import ProductCard from '../_components/ProductCard';

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
    parent: Category | null;
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
    id: string;
    name: string;
    slug: string;
    description: string | null;
    technical_details: string | null;
    features: string | null;
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
    relatedProducts: Product[];
}

// Componente principal da página de detalhes do produto
export default function ProductDetails({ product, relatedProducts }: Props) {
    return (
        <SiteLayout>
            <Head title={product.name} />
            <ProductDetailsContent product={product} relatedProducts={relatedProducts} />
        </SiteLayout>
    );
}

// Componente interno que usa o hook useCart
function ProductDetailsContent({ product, relatedProducts }: Props) {
    const { addItem, setIsOpen } = useCart(); // Adicionado setIsOpen para abrir o carrinho se necessário

    // Estado para controlar a imagem selecionada
    const [selectedImage, setSelectedImage] = useState<Image | null>(null);
    const [selectedColor, setSelectedColor] = useState<Color | null>(null);
    const [selectedSize, setSelectedSize] = useState<Size | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);
    const [mainSwiper, setMainSwiper] = useState<SwiperCore | null>(null); // Estado para o Swiper principal
    const [showZoomModal, setShowZoomModal] = useState(false);
    const [zoomImageUrl, setZoomImageUrl] = useState('');
    const [activeTab, setActiveTab] = useState('description');

    // Encontrar a imagem principal ou usar a primeira imagem
    useEffect(() => {
        if (product && product.images && product.images.length > 0) {
            let initialImage = product.images.find(img => img.is_main) || product.images[0];

            if (product.colors && product.colors.length > 0) {
                const firstColor = product.colors[0];
                setSelectedColor(firstColor);

                // Se a primeira cor tiver imagens associadas E essas imagens estiverem na galeria principal
                if (firstColor.images && firstColor.images.length > 0) {
                    const firstColorImageCandidate = firstColor.images[0];
                    const imageInMainGallery = product.images.find(img => img.id === firstColorImageCandidate.id);
                    if (imageInMainGallery) {
                        initialImage = imageInMainGallery; // Atualiza initialImage para a da cor
                    }
                }
            }
            setSelectedImage(initialImage); // Define a imagem selecionada final

            if (product.sizes && product.sizes.length > 0) {
                setSelectedSize(product.sizes[0]);
            }

            // Sincronizar o Swiper principal com a imagem inicial
            if (mainSwiper && !mainSwiper.destroyed && initialImage) {
                const initialImageIndex = product.images.findIndex(img => img.id === initialImage.id);
                if (initialImageIndex !== -1) {
                    mainSwiper.slideTo(initialImageIndex, 0); // 0 para sem animação na carga inicial
                }
            }

        }
    }, [product, mainSwiper]); // Adicionado mainSwiper como dependência para sincronizar após sua inicialização

    // Função para selecionar uma cor e mostrar a imagem associada
    const handleColorSelect = (color: Color) => {
        setSelectedColor(color);

        let imageToDisplay: Image | undefined = undefined;

        // Se a cor tiver imagens associadas, tente usar a primeira delas
        if (color.images && color.images.length > 0) {
            const colorFirstImage = color.images[0];
            imageToDisplay = product.images.find(img => img.id === colorFirstImage.id);
        }

        // Se não encontrou uma imagem específica para a cor ou a cor não tem imagens,
        // use a imagem principal do produto ou a primeira imagem da galeria.
        if (!imageToDisplay && product.images && product.images.length > 0) {
            imageToDisplay = product.images.find(img => img.is_main) || product.images[0];
        }

        if (imageToDisplay) {
            setSelectedImage(imageToDisplay); // Para destacar a miniatura e outros usos

            const imageIndex = product.images.findIndex(img => img.id === imageToDisplay!.id);

            if (imageIndex !== -1) {
                // Deslizar o Swiper principal para a imagem
                if (mainSwiper && !mainSwiper.destroyed) {
                    mainSwiper.slideTo(imageIndex);
                }
                // Também deslizar o Swiper de miniaturas, se existir
                if (thumbsSwiper && !thumbsSwiper.destroyed) {
                    (thumbsSwiper as SwiperCore).slideTo(imageIndex);
                }
            }
        }
    };


    // Função para abrir o modal de zoom
    const openZoomModal = (imageUrl: string) => {
        setZoomImageUrl(imageUrl);
        setShowZoomModal(true);
    };

    // Função para alterar a quantidade
    const handleQuantityChange = (amount: number) => {
        setQuantity(prev => Math.max(1, prev + amount)); // Mínimo de 1
    };

    // Função para adicionar ao carrinho
    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            quantity: quantity,
            image: selectedImage?.versions?.find((image) => image.version == 'md')?.url ||
                selectedImage?.versions?.find((image) => image.version == 'lg')?.url ||
                selectedImage?.url,
            slug: product.slug,
            color_id: selectedColor?.id || null,
            color_name: selectedColor?.name || null,
            size_id: selectedSize?.id || null,
            size_name: selectedSize?.name || null
        });
        // O feedback é tratado pelo CartContext
        setIsOpen(true); // O CartContext já faz isso ao adicionar item
    };

    // Função para comprar agora
    const handleBuyNow = () => {
        // Adiciona ao carrinho e redireciona para o quotation
        addItem({
            id: product.id,
            name: product.name,
            quantity: quantity,
            image: selectedImage?.versions?.find((image) => image.version == 'md')?.url ||
                selectedImage?.versions?.find((image) => image.version == 'lg')?.url ||
                selectedImage?.url,
            slug: product.slug,
            color_id: selectedColor?.id || null,
            color_name: selectedColor?.name || null,
            size_id: selectedSize?.id || null,
            size_name: selectedSize?.name || null
        });
        // Aqui você pode redirecionar para a página de quotation
        router.visit('/quotation'); // Usando router do Inertia para navegação
    };

    // Função para formatar preço
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: product.currency || 'MZN',
        }).format(value);
    };

    // Verificar se o produto está em estoque
    const isInStock = product.total_stock > 0; // ATENÇÃO: Considerar estoque da variante

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
        <>


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
                        {/* Galeria de Imagens com Swiper */}
                        <div className="space-y-4">
                            <div className="relative aspect-square border border-slate-200 rounded-lg overflow-hidden">
                                <Swiper
                                    modules={[Navigation, Thumbs, Zoom]}
                                    navigation
                                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                                    zoom={{ maxRatio: 4 }}
                                    className="product-main-swiper"
                                    onSwiper={setMainSwiper} // Captura a instância do Swiper principal
                                    onSlideChange={(swiper) => {
                                        // Atualiza selectedImage quando o slide do Swiper principal muda
                                        if (product.images[swiper.activeIndex]) {
                                            setSelectedImage(product.images[swiper.activeIndex]);
                                        }
                                    }}
                                >
                                    {product.images.map(img => (
                                        <SwiperSlide key={img.id} className="cursor-zoom-in">
                                            <div className="swiper-zoom-container">
                                                <img
                                                    src={img.versions?.find((image) => image.version == 'md')?.url ||
                                                        img.versions?.find((image) => image.version == 'lg')?.url ||
                                                        img.url}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain p-2"
                                                />
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                                <button
                                    className="absolute bottom-4 right-4 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
                                    onClick={() => {
                                        const activeImageIndex = mainSwiper ? mainSwiper.activeIndex : -1;
                                        const imageUrlForZoom = activeImageIndex !== -1 && product.images[activeImageIndex]
                                            ? product.images[activeImageIndex].url
                                            : selectedImage?.url;

                                        if (imageUrlForZoom) {
                                            openZoomModal(imageUrlForZoom);
                                        }
                                    }}
                                    aria-label="Ampliar imagem"
                                >
                                    <ZoomIn size={20} className="text-slate-700" />
                                </button>
                            </div>

                            {product.images.length > 1 && (
                                <Swiper
                                    modules={[Navigation, Thumbs]}
                                    watchSlidesProgress
                                    slidesPerView={4}
                                    spaceBetween={10}
                                    onSwiper={setThumbsSwiper}
                                    className="product-thumbs-swiper"
                                >
                                    {product.images.map((img, index) => (
                                        <SwiperSlide key={img.id} className="cursor-pointer">
                                            <div
                                                className={`aspect-square border rounded-md flex overflow-hidden transition-all duration-150
                                                ${selectedImage?.id === img.id ? 'border-orange-500 ring-2 ring-orange-500 ring-offset-1' : 'border-slate-200 hover:border-orange-400'}
                                                `}
                                                onClick={() => {
                                                    setSelectedImage(img);
                                                    if (mainSwiper && !mainSwiper.destroyed) {
                                                        mainSwiper.slideTo(index);
                                                    }
                                                }}
                                            >
                                                <img
                                                    src={
                                                        img.versions?.find((image) => image.version == 'sm')?.url ||
                                                        img.versions?.find((image) => image.version == 'md')?.url ||
                                                        img.versions?.find((image) => image.version == 'lg')?.url ||
                                                        img.url}
                                                    alt={`Miniatura ${product.name}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            )}
                        </div>

                        {/* Informações do Produto e Ações */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex flex-wrap gap-2">
                                    {product.brand && (
                                        <p className="text-sm text-orange-600 font-semibold uppercase tracking-wide">{product.brand}</p>
                                    )}

                                    <p className="text-sm text-zinc-600 font-semibold uppercase tracking-wide">
                                        | {product.category.parent?.name} - {product.category.name}
                                    </p>

                                </div>
                                <h1 className="text-3xl md:text-4xl mt-4 font-bold text-slate-800 mb-2">{product.name}</h1>

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

                                <div className='text-zinc-700' dangerouslySetInnerHTML={{ __html: product.description || '' }} />
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
                                        disabled={!isInStock} // Exemplo: desabilitar se fora de estoque
                                    >
                                        <ShoppingCart size={16} />
                                        Adicionar a cotação
                                    </button>

                                    <button
                                        onClick={handleBuyNow}
                                        className="cursor-pointer font-semibold py-3 px-6 rounded-md text-base transition-colors duration-300 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                                        disabled={!isInStock} // Exemplo: desabilitar se fora de estoque
                                    >
                                        <List size={20} />
                                        Solicitar cotação
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
                                    <span>Entrega disponível para Maputo cidade e província. Outras regiões sob consulta.</span>
                                </div>
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

            {/* Modal de Zoom */}
            {showZoomModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowZoomModal(false)}>
                    <div className="relative max-w-4xl max-h-[90vh] overflow-auto bg-white p-2 rounded-lg" onClick={e => e.stopPropagation()}>
                        <button
                            className="absolute top-2 right-2 bg-white/80 p-1 rounded-full shadow-md hover:bg-white transition-colors z-10"
                            onClick={() => setShowZoomModal(false)}
                            aria-label="Fechar zoom"
                        >
                            <X size={24} className="text-slate-700" />
                        </button>
                        <img src={zoomImageUrl} alt={product.name} className="max-w-full max-h-[85vh] object-contain" />
                    </div>
                </div>
            )}

            {/* Produtos Relacionados */}
            {relatedProducts && relatedProducts.length > 0 && (
                <div className="mt-16 pb-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Produtos Relacionados</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {relatedProducts.map(product => (
                                <ProductCard product={product} key={product.slug} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
