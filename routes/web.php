<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Pos\PosSaleController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\SearchController;


Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
});

// Rotas POS (fora do admin)
Route::prefix('pos')->name('pos.')->middleware(['auth'])->group(function () {
    Route::get('/', [\App\Http\Controllers\Pos\PosSaleController::class, 'index'])->name('index');
    Route::post('/sales', [\App\Http\Controllers\Pos\PosSaleController::class, 'store'])->name('sales.store');
    Route::get('/product-inventory', [\App\Http\Controllers\Pos\PosSaleController::class, 'getProductInventory'])->name('product-inventory');
    Route::get('/sales/{id}/print', [PosSaleController::class, 'printSale'])->name('sales.print');
});


require __DIR__ . '/site.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';
// Social media redirects

$redirects = [
    '/linkedin' => 'https://www.linkedin.com/company/matony-servicos/',
    '/instagram' => 'https://www.instagram.com/matony_servicos/',
    '/youtube' => 'https://www.youtube.com/@matony_servicos',
    '/facebook' => 'https://www.facebook.com/profile.php?id=61575857846470',
    '/whatsapp' => 'https://wa.me/258871154336'
];

foreach ($redirects as $path => $url) {
    Route::get($path, function () use ($url) {
        return redirect()->away($url);
    });
}

// Terms and Privacy Policy pages
Route::get('/termos', function () {
    return Inertia::render('Site/terms');
})->name('terms');

Route::get('/privacidade', function () {
    return Inertia::render('Site/policies');
})->name('privacy');

Route::get('/sitemap.xml', [\App\Http\Controllers\Site\SitemapController::class, 'index']);
