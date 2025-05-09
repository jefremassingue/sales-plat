<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->input('q');
        
        if (!$query) {
            return redirect()->route('home');
        }

        $products = Product::where('name', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->where('is_active', true)
            ->with(['category', 'images'])
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Search/Index', [
            'query' => $query,
            'products' => $products,
        ]);
    }
} 