<?php

use App\Http\Controllers\Api\Admin\QuotationController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('quotations', QuotationController::class);
    Route::post('quotations/{quotation}/update-status', [QuotationController::class, 'updateStatus']);
    Route::get('quotations/{quotation}/generate-pdf', [QuotationController::class, 'generatePdf']);
    Route::post('quotations/{quotation}/send-email', [QuotationController::class, 'sendEmail']);
    Route::post('quotations/{quotation}/duplicate', [QuotationController::class, 'duplicate']);
    Route::post('quotations/{quotation}/convert-to-sale', [QuotationController::class, 'convertToSale']);
    Route::get('quotations/get-product-inventory', [QuotationController::class, 'getProductInventory']);
});
