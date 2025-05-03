<?php

namespace App\Http\Middleware;

use App\Models\Currency;
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

        // Carregar a moeda padrão do sistema para estar disponível em todas as páginas
        try {
            $defaultCurrency = Currency::where('is_default', true)->first();

            // Se não encontrar moeda padrão, tentar encontrar qualquer moeda ativa
            if (!$defaultCurrency) {
                $defaultCurrency = Currency::where('is_active', true)->first();

                // Se ainda não tiver nenhuma moeda, criar uma moeda padrão
                if (!$defaultCurrency) {
                    $defaultCurrency = Currency::create([
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
        } catch (\Exception $e) {
            // Em caso de erro, definir valores padrão para a moeda
            $defaultCurrency = (object)[
                'code' => 'MZN',
                'name' => 'Metical Moçambicano',
                'symbol' => 'MT',
                'exchange_rate' => 1.0000,
                'is_default' => true,
                'is_active' => true,
                'decimal_separator' => ',',
                'thousand_separator' => '.',
                'decimal_places' => 2,
            ];
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',

            // Adicionando a moeda padrão aos dados compartilhados globalmente
            'currency' => $defaultCurrency,

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
