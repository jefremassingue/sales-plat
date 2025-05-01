import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Plus, Trash, X, Check, AlertCircle, Image as ImageIcon, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EditorComponent } from '@/components/editor-component';
import { cn } from '@/lib/utils';

interface Category {
    id: number;
    name: string;
}

interface Props {
    categories: Category[];
}

interface ProductColor {
    id?: number;
    name: string;
    hex_code: string;
    active: boolean;
    order: number;
    _tempId: string; // ID temporário para gestão no frontend
}

interface ProductSize {
    id?: number;
    name: string;
    code: string;
    description: string;
    available: boolean;
    order: number;
    _tempId: string; // ID temporário para gestão no frontend
}

interface ProductAttribute {
    id?: number;
    name: string;
    value: string;
    description: string;
    type: string;
    filterable: boolean;
    visible: boolean;
    order: number;
    _tempId: string; // ID temporário para gestão no frontend
}

interface ProductVariant {
    id?: number;
    product_color_id: number | null;
    product_size_id: number | null;
    sku: string;
    price: number | null;
    stock: number;
    active: boolean;
    _tempId: string;
    _colorName?: string; // Para exibição
    _sizeName?: string; // Para exibição
}

interface ImagePreview {
    file: File;
    preview: string;
    name: string;
    colorId?: string | null; // pode ser o ID real ou o temporário
    isMain: boolean;
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

const generateTempId = () => `temp_${Math.random().toString(36).substr(2, 9)}`;

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
    const { errors } = usePage().props;

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
            formData.append(`colors[${index}][name]`, color.name);
            formData.append(`colors[${index}][hex_code]`, color.hex_code);
            formData.append(`colors[${index}][active]`, color.active ? '1' : '0');
            formData.append(`colors[${index}][order]`, color.order.toString());
        });

        // Tamanhos
        sizes.forEach((size, index) => {
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
                const colorObj = colors.find(c => c._tempId === variant.product_color_id);
                formData.append(`variants[${index}][color_id]`, variant.product_color_id);
            }

            if (variant.product_size_id) {
                const sizeObj = sizes.find(s => s._tempId === variant.product_size_id);
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

                // Navegar para a aba que contém erros
                if (errors.name || errors.price || errors.category_id) {
                    setActiveTab('basic');
                } else if (errors.colors || errors.sizes) {
                    setActiveTab('variants');
                } else if (errors.images) {
                    setActiveTab('images');
                }
            }
        });
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
                                        <TabsTrigger value="basic">Básico</TabsTrigger>
                                        <TabsTrigger value="description">Descrições</TabsTrigger>
                                        <TabsTrigger value="attributes">Atributos</TabsTrigger>
                                        <TabsTrigger value="variants">Cores e Tamanhos</TabsTrigger>
                                        <TabsTrigger value="images">Imagens</TabsTrigger>
                                    </TabsList>
                                </CardHeader>

                                <CardContent>
                                    {/* Tab para informações básicas */}
                                    <TabsContent value="basic" className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="required">Nome do Produto</Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    placeholder="Ex: Capacete de Segurança"
                                                    required
                                                    className={errors.name ? "border-destructive" : ""}
                                                />
                                                {errors.name && (
                                                    <p className="text-destructive text-sm">{errors.name}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="slug">Slug (URL)</Label>
                                                <Input
                                                    id="slug"
                                                    value={data.slug}
                                                    onChange={(e) => setData('slug', e.target.value)}
                                                    placeholder="Ex: capacete-de-seguranca"
                                                    className={errors.slug ? "border-destructive" : ""}
                                                />
                                                {errors.slug && (
                                                    <p className="text-destructive text-sm">{errors.slug}</p>
                                                )}
                                                <p className="text-sm text-muted-foreground">
                                                    Gerado automaticamente a partir do nome se deixado em branco.
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="category_id" className="required">Categoria</Label>
                                                <Select
                                                    value={data.category_id}
                                                    onValueChange={(value) => setData('category_id', value)}
                                                >
                                                    <SelectTrigger className={errors.category_id ? "border-destructive" : ""}>
                                                        <SelectValue placeholder="Selecione uma categoria" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.category_id && (
                                                    <p className="text-destructive text-sm">{errors.category_id}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="brand">Marca</Label>
                                                <Input
                                                    id="brand"
                                                    value={data.brand}
                                                    onChange={(e) => setData('brand', e.target.value)}
                                                    placeholder="Ex: 3M, MSA, Honeywell"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="price" className="required">Preço (MZN)</Label>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.price}
                                                    onChange={(e) => setData('price', e.target.value)}
                                                    placeholder="Ex: 1200.00"
                                                    required
                                                    className={errors.price ? "border-destructive" : ""}
                                                />
                                                {errors.price && (
                                                    <p className="text-destructive text-sm">{errors.price}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="cost">Custo (MZN)</Label>
                                                <Input
                                                    id="cost"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.cost}
                                                    onChange={(e) => setData('cost', e.target.value)}
                                                    placeholder="Ex: 800.00"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="sku">SKU (Código Único)</Label>
                                                <Input
                                                    id="sku"
                                                    value={data.sku}
                                                    onChange={(e) => setData('sku', e.target.value)}
                                                    placeholder="Ex: CAP-001"
                                                    className={errors.sku ? "border-destructive" : ""}
                                                />
                                                {errors.sku && (
                                                    <p className="text-destructive text-sm">{errors.sku}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="barcode">Código de Barras</Label>
                                                <Input
                                                    id="barcode"
                                                    value={data.barcode}
                                                    onChange={(e) => setData('barcode', e.target.value)}
                                                    placeholder="Ex: 5901234123457"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="stock">Stock</Label>
                                                <Input
                                                    id="stock"
                                                    type="number"
                                                    min="0"
                                                    value={data.stock}
                                                    onChange={(e) => setData('stock', e.target.value)}
                                                    placeholder="0"
                                                />
                                                <p className="text-sm text-muted-foreground">
                                                    Deixe 0 se estiver gerindo stock por variantes.
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="weight">Peso (kg)</Label>
                                                <Input
                                                    id="weight"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.weight}
                                                    onChange={(e) => setData('weight', e.target.value)}
                                                    placeholder="Ex: 0.5"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="certification">Certificações</Label>
                                                <Input
                                                    id="certification"
                                                    value={data.certification}
                                                    onChange={(e) => setData('certification', e.target.value)}
                                                    placeholder="Ex: ISO 9001, CE, EN 397"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="warranty">Garantia</Label>
                                                <Input
                                                    id="warranty"
                                                    value={data.warranty}
                                                    onChange={(e) => setData('warranty', e.target.value)}
                                                    placeholder="Ex: 1 ano"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="origin_country">País de Origem</Label>
                                                <Input
                                                    id="origin_country"
                                                    value={data.origin_country}
                                                    onChange={(e) => setData('origin_country', e.target.value)}
                                                    placeholder="Ex: Moçambique"
                                                />
                                            </div>
                                        </div>

                                        <Separator className="my-4" />

                                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="active"
                                                    checked={data.active}
                                                    onCheckedChange={(checked) =>
                                                        setData('active', checked as boolean)
                                                    }
                                                />
                                                <Label htmlFor="active">Produto Activo</Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="featured"
                                                    checked={data.featured}
                                                    onCheckedChange={(checked) =>
                                                        setData('featured', checked as boolean)
                                                    }
                                                />
                                                <Label htmlFor="featured">Produto em Destaque</Label>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Tab para descrições */}
                                    <TabsContent value="description" className="space-y-4">
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="description">Descrição</Label>
                                                <div className="mt-2">
                                                    <EditorComponent
                                                        value={description}
                                                        onChange={setDescription}
                                                        placeholder="Insira a descrição detalhada do produto..."
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="technical_details">Detalhes Técnicos</Label>
                                                <div className="mt-2">
                                                    <EditorComponent
                                                        value={technicalDetails}
                                                        onChange={setTechnicalDetails}
                                                        placeholder="Insira os detalhes técnicos do produto..."
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="features">Características</Label>
                                                <div className="mt-2">
                                                    <EditorComponent
                                                        value={features}
                                                        onChange={setFeatures}
                                                        placeholder="Insira as características principais do produto..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Tab para atributos */}
                                    <TabsContent value="attributes" className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="attrName">Nome do Atributo</Label>
                                                <Input
                                                    id="attrName"
                                                    value={attrName}
                                                    onChange={(e) => setAttrName(e.target.value)}
                                                    placeholder="Ex: Nível de Proteção"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="attrValue">Valor</Label>
                                                <Input
                                                    id="attrValue"
                                                    value={attrValue}
                                                    onChange={(e) => setAttrValue(e.target.value)}
                                                    placeholder="Ex: IP65"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="attrDescription">Descrição (opcional)</Label>
                                                <Input
                                                    id="attrDescription"
                                                    value={attrDescription}
                                                    onChange={(e) => setAttrDescription(e.target.value)}
                                                    placeholder="Ex: Proteção contra poeira e jatos de água"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                onClick={handleAddAttribute}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Adicionar Atributo
                                            </Button>
                                        </div>

                                        {attributes.length > 0 && (
                                            <div className="border rounded-md">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Nome</TableHead>
                                                            <TableHead>Valor</TableHead>
                                                            <TableHead>Descrição</TableHead>
                                                            <TableHead className="w-[100px]">Ações</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {attributes.map((attr) => (
                                                            <TableRow key={attr._tempId}>
                                                                <TableCell>{attr.name}</TableCell>
                                                                <TableCell>{attr.value}</TableCell>
                                                                <TableCell>{attr.description || '-'}</TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleRemoveAttribute(attr._tempId)}
                                                                    >
                                                                        <Trash className="w-4 h-4 text-destructive" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}

                                        {attributes.length === 0 && (
                                            <div className="text-center p-4 border rounded-md bg-muted/50">
                                                <p className="text-muted-foreground">Nenhum atributo adicionado</p>
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Tab para cores e tamanhos */}
                                    <TabsContent value="variants" className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium mb-2">Cores</h3>
                                            <div className="grid gap-4 md:grid-cols-4">
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label htmlFor="colorName">Nome da Cor</Label>
                                                    <Input
                                                        id="colorName"
                                                        value={colorName}
                                                        onChange={(e) => setColorName(e.target.value)}
                                                        placeholder="Ex: Vermelho, Azul, Preto"
                                                    />
                                                </div>

                                                <div className="md:col-span-2 space-y-2">
                                                    <Label htmlFor="colorHex">Código da Cor</Label>
                                                    <div className="flex gap-2">
                                                        <div
                                                            className="h-10 w-10 rounded-md border"
                                                            style={{ backgroundColor: colorHex }}
                                                        />
                                                        <Input
                                                            id="colorHex"
                                                            value={colorHex}
                                                            onChange={(e) => setColorHex(e.target.value)}
                                                            placeholder="#FFFFFF"
                                                        />
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="outline" size="icon">
                                                                    <Palette className="h-4 w-4" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-3">
                                                                <HexColorPicker
                                                                    color={colorHex}
                                                                    onChange={setColorHex}
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end mt-2">
                                                <Button
                                                    type="button"
                                                    onClick={handleAddColor}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Adicionar Cor
                                                </Button>
                                            </div>

                                            {colors.length > 0 && (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                                                    {colors.map((color) => (
                                                        <div key={color._tempId} className="border rounded-md p-2 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                {color.hex_code && (
                                                                    <div
                                                                        className="h-5 w-5 rounded-full border"
                                                                        style={{ backgroundColor: color.hex_code }}
                                                                    />
                                                                )}
                                                                <span>{color.name}</span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleRemoveColor(color._tempId)}
                                                            >
                                                                <Trash className="w-3 h-3 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <Separator />

                                        <div>
                                            <h3 className="text-lg font-medium mb-2">Tamanhos</h3>
                                            <div className="grid gap-4 md:grid-cols-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor="sizeName">Nome do Tamanho</Label>
                                                    <Input
                                                        id="sizeName"
                                                        value={sizeName}
                                                        onChange={(e) => setSizeName(e.target.value)}
                                                        placeholder="Ex: XL, M, L, 42"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="sizeCode">Código (opcional)</Label>
                                                    <Input
                                                        id="sizeCode"
                                                        value={sizeCode}
                                                        onChange={(e) => setSizeCode(e.target.value)}
                                                        placeholder="Ex: XL, 42"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="sizeDescription">Descrição (opcional)</Label>
                                                    <Input
                                                        id="sizeDescription"
                                                        value={sizeDescription}
                                                        onChange={(e) => setSizeDescription(e.target.value)}
                                                        placeholder="Ex: Extra Grande, 42-44cm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end mt-2">
                                                <Button
                                                    type="button"
                                                    onClick={handleAddSize}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Adicionar Tamanho
                                                </Button>
                                            </div>

                                            {sizes.length > 0 && (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                                                    {sizes.map((size) => (
                                                        <div key={size._tempId} className="border rounded-md p-2 flex items-center justify-between">
                                                            <div>
                                                                <div className="font-medium">{size.name}</div>
                                                                {(size.code || size.description) && (
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {size.code && `Código: ${size.code}`}
                                                                        {size.code && size.description && ' - '}
                                                                        {size.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleRemoveSize(size._tempId)}
                                                            >
                                                                <Trash className="w-3 h-3 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <Separator />

                                        <div>
                                            <h3 className="text-lg font-medium mb-2">Variantes do Produto</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                As variantes permitem definir configurações específicas como preço e stock para cada combinação de cor e tamanho.
                                            </p>

                                            {(colors.length > 0 || sizes.length > 0) ? (
                                                <div className="grid gap-4 md:grid-cols-5">
                                                    {colors.length > 0 && (
                                                        <div className="space-y-2">
                                                            <Label htmlFor="variantColor">Cor</Label>
                                                            <Select
                                                                value={newVariantColorId || ""}
                                                                onValueChange={(value) => setNewVariantColorId(value || null)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Selecione uma cor" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="">Sem cor</SelectItem>
                                                                    {colors.map((color) => (
                                                                        <SelectItem key={color._tempId} value={color._tempId}>
                                                                            {color.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}

                                                    {sizes.length > 0 && (
                                                        <div className="space-y-2">
                                                            <Label htmlFor="variantSize">Tamanho</Label>
                                                            <Select
                                                                value={newVariantSizeId || ""}
                                                                onValueChange={(value) => setNewVariantSizeId(value || null)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Selecione um tamanho" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="">Sem tamanho</SelectItem>
                                                                    {sizes.map((size) => (
                                                                        <SelectItem key={size._tempId} value={size._tempId}>
                                                                            {size.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        <Label htmlFor="variantSku">SKU (opcional)</Label>
                                                        <Input
                                                            id="variantSku"
                                                            value={newVariantSku}
                                                            onChange={(e) => setNewVariantSku(e.target.value)}
                                                            placeholder="Ex: RED-XL-001"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="variantPrice">Preço (opcional)</Label>
                                                        <Input
                                                            id="variantPrice"
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={newVariantPrice}
                                                            onChange={(e) => setNewVariantPrice(e.target.value)}
                                                            placeholder="Ex: 1299.99"
                                                        />
                                                        <p className="text-xs text-muted-foreground">
                                                            Deixe em branco para usar o preço do produto
                                                        </p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="variantStock">Stock</Label>
                                                        <Input
                                                            id="variantStock"
                                                            type="number"
                                                            min="0"
                                                            value={newVariantStock}
                                                            onChange={(e) => setNewVariantStock(e.target.value)}
                                                            placeholder="Ex: 10"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <Alert variant="warning" className="mb-4">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertTitle>Atenção</AlertTitle>
                                                    <AlertDescription>
                                                        Adicione pelo menos uma cor ou tamanho antes de criar variantes.
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {(colors.length > 0 || sizes.length > 0) && (
                                                <div className="flex justify-end mt-2">
                                                    <Button
                                                        type="button"
                                                        onClick={handleAddVariant}
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Adicionar Variante
                                                    </Button>
                                                </div>
                                            )}

                                            {variants.length > 0 && (
                                                <div className="border rounded-md mt-4">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Cor</TableHead>
                                                                <TableHead>Tamanho</TableHead>
                                                                <TableHead>SKU</TableHead>
                                                                <TableHead>Preço</TableHead>
                                                                <TableHead>Stock</TableHead>
                                                                <TableHead className="w-[80px]">Ações</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {variants.map((variant) => (
                                                                <TableRow key={variant._tempId}>
                                                                    <TableCell>
                                                                        {variant._colorName || '-'}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {variant._sizeName || '-'}
                                                                    </TableCell>
                                                                    <TableCell>{variant.sku || '-'}</TableCell>
                                                                    <TableCell>
                                                                        {variant.price !== null
                                                                            ? new Intl.NumberFormat('pt-MZ', {
                                                                                style: 'currency',
                                                                                currency: 'MZN'
                                                                            }).format(variant.price)
                                                                            : 'Preço padrão'
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>{variant.stock}</TableCell>
                                                                    <TableCell>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => handleRemoveVariant(variant._tempId)}
                                                                        >
                                                                            <Trash className="w-4 h-4 text-destructive" />
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}

                                            {variants.length === 0 && (colors.length > 0 || sizes.length > 0) && (
                                                <div className="text-center p-4 border rounded-md bg-muted/50 mt-4">
                                                    <p className="text-muted-foreground">Nenhuma variante adicionada</p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* Tab para imagens */}
                                    <TabsContent value="images" className="space-y-4">
                                        <div className="border-dashed border-2 rounded-lg p-6 text-center">
                                            <input
                                                id="imageUpload"
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="imageUpload"
                                                className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                                            >
                                                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                                <span className="font-medium">Clique para carregar imagens</span>
                                                <span className="text-sm text-muted-foreground">
                                                    Suporta JPG, PNG e GIF até 2MB
                                                </span>
                                                <Button type="button" variant="outline">
                                                    Escolher ficheiros
                                                </Button>
                                            </label>
                                        </div>

                                        {imageFiles.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-medium mb-2">Imagens Carregadas</h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                    {imageFiles.map((img, index) => (
                                                        <div
                                                            key={index}
                                                            className={cn(
                                                                "border rounded-md overflow-hidden",
                                                                img.isMain && "ring-2 ring-primary"
                                                            )}
                                                        >
                                                            <div className="relative aspect-square">
                                                                <img
                                                                    src={img.preview}
                                                                    alt={img.name}
                                                                    className="object-cover w-full h-full"
                                                                />
                                                                {img.isMain && (
                                                                    <Badge
                                                                        variant="default"
                                                                        className="absolute top-2 left-2"
                                                                    >
                                                                        Principal
                                                                    </Badge>
                                                                )}
                                                                <div className="absolute top-2 right-2 flex gap-1">
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="icon"
                                                                        className="h-6 w-6 bg-white hover:bg-white text-destructive hover:text-destructive rounded-full"
                                                                        onClick={() => handleRemoveImage(index)}
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <div className="p-2 bg-muted/30 flex flex-col gap-2">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-xs truncate" title={img.name}>
                                                                        {img.name}
                                                                    </span>
                                                                    {!img.isMain && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="h-6 text-xs"
                                                                            onClick={() => handleSetMainImage(index)}
                                                                        >
                                                                            Definir Principal
                                                                        </Button>
                                                                    )}
                                                                </div>

                                                                {colors.length > 0 && (
                                                                    <div className="mt-1">
                                                                        <Select
                                                                            value={img.colorId || ""}
                                                                            onValueChange={(value) => handleAssignImageColor(index, value || null)}
                                                                        >
                                                                            <SelectTrigger className="h-7 text-xs">
                                                                                <SelectValue placeholder="Associar a cor" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="">Produto (sem cor)</SelectItem>
                                                                                {colors.map((color) => (
                                                                                    <SelectItem key={color._tempId} value={color._tempId}>
                                                                                        {color.name}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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
