import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp, PackageSearch, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Product, TaxRate, Warehouse } from './types';

const itemFormSchema = z.object({
    product_id: z.string().optional(),
    product_variant_id: z.string().optional(),
    product_color_id: z.string().optional(),
    product_size_id: z.string().optional(),
    warehouse_id: z.string().optional(),
    name: z.string().min(1, { message: 'Nome é obrigatório' }),
    description: z.string().optional(),
    quantity: z
        .string()
        .min(1, { message: 'Quantidade é obrigatória' })
        .refine((val) => !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
        .refine((val) => parseFloat(val) > 0, { message: 'Deve ser maior que zero' }),
    unit: z.string().optional(),
    unit_price: z
        .string()
        .min(1, { message: 'Preço unitário é obrigatório' })
        .refine((val) => !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
        .refine((val) => parseFloat(val) >= 0, { message: 'Não pode ser negativo' }),
    discount_percentage: z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
        .refine((val) => !val || parseFloat(val) >= 0, { message: 'Não pode ser negativo' })
        .refine((val) => !val || parseFloat(val) <= 100, { message: 'Deve ser no máximo 100%' }),
    tax_percentage: z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
        .refine((val) => !val || parseFloat(val) >= 0, { message: 'Não pode ser negativo' }),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: ItemFormValues) => void;
    products: Product[];
    warehouses: Warehouse[];
    taxRates: TaxRate[];
    units: { value: string; label: string }[];
    initialValues?: Partial<ItemFormValues>;
    title?: string;
    name?: string;
    isManualItemMode?: boolean;
    setOnSearch: (search: string) => void;
}

export default function ItemForm({
    open,
    onOpenChange,
    onSubmit,
    products,
    taxRates,
    initialValues,
    units,
    title = 'Adicionar Item',
    name,
    isManualItemMode = false,
    setOnSearch,
}: ItemFormProps) {
    const form = useForm<ItemFormValues>({
        resolver: zodResolver(itemFormSchema),
        defaultValues: {
            product_id: '',
            product_variant_id: '',
            warehouse_id: '',
            name: name || '',
            description: '',
            quantity: '1',
            unit: 'unit',
            unit_price: '0',
            discount_percentage: '0',
            tax_percentage: taxRates.find((t) => t.is_default == true)?.value + '' || '16',
        },
    });

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
    const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
    const [currentImage, setCurrentImage] = useState<{ url: string; versions?: Array<{ url: string; version: string }> } | null>(null);

    // Function to get the image for the selected color
    const getImageForColor = (
        product: Product,
        colorId: string | null,
    ): { url: string; versions?: Array<{ url: string; version: string }> } | null => {
        if (!colorId || !product || !product.colors) return product?.main_image || null;

        // Find the selected color
        const selectedColor = product.colors.find((color) => color.id === colorId || color.id.toString() === colorId);

        // If color has images, use the first one, otherwise use main product image
        if (selectedColor?.images && selectedColor.images.length > 0) {
            return selectedColor.images[0];
        }

        return product.main_image || null;
    };

    // Update image when color selection changes
    useEffect(() => {
        if (selectedProduct) {
            const newImage = getImageForColor(selectedProduct, selectedColorId);
            setCurrentImage(newImage);
        }
    }, [selectedProduct, selectedColorId]);

    const isHydratingRef = useRef(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const watchProductId = form.watch('product_id');
    // watching product_variant_id is not needed when variant is auto-resolved

    useEffect(() => {
        if (!open) {
            setSelectedProduct(null);
            return;
        }
        if (initialValues) {
            // prevent downstream effects from overriding initial selections
            isHydratingRef.current = true;
            const values = { ...initialValues } as Record<string, unknown>;
            Object.keys(values).forEach((key) => {
                const v = values[key];
                if (v !== undefined) {
                    form.setValue(key as keyof ItemFormValues, typeof v === 'number' ? String(v) : (v as string));
                }
            });
            if (values.product_id && values.product_id !== 'none') {
                const p = products.find((pp) => pp.id.toString() === String(values.product_id));
                setSelectedProduct(p || null);
                // Prefer explicit color/size from initial values (if present)
                const initColor = values.product_color_id ? String(values.product_color_id) : null;
                const initSize = values.product_size_id ? String(values.product_size_id) : null;
                if (initColor) {
                    setSelectedColorId(initColor);
                    form.setValue('product_color_id', initColor);
                }
                if (initSize) {
                    setSelectedSizeId(initSize);
                    form.setValue('product_size_id', initSize);
                }
                // If variant ID provided and color/size missing, derive from variant
                const variantId = values.product_variant_id ? String(values.product_variant_id) : null;
                if (p && p.variants && variantId && (!initColor || !initSize)) {
                    const v = p.variants.find((vv) => vv.id.toString() === variantId);
                    if (v) {
                        const vColor = v.product_color_id ? String(v.product_color_id) : '';
                        const vSize = v.product_size_id ? String(v.product_size_id) : '';
                        if (!initColor) {
                            setSelectedColorId(vColor || null);
                            form.setValue('product_color_id', vColor);
                        }
                        if (!initSize) {
                            setSelectedSizeId(vSize || null);
                            form.setValue('product_size_id', vSize);
                        }
                    }
                }
            } else {
                setSelectedProduct(null);
            }
            // allow effects to resume after hydration
            // use a microtask to ensure dependent effects see updated state
            Promise.resolve().then(() => {
                isHydratingRef.current = false;
            });
        } else if (isManualItemMode) {
            form.reset({
                product_id: '',
                product_variant_id: '',
                warehouse_id: '',
                name: name || '',
                description: '',
                quantity: '1',
                unit: 'unit',
                unit_price: '0',
                discount_percentage: '0',
                tax_percentage: taxRates.find((t) => t.is_default == true)?.value + '' || '16',
            });
            setOnSearch('');
            setSelectedProduct(null);
            setSelectedColorId(null);
            setSelectedSizeId(null);
        }
    }, [open, initialValues, isManualItemMode, name, products, taxRates, form, setOnSearch]);

    useEffect(() => {
        if (watchProductId && watchProductId !== 'none') {
            const p = products.find((pp) => pp.id.toString() === watchProductId);
            if (p) {
                setSelectedProduct(p);
                form.setValue('name', p.name);
                form.setValue('unit_price', p.price.toString());
                if (p.unit && p.unit.trim() !== '') {
                    form.setValue('unit', p.unit);
                } else {
                    form.setValue('unit', 'unit');
                }
                // Only set defaults if we do not already have a selection (e.g., editing)
                if (!isHydratingRef.current && !selectedColorId && !selectedSizeId) {
                    const defaultColor = p.colors && p.colors.length > 0 ? String(p.colors[0].id) : null;
                    const defaultSize = p.sizes && p.sizes.length > 0 ? String(p.sizes[0].id) : null;
                    setSelectedColorId(defaultColor);
                    setSelectedSizeId(defaultSize);
                    form.setValue('product_color_id', defaultColor || '');
                    form.setValue('product_size_id', defaultSize || '');
                }
            }
        } else if (watchProductId === 'none') {
            setSelectedProduct(null);
            setSelectedColorId(null);
            setSelectedSizeId(null);
        }
    }, [watchProductId, products, form, selectedColorId, selectedSizeId]);

    // Resolve variant automatically based on color/size selection
    useEffect(() => {
        if (!selectedProduct) return;
        const colorId = selectedColorId;
        const sizeId = selectedSizeId;
        let variant: NonNullable<Product['variants']>[number] | undefined = undefined;
        if (selectedProduct.variants && selectedProduct.variants.length > 0) {
            // Primeiro: tentar encontrar uma variante que corresponda exatamente à cor E tamanho selecionados
            if (colorId && sizeId) {
                variant = selectedProduct.variants.find(
                    (v) => String(v.product_color_id ?? '') === colorId && String(v.product_size_id ?? '') === sizeId,
                );
            }
            // Segundo: se não encontrar, tentar encontrar uma variante apenas pela cor selecionada
            if (!variant && colorId) {
                variant = selectedProduct.variants.find((v) => String(v.product_color_id ?? '') === colorId);
            }
            // Terceiro: se ainda não encontrar, tentar encontrar uma variante apenas pelo tamanho selecionado
            if (!variant && sizeId) {
                variant = selectedProduct.variants.find((v) => String(v.product_size_id ?? '') === sizeId);
            }
        }
        // Update form fields
        form.setValue('product_color_id', colorId || '');
        form.setValue('product_size_id', sizeId || '');
        if (variant) {
            form.setValue('product_variant_id', String(variant.id));
        } else if (!isHydratingRef.current) {
            // only clear variant id if not hydrating
            form.setValue('product_variant_id', '');
        }
        // Update name to include variant hint and SKU only after hydration
        if (!isHydratingRef.current) {
            const baseName = selectedProduct.name;
            const colorName = selectedProduct.colors?.find((c) => String(c.id) === colorId)?.name;
            const sizeName = selectedProduct.sizes?.find((s) => String(s.id) === sizeId)?.name;
            let optSuffix = '';
            if (colorName && sizeName) optSuffix = ` (Cor: ${colorName} / T: ${sizeName})`;
            else if (colorName) optSuffix = ` (Cor: ${colorName})`;
            else if (sizeName) optSuffix = ` (T: ${sizeName})`;
            
            // Incluir SKU da variante se disponível, caso contrário usar SKU do produto principal
            const skuPart = variant && variant.sku ? ` [REF: ${variant.sku}]` : 
                            selectedProduct.sku ? ` [SKU: ${selectedProduct.sku}]` : '';
            
            form.setValue('name', `${baseName}${optSuffix}${skuPart}`);
        }
    }, [selectedProduct, selectedColorId, selectedSizeId, form]);

    const handleSubmit = (values: ItemFormValues) => {
        onSubmit(values);
        onOpenChange(false);
    };

    const clearSelectedProduct = () => {
        setSelectedProduct(null);
        setSelectedColorId(null);
        setSelectedSizeId(null);
        setCurrentImage(null);
        form.setValue('product_id', '');
        form.setValue('name', '');
        form.setValue('unit_price', '0');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-10/12 overflow-y-auto sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        {selectedProduct && (
                            <div className="bg-muted relative flex gap-2 rounded-lg p-4">
                                {currentImage || selectedProduct.main_image ? (
                                    <img
                                        src={
                                            currentImage?.versions?.find((image) => image.version == 'md')?.url ||
                                            currentImage?.versions?.find((image) => image.version == 'lg')?.url ||
                                            currentImage?.url ||
                                            selectedProduct.main_image?.versions?.find((image) => image.version == 'md')?.url ||
                                            selectedProduct.main_image?.versions?.find((image) => image.version == 'lg')?.url ||
                                            selectedProduct.main_image?.url
                                        }
                                        alt={selectedProduct.name}
                                        className="h-20 min-h-20 w-20 min-w-20 object-contain transition-all hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-20 min-h-20 w-20 min-w-20 items-center justify-center bg-gray-100 dark:bg-gray-800">
                                        <PackageSearch className="h-10 w-10 text-gray-400" />
                                    </div>
                                )}
                                <div className="w-full">
                                    <div className="absolute top-2 right-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearSelectedProduct}
                                            className="h-6 w-6 rounded-full p-0"
                                        >
                                            <X className="h-6 w-6" />
                                        </Button>
                                    </div>
                                    <h3 className="font-medium">Produto selecionado</h3>
                                    <div className="mt-1 text-sm">
                                        <strong>{selectedProduct.name}</strong>
                                        <br />
                                        <span className="text-muted-foreground">
                                            SKU: {selectedProduct.sku} | Preço:{' '}
                                            {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN' }).format(selectedProduct.price)}
                                            {(() => {
                                                // Mostrar referência da variante se disponível
                                                const currentVariant = selectedProduct.variants?.find((v) => {
                                                    const colorMatch = selectedColorId ? String(v.product_color_id ?? '') === selectedColorId : !v.product_color_id;
                                                    const sizeMatch = selectedSizeId ? String(v.product_size_id ?? '') === selectedSizeId : !v.product_size_id;
                                                    return colorMatch && sizeMatch;
                                                }) || 
                                                selectedProduct.variants?.find((v) => selectedColorId ? String(v.product_color_id ?? '') === selectedColorId : false) ||
                                                selectedProduct.variants?.find((v) => selectedSizeId ? String(v.product_size_id ?? '') === selectedSizeId : false);
                                                
                                                return currentVariant?.sku ? ` | REF: ${currentVariant.sku}` : '';
                                            })()}
                                        </span>
                                    </div>

                                    {/* Color selection */}
                                    {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                                        <div className="mt-3">
                                            <FormLabel>Cor</FormLabel>
                                            <div className="flex flex-wrap gap-2.5">
                                                {selectedProduct.colors.map((color) => (
                                                    <button
                                                        type="button"
                                                        key={String(color.id)}
                                                        onClick={() => setSelectedColorId(String(color.id))}
                                                        title={color.name}
                                                        className={`relative h-8 w-8 rounded-full border transition-all focus:outline-none ${selectedColorId === String(color.id) ? 'border-2 border-orange-500 ring-2 ring-orange-500 ring-offset-1' : 'border-slate-300 hover:border-orange-400'}`}
                                                        style={{ backgroundColor: (color as { hex_code?: string | null }).hex_code || '#ccc' }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Size selection */}
                                    {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                                        <div className="mt-3">
                                            <FormLabel>Tamanho</FormLabel>
                                            <div className="flex flex-wrap gap-2.5">
                                                {selectedProduct.sizes.map((size) => (
                                                    <button
                                                        type="button"
                                                        key={String(size.id)}
                                                        onClick={() => setSelectedSizeId(String(size.id))}
                                                        className={`rounded-md border px-3.5 py-1.5 text-sm font-medium ${selectedSizeId === String(size.id) ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-orange-400 hover:text-orange-600'}`}
                                                        title={(size as { name: string }).name}
                                                    >
                                                        {(size as { name: string }).name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <FormField
                                        control={form.control}
                                        name="product_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <input type="hidden" {...field} value={selectedProduct.id.toString()} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    {/* Hidden fields for color/size and variant - bound to RHF */}
                                    <FormField
                                        control={form.control}
                                        name="product_color_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <input type="hidden" {...field} value={selectedColorId || ''} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="product_size_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <input type="hidden" {...field} value={selectedSizeId || ''} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="product_variant_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <input type="hidden" {...field} value={form.watch('product_variant_id') || ''} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Nome do Item <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="unit_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Preço Unitário <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="0.01" {...field} />
                                        </FormControl>
                                        {selectedProduct && <FormDescription>O preço é definido pelo produto selecionado</FormDescription>}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Quantidade <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0.01" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unidade</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || 'unit'} disabled={selectedProduct !== null}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione uma unidade" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {units.map((u) => (
                                                    <SelectItem key={u.value} value={u.value}>
                                                        {u.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedProduct && <FormDescription>A unidade é definida pelo produto selecionado</FormDescription>}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Toggle advanced fields (Descrição, Desconto, Imposto) */}
                        <hr className="my-4" />
                        <div className="-mt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAdvanced((v) => !v)}
                                className="text-muted-foreground hover:text-foreground px-1 text-sm"
                            >
                                {showAdvanced ? (
                                    <>
                                        <ChevronUp className="mr-1 h-4 w-4" /> Esconder opções
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="mr-1 h-4 w-4" /> Mais opções (Descrição, Desconto, Imposto)
                                    </>
                                )}
                            </Button>
                        </div>

                        {showAdvanced && (
                            <div className="mt-2 space-y-3">
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Descrição detalhada do item" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Removed helper buttons for descrição as requested */}
                                <div className="grid items-start gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="discount_percentage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Desconto (%)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" max="100" step="0.01" {...field} value={field.value || '0'} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="tax_percentage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Imposto (%)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" step="0.01" {...field} value={field.value || '0'} />
                                                </FormControl>
                                                {taxRates.length > 0 && (
                                                    <FormDescription>Taxas comuns: {taxRates.map((t) => `${t.label}`).join(', ')}</FormDescription>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit">Guardar Item</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
