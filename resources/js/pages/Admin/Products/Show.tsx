import { DeleteAlert } from '@/components/delete-alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ArrowLeft, Edit, File, Hammer, PackageSearch, Palette, Ruler, Scan, Tag, Trash, WarehouseIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { can } from '@/lib/utils';

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

// Componente CardStock atualizado
const CardStock = ({ product }: { product: Product }) => {
    // Calcular estoque total
    const totalStock = product.total_stock || 0;

    // Obter inventário por armazém
    const inventories = product.inventories || [];

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>
                    <div className="flex justify-between items-center">
                        <span>Informações de Stock</span>
                        <Badge>{totalStock > 0 ? 'Em Stock' : 'Sem Stock'}</Badge>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div>
                        <div className="font-medium">Stock Total</div>
                        <div className="text-2xl">{totalStock}</div>
                    </div>

                    {inventories.length > 0 && (
                        <>
                            <Separator />
                            <div>
                                <div className="font-medium mb-2">Stock por Armazém</div>
                                <ul className="space-y-2">
                                    {inventories.map((inv) => (
                                        <li key={inv.id} className="flex justify-between items-center">
                                            <div>
                                                <span className="font-medium">{inv.warehouse?.name || 'Armazém'}</span>
                                                {inv.location && (
                                                    <span className="text-muted-foreground text-sm block">
                                                        {inv.location}
                                                    </span>
                                                )}
                                            </div>
                                            <Badge variant="outline">{inv.quantity}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}

                    <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/products/${product.id}/inventory`}>
                                <WarehouseIcon className="mr-2 h-4 w-4" />
                                Gerir Inventário
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function Show({ product }: Props) {
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const { toast } = useToast();
    const { flash } = usePage().props as any;

    const mainImage = product.images.find((img) => img.is_main) || product.images[0];

    // Imagens organizadas: primeiro a principal, depois as restantes
    const organizedImages = [...(mainImage ? [mainImage] : []), ...product.images.filter((img) => img.id !== (mainImage?.id || 0))];

    // Mostrar mensagens flash vindas do backend
    useEffect(() => {
        if (flash?.success) {
            toast({
                title: 'Operação bem sucedida',
                description: flash.success,
                variant: 'success',
            });
        }

        if (flash?.error) {
            toast({
                title: 'Erro',
                description: flash.error,
                variant: 'destructive',
            });
        }
    }, [flash, toast]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Produtos',
            href: '/admin/products',
        },
        {
            title: product.name,
            href: `/admin/products/${product.id}`,
        },
    ];

    const formatCurrency = (value: number | null | undefined) => {
        if (value === null || value === undefined) return 'N/A';
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: product.currency || 'MZN',
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: pt });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={product.name} />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/admin/products">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">{product.name}</h1>
                        <Badge variant={product.active ? 'success' : 'secondary'}>{product.active ? 'Activo' : 'Inactivo'}</Badge>
                        {product.featured && <Badge variant="default">Destaque</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                        {can('admin-product.edit') && (
                            <Button variant="outline" asChild>
                                <Link href={`/admin/products/${product.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                </Link>
                            </Button>
                        )}
                        {can('admin-product.edit') && (
                            <Button variant="outline" asChild className="ml-2">
                                <Link href={`/admin/products/${product.id}/inventory`}>
                                    <WarehouseIcon className="mr-2 h-4 w-4" />
                                    Gerir Inventário
                                </Link>
                            </Button>
                        )}
                        {can('admin-product.destroy') && (
                            <Button variant="destructive" onClick={() => setDeleteAlertOpen(true)}>
                                <Trash className="mr-2 h-4 w-4" />
                                Eliminar
                            </Button>
                        )}
                    </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Imagens do Produto</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {product.images.length > 0 ? (
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
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
                                        <PackageSearch className="mb-2 h-10 w-10 text-gray-400" />
                                        <p>Sem imagens disponíveis</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Informações Básicas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Preço</h3>
                                    <p className="text-xl font-bold">{formatCurrency(product.price)}</p>
                                </div>
                                {product.cost !== null && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Custo</h3>
                                        <p>{formatCurrency(product.cost)}</p>
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Categoria</h3>
                                    <p>{product.category.name}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</h3>
                                    <Badge variant={product.active ? 'success' : 'secondary'}>{product.active ? 'Activo' : 'Inactivo'}</Badge>
                                    {product.featured && (
                                        <Badge variant="default" className="ml-2">
                                            Destaque
                                        </Badge>
                                    )}
                                </div>
                                {/* <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Stock</h3>
                                    <p>{product.stock > 0 ? product.stock : <span className="text-red-500">Sem stock</span>}</p>
                                </div> */}
                                {product.sku && (
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">SKU</h3>
                                        <code className="rounded-md bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800">{product.sku}</code>
                                    </div>
                                )}
                                {product.barcode && (
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Código de Barras</h3>
                                        <code className="rounded-md bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800">{product.barcode}</code>
                                    </div>
                                )}

                                <Separator />

                                {product.brand && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Marca</h3>
                                        <p>{product.brand}</p>
                                    </div>
                                )}
                                {product.certification && (
                                    <div className="flex items-center gap-2">
                                        <File className="text-primary h-4 w-4" />
                                        <div>
                                            <h3 className="text-sm font-medium">Certificação</h3>
                                            <p className="text-sm">{product.certification}</p>
                                        </div>
                                    </div>
                                )}
                                {product.warranty && (
                                    <div className="flex items-center gap-2">
                                        <Hammer className="text-primary h-4 w-4" />
                                        <div>
                                            <h3 className="text-sm font-medium">Garantia</h3>
                                            <p className="text-sm">{product.warranty}</p>
                                        </div>
                                    </div>
                                )}
                                {product.weight && (
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Peso</h3>
                                        <p>{product.weight} kg</p>
                                    </div>
                                )}
                                {product.origin_country && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">País de Origem</h3>
                                        <p>{product.origin_country}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <CardStock product={product} />

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Detalhes do Produto</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="description">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="description">Descrição</TabsTrigger>
                                        {product.technical_details && <TabsTrigger value="technical">Detalhes Técnicos</TabsTrigger>}
                                        {product.features && <TabsTrigger value="features">Características</TabsTrigger>}
                                    </TabsList>

                                    <TabsContent value="description">
                                        {product.description ? (
                                            <div
                                                className="prose prose-sm dark:prose-invert max-w-none"
                                                dangerouslySetInnerHTML={{ __html: product.description }}
                                            />
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400">Sem descrição disponível</p>
                                        )}
                                    </TabsContent>

                                    {product.technical_details && (
                                        <TabsContent value="technical">
                                            <div
                                                className="prose prose-sm dark:prose-invert max-w-none"
                                                dangerouslySetInnerHTML={{ __html: product.technical_details }}
                                            />
                                        </TabsContent>
                                    )}

                                    {product.features && (
                                        <TabsContent value="features">
                                            <div
                                                className="prose prose-sm dark:prose-invert max-w-none"
                                                dangerouslySetInnerHTML={{ __html: product.features }}
                                            />
                                        </TabsContent>
                                    )}
                                </Tabs>
                            </CardContent>
                        </Card>

                        {product.attributes.length > 0 && (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Tag className="mr-2 h-5 w-5" />
                                        Atributos do Produto
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {product.attributes.map((attribute) => (
                                            <div key={attribute.id} className="rounded-md border p-3">
                                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{attribute.name}</h3>
                                                <p>{attribute.value}</p>
                                                {attribute.description && <p className="mt-1 text-xs text-gray-500">{attribute.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {product.colors.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Palette className="mr-2 h-5 w-5" />
                                            Cores Disponíveis
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-2">
                                            {product.colors.map((color) => (
                                                <div key={color.id} className="flex items-center gap-2 rounded-md border p-2">
                                                    {color.hex_code && (
                                                        <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: color.hex_code }} />
                                                    )}
                                                    <div>
                                                        <p className="font-medium">{color.name}</p>
                                                        {!color.active && (
                                                            <Badge variant="secondary" className="mt-1">
                                                                Inactivo
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {product.sizes.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Ruler className="mr-2 h-5 w-5" />
                                            Tamanhos Disponíveis
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-2">
                                            {product.sizes.map((size) => (
                                                <div key={size.id} className="rounded-md border p-2">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium">{size.name}</p>
                                                        <Badge variant={size.available ? 'success' : 'secondary'}>
                                                            {size.available ? 'Disponível' : 'Indisponível'}
                                                        </Badge>
                                                    </div>
                                                    {size.code && <p className="text-xs text-gray-500">Código: {size.code}</p>}
                                                    {size.description && <p className="mt-1 text-xs text-gray-500">{size.description}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {product.variants.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Scan className="mr-2 h-5 w-5" />
                                        Variantes do Produto
                                    </CardTitle>
                                    <CardDescription>Combinações específicas de cores, tamanhos e outras opções</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Cor</TableHead>
                                                    <TableHead>Tamanho</TableHead>
                                                    <TableHead>SKU</TableHead>
                                                    <TableHead>Preço</TableHead>
                                                    <TableHead>Stock</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {product.variants.map((variant) => (
                                                    <TableRow key={variant.id}>
                                                        <TableCell>
                                                            {variant.color ? (
                                                                <div className="flex items-center gap-2">
                                                                    {variant.color.hex_code && (
                                                                        <div
                                                                            className="h-4 w-4 rounded-full border"
                                                                            style={{ backgroundColor: variant.color.hex_code }}
                                                                        />
                                                                    )}
                                                                    {variant.color.name}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-500">—</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {variant.size ? variant.size.name : <span className="text-gray-500">—</span>}
                                                        </TableCell>
                                                        <TableCell>{variant.sku || <span className="text-gray-500">—</span>}</TableCell>
                                                        <TableCell>
                                                            {variant.price ? (
                                                                formatCurrency(variant.price)
                                                            ) : (
                                                                <span className="text-gray-500">Preço padrão</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {variant.stock > 0 ? variant.stock : <span className="text-red-500">Esgotado</span>}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={variant.active ? 'success' : 'secondary'}>
                                                                {variant.active ? 'Activo' : 'Inactivo'}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Detalhes Técnicos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">ID do Produto</h3>
                                <p>{product.id}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Slug</h3>
                                <p className="rounded-md bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800">{product.slug}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Data de Criação</h3>
                                <p>{formatDate(product.created_at)}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Última Actualização</h3>
                                <p>{formatDate(product.updated_at)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {product.images.length > 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Todas as Imagens do Produto</CardTitle>
                            <CardDescription>Informações detalhadas sobre as imagens associadas a este produto</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Miniatura</TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Tamanho</TableHead>
                                            <TableHead>Dimensões</TableHead>
                                            <TableHead>Principal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {product.images.map((image) => (
                                            <TableRow key={image.id}>
                                                <TableCell>
                                                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                                                        <img
                                                            src={
                                                                image.versions?.find((_image) => _image.version == 'sm')?.url ||
                                                                image.versions?.find((_image) => _image.version == 'md')?.url ||
                                                                image.versions?.find((_image) => _image.version == 'lg')?.url ||
                                                                image.versions?.find((_image) => _image.version == 'xl')?.url ||
                                                                image?.url
                                                            }
                                                            alt={image.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm font-medium">{image.original_name}</div>
                                                    <div className="text-xs text-gray-500">{image.name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{image.extension?.toUpperCase()}</Badge>
                                                </TableCell>
                                                <TableCell>{formatFileSize(image.size)}</TableCell>
                                                <TableCell>Original</TableCell>
                                                <TableCell>
                                                    {image.is_main ? (
                                                        <Badge variant="default">Principal</Badge>
                                                    ) : (
                                                        <span className="text-gray-500">—</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Alerta de confirmação de exclusão */}
            <DeleteAlert
                isOpen={deleteAlertOpen}
                onClose={() => setDeleteAlertOpen(false)}
                title="Eliminar Produto"
                description="Tem certeza que deseja eliminar este produto? Esta acção não pode ser desfeita e todas as imagens associadas serão excluídas."
                deleteUrl={`/admin/products/${product.id}`}
            />
        </AppLayout>
    );
}
