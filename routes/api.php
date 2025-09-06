<?php

use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\BlogController;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rotas públicas
Route::post('/cart/validate', [CartController::class, 'validate']);

// Product creation endpoints
Route::post('/products/file', [ProductController::class, 'storeWithFile']);
Route::post('/products/url', [ProductController::class, 'storeWithUrl']);

// Blog endpoints
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{id}', [BlogController::class, 'show']);
Route::post('/blogs/file', [BlogController::class, 'storeWithFile']);
Route::post('/blogs/url', [BlogController::class, 'storeWithUrl']);
Route::post('/blogs/{id}', [BlogController::class, 'update']);
Route::delete('/blogs/{id}', [BlogController::class, 'destroy']);

require __DIR__.'/api/admin.php';
