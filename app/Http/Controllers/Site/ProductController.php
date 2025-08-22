<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Preparar a consulta base
        $productsQuery = Product::query()
            ->where('active', true)
            ->whereHas('ecommerce_inventory')
            ->with(['category', 'images', 'mainImage', 'ecommerce_inventory', 'brand']);

        // Aplicar filtros se existirem
        if ($request->has('categories') && !empty($request->categories)) {
            $productsQuery->whereIn('category_id', $request->categories);
        }

        if ($request->has('c')) {

            $productsQuery->whereIn('category_id', Category::where('parent_id', $request->c)->pluck('id'));
        }

        if ($request->has('brands') && !empty($request->brands)) {
            $brandIds = is_array($request->brands) ? $request->brands : [$request->brands];
            $productsQuery->whereIn('brand_id', $brandIds);
        }

        if ($request->has('price_min') && is_numeric($request->price_min)) {
            $productsQuery->where('price', '>=', $request->price_min);
        }

        if ($request->has('price_max') && is_numeric($request->price_max)) {
            $productsQuery->where('price', '<=', $request->price_max);
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $productsQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Aplicar ordenação
        $sortField = $request->input('sort', 'created_at');
        $sortOrder = $request->input('order', 'desc');

        switch ($sortField) {
            case 'price_asc':
                $productsQuery->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $productsQuery->orderBy('price', 'desc');
                break;
            case 'newest':
                $productsQuery->orderBy('created_at', 'desc');
                break;
            case 'name':
                $productsQuery->orderBy('name', 'asc');
                break;
            default:
                $productsQuery->orderBy('created_at', 'desc');
                break;
        }

        // Usar Inertia com Deferred Props para carregamento mais eficiente
        return Inertia::render('Site/Products/Index', [
            // Dados de produtos carregados de forma adiada (lazy)
        'products' => $productsQuery->paginate(12)->through(function ($product) {
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
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $product = Product::where(fn($query) => $query->where('id', $id)->orWhere('slug', $id))
            // ->whereHas('ecommerce_inventory')
            ->firstOrFail()
            ?->makeHidden(['price', 'created_at', 'updated_at', 'old_price']);

        $product->load([
            'category.parent',
            'images.versions',
            // 'images.colors',
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
            // ->whereHas('ecommerce_inventory')
            ->where(function ($query) use ($product) {
                // Produtos da mesma categoria
                $query->where('category_id', $product->category_id);

                // Ou produtos com a mesma marca, se existir
        if ($product->brand_id) {
            $query->orWhere('brand_id', $product->brand_id);
                }
            })
            ->where('active', true)
        ->with(['category', 'images', 'brand'])
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
                    'main_image' => $relatedProduct->images->first(),
                    'brand' => optional($relatedProduct->brand)->name,
                    'isNew' => $relatedProduct->created_at->diffInDays(now()) < 30,
                ];
            });

        // return $product;
        return Inertia::render('Site/Products/Details', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
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
