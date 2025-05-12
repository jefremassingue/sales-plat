<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class HomeController extends Controller
{
    public function index()
    {
        // Log para debug - início da requisição
        Log::info('HomeController: Iniciando carregamento de dados');

        // Carregar produtos em destaque
        $featuredProducts = Product::with(['category', 'mainImage.versions'])
            ->where('featured', true)
            ->where('active', true)
            ->take(12)
            ->get();

        // Carregar produtos populares
        $popularProducts = Product::with(['category', 'mainImage.versions'])
            ->where('active', true)
            ->orderBy('created_at', 'desc')
            ->take(12)
            ->get()
            ->makeHidden(['cost', 'total_stock', 'inventory_price']);

        // Carregar novos produtos
        $newProducts = Product::with(['category', 'mainImage.versions'])
            ->select([
                'name',
                'slug',
                'description',
                'technical_details',
                'features',
                'price',
                'category_id',
                'old_price'
            ])
            ->where('active', true)
            ->orderBy('created_at', 'desc')
            ->take(12)
            ->get();


        // Carregar categorias
        $categories = Category::where('active', true)
            ->whereNull('parent_id')
            ->orderBy('order')
            // ->take(6)
            ->get();



        $categories = $categories->map(function ($category) {
            return [
                'name' => $category->name,
                'imageUrl' => 'https://picsum.photos/seed/cat_' . $category->id . '/300/200',
                'link' => '/categorias/' . $category->slug,
                'items' => $category->products()->count(),
            ];
        });

        // return [
        //     'featuredProducts' => $featuredProducts,
        //     'popularProducts' => $popularProducts,
        //     'newProducts' => $newProducts,
        //     'categories' => $categories,
        // ];

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
