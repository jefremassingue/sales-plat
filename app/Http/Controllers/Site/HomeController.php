<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class HomeController extends Controller
{
    public function index()
    {
        // Produtos em destaque com cache
        $featuredProducts = Cache::remember('home:featured_products', now()->addMinutes(30), function () {
            return Product::with(['category', 'mainImage.versions'])
                ->where('featured', true)
                ->where('active', true)
                ->whereHas('ecommerce_inventory')
                ->take(12)
                ->get()
                ->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'slug' => $p->slug,
                    'price' => $p->ecommerce_inventory->unit_cost ?? $p->price,
                    'old_price' => $p->ecommerce_inventory->old_cost ?? $p->old_price,
                    'category' => $p->category ? [
                        'id' => $p->category->id,
                        'name' => $p->category->name,
                    ] : null,
                    'main_image' => $p->mainImage,
                    'brand' => $p->brand,
                    'isNew' => $p->created_at->diffInDays(now()) < 30,
                ]);
        });

        // Produtos populares com cache
        $popularProducts = Cache::remember('home:popular_products', now()->addMinutes(30), function () {
            return Product::with(['category', 'mainImage.versions'])
                ->where('active', true)
                ->orderBy('created_at', 'desc')
                ->whereHas('ecommerce_inventory')
                ->take(12)
                ->get()
                ->makeHidden(['cost', 'total_stock', 'inventory_price'])
                ->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'slug' => $p->slug,
                    'price' => $p->ecommerce_inventory->unit_cost ?? $p->price,
                    'old_price' => $p->ecommerce_inventory->old_cost ?? $p->old_price,
                    'category' => $p->category ? [
                        'id' => $p->category->id,
                        'name' => $p->category->name,
                    ] : null,
                    'main_image' => $p->mainImage,
                    'brand' => $p->brand,
                    'isNew' => $p->created_at->diffInDays(now()) < 30,
                ]);
        });

        // Novos produtos com cache
        $newProducts = Cache::remember('home:new_products', now()->addMinutes(30), function () {
            return Product::with(['category', 'mainImage.versions'])
                ->select(['id', 'name', 'slug', 'description', 'technical_details', 'features', 'price', 'category_id', 'old_price', 'created_at'])
                ->where('active', true)
                ->orderBy('created_at', 'desc')
                ->whereHas('ecommerce_inventory')
                ->take(12)
                ->get()
                ->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'slug' => $p->slug,
                    'price' => $p->ecommerce_inventory->unit_cost ?? $p->price,
                    'old_price' => $p->ecommerce_inventory->old_cost ?? $p->old_price,
                    'category' => $p->category ? [
                        'id' => $p->category->id,
                        'name' => $p->category->name,
                    ] : null,
                    'main_image' => $p->mainImage,
                    'brand' => $p->brand,
                    'isNew' => $p->created_at->diffInDays(now()) < 30,
                ]);
        });

        // Categorias com cache
        $categories = Cache::remember('home:categories', now()->addMinutes(30), function () {
            return Category::with(['subcategories.products'])
                ->where('active', true)
                ->whereNull('parent_id')
                ->orderBy('order')
                ->get()
                ->map(fn($c) => [
                    'name' => $c->name,
                    'imageUrl' => 'https://picsum.photos/seed/cat_' . $c->id . '/300/200',
                    'link' => '/products?c=' . $c->id,
                    'items' => $c->products()->count() + $c->subcategories->sum(fn($sc) => $sc->products->count()),
                ]);
        });

        return Inertia::render('Site/Home', [
            'featuredProducts' => $featuredProducts,
            'popularProducts' => $popularProducts,
            'newProducts' => $newProducts,
            '_categories' => $categories,
        ]);
    }

    public function about()
    {
        return Inertia::render('Site/About');
    }
}
