<?php

use App\Http\Controllers\SearchController;
use App\Http\Controllers\Site\BlogController;
use App\Http\Controllers\Site\HomeController;
use App\Http\Controllers\Site\ProductController;
use App\Http\Controllers\Site\ContactController;
use App\Http\Controllers\Site\ProfileController;
use App\Http\Controllers\Site\CustomerVerificationController;
use App\Http\Controllers\Site\QuotationController as SiteQuotationController;
use Illuminate\Support\Facades\Route;


Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/search', [SearchController::class, 'index'])->name('search');

Route::resource('blog', BlogController::class)->only(['index', 'show']);
Route::resource('products', ProductController::class)->only(['index', 'show']);

// Rotas para a página de contato
Route::get('/contact', [ContactController::class, 'index'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

Route::get('/about', [HomeController::class, 'about'])->name('about');
// Route::inertia('')


Route::inertia('/cart', 'Site/Cart/Index')->name('cart');
Route::post('/quotation', [SiteQuotationController::class, 'store'])->name('quotation.store');
Route::inertia('/quotation', 'Site/Checkout/Index')->name('quotation');

// Rotas do perfil do customer (protegidas por autenticação)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    
    // Extratos
    Route::get('/profile/sales-statement', [ProfileController::class, 'salesStatement'])->name('profile.sales.statement');
    Route::get('/profile/quotations-statement', [ProfileController::class, 'quotationsStatement'])->name('profile.quotations.statement');
    Route::get('/profile/export/sales', [ProfileController::class, 'exportSalesStatement'])->name('profile.export.sales');
    Route::get('/profile/export/quotations', [ProfileController::class, 'exportQuotationsStatement'])->name('profile.export.quotations');
});

// Customer verification
Route::get('/customer/verification', [CustomerVerificationController::class, 'index'])->name('customer.verification');
Route::post('/customer/verification/merge', [CustomerVerificationController::class, 'merge'])->name('customer.verification.merge');
Route::post('/customer/verification/create-new', [CustomerVerificationController::class, 'createNew'])->name('customer.verification.create-new');
