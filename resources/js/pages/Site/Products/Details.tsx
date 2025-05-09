import SiteLayout from '@/layouts/site-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ArrowLeft, File, Hammer, PackageSearch, Palette, Ruler, Scan, ShieldCheck, Truck, Wrench } from 'lucide-react';
import { useState } from 'react';

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
}

interface Size {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
    available: boolean;
}

interface Attribute {
    id: number;
    name: string;
    value: string;
    description: string | null;
}

interface Variant {
    id: number;
    product_color_id: number | null;
    product_size_id: number | null;
    sku: string | null;
    price: number | null;
    stock: number;
    active: boolean;
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
    cost: number | null;
    sku: string | null;
    barcode: string | null;
    weight: number | null;
    category_id: number;
    active: boolean;
    featured: boolean;
    certification: string | null;
    warranty: string | null;
    brand: string | null;
    origin_country: string | null;
    currency: string;
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

export default function ProductDetails({ product }: Props) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState<Color | null>(null);
    const [selectedSize, setSelectedSize] = useState<Size | null>(null);

    const mainImage = product.images.find((img) => img.is_main) || product.images[0];
    const organizedImages = [...(mainImage ? [mainImage] : []), ...product.images.filter((img) => img.id !== (mainImage?.id || 0))];

    const formatCurrency = (value: number | null | undefined) => {
        if (value === null || value === undefined) return 'N/A';
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: product.currency || 'MZN',
        }).format(value);
    };

    const features = [
        { icon: <ShieldCheck size={24} className="text-orange-600" />, title: 'Certificação Garantida', description: product.certification || 'Produto certificado' },
        { icon: <Truck size={24} className="text-green-600" />, title: 'Entrega Rápida', description: 'Entrega em todo o país' },
        { icon: <Wrench size={24} className="text-orange-500" />, title: 'Suporte Especializado', description: 'Suporte técnico disponível' },
        { icon: <Hammer size={24} className="text-purple-600" />, title: 'Garantia', description: product.warranty || 'Garantia do fabricante' },
    ];

    return (
        <SiteLayout>
            <Head title={product.name} />

            <div className="container mx-auto px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Imagens do Produto */}
                    <div>
                        <div className="relative mb-4 aspect-square overflow-hidden rounded-lg border">
                            <img
                                src={
                                    organizedImages[activeImageIndex]?.versions?.find((image) => image.version == 'md')?.url ||
                                    organizedImages[activeImageIndex]?.versions?.find((image) => image.version == 'lg')?.url ||
                                    organizedImages[activeImageIndex]?.versions?.find((image) => image.version == 'xl')?.url ||
                                    organizedImages[activeImageIndex]?.url
                                }
                                alt={product.name}
                                className="h-full w-full object-contain"
                            />
                            {organizedImages[activeImageIndex]?.is_main && (
                                <Badge variant="default" className="absolute top-2 right-2">
                                    Principal
                                </Badge>
                            )}
                        </div>

                        {product.images.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {organizedImages.map((image, index) => (
                                    <div
                                        key={image.id}
                                        className={cn(
                                            'aspect-square cursor-pointer overflow-hidden rounded-md border',
                                            activeImageIndex === index && 'ring-primary ring-2',
                                        )}
                                        onClick={() => setActiveImageIndex(index)}
                                    >
                                        <img
                                            src={
                                                image.versions?.find((_image) => _image.version == 'sm')?.url ||
                                                image.versions?.find((_image) => _image.version == 'md')?.url ||
                                                image.versions?.find((_image) => _image.version == 'lg')?.url ||
                                                image.versions?.find((_image) => _image.version == 'xl')?.url ||
                                                image?.url
                                            }
                                            alt={`${product.name} - Imagem ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Informações do Produto */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
                            <div className="mt-2 flex items-center gap-2">
                                <Badge variant={product.active ? 'default' : 'secondary'}>{product.active ? 'Disponível' : 'Indisponível'}</Badge>
                                {product.featured && <Badge variant="default">Destaque</Badge>}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h2 className="text-2xl font-bold text-orange-600">{formatCurrency(product.price)}</h2>
                                {product.sku && (
                                    <p className="text-sm text-slate-500">SKU: {product.sku}</p>
                                )}
                            </div>

                            {/* Cores */}
                            {product.colors.length > 0 && (
                                <div>
                                    <h3 className="mb-2 font-medium">Cores Disponíveis</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.colors.map((color) => (
                                            <button
                                                key={color.id}
                                                onClick={() => setSelectedColor(color)}
                                                className={cn(
                                                    'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm',
                                                    selectedColor?.id === color.id && 'border-orange-600 bg-orange-50',
                                                )}
                                            >
                                                {color.hex_code && (
                                                    <div
                                                        className="h-4 w-4 rounded-full border"
                                                        style={{ backgroundColor: color.hex_code }}
                                                    />
                                                )}
                                                {color.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tamanhos */}
                            {product.sizes.length > 0 && (
                                <div>
                                    <h3 className="mb-2 font-medium">Tamanhos Disponíveis</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.sizes.map((size) => (
                                            <button
                                                key={size.id}
                                                onClick={() => setSelectedSize(size)}
                                                className={cn(
                                                    'rounded-full border px-4 py-1.5 text-sm',
                                                    selectedSize?.id === size.id && 'border-orange-600 bg-orange-50',
                                                    !size.available && 'cursor-not-allowed opacity-50',
                                                )}
                                                disabled={!size.available}
                                            >
                                                {size.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Button className="w-full" size="lg">
                                Adicionar ao Carrinho
                            </Button>
                        </div>

                        {/* Características */}
                        <div className="grid grid-cols-2 gap-4">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-3 rounded-lg border p-4">
                                    <div className="rounded-full bg-orange-50 p-2">{feature.icon}</div>
                                    <div>
                                        <h3 className="font-medium">{feature.title}</h3>
                                        <p className="text-sm text-slate-600">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Detalhes do Produto */}
                <div className="mt-12">
                    <Tabs defaultValue="description">
                        <TabsList className="mb-4">
                            <TabsTrigger value="description">Descrição</TabsTrigger>
                            {product.technical_details && <TabsTrigger value="technical">Detalhes Técnicos</TabsTrigger>}
                            {product.features && <TabsTrigger value="features">Características</TabsTrigger>}
                        </TabsList>

                        <TabsContent value="description">
                            {product.description ? (
                                <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            ) : (
                                <p className="text-gray-500">Sem descrição disponível</p>
                            )}
                        </TabsContent>

                        {product.technical_details && (
                            <TabsContent value="technical">
                                <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: product.technical_details }}
                                />
                            </TabsContent>
                        )}

                        {product.features && (
                            <TabsContent value="features">
                                <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: product.features }}
                                />
                            </TabsContent>
                        )}
                    </Tabs>
                </div>

                {/* Atributos do Produto */}
                {product.attributes.length > 0 && (
                    <div className="mt-12">
                        <h2 className="mb-6 text-2xl font-bold">Especificações</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {product.attributes.map((attribute) => (
                                <div key={attribute.id} className="rounded-lg border p-4">
                                    <h3 className="text-sm font-medium text-slate-500">{attribute.name}</h3>
                                    <p className="mt-1">{attribute.value}</p>
                                    {attribute.description && (
                                        <p className="mt-1 text-sm text-slate-600">{attribute.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Informações Adicionais */}
                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {product.brand && (
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="text-sm font-medium text-slate-500">Marca</h3>
                                <p className="mt-1">{product.brand}</p>
                            </CardContent>
                        </Card>
                    )}
                    {product.origin_country && (
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="text-sm font-medium text-slate-500">País de Origem</h3>
                                <p className="mt-1">{product.origin_country}</p>
                            </CardContent>
                        </Card>
                    )}
                    {product.weight && (
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="text-sm font-medium text-slate-500">Peso</h3>
                                <p className="mt-1">{product.weight} kg</p>
                            </CardContent>
                        </Card>
                    )}
                    {product.category && (
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="text-sm font-medium text-slate-500">Categoria</h3>
                                <p className="mt-1">{product.category.name}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </SiteLayout>
    );
} 