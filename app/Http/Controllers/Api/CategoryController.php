<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index()
    {
        $categories = Category::where('active', true)
            ->with(['subcategories' => function ($query) {
                $query->where('active', true)
                    ->whereHas('products', function ($q) {
                        $q->where('active', true)->whereHas('ecommerce_inventory');
                    })
                    ->orderBy('order');
            }])
            ->whereNull('parent_id')

            ->whereHas('products', function ($q) {
                $q->where('active', true)->whereHas('ecommerce_inventory');
            })
            ->orderBy('order')
            ->get()->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'subcategories' => $category->subcategories->map(function ($sub) {
                        return [
                            'id' => $sub->id,
                            'name' => $sub->name,
                            'slug' => $sub->slug,
                            'description' => $sub->description,
                        ];
                    }),
                ];
            });

        return response()->json($categories);
    }

    /**
     * Display the specified category.
     */
    public function show($id)
    {
        $category = Category::where('active', true)
            ->with(['parent', 'children', 'products' => function ($query) {
                $query->where('active', true)->with(['brand', 'images']);
            }])
            ->findOrFail($id);

        return response()->json($category);
    }
}
