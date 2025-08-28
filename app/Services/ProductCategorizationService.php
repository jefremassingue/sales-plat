<?php

namespace App\Services;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Prism\Prism;
use Exception;

class ProductCategorizationService
{
    /**
     * Categorize a product using AI.
     *
     * @param Product $product The product to categorize.
     * @return Product The product with updated category and brand.
     * @throws Exception
     */
    public function categorize(Product $product): Product
    {
        // 1. Fetch existing categories and brands
        $categoryNames = Category::query()->pluck('name')->implode(', ');
        $brandNames = Brand::query()->pluck('name')->implode(', ');

        // 2. Construct the prompt for the AI
        $prompt = $this->buildPrompt($product, $categoryNames, $brandNames);

        try {
            // 3. Call the OpenAI API using Prism
            $response = Prism::chat()->model('gpt-4o')
                ->temperature(0)
                ->json()
                ->prompt($prompt)
                ->run();

            $result = $response->json();

            // 4. Process the AI response
            if (isset($result['category']) && isset($result['brand'])) {
                // Find the category by name.
                $category = Category::where('name', 'like', '%' . $result['category'] . '%')->first();

                if (!$category) {
                    Log::warning("AI suggested category '{$result['category']}' not found for product #{$product->id}.");
                    // Optional: throw an exception or handle as needed
                    // throw new Exception("AI suggested category not found: " . $result['category']);
                }

                // Find or create the brand.
                $brand = Brand::firstOrCreate(
                    ['name' => $result['brand']],
                    ['slug' => str_slug($result['brand'])]
                );

                // 5. Update the product
                $product->category_id = $category ? $category->id : $product->category_id;
                $product->brand_id = $brand->id;
                $product->save();

                Log::info("Product #{$product->id} categorized successfully. Category: {$category?->name}, Brand: {$brand->name}");

            } else {
                Log::error('AI response did not contain expected category and brand keys.', ['response' => $result]);
                throw new Exception('Invalid AI response format.');
            }

        } catch (Exception $e) {
            Log::error('Failed to categorize product with AI.', [
                'product_id' => $product->id,
                'error' => $e->getMessage(),
            ]);

            // Re-throw the exception to be handled by the caller
            throw $e;
        }

        return $product;
    }

    /**
     * Build the prompt for the AI.
     *
     * @param Product $product
     * @param string $categoryNames
     * @param string $brandNames
     * @return string
     */
    private function buildPrompt(Product $product, string $categoryNames, string $brandNames): string
    {
        return <<<PROMPT
You are an expert product catalog manager for an e-commerce store.
Your task is to determine the correct category and brand for a given product based on its name and description.

**Instructions:**
1.  Analyze the product name and description provided below.
2.  From the list of available categories, choose the **single most appropriate** category name.
3.  Determine the brand name of the product. If the brand is mentioned, use that name. If not, infer it from the product details. If no brand can be determined, use "Generic".
4.  You **MUST** return the result in a valid JSON format, with two keys: "category" and "brand".

**Available Categories:**
{$categoryNames}

**Available Brands:**
{$brandNames}

**Product Details:**
- **Name:** {$product->name}
- **Description:** {$product->description}

**Output Example:**
{
  "category": "Electronics",
  "brand": "Sony"
}

**Your Response:**
PROMPT;
    }
}
