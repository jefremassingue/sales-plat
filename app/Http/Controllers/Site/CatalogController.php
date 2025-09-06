<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Catalog;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index()
    {
        $catalogs = Catalog::where('status', 'available')
            ->orderBy('publish_year', 'desc')
            ->paginate(12);

        $response = Inertia::render('Site/Catalogs/Index', [
            'catalogs' => $catalogs,
        ]);

        $title = 'Catálogos de Produtos - Matony Serviços';
        $description = 'Baixe nossos catálogos e confira a linha completa de produtos e soluções que a Matony Serviços oferece.';

        return $response->title($title)
            ->description($description, 160)
            ->image(asset('og.png'))
            ->ogMeta()
            ->twitterLargeCard();
    }
}