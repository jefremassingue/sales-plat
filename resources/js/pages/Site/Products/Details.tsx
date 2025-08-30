'use client';

import { useCart } from '@/contexts/CartContext';
import SiteLayout from '@/layouts/site-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, FileText, List, ShieldCheck, ShoppingCart, Truck, X, ZoomIn } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
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

export interface Variant {
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
    // Helper to get all og meta values
    const getOgMetaValues = useCallback(() => {
        const ogTitle = product?.name ? `${product.name} - Matony Serviços` : 'Matony Serviços';
        const ogDescription = product?.description?.replace(/<[^>]*>/g, '')?.slice(0, 160) || 'Serviços profissionais da Matony.';
        const ogImage = (
            product?.main_image?.versions?.find((img) => img.version === 'sm')?.url ||
            product?.main_image?.versions?.find((img) => img.version === 'md')?.url ||
            product?.main_image?.versions?.find((img) => img.version === 'lg')?.url ||
            product?.main_image?.url ||
            window.location.origin + '/default-image.png'
        );
        const ogUrl = window.location.href;
        const ogSiteName = 'Matony Serviços';
        const ogType = 'website';
        return {
            'og:type': ogType,
            'og:site_name': ogSiteName,
            'og:title': ogTitle,
            'og:description': ogDescription,
            'og:image': ogImage,
            'og:url': ogUrl,
        };
    }, [product]);

    // Override all og:* meta tags with JS after render
    useEffect(() => {
        const ogMeta = getOgMetaValues();
        Object.entries(ogMeta).forEach(([property, value]) => {
            let metaTag = document.querySelector(`meta[property="${property}"]`);
            if (!metaTag) {
                metaTag = document.createElement('meta');
                metaTag.setAttribute('property', property);
                document.head.appendChild(metaTag);
            }
            metaTag.setAttribute('content', value);
        });
    }, [product, getOgMetaValues]);

