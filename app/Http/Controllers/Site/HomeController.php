<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Blog;
use App\Models\HeroSlider;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class HomeController extends Controller
{
    public function index()
    {
        // Produtos mais visualizados com cache
        $mostViewedProducts = Cache::remember('home:most_viewed_products', now()->addMinutes(30), function () {
            return Product::with(['category', 'mainImage.versions', 'colors' => fn($q) => $q->whereHas('images')->with('images.versions'), 'colors.images.versions'])
                ->where('active', true)
                ->whereHas('ecommerce_inventory')
                ->orderBy('views', 'desc')
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
                    'colors' => $p->colors->map(function ($color) {
                        return [
                            'id' => $color->id,
                            'name' => $color->name,
                            'image' => $color->images->first(),
                        ];
                    }),
                    'brand' => $p->brand,
                    'isNew' => $p->created_at->diffInDays(now()) < 30,
                    'views' => $p->views,
                ]);
        });

        // Cache::clear();
        // Produtos em destaque com cache
        $featuredProducts = Cache::remember('home:featured_products', now()->addMinutes(30), function () {
            return Product::with(['category', 'mainImage.versions', 'colors' => fn($q) => $q->whereHas('images')->with('images.versions'), 'colors.images.versions'])
                ->where('featured', true)
                ->where('active', true)
                ->whereHas('ecommerce_inventory')
                ->take(12)
                ->get()
                ->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'slug' => $p->slug,
                    // 'price' => $p->ecommerce_inventory->unit_cost ?? $p->price,
                    // 'old_price' => $p->ecommerce_inventory->old_cost ?? $p->old_price,
                    'category' => $p->category ? [
                        'id' => $p->category->id,
                        'name' => $p->category->name,
                    ] : null,
                    'main_image' => $p->mainImage,
                    'colors' => $p->colors->map(function ($color) {
                        return [
                            'id' => $color->id,
                            'name' => $color->name,
                            'image' => $color->images->first(),
                        ];
                    }),
                    'brand' => $p->brand,
                    'isNew' => $p->created_at->diffInDays(now()) < 30,
                ]);
        });

        // Produtos populares com cache (baseado em vendas + cotações)
        $popularProducts = Cache::remember('home:popular_products', now()->addMinutes(30), function () {
            return Product::with(['category', 'mainImage.versions', 'colors' => fn($q) => $q->whereHas('images')->with('images.versions'), 'colors.images.versions'])
                ->where('active', true)
                ->whereHas('ecommerce_inventory')
                ->withCount(['saleItems as sale_count', 'quotationItems as quotation_count'])
                ->orderByRaw('(sale_count + quotation_count) desc')
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
                    'colors' => $p->colors->map(function ($color) {
                        return [
                            'id' => $color->id,
                            'name' => $color->name,
                            'image' => $color->images->first(),
                        ];
                    }),
                    'brand' => $p->brand,
                    'isNew' => $p->created_at->diffInDays(now()) < 30,
                    'popularity' => ($p->sale_count ?? 0) + ($p->quotation_count ?? 0),
                ]);
        });

        // Novos produtos com cache
        $newProducts = Cache::remember('home:new_products', now()->addMinutes(30), function () {
            return Product::with(['category', 'mainImage.versions', 'colors' => fn($q) => $q->whereHas('images')->with('images.versions'), 'colors.images.versions'])
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
                    'colors' => $p->colors->map(function ($color) {
                        return [
                            'id' => $color->id,
                            'name' => $color->name,
                            'image' => $color->images->first(),
                        ];
                    }),
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
                    'link' => '/products?c=' . $c->id,
                    'items' => $c->products()->whereHas('ecommerce_inventory')->count() + $c->subcategories->sum(fn($sc) => $sc->products->count()),
                ]);
        });

        // Posts de blog recentes (cache)
        $blogPosts = Cache::remember('home:blog_posts', now()->addMinutes(30), function () {
            return Blog::with(['category', 'user', 'image.versions'])
                ->where('status', true)
                ->whereNotNull('published_at')
                ->orderByDesc('published_at')
                ->take(4)
                ->get()
                ->map(fn($b) => [
                    'id' => $b->id,
                    'title' => $b->title,
                    'date' => optional($b->published_at)->format('d \d\e F, Y'),
                    'excerpt' => $b->excerpt ?? str($b->content)->limit(120),
                    'link' => '/blog/' . $b->slug,
                    'image' => $b->image,
                    'category' => $b->category?->name,
                    'author' => $b->user?->name,
                ]);
        });

        $heroSlides = Cache::remember('home:hero_slides', now()->addMinutes(30), function () {
            return HeroSlider::where('active', true)->orderBy('order')->get();
        });

        $response = Inertia::render('Site/Home', [
            'featuredProducts' => $featuredProducts,
            'popularProducts' => $popularProducts,
            'mostViewedProducts' => $mostViewedProducts,
            'newProducts' => $newProducts,
            '_categories' => $categories,
            'blogPosts' => $blogPosts,
            'heroSlides' => $heroSlides,
        ]);

        $title = 'Matony - Soluções em Equipamentos e Materiais de Construção';
        $description = 'Encontre na Matony uma vasta gama de equipamentos, materiais de construção e soluções para sua obra ou indústria. Qualidade, variedade e os melhores preços.';

        return $response->title($title)
            ->description($description, 160)
            ->image(asset('og.png'))
            ->ogMeta()
            ->twitterLargeCard();
    }

    public function about()
    {
        $response = Inertia::render('Site/About');

        $title = 'Sobre Nós - Conheça a Matony';
        $description = 'Saiba mais sobre a história, missão e valores da Matony. Somos comprometidos em oferecer as melhores soluções e atendimento para nossos clientes em todo o país.';

        return $response->title($title)
            ->description($description, 160)
            ->image(asset('og.png'))
            ->ogMeta()
            ->twitterLargeCard();
    }
}
