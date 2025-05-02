<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserRoleController;
use App\Http\Controllers\Admin\WarehouseController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('categories/tree', [CategoryController::class, 'tree'])->name('categories.tree');
    Route::resource('categories', CategoryController::class);

    Route::resource('products', ProductController::class);

    // Rotas para gestão de clientes
    Route::resource('customers', CustomerController::class);

    // Rotas para gestão de armazéns
    Route::resource('warehouses', WarehouseController::class);

    // Rotas para API de utilizadores (para o formulário de cliente)
    Route::prefix('api')->group(function () {
        Route::get('users/search', [UserController::class, 'search'])->name('api.users.search');
        Route::get('users/{id}', [UserController::class, 'getUser'])->name('api.users.get');
    });

    // Rotas para gestão de funções e permissões (Spatie)
    Route::group(['middleware' => ['auth']], function () {
        // Funções (Roles)
        Route::resource('roles', RoleController::class);

        // Permissões
        Route::resource('permissions', PermissionController::class);
        Route::post('permissions/generate', [PermissionController::class, 'generatePermissions'])->name('permissions.generate');

        // Gerir funções de utilizadores
        Route::resource('user-roles', UserRoleController::class)->only(['index', 'edit', 'update', 'show']);

        // Utilizadores com funções
        Route::resource('users', UserController::class);
    });
});
