import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Check, AlertCircle, Trash } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Import our components
import {
    BasicInfoTab,
    DescriptionTab,
    AttributesTab,
    VariantsTab,
    ImagesTab,
    generateTempId,
    hasTabErrors,
    type ProductColor,
    type ProductSize,
    type ProductVariant,
    type ProductAttribute,
    type ImagePreview
} from './_components';

interface Category {
    id: number;
    name: string;
}

interface ProductImage {
        id: number;
        name: string;
        original_name: string;
        size: number;
        is_main?: boolean;
        url: string;
        versions?: ProductImage[];
        version: string;
    }

interface Product {
    id: number;
    name: string;
    slug: string;
    unit: string;
    description: string | null;
    technical_details: string | null;
    features: string | null;
    price: number;
    cost: number | null;
    sku: string | null;
    barcode: string | null;
    weight: number | null;
    stock: number;
    category_id: number;
    active: boolean;
    featured: boolean;
    certification: string | null;
    warranty: string | null;
    brand: string | null;
    origin_country: string | null;
    currency: string;
    description_pdf_url?: string | null;
    images: ProductImage[];
    colors: ProductColor[];
    sizes: ProductSize[];
    attributes: ProductAttribute[];
    variants: ProductVariant[];
}

interface Props {
    product: Product;
    categories: Category[];
    units: { value: string; label: string }[];
    brands: { id: number; name: string; logo_url?: string }[];
}

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
        title: 'Editar Produto',
        href: '/admin/products/create',
    },
];

