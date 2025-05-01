<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductColor;
use App\Models\ProductSize;
use App\Models\ProductVariant;
use App\Models\ProductAttribute;
use App\Models\Category;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
            $query = Product::query()
                ->with('mainImage', 'category');

            // Filtros
            if ($request->has('search')) {
                $query->where(function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('sku', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%');
                });
            }

            if ($request->has('category_id') && $request->category_id) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->has('active')) {
                $query->where('active', $request->active == 'true');
            }

            // Ordenação
            $sortField = $request->input('sort_field', 'created_at');
            $sortOrder = $request->input('sort_order', 'desc');

            $allowedSortFields = ['name', 'sku', 'price', 'stock', 'created_at'];
            if (in_array($sortField, $allowedSortFields)) {
                $query->orderBy($sortField, $sortOrder);
            }

            $products = $query->paginate(15)->withQueryString();
            $categories = Category::all();
            // return $products;
            return Inertia::render('Admin/Products/Index', [
                'products' => $products,
                'categories' => $categories,
                'filters' => $request->only(['search', 'category_id', 'active', 'sort_field', 'sort_order'])
            ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            $categories = Category::all();

            return Inertia::render('Admin/Products/Create', [
                'categories' => $categories
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Ocorreu um erro ao carregar o formulário: ' . $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('products', 'slug')
            ],
            'description' => 'nullable|string',
            'technical_details' => 'nullable|string',
            'features' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'barcode' => 'nullable|string|max:100',
            'weight' => 'nullable|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'stock' => 'nullable|integer|min:0',
            'active' => 'boolean',
            'featured' => 'boolean',
            'certification' => 'nullable|string|max:255',
            'warranty' => 'nullable|string|max:255',
            'brand' => 'nullable|string|max:255',
            'origin_country' => 'nullable|string|max:100',
            'currency' => 'nullable|string|size:3',
            'images.*' => 'nullable|image|max:2048',
            'main_image' => 'nullable|integer',
            'colors' => 'nullable|array',
            'colors.*.name' => 'required|string|max:100',
            'colors.*.hex_code' => 'nullable|string|max:20',
            'sizes' => 'nullable|array',
            'sizes.*.name' => 'required|string|max:100',
            'attributes' => 'nullable|array',
            'attributes.*.name' => 'required|string|max:100',
            'attributes.*.value' => 'required|string|max:255',
            'variants' => 'nullable|array',
            'variants.*.color_id' => 'nullable|integer',
            'variants.*.size_id' => 'nullable|integer',
            'variants.*.sku' => 'nullable|string|max:100',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.stock' => 'nullable|integer|min:0',
        ], [
            'slug.regex' => 'O slug deve conter apenas letras minúsculas, números e hífens.',
            'slug.unique' => 'Este slug já está a ser utilizado por outro produto.',
            'price.required' => 'O preço é obrigatório.',
            'price.min' => 'O preço deve ser igual ou maior que zero.',
            'category_id.required' => 'A categoria é obrigatória.',
            'category_id.exists' => 'A categoria selecionada não existe.',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Preparar os dados para criação
            $data = $request->except(['images', 'colors', 'sizes', 'attributes', 'variants']);

            // Se o slug não foi fornecido, gerar a partir do nome
            if (empty($data['slug'])) {
                $data['slug'] = Str::slug($data['name']);
            } else {
                // Garantir que o slug esteja no formato correto
                $data['slug'] = Str::slug($data['slug']);
            }

            // Criar o produto
            $product = Product::create($data);

            // Processar cores
            if ($request->has('colors') && is_array($request->colors)) {
                foreach ($request->colors as $colorData) {
                    $product->colors()->create([
                        'name' => $colorData['name'],
                        'hex_code' => $colorData['hex_code'] ?? null,
                        'active' => true,
                        'order' => $colorData['order'] ?? 0
                    ]);
                }
            }

            // Processar tamanhos
            if ($request->has('sizes') && is_array($request->sizes)) {
                foreach ($request->sizes as $sizeData) {
                    $product->sizes()->create([
                        'name' => $sizeData['name'],
                        'code' => $sizeData['code'] ?? null,
                        'description' => $sizeData['description'] ?? null,
                        'available' => $sizeData['available'] ?? true,
                        'order' => $sizeData['order'] ?? 0
                    ]);
                }
            }

            // Processar atributos
            if ($request->has('attributes') && is_array($request->attributes)) {
                foreach ($request->attributes as $attrData) {
                    $product->attributes()->create([
                        'name' => $attrData['name'],
                        'value' => $attrData['value'],
                        'description' => $attrData['description'] ?? null,
                        'type' => $attrData['type'] ?? 'text',
                        'filterable' => $attrData['filterable'] ?? false,
                        'visible' => $attrData['visible'] ?? true,
                        'order' => $attrData['order'] ?? 0
                    ]);
                }
            }

            // Processar variantes
            if ($request->has('variants') && is_array($request->variants)) {
                foreach ($request->variants as $variantData) {
                    $product->variants()->create([
                        'product_color_id' => $variantData['color_id'] ?? null,
                        'product_size_id' => $variantData['size_id'] ?? null,
                        'sku' => $variantData['sku'] ?? null,
                        'price' => $variantData['price'] ?? null,
                        'stock' => $variantData['stock'] ?? 0,
                        'active' => $variantData['active'] ?? true
                    ]);
                }
            }

            // Processar imagens
            if ($request->hasFile('images')) {
                $mainImageIndex = $request->input('main_image', 0);

                foreach ($request->file('images') as $index => $imageFile) {
                    $path = $imageFile->store('products', 'public');
                    $isMain = $index == $mainImageIndex;

                    $image = new Image([
                        'storage' => 'public',
                        'path' => $path,
                        'name' => basename($path),
                        'original_name' => $imageFile->getClientOriginalName(),
                        'size' => $imageFile->getSize(),
                        'extension' => $imageFile->extension()
                    ]);

                    // Se houver um color_id associado à imagem
                    if (isset($request->image_colors[$index])) {
                        $colorId = $request->image_colors[$index];
                        $color = ProductColor::find($colorId);
                        if ($color) {
                            $color->images()->save($image);
                        }
                    } else {
                        // Associar ao produto
                        $product->images()->save($image);
                    }

                    // Marcar como imagem principal se for o caso
                    if ($isMain) {
                        $image->is_main = true;
                        $image->save();
                    }
                }
            }

            DB::commit();

            return redirect()->route('admin.products.index')
                ->with('success', 'Produto criado com sucesso!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao criar o produto: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        try {
            $product->load([
                'category',
                'images',
                'colors',
                'sizes',
                'attributes',
                'variants',
                'variants.color',
                'variants.size'
            ]);

            return Inertia::render('Admin/Products/Show', [
                'product' => $product,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Ocorreu um erro ao apresentar o produto: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        try {
            $product->load([
                'category',
                'images',
                'colors',
                'sizes',
                'attributes',
                'variants',
                'variants.color',
                'variants.size'
            ]);

            $categories = Category::all();

            return Inertia::render('Admin/Products/Edit', [
                'product' => $product,
                'categories' => $categories
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Ocorreu um erro ao carregar o formulário de edição: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('products', 'slug')->ignore($product->id)
            ],
            'description' => 'nullable|string',
            'technical_details' => 'nullable|string',
            'features' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'sku' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('products', 'sku')->ignore($product->id)
            ],
            'barcode' => 'nullable|string|max:100',
            'weight' => 'nullable|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'stock' => 'nullable|integer|min:0',
            'active' => 'boolean',
            'featured' => 'boolean',
            'certification' => 'nullable|string|max:255',
            'warranty' => 'nullable|string|max:255',
            'brand' => 'nullable|string|max:255',
            'origin_country' => 'nullable|string|max:100',
            'currency' => 'nullable|string|size:3',
            'images.*' => 'nullable|image|max:2048',
            'main_image' => 'nullable|integer',
            // Arrays para atualizações
            'colors' => 'nullable|array',
            'colors.*.id' => 'nullable|integer|exists:product_colors,id',
            'colors.*.name' => 'required|string|max:100',
            'sizes' => 'nullable|array',
            'sizes.*.id' => 'nullable|integer|exists:product_sizes,id',
            'sizes.*.name' => 'required|string|max:100',
            'attributes' => 'nullable|array',
            'attributes.*.id' => 'nullable|integer|exists:product_attributes,id',
            'attributes.*.name' => 'required|string|max:100',
            'variants' => 'nullable|array',
            'variants.*.id' => 'nullable|integer|exists:product_variants,id',
            'existing_image_ids' => 'nullable|array',
            'existing_image_ids.*' => 'nullable|integer|exists:images,id',
            'delete_image_ids' => 'nullable|array',
            'delete_image_ids.*' => 'nullable|integer|exists:images,id',
        ], [
            'slug.regex' => 'O slug deve conter apenas letras minúsculas, números e hífens.',
            'slug.unique' => 'Este slug já está a ser utilizado por outro produto.',
            'price.required' => 'O preço é obrigatório.',
            'price.min' => 'O preço deve ser igual ou maior que zero.',
            'category_id.required' => 'A categoria é obrigatória.',
            'category_id.exists' => 'A categoria selecionada não existe.',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Preparar os dados para atualização
            $data = $request->except(['images', 'colors', 'sizes', 'attributes', 'variants', 'existing_image_ids', 'delete_image_ids']);

            // Se o slug foi fornecido, garantir que esteja no formato correto
            if (isset($data['slug'])) {
                $data['slug'] = Str::slug($data['slug']);
            }

            // Atualizar o produto
            $product->update($data);

            // Atualizar cores
            if ($request->has('colors') && is_array($request->colors)) {
                // IDs das cores que serão mantidos/atualizados
                $keepColorIds = [];

                foreach ($request->colors as $colorData) {
                    if (isset($colorData['id'])) {
                        // Atualizar cor existente
                        $color = ProductColor::find($colorData['id']);
                        if ($color && $color->product_id == $product->id) {
                            $color->update([
                                'name' => $colorData['name'],
                                'hex_code' => $colorData['hex_code'] ?? null,
                                'active' => $colorData['active'] ?? true,
                                'order' => $colorData['order'] ?? 0
                            ]);
                            $keepColorIds[] = $color->id;
                        }
                    } else {
                        // Criar nova cor
                        $color = $product->colors()->create([
                            'name' => $colorData['name'],
                            'hex_code' => $colorData['hex_code'] ?? null,
                            'active' => $colorData['active'] ?? true,
                            'order' => $colorData['order'] ?? 0
                        ]);
                        $keepColorIds[] = $color->id;
                    }
                }

                // Remover cores que não estão na lista de manter
                ProductColor::where('product_id', $product->id)
                    ->whereNotIn('id', $keepColorIds)
                    ->delete();
            }

            // Atualizar tamanhos
            if ($request->has('sizes') && is_array($request->sizes)) {
                // IDs dos tamanhos que serão mantidos/atualizados
                $keepSizeIds = [];

                foreach ($request->sizes as $sizeData) {
                    if (isset($sizeData['id'])) {
                        // Atualizar tamanho existente
                        $size = ProductSize::find($sizeData['id']);
                        if ($size && $size->product_id == $product->id) {
                            $size->update([
                                'name' => $sizeData['name'],
                                'code' => $sizeData['code'] ?? null,
                                'description' => $sizeData['description'] ?? null,
                                'available' => $sizeData['available'] ?? true,
                                'order' => $sizeData['order'] ?? 0
                            ]);
                            $keepSizeIds[] = $size->id;
                        }
                    } else {
                        // Criar novo tamanho
                        $size = $product->sizes()->create([
                            'name' => $sizeData['name'],
                            'code' => $sizeData['code'] ?? null,
                            'description' => $sizeData['description'] ?? null,
                            'available' => $sizeData['available'] ?? true,
                            'order' => $sizeData['order'] ?? 0
                        ]);
                        $keepSizeIds[] = $size->id;
                    }
                }

                // Remover tamanhos que não estão na lista de manter
                ProductSize::where('product_id', $product->id)
                    ->whereNotIn('id', $keepSizeIds)
                    ->delete();
            }

            // Atualizar atributos
            if ($request->has('attributes') && is_array($request->attributes)) {
                // IDs dos atributos que serão mantidos/atualizados
                $keepAttributeIds = [];

                foreach ($request->attributes as $attrData) {
                    if (isset($attrData['id'])) {
                        // Atualizar atributo existente
                        $attr = ProductAttribute::find($attrData['id']);
                        if ($attr && $attr->product_id == $product->id) {
                            $attr->update([
                                'name' => $attrData['name'],
                                'value' => $attrData['value'],
                                'description' => $attrData['description'] ?? null,
                                'type' => $attrData['type'] ?? 'text',
                                'filterable' => $attrData['filterable'] ?? false,
                                'visible' => $attrData['visible'] ?? true,
                                'order' => $attrData['order'] ?? 0
                            ]);
                            $keepAttributeIds[] = $attr->id;
                        }
                    } else {
                        // Criar novo atributo
                        $attr = $product->attributes()->create([
                            'name' => $attrData['name'],
                            'value' => $attrData['value'],
                            'description' => $attrData['description'] ?? null,
                            'type' => $attrData['type'] ?? 'text',
                            'filterable' => $attrData['filterable'] ?? false,
                            'visible' => $attrData['visible'] ?? true,
                            'order' => $attrData['order'] ?? 0
                        ]);
                        $keepAttributeIds[] = $attr->id;
                    }
                }

                // Remover atributos que não estão na lista de manter
                ProductAttribute::where('product_id', $product->id)
                    ->whereNotIn('id', $keepAttributeIds)
                    ->delete();
            }

            // Atualizar variantes
            if ($request->has('variants') && is_array($request->variants)) {
                // IDs das variantes que serão mantidas/atualizadas
                $keepVariantIds = [];

                foreach ($request->variants as $variantData) {
                    if (isset($variantData['id'])) {
                        // Atualizar variante existente
                        $variant = ProductVariant::find($variantData['id']);
                        if ($variant && $variant->product_id == $product->id) {
                            $variant->update([
                                'product_color_id' => $variantData['color_id'] ?? null,
                                'product_size_id' => $variantData['size_id'] ?? null,
                                'sku' => $variantData['sku'] ?? null,
                                'barcode' => $variantData['barcode'] ?? null,
                                'price' => $variantData['price'] ?? null,
                                'stock' => $variantData['stock'] ?? 0,
                                'active' => $variantData['active'] ?? true
                            ]);
                            $keepVariantIds[] = $variant->id;
                        }
                    } else {
                        // Criar nova variante
                        $variant = $product->variants()->create([
                            'product_color_id' => $variantData['color_id'] ?? null,
                            'product_size_id' => $variantData['size_id'] ?? null,
                            'sku' => $variantData['sku'] ?? null,
                            'barcode' => $variantData['barcode'] ?? null,
                            'price' => $variantData['price'] ?? null,
                            'stock' => $variantData['stock'] ?? 0,
                            'active' => $variantData['active'] ?? true
                        ]);
                        $keepVariantIds[] = $variant->id;
                    }
                }

                // Remover variantes que não estão na lista de manter
                ProductVariant::where('product_id', $product->id)
                    ->whereNotIn('id', $keepVariantIds)
                    ->delete();
            }

            // Remover imagens marcadas para exclusão
            if ($request->has('delete_image_ids') && is_array($request->delete_image_ids)) {
                foreach ($request->delete_image_ids as $imageId) {
                    $image = Image::find($imageId);
                    if ($image &&
                        (($image->typeable_type == Product::class && $image->typeable_id == $product->id) ||
                         ($image->typeable_type == ProductColor::class && in_array($image->typeable_id, $product->colors->pluck('id')->toArray())))) {

                        // Excluir arquivo fisicamente
                        if ($image->storage == 'public' && $image->path) {
                            Storage::disk('public')->delete($image->path);
                        }

                        $image->delete();
                    }
                }
            }

            // Atualizar imagem principal
            if ($request->has('main_image_id')) {
                // Remover flag de imagem principal de todas as imagens do produto
                Image::where('typeable_type', Product::class)
                    ->where('typeable_id', $product->id)
                    ->update(['is_main' => false]);

                // Definir nova imagem principal
                $mainImage = Image::find($request->main_image_id);
                if ($mainImage && $mainImage->typeable_type == Product::class && $mainImage->typeable_id == $product->id) {
                    $mainImage->is_main = true;
                    $mainImage->save();
                }
            }

            // Processar novas imagens
            if ($request->hasFile('images')) {
                $mainImageIndex = $request->input('main_image', -1);

                foreach ($request->file('images') as $index => $imageFile) {
                    $path = $imageFile->store('products', 'public');
                    $isMain = $index == $mainImageIndex;

                    $image = new Image([
                        'storage' => 'public',
                        'path' => $path,
                        'name' => basename($path),
                        'original_name' => $imageFile->getClientOriginalName(),
                        'size' => $imageFile->getSize(),
                        'extension' => $imageFile->extension(),
                        'is_main' => $isMain
                    ]);

                    // Se houver um color_id associado à imagem
                    if (isset($request->image_colors[$index])) {
                        $colorId = $request->image_colors[$index];
                        $color = ProductColor::find($colorId);
                        if ($color && $color->product_id == $product->id) {
                            $color->images()->save($image);
                        }
                    } else {
                        // Associar ao produto
                        $product->images()->save($image);
                    }

                    // Se for a imagem principal, atualizar as outras imagens
                    if ($isMain) {
                        Image::where('typeable_type', Product::class)
                            ->where('typeable_id', $product->id)
                            ->where('id', '!=', $image->id)
                            ->update(['is_main' => false]);
                    }
                }
            }

            DB::commit();

            return redirect()->route('admin.products.index')
                ->with('success', 'Produto atualizado com sucesso!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao atualizar o produto: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        try {
            DB::beginTransaction();

            // Excluir imagens do produto
            $images = $product->images;
            foreach ($images as $image) {
                if ($image->storage == 'public' && $image->path) {
                    Storage::disk('public')->delete($image->path);
                }
                $image->delete();
            }

            // Excluir imagens das cores
            foreach ($product->colors as $color) {
                $colorImages = $color->images;
                foreach ($colorImages as $image) {
                    if ($image->storage == 'public' && $image->path) {
                        Storage::disk('public')->delete($image->path);
                    }
                    $image->delete();
                }
            }

            // Excluir o produto (as relações serão excluídas pela restrição de chave estrangeira com onDelete cascade)
            $product->delete();

            DB::commit();

            return redirect()->route('admin.products.index')
                ->with('success', 'Produto eliminado com sucesso!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Ocorreu um erro ao eliminar o produto: ' . $e->getMessage());
        }
    }
}
