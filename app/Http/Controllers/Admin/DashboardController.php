<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Quotation;
use App\Models\Sale;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {

        if (auth()->user()->can('admin-dashboard.__invoke')) {
            $stats = [
                'products' => Product::count(),
                'quotations' => Quotation::count(),
                'sales' => Sale::count(),
                'customers' => Customer::count(),
                'suppliers' => Supplier::count(),
                'warehouses' => Warehouse::count(),
                'users' => User::count(),
                'posts' => Blog::count(),
                'categories' => Category::count(),
            ];

            $recentProducts = Product::latest()->take(5)->get();
            $recentQuotations = Quotation::latest()->take(5)->get();
            $recentSales = Sale::with('customer')->latest()->take(5)->get();

            return Inertia::render('dashboard', [
                'stats' => $stats,
                'recentProducts' => $recentProducts,
                'recentQuotations' => $recentQuotations,
                'recentSales' => $recentSales,
            ]);
        } else {
            // If user does not have permission, redirect to profile or home
            return redirect()->route('profile');
            // Or you can redirect to home
            // return redirect()->route('home')->with('error', 'You do not have permission to access the dashboard.');

        }
    }
}
