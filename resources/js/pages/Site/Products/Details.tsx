'use client';

import { useCart } from '@/contexts/CartContext';
import SiteLayout from '@/layouts/site-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, List, ShieldCheck, ShoppingCart, Truck, X, ZoomIn, FileText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Navigation, Thumbs, Zoom } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperCore } from 'swiper/types'; // Importado para tipagem

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
    attributes: Record<string, unknown>;
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

interface BrandRel {
    id: number;
    name: string;
    logo_url?: string | null;
}

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    technical_details: string | null;
    features: string | null;
    description_pdf_url?: string | null;
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
    brand: BrandRel | null;
    origin_country: string | null;
    currency: string;
    created_at: string;
    updated_at: string;
    category: Category;
    images: Image[];
    main_image: Image | null;
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
            <Head title={product.name}>
                <meta name="description" content={product.description || ''} />
                    <link rel="canonical" href={`${window.location.origin}/products/${product.slug}`} />
                    {/* og:image */}
                    <meta
                        property="og:image"
                        content={
                            product.main_image?.versions?.find((image) => image.version == 'sm')?.url ||
                            product.main_image?.versions?.find((image) => image.version == 'md')?.url ||
                            product.main_image?.versions?.find((image) => image.version == 'lg')?.url ||
                            product.main_image?.url ||
                            window.location.origin + '/og.png'
                        }
                    />
                    <meta property="og:image:alt" content={product.name} />
            </Head>
            <ProductDetailsContent product={product} relatedProducts={relatedProducts} />
        </SiteLayout>
    );
}

