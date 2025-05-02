<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ClientController;
use App\Http\Controllers\Admin\ProductController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('categories/tree', [CategoryController::class, 'tree'])->name('categories.tree');
    Route::resource('categories', CategoryController::class);

    Route::resource('products', ProductController::class);

    // Rotas para gestão de clientes
    Route::resource('clients', ClientController::class);
});
