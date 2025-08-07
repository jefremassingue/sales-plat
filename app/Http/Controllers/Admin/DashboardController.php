<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Quotation;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $products = Product::latest()->take(5)->get();
        $quotations = Quotation::latest()->take(5)->get();

        return Inertia::render('dashboard', [
            'products' => $products,
            'quotations' => $quotations,
        ]);
    }
}
