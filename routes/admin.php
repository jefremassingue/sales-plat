<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\CurrencyController;
use App\Http\Controllers\Admin\InventoryAdjustmentController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\PaymentMethodController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\QuotationController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SaleController;
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

    // APIs para PDV e gestão de vendas/cotações
    Route::get('api/product-inventory', [QuotationController::class, 'getProductInventory'])->name('api.product-inventory');
    Route::get('api/inventory-status', [SaleController::class, 'getInventoryStatus'])->name('api.inventory-status');

    // Rotas para ajustes de inventário
    Route::get('inventories/{inventory}/adjustments', [InventoryAdjustmentController::class, 'index'])->name('inventories.adjustments.index');
    Route::get('inventories/{inventory}/adjustments/create', [InventoryAdjustmentController::class, 'create'])->name('inventories.adjustments.create');
    Route::post('inventories/{inventory}/adjustments', [InventoryAdjustmentController::class, 'store'])->name('inventories.adjustments.store');
    Route::get('inventories/{inventory}/adjustments/{adjustment}', [InventoryAdjustmentController::class, 'show'])->name('inventories.adjustments.show');
    Route::get('inventories/{inventory}/adjustments/{adjustment}/edit', [InventoryAdjustmentController::class, 'edit'])->name('inventories.adjustments.edit');
    Route::put('inventories/{inventory}/adjustments/{adjustment}', [InventoryAdjustmentController::class, 'update'])->name('inventories.adjustments.update');
    Route::delete('inventories/{inventory}/adjustments/{adjustment}', [InventoryAdjustmentController::class, 'destroy'])->name('inventories.adjustments.destroy');

    // Rotas para cotações
    Route::resource('quotations', QuotationController::class);
    Route::post('quotations/{quotation}/status', [QuotationController::class, 'updateStatus'])->name('quotations.status');
    Route::get('quotations/{quotation}/pdf', [QuotationController::class, 'generatePdf'])->name('quotations.pdf');
    Route::get('api/product-inventory', [QuotationController::class, 'getProductInventory'])->name('api.product.inventory');
    Route::post('quotations/{quotation}/send-email', [QuotationController::class, 'sendEmail'])->name('quotations.send-email');
    Route::post('quotations/{quotation}/duplicate', [QuotationController::class, 'duplicate'])->name('quotations.duplicate');
    Route::post('quotations/{quotation}/convert-to-sale', [SaleController::class, 'convertFromQuotation'])->name('quotations.convert-to-sale');

    // Rotas para vendas
    Route::resource('sales', SaleController::class);
    Route::post('sales/{sale}/status', [SaleController::class, 'updateStatus'])->name('sales.status');
    Route::post('sales/{sale}/payment', [SaleController::class, 'registerPayment'])->name('sales.payment');
    Route::get('sales/{sale}/pdf', [SaleController::class, 'generatePdf'])->name('sales.pdf');
    Route::post('sales/{sale}/send-email', [SaleController::class, 'sendEmail'])->name('sales.send-email');
    Route::post('sales/{sale}/duplicate', [SaleController::class, 'duplicate'])->name('sales.duplicate');

    // Rotas para métodos de pagamento
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::resource('payment-methods', PaymentMethodController::class);
        Route::post('payment-methods/{paymentMethod}/status', [PaymentMethodController::class, 'updateStatus'])
             ->name('payment-methods.status');
        Route::post('payment-methods/{paymentMethod}/set-default', [PaymentMethodController::class, 'setDefault'])
             ->name('payment-methods.set-default');
    });

    // Rotas para gestão de clientes
    Route::resource('customers', CustomerController::class);

    // Rotas para gestão de fornecedores
    Route::resource('suppliers', SupplierController::class);

    // Rotas para gestão de armazéns
    Route::resource('warehouses', WarehouseController::class);

    // Rotas para gestão de moedas
    Route::resource('currencies', CurrencyController::class);
    Route::post('currencies/{currency}/set-default', [CurrencyController::class, 'setDefault'])
        ->name('currencies.set-default');

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