// Componente interno que usa o hook useCart
function ProductDetailsContent({ product, relatedProducts }: Props) {
    const { addItem, setIsOpen } = useCart(); // Adicionado setIsOpen para abrir o carrinho se necessário

    // Estado para controlar a imagem selecionada
    const [selectedImage, setSelectedImage] = useState<Image | null>(null);
    const [selectedColor, setSelectedColor] = useState<Color | null>(product.colors && product.colors.length > 0 ? product.colors[0] : null);
    const [selectedSize, setSelectedSize] = useState<Size | null>(product.sizes && product.sizes.length > 0 ? product.sizes[0] : null);
    const [quantity, setQuantity] = useState(1);
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);
    const [mainSwiper, setMainSwiper] = useState<SwiperCore | null>(null); // Estado para o Swiper principal
    const [showZoomModal, setShowZoomModal] = useState(false);
    const [zoomImageUrl, setZoomImageUrl] = useState('');
    const [activeTab, setActiveTab] = useState('description');

    // Lista de imagens exibidas com base na cor selecionada
    const displayedImages = useMemo<Image[]>(() => {
        if (selectedColor?.images && selectedColor.images.length > 0) {
            return selectedColor.images as Image[];
        }
        return product.images;
    }, [selectedColor, product.images]);

    // Encontrar a imagem principal ou usar a primeira imagem
    useEffect(() => {
        if (displayedImages && displayedImages.length > 0) {
            const initialImage = displayedImages.find((img) => img.is_main) || displayedImages[0];
            setSelectedImage(initialImage);

            // Sincronizar o Swiper principal com a imagem inicial da lista exibida
            if (mainSwiper && !mainSwiper.destroyed) {
                const initialImageIndex = displayedImages.findIndex((img) => img.id === initialImage.id);
                mainSwiper.slideTo(initialImageIndex !== -1 ? initialImageIndex : 0, 0);
            }
        }
    }, [displayedImages, mainSwiper]);

    // Função para selecionar uma cor e mostrar a imagem associada
    const handleColorSelect = (color: Color) => {
        setSelectedColor(color);
        const nextImages = (color.images && color.images.length > 0 ? (color.images as Image[]) : product.images) || [];
        if (nextImages.length === 0) return;
        setSelectedImage(nextImages[0]);
        if (mainSwiper && !mainSwiper.destroyed) mainSwiper.slideTo(0);
        if (thumbsSwiper && !thumbsSwiper.destroyed) (thumbsSwiper as SwiperCore).slideTo(0);
    };

    // Função para abrir o modal de zoom
    const openZoomModal = (imageUrl: string) => {
        setZoomImageUrl(imageUrl);
        setShowZoomModal(true);
    };

    // Função para alterar a quantidade
    const handleQuantityChange = (amount: number) => {
        setQuantity((prev) => Math.max(1, prev + amount)); // Mínimo de 1
    };

    // Função para adicionar ao carrinho
    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            quantity: quantity,
            image:
                selectedImage?.versions?.find((image) => image.version == 'md')?.url ||
                selectedImage?.versions?.find((image) => image.version == 'lg')?.url ||
                selectedImage?.url,
            slug: product.slug,
            color_id: selectedColor?.id || null,
            color_name: selectedColor?.name || null,
            size_id: selectedSize?.id || null,
            size_name: selectedSize?.name || null,
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
            image:
                selectedImage?.versions?.find((image) => image.version == 'md')?.url ||
                selectedImage?.versions?.find((image) => image.version == 'lg')?.url ||
                selectedImage?.url,
            slug: product.slug,
            color_id: selectedColor?.id || null,
            color_name: selectedColor?.name || null,
            size_id: selectedSize?.id || null,
            size_name: selectedSize?.name || null,
        });
        // Aqui você pode redirecionar para a página de quotation
        router.visit('/quotation'); // Usando router do Inertia para navegação
    };

    // ...

    // Verificar se o produto está em estoque
    const isInStock = product.total_stock > 0; // ATENÇÃO: Considerar estoque da variante

    if (!product) {
        return (
            <SiteLayout>
                <div className="container mx-auto px-4 py-16 text-center sm:px-6 lg:px-8">
                    <h1 className="mb-4 text-3xl font-bold text-slate-800">Produto Não Encontrado</h1>
                    <p className="mb-8 text-slate-600">O produto que você procura não existe ou foi movido.</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center rounded-md border border-transparent bg-orange-600 px-6 py-2 text-base font-medium text-white hover:bg-orange-700"
                    >
                        <ArrowLeft size={18} className="mr-2" /> Voltar para a Loja
                    </Link>
                </div>
            </SiteLayout>
        );
    }

    return (
        <>
            <div className="bg-white">
                <div className="container mx-auto px-4 py-8 sm:px-6 md:py-12 lg:px-8">
                    {/* Breadcrumbs */}
                    <nav className="mb-6 text-sm text-slate-500">
                        <Link href="/" className="hover:text-orange-600">
                            Início
                        </Link>
                        <span className="mx-2">/</span>
                        <Link href="/products" className="hover:text-orange-600">
                            Produtos
                        </Link>
                        <span className="mx-2">/</span>
                        <Link href={`/products?categoria=${product.category.id}`} className="hover:text-orange-600">
                            {product.category.name}
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="font-medium text-slate-700">{product.name}</span>
                    </nav>

                    <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2">
                        {/* Galeria de Imagens com Swiper */}
                        <div className="space-y-4">
                            <div className="relative aspect-square overflow-hidden rounded-lg border  !h-[500px] w-full border-slate-200">
                                <Swiper
                                    modules={[Navigation, Thumbs, Zoom]}
                                    navigation
                                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                                    zoom={{ maxRatio: 4 }}
                                    className="product-main-swiper"
                                    onSwiper={setMainSwiper} // Captura a instância do Swiper principal
                                    onSlideChange={(swiper) => {
                                        // Atualiza selectedImage quando o slide do Swiper principal muda
                                        if (displayedImages[swiper.activeIndex]) {
                                            setSelectedImage(displayedImages[swiper.activeIndex]);
                                        }
                                    }}
                                >
                                    {displayedImages.map((img) => (
                                        <SwiperSlide key={img.id} className="cursor-zoom-in !h-[500px]">
                                            <div className="swiper-zoom-container">
                                                <img
                                                    src={
                                                        img.versions?.find((image) => image.version == 'md')?.url ||
                                                        img.versions?.find((image) => image.version == 'lg')?.url ||
                                                        img.url
                                                    }
                                                    alt={product.name}
                                                    className="h-full w-full object-contain p-2"
                                                />
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                                <button
                                    className="absolute right-4 bottom-4 z-10 rounded-full bg-white/80 p-2 shadow-md transition-colors hover:bg-white"
                                    onClick={() => {
                                        const activeImageIndex = mainSwiper ? mainSwiper.activeIndex : -1;
                                        const imageUrlForZoom =
                                            activeImageIndex !== -1 && displayedImages[activeImageIndex]
                                                ? displayedImages[activeImageIndex].url
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

                            {displayedImages.length > 1 && (
                                <Swiper
                                    modules={[Navigation, Thumbs]}
                                    watchSlidesProgress
                                    slidesPerView={4}
                                    spaceBetween={10}
                                    onSwiper={setThumbsSwiper}
                                    className="product-thumbs-swiper"
                                >
                                    {displayedImages.map((img, index) => (
                                        <SwiperSlide key={img.id} className="cursor-pointer">
                                            <div
                                                className={`flex aspect-square overflow-hidden rounded-md border transition-all duration-150 ${selectedImage?.id === img.id ? 'border-orange-500 ring-2 ring-orange-500 ring-offset-1' : 'border-slate-200 hover:border-orange-400'} `}
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
                                                        img.url
                                                    }
                                                    alt={`Miniatura ${product.name}`}
                                                    className="h-full w-full object-contain"
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
                                <div className="flex flex-wrap items-center gap-3">
                                    {product.brand && (
                                        <div className="flex items-center gap-2">
                                            {product.brand.logo_url && (
                                                <img
                                                    src={product.brand.logo_url}
                                                    alt={product.brand.name}
                                                    className="h-5 w-5 rounded object-contain"
                                                />
                                            )}
                                            <p className="text-sm font-semibold tracking-wide text-orange-600 uppercase">{product.brand.name}</p>
                                        </div>
                                    )}

                                    <p className="text-sm font-semibold tracking-wide text-zinc-600 uppercase">
                                        | {product.category.parent?.name} - {product.category.name}
                                    </p>
                                </div>
                                <h1 className="mt-4 mb-2 text-3xl font-bold text-slate-800 md:text-4xl">{product.name}</h1>

                                <div className="mb-3 flex items-center space-x-2">
                                    {product.certification && (
                                        <span className="rounded bg-green-100 px-2 py-0.5 text-sm text-green-800">{product.certification}</span>
                                    )}
                                    {product.featured && <span className="rounded bg-orange-100 px-2 py-0.5 text-sm text-orange-800">Destaque</span>}
                                </div>

                                <div className="text-zinc-700" dangerouslySetInnerHTML={{ __html: product.description || '' }} />
                            </div>

                            {/* Opções de Cor */}
                            {product.colors && product.colors.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">
                                        Cor: <span className="font-semibold">{selectedColor?.name}</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {product.colors.map((color) => (
                                            <button
                                                key={color.id}
                                                onClick={() => handleColorSelect(color)}
                                                title={color.name}
                                                className={`h-8 w-8 rounded-full border-2 border-zinc-500 transition-all duration-150 ${selectedColor?.id === color.id ? 'ring-2 ring-orange-500 ring-offset-1' : 'border-transparent hover:opacity-80'}`}
                                                style={{ backgroundColor: color.hex_code || '#ccc' }}
                                                aria-label={`Selecionar cor ${color.name}`}
                                            >
                                                {selectedColor?.id === color.id && <CheckCircle size={16} className="m-auto text-white opacity-75" />}
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
                                        {product.sizes.map((size) => (
                                            <button
                                                key={size.id}
                                                onClick={() => setSelectedSize(size)}
                                                className={`rounded-md border px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${selectedSize?.id === size.id ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-orange-400 hover:text-orange-600'}`}
                                            >
                                                {size.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantidade e Botões de Ação */}
                            <div className="space-y-4 border-t border-slate-200 pt-4">
                                {/* Preço por consulta inline */}
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <List size={18} className="text-orange-500" />
                                    <span>Preço por consulta</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="block text-sm font-medium text-slate-700">Quantidade:</label>
                                    <div className="flex items-center rounded-md border border-slate-300">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            className="rounded-l-md px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100"
                                            aria-label="Diminuir quantidade"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            readOnly
                                            value={quantity}
                                            min="1"
                                            className="w-12 border-x border-slate-300 py-2 text-center text-sm font-medium text-slate-700 focus:outline-none"
                                            aria-label="Quantidade"
                                        />
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            className="rounded-r-md px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100"
                                            aria-label="Aumentar quantidade"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAddToCart}
                                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-md bg-zinc-600 px-6 py-3 text-base font-semibold text-white transition-colors duration-300 hover:bg-zinc-700`}
                                        disabled={!isInStock} // Exemplo: desabilitar se fora de estoque
                                    >
                                        <ShoppingCart size={16} />
                                        Adicionar a cotação
                                    </button>

                                    <button
                                        onClick={handleBuyNow}
                                        className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-orange-500 px-6 py-3 text-base font-semibold text-white transition-colors duration-300 hover:bg-orange-600"
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
                                {product.description_pdf_url && (
                                    <div className="flex items-center gap-2">
                                        <FileText size={18} className="text-blue-600" />
                                        <a
                                            href={product.description_pdf_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            Ver ficha técnica (PDF)
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Abas: Descrição, Especificações, Avaliações */}
                    <div className="mt-12 border-t border-slate-200 pt-8 md:mt-16">
                        {/* Navegação das Abas */}
                        <div className="mb-8 border-b border-slate-200">
                            <nav className="-mb-px flex flex-wrap">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`mr-8 border-b-2 py-2 px-4 text-sm font-medium transition-colors ${
                                        activeTab === 'description'
                                            ? 'border-orange-500 text-orange-600'
                                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                    }`}
                                >
                                    Descrição
                                </button>

                                {product.technical_details && (
                                    <button
                                        onClick={() => setActiveTab('technical')}
                                        className={`mr-8 border-b-2 py-4 text-sm font-medium transition-colors ${
                                            activeTab === 'technical'
                                                ? 'border-orange-500 text-orange-600'
                                                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                        }`}
                                    >
                                        Detalhes Técnicos
                                    </button>
                                )}

                                {product.features && (
                                    <button
                                        onClick={() => setActiveTab('features')}
                                        className={`mr-8 border-b-2 py-4 text-sm font-medium transition-colors ${
                                            activeTab === 'features'
                                                ? 'border-orange-500 text-orange-600'
                                                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                        }`}
                                    >
                                        Características
                                    </button>
                                )}

                                {product.attributes && product.attributes.length > 0 && (
                                    <button
                                        onClick={() => setActiveTab('attributes')}
                                        className={`mr-8 border-b-2 py-4 text-sm font-medium transition-colors ${
                                            activeTab === 'attributes'
                                                ? 'border-orange-500 text-orange-600'
                                                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                        }`}
                                    >
                                        Especificações
                                    </button>
                                )}

                            </nav>
                        </div>

                        {/* Conteúdo das Abas */}
                        <div className="prose prose-slate max-w-none leading-relaxed text-slate-700">
                            {/* Descrição Completa */}
                            {activeTab === 'description' && product.description && <div dangerouslySetInnerHTML={{ __html: product.description }} />}

                            {/* Detalhes Técnicos */}
                            {activeTab === 'technical' && product.technical_details && (
                                <div dangerouslySetInnerHTML={{ __html: product.technical_details }} />
                            )}

                            {/* Características */}
                            {activeTab === 'features' && product.features && <div dangerouslySetInnerHTML={{ __html: product.features }} />}

                            {/* Atributos */}
                            {activeTab === 'attributes' && product.attributes && product.attributes.length > 0 && (
                                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <tbody className="divide-y divide-slate-200">
                                            {product.attributes.map((attr) => (
                                                <tr key={attr.id}>
                                                    <td className="w-1/3 bg-slate-50 px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-700">
                                                        {attr.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-normal text-slate-600">{attr.value}</td>
                                                </tr>
                                            ))}
                                            {product.weight && (
                                                <tr>
                                                    <td className="w-1/3 bg-slate-50 px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-700">
                                                        Peso
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-normal text-slate-600">{product.weight} kg</td>
                                                </tr>
                                            )}
                                            {product.origin_country && (
                                                <tr>
                                                    <td className="w-1/3 bg-slate-50 px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-700">
                                                        País de Origem
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-normal text-slate-600">{product.origin_country}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Preço por consulta (removido das abas; agora aparece na área de ações) */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Zoom */}
            {showZoomModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setShowZoomModal(false)}>
                    <div className="relative max-h-[90vh] max-w-4xl overflow-auto rounded-lg bg-white p-2" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="absolute top-2 right-2 z-10 rounded-full bg-white/80 p-1 shadow-md transition-colors hover:bg-white"
                            onClick={() => setShowZoomModal(false)}
                            aria-label="Fechar zoom"
                        >
                            <X size={24} className="text-slate-700" />
                        </button>
                        <img src={zoomImageUrl} alt={product.name} className="max-h-[85vh] max-w-full object-contain" />
                    </div>
                </div>
            )}

            {/* Produtos Relacionados */}
            {relatedProducts && relatedProducts.length > 0 && (
                <div className="mt-16 pb-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="mb-6 text-2xl font-bold text-slate-800">Produtos Relacionados</h2>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {relatedProducts.map((product) => (
                                <ProductCard product={product} key={product.slug} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
