<?php

use App\Http\Controllers\SearchController;
use App\Http\Controllers\Site\BlogController;
use App\Http\Controllers\Site\HomeController;
use App\Http\Controllers\Site\ProductController;
use App\Http\Controllers\Site\ContactController;
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
Route::inertia('/quotation', 'Site/Checkout/Index')->name('quotation');
