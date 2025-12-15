<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // cache()->clear();

        // Preparar a consulta base usando busca inteligente
        $search = $request->filled('search') ? trim($request->input('search')) : null;

        // Se há termo de busca com menos de 1 caractere, tratar como vazio
        if ($search && strlen($search) < 1) {
            $search = null;
        }

        $productsQuery = Product::smartSearch($search, true) // true = apenas produtos para e-commerce
            ->with(['category', 'images', 'mainImage.versions', 'brand', 'colors' => fn($q) => $q->whereHas('images')->with('images.versions'), 'colors.images.versions']);

        // Filtro inteligente: categorias principais buscam todas as subcategorias
        if ($request->has('categories') && !empty($request->categories)) {
            $categoryIds = collect($request->categories);
            $parentCategories = Category::whereIn('id', $categoryIds)->whereNull('parent_id')->pluck('id');
            $subCategories = Category::whereIn('id', $categoryIds)->whereNotNull('parent_id')->pluck('id');
            $subcategoriesFromParents = $parentCategories->isNotEmpty()
                ? Category::whereIn('parent_id', $parentCategories)->pluck('id')
                : collect();
            $finalCategoryIds = $subCategories->merge($subcategoriesFromParents)->unique();
            if ($finalCategoryIds->isNotEmpty()) {
                $productsQuery->whereIn('category_id', $finalCategoryIds);
            }
        }

        if ($request->has('c')) {
            $productsQuery->whereIn('category_id', Category::where('parent_id', $request->c)->pluck('id'));
        }

        if ($request->has('brands') && !empty($request->brands)) {
            $brandIds = is_array($request->brands) ? $request->brands : [$request->brands];
            $productsQuery->whereIn('brand_id', $brandIds);
        }

        // Aplicar ordenação
        $sortField = $request->input('sort', 'most_viewed');
        $sortOrder = $request->input('order', 'desc');
        $hasSearch = !empty($search) && strlen(trim($search)) >= 3;

        // Se há busca full-text, a relevância já foi aplicada, não aplicar ordenação adicional
        // a menos que seja especificamente solicitada
        if (!$hasSearch || $request->has('sort')) {
            switch ($sortField) {
                case 'price_asc':
                    $productsQuery->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $productsQuery->orderBy('price', 'desc');
                    break;
                case 'most_viewed':
                    $productsQuery->orderBy('views', 'desc');
                    break;
                case 'most_popular':
                    $productsQuery->withCount(['quotationItems as quotation_count' => function ($q) {}, 'saleItems as sale_count' => function ($q) {}])
                        ->orderByRaw('(quotation_count + sale_count) desc');
                    break;
                case 'newest':
                    $productsQuery->orderBy('created_at', 'desc');
                    break;
                case 'name':
                    $productsQuery->orderBy('name', 'asc');
                    break;
                case 'relevance':
                    // Apenas para busca full-text
                    if ($hasSearch) {
                        // A relevância já foi aplicada na busca
                    } else {
                        $productsQuery->orderBy('created_at', 'desc');
                    }
                    break;
                default:
                    $productsQuery->orderBy('created_at', 'desc');
                    break;
            }
        }

        // cache()->clear();
        // --- CATEGORIES WITH COUNTS FOR SIDEBAR ---
        $categories = Cache::remember('categories_with_counts', 3600, function () {
            return Category::with([
                'subcategories' => function ($query) {
                    $query->withCount([
                        'products as products_count' => function ($q) {
                            $q->where('active', true)->whereHas('ecommerce_inventory');
                        }
                    ])
                        ->whereHas('products', function ($q) {
                            $q->where('active', true)->whereHas('ecommerce_inventory');
                        });
                }
            ])
                ->whereNull('parent_id')
                ->whereHas('subcategories.products', function ($q) {
                    $q->where('active', true)->whereHas('ecommerce_inventory');
                })
                ->get()
                ->map(function ($cat) {
                    $subcategories = $cat->subcategories->map(function ($subcat) {
                        return [
                            'id' => $subcat->id,
                            'name' => $subcat->name,
                            'count' => $subcat->products_count,
                        ];
                    });

                    return [
                        'id' => $cat->id,
                        'name' => $cat->name,
                        'count' => $subcategories->sum('count'),
                        'subcategories' => $subcategories,
                    ];
                });
        });

        // Usar Inertia com Deferred Props para carregamento mais eficiente
        $response = Inertia::render('Site/Products/Index', [
            // Dados de produtos carregados de forma adiada (lazy)
            'products' => $productsQuery->paginate(20)->through(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $product->ecommerce_inventory->unit_cost ?? $product->price,
                    'old_price' => $product->ecommerce_inventory->old_cost ?? $product->old_price,
                    'category' => $product->category ? [
                        'id' => $product->category->id,
                        'name' => $product->category->name,
                    ] : null,
                    'main_image' => $product->mainImage,
                    'colors' => $product->colors->map(function ($color) {
                        return [
                            'id' => $color->id,
                            'name' => $color->name,
                            'image' => $color->images->first(),
                        ];
                    }),
                    'brand' => optional($product->brand)->name,
                    'isNew' => $product->created_at->diffInDays(now()) < 30,
                ];
            }),

            // Marcas populares (também carregadas de forma adiada)
            'brands' => Brand::query()
                ->whereHas('products', function ($q) {
                    $q->where('active', true)
                        ->whereHas('ecommerce_inventory');
                })
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(function ($brand) {
                    return [
                        'id' => $brand->id,
                        'name' => $brand->name,
                    ];
                }),

            // Filtros aplicados
            'filters' => $request->only(['categories', 'c', 'brands', 'price_min', 'price_max', 'search', 'sort', 'order']),

            // Categorias e subcategorias com contagem de produtos
            'categories' => $categories,
        ]);

        $title = 'Nossos Produtos';
        $description = 'Explore nossa ampla gama de produtos de alta qualidade. Encontre tudo o que precisa, desde equipamentos industriais a materiais de construção na Matony.';

        if ($request->filled('search')) {
            $searchTerm = e($request->search);
            $title = "Busca por \"{$searchTerm}\"";
            $description = "Resultados da busca por \"{$searchTerm}\". Encontre os melhores produtos e ofertas.";
        }
        // elseif ($request->filled('categories')) {
        //     $categoryIds = is_array($request->categories) ? $request->categories : [$request->categories];
        //     $categoryNames = Category::whereIn('id', $categoryIds)->pluck('name')->join(', ');
        //     if ($categoryNames) {
        //         $title = "Produtos em {$categoryNames}";
        //         $description = "Confira nossos produtos na(s) categoria(s) {$categoryNames}. Qualidade e variedade é na Matony.";
        //     }
        // }

        return $response->title($title)
            ->description($description, 160)
            ->image(asset('og.png'))
            ->ogMeta()
            ->twitterLargeCard();
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $product = Product::where(fn($query) => $query->where('id', $id)->orWhere('slug', $id))
            ->whereHas('ecommerce_inventory')
            ->firstOrFail()
            ?->makeHidden(['price', 'created_at', 'updated_at', 'old_price']);

        $sessionKey = 'product_viewed_' . $product->id;
        if (!$request->session()->has($sessionKey)) {
            $product->increment('views');
            $request->session()->put($sessionKey, true);
        }

        $product->load([
            'category.parent',
            'images.versions',
            'images.colors',
            'mainImage.versions',
            'colors.images.versions',
            'sizes',
            'attributes',
            'variants',
            'variants.color',
            'variants.size',
            'inventories.warehouse', // Adicionar esta linha
            'brand'
        ]);

        // $product->price = $product->ecommerce_inventory->unit_cost ?? $product->price;
        // $product->old_price = $product->ecommerce_inventory->old_cost ?? $product->old_price;

        // Buscar produtos relacionados
        $relatedProducts = Product::where('id', '!=', $product->id)
            ->whereHas('ecommerce_inventory')
            ->where(function ($query) use ($product) {
                // Produtos da mesma categoria
                $query->where('category_id', $product->category_id);

                // Ou produtos com a mesma marca, se existir
                if ($product->brand_id) {
                    $query->orWhere('brand_id', $product->brand_id);
                }
            })
            ->where('active', true)
            ->with(['category', 'images', 'brand', 'mainImage.versions', 'colors' => fn($q) => $q->whereHas('images')->with('images.versions'), 'colors.images.versions'])
            ->inRandomOrder()
            ->limit(5)
            ->get()
            ->map(function ($relatedProduct) {
                return [
                    'id' => $relatedProduct->id,
                    'name' => $relatedProduct->name,
                    'slug' => $relatedProduct->slug,
                    'price' => $relatedProduct->ecommerce_inventory->unit_cost ?? $relatedProduct->price,
                    'old_price' => $relatedProduct->ecommerce_inventory->old_cost ?? $relatedProduct->old_price,
                    'category' => $relatedProduct->category ? [
                        'id' => $relatedProduct->category->id,
                        'name' => $relatedProduct->category->name,
                    ] : null,
                    'main_image' => $relatedProduct->mainImage,
                    'colors' => $relatedProduct->colors->map(function ($color) {
                        return [
                            'id' => $color->id,
                            'name' => $color->name,
                            'image' => $color->images->first(),
                        ];
                    }),
                    'brand' => optional($relatedProduct->brand)->name,
                    'isNew' => $relatedProduct->created_at->diffInDays(now()) < 30,
                ];
            });

        $imageUrl = null;

        if (!empty($product->mainImage)) {
            $versions = $product->mainImage->versions ?? [];

            foreach (['sm', 'md', 'lg'] as $size) {
                foreach ($versions as $img) {
                    if (($img->version ?? null) === $size) {
                        $imageUrl = $img->url ?? null;
                        break 2; // sai dos dois loops
                    }
                }
            }

            if (!$imageUrl && !empty($product->mainImage->url)) {
                $imageUrl = $product->mainImage->url;
            }
        }

        // dd($imageUrl);
        $description = str(strip_tags($product->description ?? ''))->limit(150);
        return Inertia::render('Site/Products/Details', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ])
            ->title($product->name)
            ->description($description ?? 'Produto ' . $product->name)
            ->image($imageUrl ?? asset('og.png'))
            ->ogMeta()
            ->twitterLargeCard();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
