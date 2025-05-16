<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * Validate cart items and calculate totals
     */
    public function validate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $items = $request->items;
        $validatedItems = [];
        $total = 0;
        $itemCount = 0;

        foreach ($items as $item) {
            $product = Product::find($item['id']);

            if (!$product || !$product->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'One or more products are no longer available',
                    'unavailable_product' => $item['id']
                ], 422);
            }

            // Check if product is in stock
            if ($product->track_inventory && $product->stock < $item['quantity']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product out of stock or insufficient quantity',
                    'product_id' => $product->id,
                    'available_stock' => $product->stock
                ], 422);
            }

            // Get current price (handle discounts)
            $price = $product->discount_percentage
                ? $product->price * (1 - $product->discount_percentage / 100)
                : $product->price;

            $validatedItems[] = [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'price' => $price,
                'quantity' => $item['quantity'],
                'image' => $product->image,
                'color_id' => $item['color_id'] ?? null,
                'size_id' => $item['size_id'] ?? null,
            ];

            $total += $price * $item['quantity'];
            $itemCount += $item['quantity'];
        }

        return response()->json([
            'success' => true,
            'items' => $validatedItems,
            'total' => $total,
            'itemCount' => $itemCount
        ]);
    }
}
