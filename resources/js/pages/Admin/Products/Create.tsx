import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Check, AlertCircle } from 'lucide-react';
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

interface Props {
    categories: Category[];
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
        title: 'Novo Produto',
        href: '/admin/products/create',
    },
];

export default function Create({ categories }: Props) {
    const [activeTab, setActiveTab] = useState('basic');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [description, setDescription] = useState('');
    const [technicalDetails, setTechnicalDetails] = useState('');
    const [features, setFeatures] = useState('');

    // Estados para itens relacionados
    const [colors, setColors] = useState<ProductColor[]>([]);
    const [colorName, setColorName] = useState('');
    const [colorHex, setColorHex] = useState('#ffffff');

    const [sizes, setSizes] = useState<ProductSize[]>([]);
    const [sizeName, setSizeName] = useState('');
    const [sizeCode, setSizeCode] = useState('');
    const [sizeDescription, setSizeDescription] = useState('');

    const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
    const [attrName, setAttrName] = useState('');
    const [attrValue, setAttrValue] = useState('');
    const [attrDescription, setAttrDescription] = useState('');

    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [newVariantColorId, setNewVariantColorId] = useState<string | null>(null);
    const [newVariantSizeId, setNewVariantSizeId] = useState<string | null>(null);
    const [newVariantSku, setNewVariantSku] = useState('');
    const [newVariantPrice, setNewVariantPrice] = useState<string>('');
    const [newVariantStock, setNewVariantStock] = useState<string>('0');

    // Estado para pré-visualização de imagens
    const [imageFiles, setImageFiles] = useState<ImagePreview[]>([]);
    const [mainImageIndex, setMainImageIndex] = useState<number>(0);

    const { toast } = useToast();
    const { errors } = usePage().props as { errors: Record<string, string> };

    // Formulário principal do produto
    const { data, setData } = useForm({
        name: '',
        slug: '',
        price: '',
        cost: '',
        sku: '',
        barcode: '',
        weight: '',
        stock: '0',
        category_id: '',
        active: true,
        featured: false,
        certification: '',
        warranty: '',
        brand: '',
        origin_country: 'Moçambique',
        currency: 'MZN',
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

    // Processar adição de imagens
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
            if (imageFiles.length === 0 && newImages.length > 0) {
                newImages[0].isMain = true;
            }

            setImageFiles([...imageFiles, ...newImages]);
        }
    };

    // Remover imagem
    const handleRemoveImage = (index: number) => {
        const newImageFiles = [...imageFiles];

        // Se a imagem removida for a principal, definir a primeira imagem restante como principal
        if (newImageFiles[index].isMain && newImageFiles.length > 1) {
            const nextIndex = index === 0 ? 1 : 0;
            newImageFiles[nextIndex].isMain = true;
        }

        // Liberar URL do objeto
        URL.revokeObjectURL(newImageFiles[index].preview);

        newImageFiles.splice(index, 1);
        setImageFiles(newImageFiles);

        // Ajustar o índice da imagem principal
        const mainIndex = newImageFiles.findIndex(img => img.isMain);
        setMainImageIndex(mainIndex >= 0 ? mainIndex : 0);
    };

    // Definir imagem principal
    const handleSetMainImage = (index: number) => {
        const newImageFiles = [...imageFiles].map((img, i) => ({
            ...img,
            isMain: i === index
        }));

        setImageFiles(newImageFiles);
        setMainImageIndex(index);
    };

    // Associar imagem a uma cor
    const handleAssignImageColor = (imageIndex: number, colorId: string | null) => {
        const newImageFiles = [...imageFiles];
        newImageFiles[imageIndex].colorId = colorId;
        setImageFiles(newImageFiles);
    };

    // Gerar slug a partir do nome
    useEffect(() => {
        if (data.name && !data.slug) {
            const slug = data.name
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')  // Remover caracteres especiais
                .replace(/\s+/g, '-')      // Espaços para hífens
                .replace(/-+/g, '-');      // Remover hífens duplicados

            setData('slug', slug);
        }
    }, [data.name]);

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
            });
            setActiveTab('basic');
            return;
        }

        setIsSubmitting(true);

        // Preparar os dados para o envio
        const formData = new FormData();

        try {
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

            // Cores
            colors.forEach((color, index) => {
                formData.append(`colors[${index}][_tempId]`, color._tempId);
                formData.append(`colors[${index}][name]`, color.name);
                formData.append(`colors[${index}][hex_code]`, color.hex_code);
                formData.append(`colors[${index}][active]`, color.active ? '1' : '0');
                formData.append(`colors[${index}][order]`, color.order.toString());
            });

            // Tamanhos
            sizes.forEach((size, index) => {
                formData.append(`sizes[${index}][_tempId]`, size._tempId);
                formData.append(`sizes[${index}][name]`, size.name);
                formData.append(`sizes[${index}][code]`, size.code || '');
                formData.append(`sizes[${index}][description]`, size.description || '');
                formData.append(`sizes[${index}][available]`, size.available ? '1' : '0');
                formData.append(`sizes[${index}][order]`, size.order.toString());
            });

            // Atributos
            attributes.forEach((attr, index) => {
                formData.append(`attributes[${index}][name]`, attr.name);
                formData.append(`attributes[${index}][value]`, attr.value);
                formData.append(`attributes[${index}][description]`, attr.description || '');
                formData.append(`attributes[${index}][type]`, attr.type);
                formData.append(`attributes[${index}][filterable]`, attr.filterable ? '1' : '0');
                formData.append(`attributes[${index}][visible]`, attr.visible ? '1' : '0');
                formData.append(`attributes[${index}][order]`, attr.order.toString());
            });

            // Variantes
            variants.forEach((variant, index) => {
                if (variant.product_color_id) {
                    formData.append(`variants[${index}][color_id]`, variant.product_color_id);
                }

                if (variant.product_size_id) {
                    formData.append(`variants[${index}][size_id]`, variant.product_size_id);
                }

                formData.append(`variants[${index}][sku]`, variant.sku || '');
                if (variant.price !== null) {
                    formData.append(`variants[${index}][price]`, variant.price.toString());
                }
                formData.append(`variants[${index}][stock]`, variant.stock.toString());
                formData.append(`variants[${index}][active]`, variant.active ? '1' : '0');
            });

            // Imagens
            imageFiles.forEach((img, index) => {
                formData.append(`images[${index}]`, img.file);
                if (img.colorId) {
                    formData.append(`image_colors[${index}]`, img.colorId);
                }
                if (img.isMain) {
                    formData.append('main_image', index.toString());
                }
            });

            router.post('/admin/products', formData, {
                onSuccess: () => {
                    setIsSubmitting(false);
                    toast({
                        title: "Produto criado",
                        description: "O produto foi criado com sucesso!",
                        variant: "success",
                    });
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    toast({
                        title: "Erro ao criar produto",
                        description: "Verifique os campos e tente novamente.",
                        variant: "destructive",
                    });

                    // Exibir alerta de erro geral
                    if (errors.general) {
                        toast({
                            title: "Erro no servidor",
                            description: errors.general,
                            variant: "destructive",
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
            });
            console.error(error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Novo Produto" />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/admin/products">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">Novo Produto</h1>
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
                                        Preencha os dados do novo produto. Campos marcados com * são obrigatórios.
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
                                        <ImagesTab
                                            imageFiles={imageFiles}
                                            setImageFiles={setImageFiles}
                                            colors={colors}
                                            handleImageChange={handleImageChange}
                                            handleRemoveImage={handleRemoveImage}
                                            handleSetMainImage={handleSetMainImage}
                                            handleAssignImageColor={handleAssignImageColor}
                                            errors={errors}
                                            mainImageIndex={mainImageIndex}
                                        />
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
                                    Guardar Produto
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
