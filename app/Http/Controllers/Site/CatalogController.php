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

        return Inertia::render('Site/Catalogs/Index', [
            'catalogs' => $catalogs,
        ]);
    }
}