    return (
        <SiteLayout>
            <Head>
                {/* SEO Básico */}
                <title>{product?.name ? `${product.name} - Matony Serviços` : 'Matony Serviços'}</title>

                <meta
                    name="description"
                    content={product?.description?.replace(/<[^>]*>/g, '')?.slice(0, 160) || 'Serviços profissionais da Matony.'}
                />
                <meta name="keywords" content={`${product?.name || ''}, serviços, Matony`} />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Matony Serviços" />
                <meta property="og:title" content={product?.name ? `${product.name} - Matony Serviços` : 'Matony Serviços'} />
                <meta
                    property="og:description"
                    content={product?.description?.replace(/<[^>]*>/g, '')?.slice(0, 160) || 'Serviços profissionais da Matony.'}
                />
                
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />

                {/* Twitter Cards */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@matony" />
                <meta name="twitter:title" content={product?.name ? `${product.name} - Matony Serviços` : 'Matony Serviços'} />
                <meta
                    name="twitter:description"
                    content={product?.description?.replace(/<[^>]*>/g, '')?.slice(0, 160) || 'Serviços profissionais da Matony.'}
                />
                <meta
                    name="twitter:image"
                    content={
                        product?.main_image?.versions?.find((img) => img.version === 'sm')?.url ||
                        product?.main_image?.versions?.find((img) => img.version === 'md')?.url ||
                        product?.main_image?.versions?.find((img) => img.version === 'lg')?.url ||
                        product?.main_image?.url ||
                        (typeof window !== 'undefined' ? window.location.origin + '/default-image.png' : '/default-image.png')
                    }
                />

                {/* Extra de compatibilidade */}
                <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
                <meta name="author" content="Matony Serviços" />
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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [galleryRef, setGalleryRef] = useState<ImageGallery | null>(null);
    const [showZoomModal, setShowZoomModal] = useState(false);
    const [zoomImageUrl, setZoomImageUrl] = useState('');
    const [activeTab, setActiveTab] = useState('description');

    // Nova lógica de imagens:
    // 1) Sempre mostrar TODAS as imagens do produto na galeria
    // 2) Ao clicar em uma cor, navegar para o índice da imagem que corresponde à cor
    const displayedImages = useMemo<Image[]>(() => product.images, [product.images]);
    const currentVariant = useMemo<Variant | null>(() => {
        // Encontrar variante que corresponda à cor e tamanho selecionados
        const variant = product.variants.find((v) => {
            const colorMatch = selectedColor ? v.product_color_id == selectedColor.id : v.product_color_id == null;
            const sizeMatch = selectedSize ? v.product_size_id == selectedSize.id : v.product_size_id == null;
            return colorMatch && sizeMatch;
        });

        // Se não encontrar uma variante exata, tentar apenas por cor ou tamanho
        if (!variant) {
            if (selectedColor) {
                return product.variants.find((v) => v.product_color_id == selectedColor.id);
            }
            if (selectedSize) {
                return product.variants.find((v) => v.product_size_id == selectedSize.id);
            }
        }

        return variant || null;
    }, [selectedColor, selectedSize, product.variants]);
    // Helper: encontra o índice da imagem que corresponde à cor
    const findImageIndexForColor = useCallback(
        (color: Color | null): number => {
            if (!color) return 0;
            const imgs = product.images || [];

            // Se a cor tem imagens vinculadas, tentar casar por id/nome com as imagens do produto
            if (color.images && color.images.length > 0) {
                for (const cimg of color.images) {
                    const byId = imgs.findIndex((img) => img.id === cimg.id);
                    if (byId !== -1) return byId;

                    const byName = imgs.findIndex(
                        (img) => (!!cimg.name && img.name === cimg.name) || (!!cimg.original_name && img.original_name === cimg.original_name),
                    );
                    if (byName !== -1) return byName;
                }
            }

            // Fallback: tentar por nome da cor contido no nome da imagem
            const colorName = (color.name || '').toLowerCase();
            if (colorName) {
                const byColorName = imgs.findIndex(
                    (img) => (img.name || '').toLowerCase().includes(colorName) || (img.original_name || '').toLowerCase().includes(colorName),
                );
                if (byColorName !== -1) return byColorName;
            }

            // Fallback final: imagem principal se existir, senão primeira
            const mainIdx = imgs.findIndex((img) => !!img.is_main);
            return mainIdx !== -1 ? mainIdx : 0;
        },
        [product.images],
    );

    // Helper: encontra a cor correspondente a uma imagem
    const findColorForImage = useCallback(
        (image: Image | null): Color | null => {
            if (!image || !product.colors || product.colors.length === 0) return null;

            // 1) Match direto por ID em color.images
            for (const color of product.colors) {
                if (color.images && color.images.some((cimg) => cimg.id === image.id)) {
                    return color;
                }
            }

            // 2) Match por nome exato em color.images
            for (const color of product.colors) {
                if (
                    color.images &&
                    color.images.some(
                        (cimg) => (!!cimg.name && cimg.name === image.name) || (!!cimg.original_name && cimg.original_name === image.original_name),
                    )
                ) {
                    return color;
                }
            }

            // 3) Fallback: nome da cor contido no nome da imagem
            const iname = (image.name || image.original_name || '').toLowerCase();
            if (iname) {
                const byContains = product.colors.find(
                    (color) => (color.name || '').toLowerCase() && iname.includes((color.name || '').toLowerCase()),
                );
                if (byContains) return byContains;
            }

            return null;
        },
        [product.colors],
    );

    // Encontrar a imagem principal ou usar a primeira imagem
    useEffect(() => {
        if (displayedImages && displayedImages.length > 0) {
            const initialImage = displayedImages.find((img) => img.is_main) || displayedImages[0];
            setSelectedImage(initialImage);

            // Sincronizar a galeria com a imagem inicial da lista exibida
            const initialImageIndex = displayedImages.findIndex((img) => img.id === initialImage.id);
            setCurrentIndex(initialImageIndex !== -1 ? initialImageIndex : 0);
            galleryRef?.slideToIndex(initialImageIndex !== -1 ? initialImageIndex : 0);
        }
    }, [displayedImages, galleryRef]);

    // Função para selecionar uma cor e mostrar a imagem associada (apenas mover o índice na galeria)
    const handleColorSelect = (color: Color) => {
        setSelectedColor(color);

        // Descobrir o índice na lista completa de imagens
        const idx = findImageIndexForColor(color);
        const safeIdx = idx >= 0 && idx < displayedImages.length ? idx : 0;
        const img = displayedImages[safeIdx];
        if (img) setSelectedImage(img);
        setCurrentIndex(safeIdx);
        galleryRef?.slideToIndex(safeIdx);
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
            variant_id: currentVariant?.id || null,
            variant_sku: currentVariant?.sku || null,
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

            variant_id: currentVariant?.id || null,
            variant_sku: currentVariant?.sku || null,
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
                        {/* Galeria de Imagens com react-image-gallery */}
                        <div className="space-y-4">
                            <div className="relative w-full overflow-hidden">
                                <ImageGallery
                                    ref={(instance) => setGalleryRef(instance)}
                                    items={displayedImages.map((img) => ({
                                        original:
                                            img.versions?.find((image) => image.version == 'md')?.url ||
                                            img.versions?.find((image) => image.version == 'lg')?.url ||
                                            img.url,
                                        thumbnail:
                                            img.versions?.find((image) => image.version == 'sm')?.url ||
                                            img.versions?.find((image) => image.version == 'md')?.url ||
                                            img.url,
                                        originalAlt: product.name,
                                        thumbnailAlt: `Miniatura ${product.name}`,
                                        originalClass: 'w-full aspect-[4/3] object-contain p-3',
                                        thumbnailClass: 'object-contain',
                                    }))}
                                    startIndex={currentIndex}
                                    onSlide={(index) => {
                                        setCurrentIndex(index);
                                        const img = displayedImages[index];
                                        if (img) {
                                            setSelectedImage(img);
                                            const color = findColorForImage(img);
                                            if (color && color.id !== selectedColor?.id) {
                                                setSelectedColor(color);
                                            }
                                        }
                                    }}
                                    showPlayButton={false}
                                    showFullscreenButton={false}
                                    showNav={true}
                                    showThumbnails={displayedImages.length > 1}
                                    thumbnailPosition="bottom"
                                    additionalClass=""
                                />
                                <button
                                    className="absolute top-4 right-4 z-10 rounded-full bg-white/90 p-2 shadow-md ring-1 ring-slate-200 transition-colors hover:bg-white"
                                    onClick={() => {
                                        const activeImageIndex = currentIndex;
                                        const imageUrlForZoom =
                                            activeImageIndex !== -1 && displayedImages[activeImageIndex]
                                                ? displayedImages[activeImageIndex].versions?.find((image) => image.version == 'lg')?.url ||
                                                  displayedImages[activeImageIndex].url
                                                : selectedImage?.versions?.find((image) => image.version == 'lg')?.url || selectedImage?.url;

                                        if (imageUrlForZoom) {
                                            openZoomModal(imageUrlForZoom);
                                        }
                                    }}
                                    aria-label="Ampliar imagem"
                                >
                                    <ZoomIn size={20} className="text-slate-700" />
                                </button>
                            </div>
                        </div>

                        {/* Informações do Produto e Ações */}
                        <div className="lg:sticky lg:top-24">
                            <div className="space-y-6 rounded-xl border border-slate-200 bg-white/60 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/50">
                                {/* Cabeçalho */}
                                <div className="min-w-0">
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
                                    <h1 className="mt-3 mb-2 text-2xl leading-snug font-bold text-slate-900 md:text-3xl">{product.name}</h1>

                                    <div className="mb-4 flex flex-wrap items-center gap-2">
                                        {isInStock && (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                                <CheckCircle size={14} /> Em estoque {product.total_stock ? `(${product.total_stock})` : ''}
                                            </span>
                                        )}
                                        {product.certification && (
                                            <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                                {product.certification}
                                            </span>
                                        )}
                                        {product.featured && (
                                            <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                                                Destaque
                                            </span>
                                        )}
                                        {product.sku && (
                                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                SKU: {product.sku}
                                            </span>
                                        )}
                                        {currentVariant && (
                                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                REF: {currentVariant?.sku}
                                            </span>
                                        )}
                                        {product.barcode && (
                                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                EAN: {product.barcode}
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-slate-700" dangerouslySetInnerHTML={{ __html: product.description || '' }} />
                                </div>

                                {/* Opções */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Opções</h3>
                                    {/* Opções de Cor */}
                                    {product.colors && product.colors.length > 0 && (
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[110px_1fr] sm:items-center">
                                            <label className="text-sm font-medium text-slate-700">
                                                Cor:
                                                <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                                    {selectedColor?.name}
                                                </span>
                                            </label>
                                            <div className="flex flex-wrap gap-2.5">
                                                {product.colors.map((color) => (
                                                    <button
                                                        key={color.id}
                                                        onClick={() => handleColorSelect(color)}
                                                        title={color.name}
                                                        className={`relative h-9 w-9 rounded-full border transition-all duration-150 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:outline-none ${
                                                            selectedColor?.id === color.id
                                                                ? 'border-orange-500 ring-2 ring-orange-500 ring-offset-1'
                                                                : 'border-slate-300 hover:border-orange-400'
                                                        }`}
                                                        aria-pressed={selectedColor?.id === color.id}
                                                        style={{ backgroundColor: color.hex_code || '#ccc' }}
                                                        aria-label={`Selecionar cor ${color.name}`}
                                                    >
                                                        {selectedColor?.id === color.id && (
                                                            <span className="absolute inset-0 m-auto flex h-full w-full items-center justify-center rounded-full">
                                                                <CheckCircle size={16} className="text-white/90 drop-shadow" />
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Opções de Tamanho */}
                                    {product.sizes && product.sizes.length > 0 && (
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[110px_1fr] sm:items-center">
                                            <label className="text-sm font-medium text-slate-700">Opções:</label>
                                            <div className="flex flex-wrap gap-2.5">
                                                {product.sizes.map((size) => (
                                                    <button
                                                        key={size.id}
                                                        onClick={() => setSelectedSize(size)}
                                                        className={`rounded-md border px-3.5 py-2 text-sm font-medium transition-colors duration-150 ${
                                                            selectedSize?.id === size.id
                                                                ? 'border-orange-500 bg-orange-500 text-white'
                                                                : 'border-slate-300 bg-white text-slate-700 hover:border-orange-400 hover:text-orange-600'
                                                        }`}
                                                        aria-pressed={selectedSize?.id === size.id}
                                                        title={size.name}
                                                    >
                                                        {size.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Quantidade e Ações */}
                                <div className="space-y-4 border-t border-slate-200 pt-4">
                                    <div className="rounded-lg border border-orange-200 bg-orange-50/60 px-4 py-3 text-sm text-orange-800">
                                        <div className="flex items-center gap-2">
                                            <List size={18} className="text-orange-500" />
                                            <span className="font-medium">Preço sob consulta</span>
                                        </div>
                                        <p className="mt-1 text-xs text-orange-700">
                                            Envie uma solicitação de cotação que retornaremos com o melhor preço.
                                        </p>
                                    </div>

                                    <h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Quantidade</h3>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center overflow-hidden rounded-md border border-slate-300">
                                            <button
                                                onClick={() => handleQuantityChange(-1)}
                                                className="rounded-l-md px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                                                aria-label="Diminuir quantidade"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                readOnly
                                                value={quantity}
                                                min="1"
                                                className="w-16 border-x border-slate-300 py-2 text-center text-sm font-semibold text-slate-800 focus:outline-none"
                                                aria-label="Quantidade"
                                            />
                                            <button
                                                onClick={() => handleQuantityChange(1)}
                                                className="rounded-r-md px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                                                aria-label="Aumentar quantidade"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Ações</h3>
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <button
                                            onClick={handleAddToCart}
                                            className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-zinc-700 px-6 py-3 text-base font-semibold text-white transition-colors duration-300 hover:bg-zinc-800 sm:w-auto`}
                                        >
                                            <ShoppingCart size={16} />
                                            Adicionar à cotação
                                        </button>

                                        <button
                                            onClick={handleBuyNow}
                                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-orange-500 px-6 py-3 text-base font-semibold text-white transition-colors duration-300 hover:bg-orange-600 sm:w-auto"
                                        >
                                            <List size={20} />
                                            Solicitar cotação
                                        </button>
                                    </div>
                                </div>

                                {/* Informações Adicionais */}
                                <div className="space-y-3 pt-2 text-sm text-slate-600">
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
                                            <a
                                                href={product.description_pdf_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-base font-semibold text-white shadow transition-colors duration-200 hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:outline-none"
                                                style={{ textDecoration: 'none' }}
                                            >
                                                <FileText size={20} className="text-white" />
                                                Ver ficha técnica (PDF)
                                            </a>
                                        </div>
                                    )}
                                </div>
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
                                    className={`mr-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors md:mr-6 ${
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
                                        className={`mr-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors md:mr-6 ${
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
                                        className={`mr-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors md:mr-6 ${
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
                                        className={`mr-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors md:mr-6 ${
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
                <div className="mt-16 bg-slate-50 py-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="mb-6 text-2xl font-bold text-slate-900">Produtos Relacionados</h2>

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
