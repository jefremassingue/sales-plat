import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';

// Função para formatar o slug
const formatSlug = (text: string): string => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplicados
        .trim();
};

interface Category {
    id: number;
    name: string;
    subcategories: Category[];
}

interface BasicInfoTabProps {
    data: {
        name: string;
        slug: string;
        price: string;
        cost: string;
        sku: string;
        barcode: string;
        weight: string;
        stock: string;
        category_id: string;
        active: boolean;
        featured: boolean;
        certification: string;
        warranty: string;
        brand: string;
        origin_country: string;
        currency: string;
    };
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
    categories: Category[];
}

export default function BasicInfoTab({ data, setData, errors, categories }: BasicInfoTabProps) {
    // Efeito para formatar o slug quando o nome mudar
    useEffect(() => {
        if (data.name && (!data.slug || data.slug === '')) {
            setData('slug', formatSlug(data.name));
        }
    }, [data.name]);

    const handleSlugChange = (value: string) => {
        setData('slug', formatSlug(value));
    };

    // Função auxiliar para verificar se uma categoria tem subcategorias
    const hasSubcategories = (category: Category): boolean => {
        return category.subcategories && category.subcategories.length > 0;
    };

    // Função para obter todas as subcategorias em formato plano
    const getAllSubcategories = (): Category[] => {
        let allSubcategories: Category[] = [];
        categories.forEach(category => {
            if (hasSubcategories(category)) {
                allSubcategories = [...allSubcategories, ...category.subcategories];
            }
        });
        return allSubcategories;
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="required">Nome do Produto *</Label>
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
                        onChange={(e) => handleSlugChange(e.target.value)}
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
                    <Label htmlFor="category_id" className="required">Categoria *</Label>
                    <Select
                        value={data.category_id}
                        onValueChange={(value) => setData('category_id', value)}
                    >
                        <SelectTrigger className={errors.category_id ? "border-destructive" : ""}>
                            <SelectValue placeholder="Selecione uma subcategoria" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <div key={category.id} className="category-group">
                                    {/* Mostrar categoria principal como título não selecionável */}
                                    <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                                        {category.name}
                                    </div>
                                    {/* Mostrar subcategorias como itens selecionáveis */}
                                    {hasSubcategories(category) ? (
                                        category.subcategories.map((subcategory) => (
                                            <SelectItem
                                                key={subcategory.id}
                                                value={subcategory.id.toString()}
                                                className="pl-4"
                                            >
                                                {subcategory.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="px-4 py-1 text-sm text-muted-foreground italic">
                                            Sem subcategorias disponíveis
                                        </div>
                                    )}
                                </div>
                            ))}
                            {getAllSubcategories().length === 0 && (
                                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                    Não existem subcategorias disponíveis
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                    {errors.category_id && (
                        <p className="text-destructive text-sm">{errors.category_id}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                        Selecione apenas subcategorias para classificar o seu produto.
                    </p>
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
                    <Label htmlFor="price" className="required">Preço (MZN) *</Label>
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
        </div>
    );
}
