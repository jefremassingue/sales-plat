<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductColor;
use App\Models\ProductSize;
use App\Models\ProductVariant;
use App\Models\ProductAttribute;
use App\Models\Category;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
                ->with('mainImage.versions', 'category');

            // Filtros
            if ($request->has('search') && $request->search !== null && trim($request->search) !== '') {
                $search = trim($request->search);
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                      ->orWhere('sku', 'like', '%' . $search . '%')
                      ->orWhere('description', 'like', '%' . $search . '%')
                      ->orWhere('barcode', 'like', '%' . $search . '%')
                      ->orWhere('brand', 'like', '%' . $search . '%');
                });
            }

            if ($request->has('category_id') && $request->category_id) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->has('active') && $request->active !== null) {
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
            $categories = Category::whereNull('parent_id')->with('subcategories')->get();

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
        try {

            // Validação inicial dos dados básicos
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
                // 'active' => 'boolean',
                // 'featured' => 'boolean',
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
                'variants.*.color_id' => 'nullable|string',
                'variants.*.size_id' => 'nullable|string',
                'variants.*.sku' => 'nullable|string|max:100',
                'variants.*.price' => 'nullable|numeric|min:0',
                'variants.*.stock' => 'nullable|integer|min:0',
            ], [
                'name.required' => 'O nome do produto é obrigatório.',
                'slug.regex' => 'O slug deve conter apenas letras minúsculas, números e hífens.',
                'slug.unique' => 'Este slug já está a ser utilizado por outro produto.',
                'price.required' => 'O preço é obrigatório.',
                'price.min' => 'O preço deve ser igual ou maior que zero.',
                'price.numeric' => 'O preço deve ser um valor numérico.',
                'category_id.required' => 'A categoria é obrigatória.',
                'category_id.exists' => 'A categoria selecionada não existe.',
                'sku.unique' => 'Este código SKU já está a ser utilizado por outro produto.',
                'images.*.image' => 'Os ficheiros devem ser imagens (jpeg, png, bmp, gif, svg, ou webp).',
                'images.*.max' => 'As imagens não devem exceder 2MB.',
                'colors.*.name.required' => 'O nome da cor é obrigatório.',
                'sizes.*.name.required' => 'O nome do tamanho é obrigatório.',
                'attributes.*.name.required' => 'O nome do atributo é obrigatório.',
                'attributes.*.value.required' => 'O valor do atributo é obrigatório.',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();

            try {
                // Preparar os dados para criação
                $data = $request->except(['images', 'colors', 'sizes', 'attributes', 'variants', 'image_colors']);

                // Se o slug não foi fornecido, gerar a partir do nome
                if (empty($data['slug'])) {
                    $data['slug'] = Str::slug($data['name']);
                } else {
                    // Garantir que o slug esteja no formato correto
                    $data['slug'] = Str::slug($data['slug']);
                }
                $data['active'] = $data['active'] == 'true';
                $data['featured'] = $data['featured'] == 'true';

                // Criar o produto
                $product = Product::create($data);

                // Processar cores
                $colorIds = [];
                if ($request->has('colors') && is_array($request->colors)) {
                    foreach ($request->colors as $index => $colorData) {
                        try {
                            $color = $product->colors()->create([
                                'name' => $colorData['name'],
                                'hex_code' => $colorData['hex_code'] ?? null,
                                'active' => $colorData['active'] ?? true,
                                'order' => $colorData['order'] ?? $index
                            ]);
                            $colorIds[$colorData['_tempId'] ?? $index] = $color->id;
                        } catch (\Exception $e) {
                            throw new \Exception('Erro ao processar cor: ' . $e->getMessage());
                        }
                    }
                }

                // Processar tamanhos
                $sizeIds = [];
                if ($request->has('sizes') && is_array($request->sizes)) {
                    foreach ($request->sizes as $index => $sizeData) {
                        try {
                            $size = $product->sizes()->create([
                                'name' => $sizeData['name'],
                                'code' => $sizeData['code'] ?? null,
                                'description' => $sizeData['description'] ?? null,
                                'available' => $sizeData['available'] ?? true,
                                'order' => $sizeData['order'] ?? $index
                            ]);
                            $sizeIds[$sizeData['_tempId'] ?? $index] = $size->id;
                        } catch (\Exception $e) {
                            throw new \Exception('Erro ao processar tamanho: ' . $e->getMessage());
                        }
                    }
                }

                // Processar atributos
                if ($request->has('attributes') && is_array($request->attributes)) {
                    foreach ($request->attributes as $index => $attrData) {
                        try {
                            $product->attributes()->create([
                                'name' => $attrData['name'],
                                'value' => $attrData['value'],
                                'description' => $attrData['description'] ?? null,
                                'type' => $attrData['type'] ?? 'text',
                                'filterable' => $attrData['filterable'] ?? false,
                                'visible' => $attrData['visible'] ?? true,
                                'order' => $attrData['order'] ?? $index
                            ]);
                        } catch (\Exception $e) {
                            throw new \Exception('Erro ao processar atributo: ' . $e->getMessage());
                        }
                    }
                }

                // Processar variantes
                if ($request->has('variants') && is_array($request->variants)) {
                    foreach ($request->variants as $index => $variantData) {
                        try {
                            $colorId = null;
                            // dd($variantData['color_id'], $request->variants, $colorIds);
                            if (!empty($variantData['color_id'])) {
                                $colorId = $colorIds[$variantData['color_id']] ?? null;
                                if (!$colorId) {
                                    throw new \Exception('Cor não encontrada para a variante');
                                }
                            }

                            $sizeId = null;
                            if (!empty($variantData['size_id'])) {
                                $sizeId = $sizeIds[$variantData['size_id']] ?? null;
                                if (!$sizeId) {
                                    throw new \Exception('Tamanho não encontrado para a variante');
                                }
                            }

                            $product->variants()->create([
                                'product_color_id' => $colorId,
                                'product_size_id' => $sizeId,
                                'sku' => $variantData['sku'] ?? null,
                                'price' => $variantData['price'] ?? null,
                                'stock' => $variantData['stock'] ?? 0,
                                'active' => $variantData['active'] ?? true
                            ]);
                        } catch (\Exception $e) {
                            throw new \Exception('Erro ao processar variante: ' . $e->getMessage());
                        }
                    }
                }

                // Processar imagens
                if ($request->hasFile('images')) {
                    $mainImageIndex = $request->input('main_image', 0);
                    $imageColors = $request->input('image_colors', []);

                    foreach ($request->file('images') as $index => $imageFile) {
                        try {
                            if (!$imageFile->isValid()) {
                                throw new \Exception('Ficheiro inválido');
                            }

                            $path = $imageFile->store('products', 'public');
                            $isMain = $index == $mainImageIndex;

                            $image = new Image([
                                'version' => 'original',
                                'storage' => 'public',
                                'path' => $path,
                                'name' => basename($path),
                                'original_name' => $imageFile->getClientOriginalName(),
                                'size' => $imageFile->getSize(),
                                'extension' => $imageFile->extension(),
                                'is_main' => $isMain
                            ]);

                            // Se houver um color_id associado à imagem
                            if (isset($imageColors[$index]) && $imageColors[$index]) {
                                $colorTempId = $imageColors[$index];
                                $colorId = $colorIds[$colorTempId] ?? null;

                                if ($colorId) {
                                    $color = ProductColor::find($colorId);
                                    if ($color) {
                                        $color->images()->save($image);
                                    } else {
                                        $product->images()->save($image);
                                    }
                                } else {
                                    $product->images()->save($image);
                                }
                            } else {
                                // Associar ao produto
                                $product->images()->save($image);
                            }
                        } catch (\Exception $e) {
                            // Se houver erro, remover a imagem caso já tenha sido salva
                            if (isset($path) && Storage::disk('public')->exists($path)) {
                                Storage::disk('public')->delete($path);
                            }
                            throw new \Exception('Erro ao processar imagem: ' . $e->getMessage());
                        }
                    }
                }

                DB::commit();

                return redirect()->route('admin.products.index')
                    ->with('success', 'Produto criado com sucesso!');
            } catch (\Exception $e) {
                DB::rollback();

                // Logar o erro para depuração
                Log::error('Erro ao criar produto: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                    'request' => $request->all()
                ]);

                return redirect()->back()
                    ->withErrors(['general' => 'Ocorreu um erro ao criar o produto: ' . $e->getMessage()])
                    ->withInput();
            }
        } catch (\Exception $e) {
            // Logar o erro de validação para depuração
            Log::error('Erro na validação do produto: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withErrors(['general' => 'Ocorreu um erro ao validar os dados: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
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

            $categories = Category::whereNull('parent_id')->with('subcategories')->get();

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
        try {
            // Validação inicial dos dados básicos
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
                // 'active' => 'boolean',
                // 'featured' => 'boolean',
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
                'colors.*.hex_code' => 'nullable|string|max:20',
                'sizes' => 'nullable|array',
                'sizes.*.id' => 'nullable|integer|exists:product_sizes,id',
                'sizes.*.name' => 'required|string|max:100',
                'attributes' => 'nullable|array',
                'attributes.*.id' => 'nullable|integer|exists:product_attributes,id',
                'attributes.*.name' => 'required|string|max:100',
                'attributes.*.value' => 'required|string|max:255',
                'variants' => 'nullable|array',
                'variants.*.id' => 'nullable|integer|exists:product_variants,id',
                'variants.*.color_id' => 'nullable|string',
                'variants.*.size_id' => 'nullable|string',
                'variants.*.sku' => 'nullable|string|max:100',
                'variants.*.price' => 'nullable|numeric|min:0',
                'variants.*.stock' => 'nullable|integer|min:0',
                'existing_image_ids' => 'nullable|array',
                'existing_image_ids.*' => 'nullable|integer|exists:images,id',
                'delete_image_ids' => 'nullable|array',
                'delete_image_ids.*' => 'nullable|integer|exists:images,id',
            ], [
                'name.required' => 'O nome do produto é obrigatório.',
                'slug.regex' => 'O slug deve conter apenas letras minúsculas, números e hífens.',
                'slug.unique' => 'Este slug já está a ser utilizado por outro produto.',
                'price.required' => 'O preço é obrigatório.',
                'price.min' => 'O preço deve ser igual ou maior que zero.',
                'price.numeric' => 'O preço deve ser um valor numérico.',
                'category_id.required' => 'A categoria é obrigatória.',
                'category_id.exists' => 'A categoria selecionada não existe.',
                'sku.unique' => 'Este código SKU já está a ser utilizado por outro produto.',
                'images.*.image' => 'Os ficheiros devem ser imagens (jpeg, png, bmp, gif, svg, ou webp).',
                'images.*.max' => 'As imagens não devem exceder 2MB.',
                'colors.*.name.required' => 'O nome da cor é obrigatório.',
                'sizes.*.name.required' => 'O nome do tamanho é obrigatório.',
                'attributes.*.name.required' => 'O nome do atributo é obrigatório.',
                'attributes.*.value.required' => 'O valor do atributo é obrigatório.',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();

            try {
                // Preparar os dados para atualização
                $data = $request->except(['images', 'colors', 'sizes', 'attributes', 'variants', 'existing_image_ids', 'delete_image_ids', 'image_colors']);

                // Se o slug não foi fornecido, gerar a partir do nome
                if (empty($data['slug'])) {
                    $data['slug'] = Str::slug($data['name']);
                } else {
                    // Garantir que o slug esteja no formato correto
                    $data['slug'] = Str::slug($data['slug']);
                }

                $data['active'] = $data['active'] == 'true';
                $data['featured'] = $data['featured'] == 'true';

                // Atualizar o produto
                $product->update($data);

                // Processar cores
                $colorIds = [];
                if ($request->has('colors') && is_array($request->colors)) {
                    $keepColorIds = [];

                    foreach ($request->colors as $index => $colorData) {
                        try {
                            if (isset($colorData['id'])) {
                                // Atualizar cor existente
                                $color = ProductColor::find($colorData['id']);
                                if ($color && $color->product_id == $product->id) {
                                    $color->update([
                                        'name' => $colorData['name'],
                                        'hex_code' => $colorData['hex_code'] ?? null,
                                        'active' => $colorData['active'] ?? true,
                                        'order' => $colorData['order'] ?? $index
                                    ]);
                                    $keepColorIds[] = $color->id;
                                    $colorIds[$colorData['_tempId'] ?? $index] = $color->id;
                                }
                            } else {
                                // Criar nova cor
                                $color = $product->colors()->create([
                                    'name' => $colorData['name'],
                                    'hex_code' => $colorData['hex_code'] ?? null,
                                    'active' => $colorData['active'] ?? true,
                                    'order' => $colorData['order'] ?? $index
                                ]);
                                $keepColorIds[] = $color->id;
                                $colorIds[$colorData['_tempId'] ?? $index] = $color->id;
                            }
                        } catch (\Exception $e) {
                            throw new \Exception('Erro ao processar cor: ' . $e->getMessage());
                        }
                    }

                    // Remover cores que não estão na lista de manter
                    ProductColor::where('product_id', $product->id)
                        ->whereNotIn('id', $keepColorIds)
                        ->delete();
                }

                // Processar tamanhos
                $sizeIds = [];
                if ($request->has('sizes') && is_array($request->sizes)) {
                    $keepSizeIds = [];

                    foreach ($request->sizes as $index => $sizeData) {
                        try {
                            if (isset($sizeData['id'])) {
                                // Atualizar tamanho existente
                                $size = ProductSize::find($sizeData['id']);
                                if ($size && $size->product_id == $product->id) {
                                    $size->update([
                                        'name' => $sizeData['name'],
                                        'code' => $sizeData['code'] ?? null,
                                        'description' => $sizeData['description'] ?? null,
                                        'available' => $sizeData['available'] ?? true,
                                        'order' => $sizeData['order'] ?? $index
                                    ]);
                                    $keepSizeIds[] = $size->id;
                                    $sizeIds[$sizeData['_tempId'] ?? $index] = $size->id;
                                }
                            } else {
                                // Criar novo tamanho
                                $size = $product->sizes()->create([
                                    'name' => $sizeData['name'],
                                    'code' => $sizeData['code'] ?? null,
                                    'description' => $sizeData['description'] ?? null,
                                    'available' => $sizeData['available'] ?? true,
                                    'order' => $sizeData['order'] ?? $index
                                ]);
                                $keepSizeIds[] = $size->id;
                                $sizeIds[$sizeData['_tempId'] ?? $index] = $size->id;
                            }
                        } catch (\Exception $e) {
                            throw new \Exception('Erro ao processar tamanho: ' . $e->getMessage());
                        }
                    }

                    // Remover tamanhos que não estão na lista de manter
                    ProductSize::where('product_id', $product->id)
                        ->whereNotIn('id', $keepSizeIds)
                        ->delete();
                }

                // Processar atributos
                if ($request->has('attributes') && is_array($request->attributes)) {
                    $keepAttributeIds = [];

                    foreach ($request->attributes as $index => $attrData) {
                        try {
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
                                        'order' => $attrData['order'] ?? $index
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
                                    'order' => $attrData['order'] ?? $index
                                ]);
                                $keepAttributeIds[] = $attr->id;
                            }
                        } catch (\Exception $e) {
                            throw new \Exception('Erro ao processar atributo: ' . $e->getMessage());
                        }
                    }

                    // Remover atributos que não estão na lista de manter
                    ProductAttribute::where('product_id', $product->id)
                        ->whereNotIn('id', $keepAttributeIds)
                        ->delete();
                }

                // Processar variantes
                if ($request->has('variants') && is_array($request->variants)) {
                    $keepVariantIds = [];

                    foreach ($request->variants as $index => $variantData) {
                        try {
                            $colorId = null;
                            if (!empty($variantData['color_id'])) {
                                $colorId = $colorIds[$variantData['color_id']] ?? $variantData['color_id'];
                                if (!$colorId) {
                                    throw new \Exception('Cor não encontrada para a variante');
                                }
                            }

                            $sizeId = null;
                            if (!empty($variantData['size_id'])) {
                                $sizeId = $sizeIds[$variantData['size_id']] ?? $variantData['size_id'];
                                if (!$sizeId) {
                                    throw new \Exception('Tamanho não encontrado para a variante');
                                }
                            }

                            if (isset($variantData['id'])) {
                                // Atualizar variante existente
                                $variant = ProductVariant::find($variantData['id']);
                                if ($variant && $variant->product_id == $product->id) {
                                    $variant->update([
                                        'product_color_id' => $colorId,
                                        'product_size_id' => $sizeId,
                                        'sku' => $variantData['sku'] ?? null,
                                        'price' => $variantData['price'] ?? null,
                                        'stock' => $variantData['stock'] ?? 0,
                                        'active' => $variantData['active'] ?? true
                                    ]);
                                    $keepVariantIds[] = $variant->id;
                                }
                            } else {
                                // Criar nova variante
                                $variant = $product->variants()->create([
                                    'product_color_id' => $colorId,
                                    'product_size_id' => $sizeId,
                                    'sku' => $variantData['sku'] ?? null,
                                    'price' => $variantData['price'] ?? null,
                                    'stock' => $variantData['stock'] ?? 0,
                                    'active' => $variantData['active'] ?? true
                                ]);
                                $keepVariantIds[] = $variant->id;
                            }
                        } catch (\Exception $e) {
                            throw new \Exception('Erro ao processar variante: ' . $e->getMessage());
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
                        try {
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
                        } catch (\Exception $e) {
                            throw new \Exception('Erro ao excluir imagem: ' . $e->getMessage());
                        }
                    }
                }

                // Atualizar imagem principal
                if ($request->has('main_image_id')) {
                    try {
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
                    } catch (\Exception $e) {
                        throw new \Exception('Erro ao atualizar imagem principal: ' . $e->getMessage());
                    }
                }

                // Processar novas imagens
                if ($request->hasFile('images')) {
                    $mainImageIndex = $request->input('main_image', -1);
                    $imageColors = $request->input('image_colors', []);

                    foreach ($request->file('images') as $index => $imageFile) {
                        try {
                            if (!$imageFile->isValid()) {
                                throw new \Exception('Ficheiro inválido');
                            }

                            $path = $imageFile->store('products', 'public');
                            $isMain = $index == $mainImageIndex;

                            $image = new Image([
                                'version' => 'original',
                                'storage' => 'public',
                                'path' => $path,
                                'name' => basename($path),
                                'original_name' => $imageFile->getClientOriginalName(),
                                'size' => $imageFile->getSize(),
                                'extension' => $imageFile->extension(),
                                'is_main' => $isMain
                            ]);

                            // Se houver um color_id associado à imagem
                            if (isset($imageColors[$index]) && $imageColors[$index]) {
                                $colorTempId = $imageColors[$index];
                                $colorId = $colorIds[$colorTempId] ?? null;

                                if ($colorId) {
                                    $color = ProductColor::find($colorId);
                                    if ($color) {
                                        $color->images()->save($image);
                                    } else {
                                        $product->images()->save($image);
                                    }
                                } else {
                                    $product->images()->save($image);
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
                        } catch (\Exception $e) {
                            // Se houver erro, remover a imagem caso já tenha sido salva
                            if (isset($path) && Storage::disk('public')->exists($path)) {
                                Storage::disk('public')->delete($path);
                            }
                            throw new \Exception('Erro ao processar imagem: ' . $e->getMessage());
                        }
                    }
                }

                DB::commit();

                return redirect()->route('admin.products.index')
                    ->with('success', 'Produto atualizado com sucesso!');
            } catch (\Exception $e) {
                DB::rollback();

                // Logar o erro para depuração
                Log::error('Erro ao atualizar produto: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                    'request' => $request->all()
                ]);

                return redirect()->back()
                    ->withErrors(['general' => 'Ocorreu um erro ao atualizar o produto: ' . $e->getMessage()])
                    ->withInput();
            }
        } catch (\Exception $e) {
            // Logar o erro de validação para depuração
            Log::error('Erro na validação do produto: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withErrors(['general' => 'Ocorreu um erro ao validar os dados: ' . $e->getMessage()])
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
