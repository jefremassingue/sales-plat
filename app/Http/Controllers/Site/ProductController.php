<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Product;
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
            ->with(['category', 'images', 'mainImage', 'ecommerce_inventory']);

        // Aplicar filtros se existirem
        if ($request->has('categories') && !empty($request->categories)) {
            $productsQuery->whereIn('category_id', $request->categories);
        }

        if ($request->has('c')) {

            $productsQuery->whereIn('category_id', Category::where('parent_id', $request->c)->pluck('id'));
        }

        if ($request->has('brands') && !empty($request->brands)) {
            $productsQuery->whereIn('brand', $request->brands);
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
                    'brand' => $product->brand,
                    'isNew' => $product->created_at->diffInDays(now()) < 30,
                ];
            }),

            // Marcas populares (também carregadas de forma adiada)
            'brands' => Product::select('brand')
                ->whereNotNull('brand')
                ->whereHas('ecommerce_inventory')
                ->distinct()
                ->get()
                ->pluck('brand')
                ->map(function ($brand) {
                    return [
                        'id' => strtolower(str_replace(' ', '-', $brand)),
                        'name' => $brand,
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
        $product = Product::where('slug', $id)
            ->whereHas('ecommerce_inventory')
            ->firstOrFail();

        $product->load([
            'category.parent',
            'images.versions',
            // 'images.colors',
            'colors.images',
            'sizes',
            'attributes',
            'variants',
            'variants.color',
            'variants.size',
            'inventories.warehouse' // Adicionar esta linha
        ]);

        $product->price = $product->ecommerce_inventory->unit_cost ?? $product->price;
        $product->old_price = $product->ecommerce_inventory->old_cost ?? $product->old_price;

        // Buscar produtos relacionados
        $relatedProducts = Product::where('id', '!=', $product->id)
            ->whereHas('ecommerce_inventory')
            ->where(function ($query) use ($product) {
                // Produtos da mesma categoria
                $query->where('category_id', $product->category_id);

                // Ou produtos com a mesma marca, se existir
                if ($product->brand) {
                    $query->orWhere('brand', $product->brand);
                }
            })
            ->where('active', true)
            ->with(['category', 'images'])
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
                    'brand' => $relatedProduct->brand,
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
