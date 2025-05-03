<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\InventoryAdjustmentController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserRoleController;
use App\Http\Controllers\Admin\WarehouseController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('categories/tree', [CategoryController::class, 'tree'])->name('categories.tree');
    Route::resource('categories', CategoryController::class);

    // Rotas para produtos
    Route::resource('products', ProductController::class);
    Route::get('products/{product}/inventory', [ProductController::class, 'manageInventory'])->name('products.inventory');
    Route::post('products/update-inventory', [ProductController::class, 'updateInventory'])->name('products.update-inventory');

    // Rotas para gestão de inventário
    Route::resource('inventories', InventoryController::class);
    Route::get('api/products/{product_id}/variants', [InventoryController::class, 'getVariants'])->name('api.products.variants');

    // Rotas para ajustes de inventário
    Route::get('inventories/{inventory}/adjustments', [InventoryAdjustmentController::class, 'index'])->name('inventories.adjustments.index');
    Route::get('inventories/{inventory}/adjustments/create', [InventoryAdjustmentController::class, 'create'])->name('inventories.adjustments.create');
    Route::post('inventories/{inventory}/adjustments', [InventoryAdjustmentController::class, 'store'])->name('inventories.adjustments.store');
    Route::get('inventories/{inventory}/adjustments/{adjustment}', [InventoryAdjustmentController::class, 'show'])->name('inventories.adjustments.show');
    Route::get('inventories/{inventory}/adjustments/{adjustment}/edit', [InventoryAdjustmentController::class, 'edit'])->name('inventories.adjustments.edit');
    Route::put('inventories/{inventory}/adjustments/{adjustment}', [InventoryAdjustmentController::class, 'update'])->name('inventories.adjustments.update');
    Route::delete('inventories/{inventory}/adjustments/{adjustment}', [InventoryAdjustmentController::class, 'destroy'])->name('inventories.adjustments.destroy');

    // Rotas para gestão de clientes
    Route::resource('customers', CustomerController::class);

    // Rotas para gestão de fornecedores
    Route::resource('suppliers', SupplierController::class);

    // Rotas para gestão de armazéns
    Route::resource('warehouses', WarehouseController::class);

    // Rotas para API de utilizadores (para o formulário de cliente e fornecedor)
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
