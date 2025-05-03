<?php

use App\Http\Controllers\Api\SettingsController;
use Illuminate\Http\Request;
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
Route::get('/settings/default-currency', [SettingsController::class, 'getDefaultCurrency']);

// Grupo de rotas com autenticação
Route::middleware('auth:sanctum')->group(function() {
    // Futuras rotas autenticadas aqui
});
