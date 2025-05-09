<?php

    use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Pos\PosSaleController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\SearchController;


Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Rotas POS (fora do admin)
Route::prefix('pos')->name('pos.')->middleware(['auth'])->group(function () {
    Route::get('/', [\App\Http\Controllers\Pos\PosSaleController::class, 'index'])->name('index');
    Route::post('/sales', [\App\Http\Controllers\Pos\PosSaleController::class, 'store'])->name('sales.store');
    Route::get('/product-inventory', [\App\Http\Controllers\Pos\PosSaleController::class, 'getProductInventory'])->name('product-inventory');
    Route::get('/sales/{id}/print', [PosSaleController::class, 'printSale'])->name('sales.print');
});


require __DIR__.'/site.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
