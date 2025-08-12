<?php

namespace App\Http\Middleware;

use App\Models\Currency;
use App\Models\Category;
use App\Models\Warehouse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // Cache key definitions
        $currencyCacheKey = 'default_currency';
        $categoriesCacheKey = 'top_categories_with_subs';
        $defaultWarehouseCacheKey = 'default_warehouse';

        // Carregar a moeda padrão do sistema com cache
        $defaultCurrency = Cache::remember($currencyCacheKey, now()->addMinutes(60), function () {
            $currency = Currency::where('is_default', true)->first();

            if (! $currency) {
                $currency = Currency::where('is_active', true)->first();

                if (! $currency) {
                    $currency = Currency::create([
                        'code' => 'MZN',
                        'name' => 'Metical Moçambicano',
                        'symbol' => 'MT',
                        'exchange_rate' => 1.0000,
                        'is_default' => true,
                        'is_active' => true,
                        'decimal_separator' => ',',
                        'thousand_separator' => '.',
                        'decimal_places' => 2,
                    ]);
                }
            }

            return $currency;
        });

        // Carregar categorias apenas se necessário, com cache
        $categories = Cache::remember($categoriesCacheKey, now()->addMinutes(60), function () {
            return Category::whereNull('parent_id')
                ->with('subcategories')
                ->orderBy('name')
                ->get(['id', 'name', 'slug'])
                ->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'href' => "/products?c={$category->id}",
                        'subcategories' => $category->subcategories->map(function ($subcategory) {
                            return [
                                'id' => $subcategory->id,
                                'name' => $subcategory->name,
                                'href' => "/products?categories[0]={$subcategory->id}",
                            ];
                        }),
                    ];
                });
        });


        // Só compartilhar defaultWarehouse em rotas de admin
        $isAdminRoute = str($request->path())->startsWith('admin');
        $defaultWarehouse = null;
        if ($isAdminRoute) {
            $defaultWarehouse = Cache::remember($defaultWarehouseCacheKey, now()->addDay(), function () {
                return Warehouse::where('is_main', true)->first();
            });
        }

        return [
            ...parent::share($request),
            ...( $isAdminRoute ? ['defaultWarehouse' => $defaultWarehouse] : [] ),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'can' => $request->user()->getAllPermissions()->pluck('name')->toArray(),
                ] : null,
            ],
            'ziggy' => fn(): array => [
                ...(new Ziggy())->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',

            // Adicionando a moeda padrão e categorias com cache
            'currency' => $defaultCurrency,
            'categories' => $categories,

            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
        ];
    }
}