export default function Edit({ product, categories, units, brands }: Props) {
    const [activeTab, setActiveTab] = useState('basic');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [description, setDescription] = useState(product.description || '');
    const [technicalDetails, setTechnicalDetails] = useState(product.technical_details || '');
    const [features, setFeatures] = useState(product.features || '');
    const [descriptionPdfFile, setDescriptionPdfFile] = useState<File | null>(null);
    const [currentDescriptionPdfUrl, setCurrentDescriptionPdfUrl] = useState<string | null>(product.description_pdf_url || null);
    const [removeCurrentPdf, setRemoveCurrentPdf] = useState(false);

    // Mapear cores existentes para o formato esperado
    const [colors, setColors] = useState<ProductColor[]>(
        product.colors.map(color => ({
            ...color,
            _tempId: color.id.toString(),
        }))
    );
    const [colorName, setColorName] = useState('');
    const [colorHex, setColorHex] = useState('#ffffff');

    // Mapear tamanhos existentes para o formato esperado
    const [sizes, setSizes] = useState<ProductSize[]>(
        product.sizes.map(size => ({
            ...size,
            _tempId: size.id.toString(),
        }))
    );
    const [sizeName, setSizeName] = useState('');
    const [sizeCode, setSizeCode] = useState('');
    const [sizeDescription, setSizeDescription] = useState('');

    // Mapear atributos existentes para o formato esperado
    const [attributes, setAttributes] = useState<ProductAttribute[]>(
        product.attributes.map(attr => ({
            ...attr,
            _tempId: attr.id.toString(),
        }))
    );
    const [attrName, setAttrName] = useState('');
    const [attrValue, setAttrValue] = useState('');
    const [attrDescription, setAttrDescription] = useState('');

    // Mapear variantes existentes para o formato esperado
    const [variants, setVariants] = useState<ProductVariant[]>(
        product.variants.map(variant => ({
            ...variant,
            _tempId: variant.id.toString(),
            product_color_id: variant.product_color_id ? variant.product_color_id.toString() : null,
            product_size_id: variant.product_size_id ? variant.product_size_id.toString() : null,
            _colorName: product.colors.find(c => c.id === variant.product_color_id)?.name,
            _sizeName: product.sizes.find(s => s.id === variant.product_size_id)?.name,
        }))
    );
    const [newVariantColorId, setNewVariantColorId] = useState<string | null>(null);
    const [newVariantSizeId, setNewVariantSizeId] = useState<string | null>(null);
    const [newVariantSku, setNewVariantSku] = useState('');
    const [newVariantPrice, setNewVariantPrice] = useState<string>('');
    const [newVariantStock, setNewVariantStock] = useState<string>('0');

    // Estado para pré-visualização de imagens
    const [imageFiles, setImageFiles] = useState<ImagePreview[]>([]);
    const [existingImages, setExistingImages] = useState<ProductImage[]>(product.images || []);
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
    const mainImage = product.images.find(img => img.is_main);
    const [mainImageId, setMainImageId] = useState<number | null>(mainImage?.id || null);

    const { toast } = useToast();
    const { errors } = usePage().props as { errors: Record<string, string> };

    // Auto-selecionar cor/tamanho quando existir exatamente uma opção
    useEffect(() => {
        if (!newVariantColorId && colors.length === 1) {
            setNewVariantColorId(colors[0]._tempId);
        }
        // Se a cor selecionada for removida, limpar seleção
        if (newVariantColorId && !colors.some(c => c._tempId === newVariantColorId)) {
            setNewVariantColorId(null);
        }
    }, [colors, newVariantColorId]);

    useEffect(() => {
        if (!newVariantSizeId && sizes.length === 1) {
            setNewVariantSizeId(sizes[0]._tempId);
        }
        // Se o tamanho selecionado for removido, limpar seleção
        if (newVariantSizeId && !sizes.some(s => s._tempId === newVariantSizeId)) {
            setNewVariantSizeId(null);
        }
    }, [sizes, newVariantSizeId]);

    // Formulário principal do produto
    const { data, setData } = useForm({
        name: product.name,
        slug: product.slug,
        price: product.price.toString(),
        cost: product.cost?.toString() || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        weight: product.weight?.toString() || '',
        category_id: product.category_id.toString(),
        active: product.active,
        unit: product.unit,
        featured: product.featured,
        certification: product.certification || '',
        warranty: product.warranty || '',
        brand_id: product.brand_id ? product.brand_id.toString() : '',
        origin_country: product.origin_country || 'Moçambique',
        currency: product.currency || 'MZN',
    });

    // Verificar se há erros e mudar para a aba correspondente
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            // Básico
            if (hasTabErrors('basic', errors)) {
                setActiveTab('basic');
                return;
            }

            // Descrições
            if (hasTabErrors('description', errors)) {
                setActiveTab('description');
                return;
            }

            // Atributos
            if (hasTabErrors('attributes', errors)) {
                setActiveTab('attributes');
                return;
            }

            // Cores e Tamanhos
            if (hasTabErrors('variants', errors)) {
                setActiveTab('variants');
                return;
            }

            // Imagens
            if (hasTabErrors('images', errors)) {
                setActiveTab('images');
                return;
            }
        }
    }, [errors]);

    // Adicionar cor
    const handleAddColor = () => {
        if (!colorName.trim()) {
            toast({
                title: "Campo obrigatório",
                description: "O nome da cor é obrigatório.",
                variant: "destructive",
                className: "text-white dark:text-white"

            });
            return;
        }

        const newColor: ProductColor = {
            name: colorName,
            hex_code: colorHex,
            active: true,
            order: colors.length,
            _tempId: generateTempId(),
        };

        setColors([...colors, newColor]);
        setColorName('');
        setColorHex('#ffffff');
    };

    // Remover cor
    const handleRemoveColor = (tempId: string) => {
        const colorToRemove = colors.find(c => c._tempId === tempId);

        // Se a cor já existe no banco, precisamos verificar se há variantes associadas
        if (colorToRemove && typeof colorToRemove.id === 'number') {
            const hasVariants = variants.some(v => v.product_color_id === tempId);
            if (hasVariants) {
                toast({
                    title: "Não é possível remover",
                    description: "Esta cor está associada a variantes do produto. Remova as variantes primeiro.",
                    variant: "destructive",
                    className: "text-white dark:text-white"
                });
                return;
            }
        }

        setColors(colors.filter(c => c._tempId !== tempId));

        // Remover também quaisquer variantes que usem esta cor
        setVariants(variants.filter(v => v.product_color_id !== tempId));

        // Desassociar imagens desta cor
        setImageFiles(imageFiles.map(img =>
            img.colorId === tempId ? { ...img, colorId: null } : img
        ));
    };

    // Adicionar tamanho
    const handleAddSize = () => {
        if (!sizeName.trim()) {
            toast({
                title: "Campo obrigatório",
                description: "O nome do tamanho é obrigatório.",
                variant: "destructive",
                className: "text-white dark:text-white"
            });
            return;
        }

        const newSize: ProductSize = {
            name: sizeName,
            code: sizeCode,
            description: sizeDescription,
            available: true,
            order: sizes.length,
            _tempId: generateTempId(),
        };

        setSizes([...sizes, newSize]);
        setSizeName('');
        setSizeCode('');
        setSizeDescription('');
    };

    // Remover tamanho
    const handleRemoveSize = (tempId: string) => {
        const sizeToRemove = sizes.find(s => s._tempId === tempId);

        // Se o tamanho já existe no banco, precisamos verificar se há variantes associadas
        if (sizeToRemove && typeof sizeToRemove.id === 'number') {
            const hasVariants = variants.some(v => v.product_size_id === tempId);
            if (hasVariants) {
                toast({
                    title: "Não é possível remover",
                    description: "Este tamanho está associado a variantes do produto. Remova as variantes primeiro.",
                    variant: "destructive",
                    className: "text-white dark:text-white"
                });
                return;
            }
        }

        setSizes(sizes.filter(s => s._tempId !== tempId));

        // Remover também quaisquer variantes que usem este tamanho
        setVariants(variants.filter(v => v.product_size_id !== tempId));
    };

    // Adicionar atributo
    const handleAddAttribute = () => {
        if (!attrName.trim() || !attrValue.trim()) {
            toast({
                title: "Campos obrigatórios",
                description: "Nome e valor do atributo são obrigatórios.",
                variant: "destructive",
                className: "text-white dark:text-white"
            });
            return;
        }

        const newAttr: ProductAttribute = {
            name: attrName,
            value: attrValue,
            description: attrDescription,
            type: 'text',
            filterable: false,
            visible: true,
            order: attributes.length,
            _tempId: generateTempId(),
        };

        setAttributes([...attributes, newAttr]);
        setAttrName('');
        setAttrValue('');
        setAttrDescription('');
    };

    // Remover atributo
    const handleRemoveAttribute = (tempId: string) => {
        setAttributes(attributes.filter(a => a._tempId !== tempId));
    };

    // Adicionar variante
    const handleAddVariant = () => {
        // Se nem cor nem tamanho forem selecionados, não faz sentido criar uma variante
        if (!newVariantColorId && !newVariantSizeId) {
            toast({
                title: "Dados incompletos",
                description: "Selecione pelo menos uma cor ou tamanho para a variante.",
                variant: "destructive",
                className: "text-white dark:text-white"
            });
            return;
        }

        // Verificar se já existe uma variante com a mesma combinação de cor e tamanho
        const existingVariant = variants.find(v =>
            v.product_color_id === newVariantColorId &&
            v.product_size_id === newVariantSizeId
        );

        if (existingVariant) {
            toast({
                title: "Variante duplicada",
                description: "Já existe uma variante com esta combinação de cor e tamanho.",
                variant: "destructive",
                className: "text-white dark:text-white"
            });
            return;
        }

        // Encontrar objetos cor e tamanho para exibição
        const selectedColor = colors.find(c => c._tempId === newVariantColorId);
        const selectedSize = sizes.find(s => s._tempId === newVariantSizeId);

        const newVariant: ProductVariant = {
            product_color_id: newVariantColorId,
            product_size_id: newVariantSizeId,
            sku: newVariantSku,
            price: newVariantPrice ? parseFloat(newVariantPrice) : null,
            stock: newVariantStock ? parseInt(newVariantStock) : 0,
            active: true,
            _tempId: generateTempId(),
            _colorName: selectedColor?.name,
            _sizeName: selectedSize?.name
        };

        setVariants([...variants, newVariant]);
        setNewVariantColorId(null);
        setNewVariantSizeId(null);
        setNewVariantSku('');
        setNewVariantPrice('');
        setNewVariantStock('0');
    };

    // Remover variante
    const handleRemoveVariant = (tempId: string) => {
        setVariants(variants.filter(v => v._tempId !== tempId));
    };

    // Processar adição de novas imagens
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newImages: ImagePreview[] = Array.from(e.target.files).map(file => ({
                file,
                preview: URL.createObjectURL(file),
                name: file.name,
                colorId: null,
                isMain: false
            }));

            // Se ainda não houver imagens, definir a primeira como principal
            if (existingImages.length === 0 && imageFiles.length === 0 && newImages.length > 0) {
                newImages[0].isMain = true;
                setMainImageId(null); // Remover qualquer mainImageId existente
            }

            setImageFiles([...imageFiles, ...newImages]);
        }
    };

    // Remover nova imagem (ainda não salva)
    const handleRemoveNewImage = (index: number) => {
        const newImageFiles = [...imageFiles];

        // Liberar URL do objeto
        URL.revokeObjectURL(newImageFiles[index].preview);
        newImageFiles.splice(index, 1);

        setImageFiles(newImageFiles);
    };

    // Remover imagem existente
    const handleRemoveExistingImage = (id: number) => {
        // Adicionar à lista de IDs para exclusão
        setDeletedImageIds([...deletedImageIds, id]);

        // Remover da lista de exibição
        setExistingImages(existingImages.filter(img => img.id !== id));

        // Se for a imagem principal, ajustar
        if (mainImageId === id) {
            // Tentar definir outra imagem como principal
            const remainingImages = existingImages.filter(img => img.id !== id);
            if (remainingImages.length > 0) {
                setMainImageId(remainingImages[0].id);
            } else if (imageFiles.length > 0) {
                // Se não houver imagens existentes, mas houver novas
                const newImages = [...imageFiles];
                newImages[0].isMain = true;
                setImageFiles(newImages);
                setMainImageId(null);
            } else {
                setMainImageId(null);
            }
        }
    };

    // Definir imagem principal (nova imagem)
    const handleSetMainNewImage = (index: number) => {
        // Desmarcar todas as imagens existentes
        if (mainImageId) {
            setMainImageId(null);
        }

        const newImageFiles = [...imageFiles].map((img, i) => ({
            ...img,
            isMain: i === index
        }));

        setImageFiles(newImageFiles);
    };

    // Definir imagem principal (imagem existente)
    const handleSetMainExistingImage = (id: number) => {
        setMainImageId(id);

        // Desmarcar todas as novas imagens
        const newImageFiles = [...imageFiles].map(img => ({
            ...img,
            isMain: false
        }));
        setImageFiles(newImageFiles);
    };

    // Associar imagem a uma cor (nova imagem)
    const handleAssignNewImageColor = (imageIndex: number, colorId: string | null) => {
        const newImageFiles = [...imageFiles];
        newImageFiles[imageIndex].colorId = colorId;
        setImageFiles(newImageFiles);
    };

    // Associar imagem existente a uma cor
    // Nota: Esta funcionalidade provavelmente precisaria de uma implementação específica no backend

    // Helper para simplificar o setData
    const handleSetData = (key: string, value: any) => {
        setData(key as any, value);
    };

    // Submeter o formulário
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validações básicas
        if (!data.name || !data.price || !data.category_id) {
            toast({
                title: "Dados incompletos",
                description: "Preencha todos os campos obrigatórios.",
                variant: "destructive",
                className: "text-white dark:text-white"
            });
            setActiveTab('basic');
            return;
        }

        setIsSubmitting(true);

        // Preparar os dados para o envio
        const formData = new FormData();

        try {
            // Método PUT/PATCH para atualização
            formData.append('_method', 'PUT');

            // Dados básicos do produto
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value.toString());
                }
            });

            // Descrições ricas
            formData.append('description', description);
            formData.append('technical_details', technicalDetails);
            formData.append('features', features);

            // PDF (remover e/ou enviar novo)
            if (removeCurrentPdf) {
                formData.append('remove_description_pdf', '1');
            }
            if (descriptionPdfFile) {
                formData.append('description_pdf', descriptionPdfFile);
            }

            // Cores
            colors.forEach((color, index) => {
                if (color.id) {
                    formData.append(`colors[${index}][id]`, color.id.toString());
                }
                formData.append(`colors[${index}][name]`, color.name);
                formData.append(`colors[${index}][hex_code]`, color.hex_code || '');
                formData.append(`colors[${index}][active]`, color.active ? '1' : '0');
                formData.append(`colors[${index}][order]`, color.order.toString());
            });

            // Tamanhos
            sizes.forEach((size, index) => {
                if (size.id) {
                    formData.append(`sizes[${index}][id]`, size.id.toString());
                }
                formData.append(`sizes[${index}][name]`, size.name);
                formData.append(`sizes[${index}][code]`, size.code || '');
                formData.append(`sizes[${index}][description]`, size.description || '');
                formData.append(`sizes[${index}][available]`, size.available ? '1' : '0');
                formData.append(`sizes[${index}][order]`, size.order.toString());
            });

            // Atributos
            attributes.forEach((attr, index) => {
                if (attr.id) {
                    formData.append(`attributes[${index}][id]`, attr.id.toString());
                }
                formData.append(`attributes[${index}][name]`, attr.name);
                formData.append(`attributes[${index}][value]`, attr.value);
                formData.append(`attributes[${index}][description]`, attr.description || '');
                formData.append(`attributes[${index}][type]`, attr.type || 'text');
                formData.append(`attributes[${index}][filterable]`, attr.filterable ? '1' : '0');
                formData.append(`attributes[${index}][visible]`, attr.visible ? '1' : '0');
                formData.append(`attributes[${index}][order]`, attr.order.toString());
            });

            // Variantes
            variants.forEach((variant, index) => {
                if (variant.id) {
                    formData.append(`variants[${index}][id]`, variant.id.toString());
                }

                if (variant.product_color_id) {
                    const colorObj = colors.find(c => c._tempId === variant.product_color_id);
                    if (colorObj && colorObj.id) {
                        formData.append(`variants[${index}][color_id]`, colorObj.id.toString());
                    } else {
                        formData.append(`variants[${index}][color_id]`, variant.product_color_id);
                    }
                }

                if (variant.product_size_id) {
                    const sizeObj = sizes.find(s => s._tempId === variant.product_size_id);
                    if (sizeObj && sizeObj.id) {
                        formData.append(`variants[${index}][size_id]`, sizeObj.id.toString());
                    } else {
                        formData.append(`variants[${index}][size_id]`, variant.product_size_id);
                    }
                }

                formData.append(`variants[${index}][sku]`, variant.sku || '');
                if (variant.price !== null) {
                    formData.append(`variants[${index}][price]`, variant.price.toString());
                }
                formData.append(`variants[${index}][stock]`, variant.stock.toString());
                formData.append(`variants[${index}][active]`, variant.active ? '1' : '0');
            });

            // IDs de imagens existentes que devem ser mantidas
            existingImages.forEach((img, index) => {
                formData.append(`existing_image_ids[${index}]`, img.id.toString());
            });

            // IDs de imagens que devem ser excluídas
            deletedImageIds.forEach((id, index) => {
                formData.append(`delete_image_ids[${index}]`, id.toString());
            });

            // Imagem principal
            if (mainImageId !== null) {
                formData.append('main_image_id', mainImageId.toString());
            }

            // Novas imagens
            imageFiles.forEach((img, index) => {
                formData.append(`images[${index}]`, img.file);
                if (img.colorId) {
                    formData.append(`image_colors[${index}]`, img.colorId);
                }
                if (img.isMain && mainImageId === null) {
                    formData.append('main_image', index.toString());
                }
            });

            router.post(`/admin/products/${product.id}`, formData, {
                onSuccess: () => {
                    setIsSubmitting(false);
                    toast({
                        title: "Produto atualizado",
                        description: "O produto foi atualizado com sucesso!",
                        variant: "success",
                    });
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    toast({
                        title: "Erro ao atualizar produto",
                        description: "Verifique os campos e tente novamente.",
                        variant: "destructive",
                        className: "text-white dark:text-white"
                    });

                    // Exibir alerta de erro geral
                    if (errors.general) {
                        toast({
                            title: "Erro no servidor",
                            description: errors.general,
                            variant: "destructive",
                            className: "text-white dark:text-white"
                        });
                    }
                },
                preserveScroll: true,
                preserveState: true
            });
        } catch (error) {
            setIsSubmitting(false);
            toast({
                title: "Erro inesperado",
                description: "Ocorreu um erro ao processar o pedido. Tente novamente.",
                variant: "destructive",
                className: "text-white dark:text-white"
            });
            console.error(error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Produto: ${product.name}`} />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/admin/products">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">Editar Produto: {product.name}</h1>
                    </div>
                </div>

                {/* Mensagem de erro geral */}
                {errors.general && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erro</AlertTitle>
                        <AlertDescription>{errors.general}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="mt-6">
                    <div className="space-y-6">
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="w-full"
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informações do Produto</CardTitle>
                                    <CardDescription>
                                        Edite os dados do produto. Campos marcados com * são obrigatórios.
                                    </CardDescription>

                                    <TabsList className="grid grid-cols-5 md:w-fit">
                                        <TabsTrigger value="basic" className={cn(
                                            hasTabErrors('basic', errors) && "text-destructive"
                                        )}>
                                            Básico {hasTabErrors('basic', errors) && <AlertCircle className="h-3 w-3 ml-1 text-destructive" />}
                                        </TabsTrigger>
                                        <TabsTrigger value="description" className={cn(
                                            hasTabErrors('description', errors) && "text-destructive"
                                        )}>
                                            Descrições {hasTabErrors('description', errors) && <AlertCircle className="h-3 w-3 ml-1 text-destructive" />}
                                        </TabsTrigger>
                                        <TabsTrigger value="attributes" className={cn(
                                            hasTabErrors('attributes', errors) && "text-destructive"
                                        )}>
                                            Atributos {hasTabErrors('attributes', errors) && <AlertCircle className="h-3 w-3 ml-1 text-destructive" />}
                                        </TabsTrigger>
                                        <TabsTrigger value="variants" className={cn(
                                            hasTabErrors('variants', errors) && "text-destructive"
                                        )}>
                                            Cores e Tamanhos {hasTabErrors('variants', errors) && <AlertCircle className="h-3 w-3 ml-1 text-destructive" />}
                                        </TabsTrigger>
                                        <TabsTrigger value="images" className={cn(
                                            hasTabErrors('images', errors) && "text-destructive"
                                        )}>
                                            Imagens {hasTabErrors('images', errors) && <AlertCircle className="h-3 w-3 ml-1 text-destructive" />}
                                        </TabsTrigger>
                                    </TabsList>
                                </CardHeader>

                                <CardContent>
                                    {/* Tab para informações básicas */}
                                    <TabsContent value="basic">
                                        <BasicInfoTab
                                            data={data}
                                            setData={handleSetData}
                                            errors={errors}
                                            categories={categories}
                                            units={units}
                                            brands={brands}
                                            isEditing={true}
                                            productId={product.id}
                                        />
                                    </TabsContent>

                                    {/* Tab para descrições */}
                                    <TabsContent value="description">
                                        <DescriptionTab
                                            description={description}
                                            setDescription={setDescription}
                                            technicalDetails={technicalDetails}
                                            setTechnicalDetails={setTechnicalDetails}
                                            features={features}
                                            setFeatures={setFeatures}
                                            errors={errors}
                                            descriptionPdfFile={descriptionPdfFile}
                                            setDescriptionPdfFile={setDescriptionPdfFile}
                                            currentDescriptionPdfUrl={currentDescriptionPdfUrl}
                                            onRemoveCurrentPdf={() => { setRemoveCurrentPdf(true); setCurrentDescriptionPdfUrl(null); }}
                                        />
                                    </TabsContent>

                                    {/* Tab para atributos */}
                                    <TabsContent value="attributes">
                                        <AttributesTab
                                            attributes={attributes}
                                            setAttributes={setAttributes}
                                            attrName={attrName}
                                            setAttrName={setAttrName}
                                            attrValue={attrValue}
                                            setAttrValue={setAttrValue}
                                            attrDescription={attrDescription}
                                            setAttrDescription={setAttrDescription}
                                            handleAddAttribute={handleAddAttribute}
                                            handleRemoveAttribute={handleRemoveAttribute}
                                            errors={errors}
                                        />
                                    </TabsContent>

                                    {/* Tab para cores e tamanhos */}
                                    <TabsContent value="variants">
                                        <VariantsTab
                                            colors={colors}
                                            setColors={setColors}
                                            sizes={sizes}
                                            setSizes={setSizes}
                                            variants={variants}
                                            setVariants={setVariants}
                                            colorName={colorName}
                                            setColorName={setColorName}
                                            colorHex={colorHex}
                                            setColorHex={setColorHex}
                                            handleAddColor={handleAddColor}
                                            handleRemoveColor={handleRemoveColor}
                                            sizeName={sizeName}
                                            setSizeName={setSizeName}
                                            sizeCode={sizeCode}
                                            setSizeCode={setSizeCode}
                                            sizeDescription={sizeDescription}
                                            setSizeDescription={setSizeDescription}
                                            handleAddSize={handleAddSize}
                                            handleRemoveSize={handleRemoveSize}
                                            newVariantColorId={newVariantColorId}
                                            setNewVariantColorId={setNewVariantColorId}
                                            newVariantSizeId={newVariantSizeId}
                                            setNewVariantSizeId={setNewVariantSizeId}
                                            newVariantSku={newVariantSku}
                                            setNewVariantSku={setNewVariantSku}
                                            newVariantPrice={newVariantPrice}
                                            setNewVariantPrice={setNewVariantPrice}
                                            newVariantStock={newVariantStock}
                                            setNewVariantStock={setNewVariantStock}
                                            handleAddVariant={handleAddVariant}
                                            handleRemoveVariant={handleRemoveVariant}
                                            errors={errors}
                                        />
                                    </TabsContent>

                                    {/* Tab para imagens */}
                                    <TabsContent value="images">
                                        <div className="space-y-6">
                                            {/* Imagens existentes */}
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4">Imagens Existentes</h3>

                                                {existingImages.length === 0 ? (
                                                    <div className="text-sm text-muted-foreground">
                                                        Sem imagens existentes.
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                                        {existingImages.map(image => (
                                                            <div key={image.id} className="relative group">
                                                                <div className={cn(
                                                                    "border rounded-md overflow-hidden bg-muted aspect-square flex items-center justify-center relative",
                                                                    mainImageId === image.id && "ring-2 ring-primary"
                                                                )}>
                                                                    <img
                                                                        src={
                                                                            image.versions?.find((_image) => _image.version == 'md')?.url ||
                                                                            image.versions?.find((_image) => _image.version == 'lg')?.url ||
                                                                            image.versions?.find((_image) => _image.version == 'xl')?.url ||
                                                                            image?.url}
                                                                        alt="Imagem do produto"
                                                                        className="object-cover w-full h-full"
                                                                    />

                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-2 transition-opacity">
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant={mainImageId === image.id ? "default" : "secondary"}
                                                                            className="h-8 w-8 p-0"
                                                                            onClick={() => handleSetMainExistingImage(image.id)}
                                                                        >
                                                                            <Check className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            className="h-8 w-8 p-0"
                                                                            onClick={() => handleRemoveExistingImage(image.id)}
                                                                        >
                                                                            <Trash className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                {mainImageId === image.id && (
                                                                    <div className="absolute top-0 right-0 bg-primary text-white dark:text-zinc-900 text-xs px-2 py-1 rounded-bl">
                                                                        Principal
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Novas imagens */}
                                            <ImagesTab
                                                imageFiles={imageFiles}
                                                setImageFiles={setImageFiles}
                                                colors={colors}
                                                handleImageChange={handleImageChange}
                                                handleRemoveImage={handleRemoveNewImage}
                                                handleSetMainImage={handleSetMainNewImage}
                                                handleAssignImageColor={handleAssignNewImageColor}
                                                errors={errors}
                                                mainImageIndex={imageFiles.findIndex(img => img.isMain)}
                                            />
                                        </div>
                                    </TabsContent>
                                </CardContent>
                            </Card>
                        </Tabs>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" type="button" asChild>
                            <Link href="/admin/products">Cancelar</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    A guardar...
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Guardar Alterações
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
