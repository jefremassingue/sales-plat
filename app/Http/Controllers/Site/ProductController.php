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
            ->with(['category', 'images']);

        // Aplicar filtros se existirem
        if ($request->has('categories') && !empty($request->categories)) {
            $productsQuery->whereIn('category_id', $request->categories);
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
            // Dados principais carregados imediatamente
            'categories' => Category::where('active', true)
                ->whereNull('parent_id')
                ->with(['subcategories' => function ($query) {
                    $query->where('active', true);
                }])
                ->get()
                ->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'subcategories' => $category->subcategories->map(function ($subcategory) {
                            return [
                                'id' => $subcategory->id,
                                'name' => $subcategory->name,
                            ];
                        }),
                    ];
                }),

            // Dados de produtos carregados de forma adiada (lazy)
            'products' => $productsQuery->paginate(12)->through(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $product->price,
                    'old_price' => $product->old_price,
                    'category' => $product->category ? [
                        'id' => $product->category->id,
                        'name' => $product->category->name,
                    ] : null,
                    'main_image' => $product->images->first(),
                    'brand' => $product->brand,
                    'isNew' => $product->created_at->diffInDays(now()) < 30,
                ];
            }),

            // Marcas populares (também carregadas de forma adiada)
            'brands' => Product::select('brand')
                ->whereNotNull('brand')
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
            'filters' => $request->only(['categories', 'brands', 'price_min', 'price_max', 'search', 'sort', 'order']),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {

        $product = Product::where('slug', $id)->firstOrFail();

        $product->load([
            'category',
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

        // return $product;
        return Inertia::render('Site/Products/Details', [
            'product' => $product,
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
