<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Image;
use App\Models\ProductColor;
use App\Models\ProductSize;
use App\Models\ProductAttribute;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use GuzzleHttp\Client;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request)
    {
        $query = Product::where('active', true)
            ->with(['category', 'brand', 'mainImage.versions', 'variants']);

        // Optional search parameter
        if ($request->has('search')) {
            $query->smartSearch($request->input('search'));
        }

        // Optional category filter
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('paginate')) {
            $perPage = (int) $request->input('paginate', 20);
            $perPage = $perPage > 0 ? $perPage : 20;
            $products = $query->orderBy('created_at', 'desc')->paginate($perPage)
                ->getCollection()->transform(function ($product) {
                    $imageUrl = null;

                    if (!empty($product->mainImage)) {

                        $versions = $product->mainImage->versions ?? [];

                        foreach (['sm', 'md', 'lg'] as $size) {
                            foreach ($versions as $img) {
                                if (($img->version ?? null) === $size) {
                                    $imageUrl = $img->url ?? null;
                                    break 2; // sai dos dois loops
                                }
                            }
                        }

                        if (!$imageUrl && !empty($product->mainImage->url)) {
                            $imageUrl = $product->mainImage->url;
                        }
                    }
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'description' => $product->description,
                        'slug' => $product->slug,
                        'sku' => $product->sku,
                        'certification' => $product->certification,
                        'image' => $imageUrl,
                        'brand' => $product->brand ? [
                            'id' => $product->brand->id,
                            'name' => $product->brand->name,
                        ] : null,
                        'category' => $product->category ? [
                            'id' => $product->category->id,
                            'name' => $product->category->name,
                        ] : null,
                        'colors' => $product->colors->map(function ($color) {
                            return [
                                'id' => $color->id,
                                'name' => $color->name,
                            ];
                        }),
                    ];
                });
            // $products->appends($request->all());
            unset($products->links);
            return response()->json($products);
        }

        $products = $query->orderBy('created_at', 'desc')->get()->transform(function ($product) {
                    $imageUrl = null;

                    if (!empty($product->mainImage)) {

                        $versions = $product->mainImage->versions ?? [];

                        foreach (['sm', 'md', 'lg'] as $size) {
                            foreach ($versions as $img) {
                                if (($img->version ?? null) === $size) {
                                    $imageUrl = $img->url ?? null;
                                    break 2; // sai dos dois loops
                                }
                            }
                        }

                        if (!$imageUrl && !empty($product->mainImage->url)) {
                            $imageUrl = $product->mainImage->url;
                        }
                    }
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'description' => $product->description,
                        'slug' => $product->slug,
                        'sku' => $product->sku,
                        'certification' => $product->certification,
                        'image' => $imageUrl,
                        'brand' => $product->brand ? [
                            'id' => $product->brand->id,
                            'name' => $product->brand->name,
                        ] : null,
                        'category' => $product->category ? [
                            'id' => $product->category->id,
                            'name' => $product->category->name,
                        ] : null,
                        'colors' => $product->colors->map(function ($color) {
                            return [
                                'id' => $color->id,
                                'name' => $color->name,
                            ];
                        }),
                    ];
                });

        return response()->json($products);
    }

    /**
     * Display the specified product.
     */
    public function show($id)
    {
        $product = Product::where('active', true)
            ->with(['category', 'brand', 'images', 'colors', 'sizes', 'attributes', 'variants'])
            ->findOrFail($id);

        return response()->json($product);
    }

    public function storeWithFile(Request $request)
    {
        // Note: Handling complex nested data like variants from multipart/form-data is tricky.
        // The client would need to JSON-encode the arrays for sizes, variants, etc., and send them as text fields.
        return $this->createProduct($request, 'file');
    }

    public function storeWithUrl(Request $request)
    {
        return $this->createProduct($request, 'url');
    }

    private function createProduct(Request $request, $imageInputType = 'url')
    {
        // For file uploads, nested data might come in as JSON strings.
        $this->decodeJsonStrings($request, ['colors', 'sizes', 'attributes', 'variants', 'images']);

        $validationRules = $this->getValidationRules($imageInputType);
        $validator = Validator::make($request->all(), $validationRules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $product = $this->createProductModel($request);

            $colorIdMap = $this->processColors($request, $product);
            $sizeIdMap = $this->processSizes($request, $product);
            $this->processAttributes($request, $product);
            $this->processVariants($request, $product, $colorIdMap, $sizeIdMap);
            $this->processImages($request, $product, $imageInputType, $colorIdMap);
            $this->createInventoryForWarehouses($product);

            DB::commit();

            return response()->json($product->load(['images.colors', 'colors', 'sizes', 'attributes', 'variants']), 201);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error creating product via API: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return response()->json(['error' => 'An unexpected error occurred: ' . $e->getMessage()], 500);
        }
    }



    private function getValidationRules($imageInputType)
    {
        $rules = [
            'name'              => 'required|string|max:255',
            'description'       => 'nullable|string',
            'technical_details' => 'nullable|string',
            'features'          => 'nullable|string',
            'cost'              => 'nullable|numeric|min:0',
            'ref'               => 'nullable|string|max:100|unique:products,sku',
            'brand_id'          => 'nullable|exists:brands,id',
            'certification'     => 'nullable|string|max:255',

            'colors'            => 'nullable|array',
            'colors.*.name'     => 'required|string|max:100',

            'sizes'             => 'nullable|array',
            'sizes.*.name'      => 'required|string|max:255',

            'attributes'        => 'nullable|array',
            'attributes.*.name' => 'required|string|max:255',
            'attributes.*.value' => 'required|string',

            'variants'          => 'nullable|array',
            'variants.*.ref'    => 'nullable|string|max:100',
        ];

        if ($imageInputType === 'file') {
            $rules['description_pdf'] = 'nullable|file|mimes:pdf|max:10240';
            $rules['images'] = 'nullable|array'; // Can be files or JSON string
        } else { // url
            $rules['description_pdf_url'] = 'nullable|url';
            $rules['images'] = 'nullable|array';
            $rules['images.*.url'] = 'required|url';
            $rules['images.*.color_temp_id'] = 'nullable|string';
        }
        return $rules;
    }

    private function createProductModel(Request $request): Product
    {
        $data = $request->only([
            'name',
            'description',
            'technical_details',
            'features',
            'price',
            'cost',
            'sku',
            'category_id',
            'brand_id',
            'certification'
        ]);
        $data['category_id'] = Category::first()->id;
        $data['brand_id'] = $request->has('brand_name') ? (Brand::where('name', 'like', '%' . $request->input('brand_name') . '%')->first()?->id ?? Brand::create(['name' => $request->input('brand_name')])->id) : null;
        $data['price'] = 0;
        $data['sku'] = $request->input('ref');
        $product = Product::create($data);

        // Handle PDF
        $pdfPath = null;
        if ($request->hasFile('description_pdf')) {
            $pdfPath = $request->file('description_pdf')->store('products/pdfs', 'public');
        } elseif ($request->filled('description_pdf_url')) {
            try {
                $pdfUrl = $request->input('description_pdf_url');
                $pdfContents = file_get_contents($pdfUrl);
                $pdfName = basename(parse_url($pdfUrl, PHP_URL_PATH));
                $pdfPath = 'products/pdfs/' . $product->id . '-' . $pdfName;
                Storage::disk('public')->put($pdfPath, $pdfContents);
            } catch (\Exception $e) {
                Log::error("Failed to download PDF from URL: {$request->input('description_pdf_url')}", ['error' => $e->getMessage()]);
            }
        }
        if ($pdfPath) {
            $product->description_pdf = $pdfPath;
            $product->save();
        }
        return $product;
    }

    private function processColors(Request $request, Product $product): array
    {
        $idMap = [];
        if ($request->has('colors')) {
            foreach ($request->colors as $colorData) {
                $color = $product->colors()->create($colorData);
                if (isset($colorData['_tempId'])) {
                    $idMap[$colorData['_tempId']] = $color->id;
                }
            }
        }
        return $idMap;
    }

    private function processSizes(Request $request, Product $product): array
    {
        $idMap = [];
        if ($request->has('sizes')) {
            foreach ($request->sizes as $sizeData) {
                $size = $product->sizes()->create($sizeData);
                if (isset($sizeData['_tempId'])) {
                    $idMap[$sizeData['_tempId']] = $size->id;
                }
            }
        }
        return $idMap;
    }

    private function processAttributes(Request $request, Product $product)
    {
        if ($request->has('attributes')) {
            foreach ($request->attributes as $attrData) {
                $product->attributes()->create($attrData);
            }
        }
    }

    private function processVariants(Request $request, Product $product, array $colorIdMap, array $sizeIdMap)
    {
        if ($request->has('variants')) {
            foreach ($request->variants as $variantData) {
                $colorId = $colorIdMap[$variantData['color_temp_id'] ?? null] ?? null;
                $sizeId = $sizeIdMap[$variantData['size_temp_id'] ?? null] ?? null;

                $product->variants()->create([
                    'product_color_id' => $colorId,
                    'product_size_id' => $sizeId,
                    'sku' => $variantData['ref'] ?? null,
                    'price' => $variantData['price'] ?? null,
                    'stock' => $variantData['stock'] ?? 0,
                ]);
            }
        }
    }

    private function processImages(Request $request, Product $product, $imageInputType, array $colorIdMap)
    {
        if ($imageInputType === 'file' && $request->hasFile('images')) {
            // This part remains complex for file uploads with metadata.
            // Assumes metadata is passed as a separate JSON-encoded string `image_metadata`
            $imageMetadata = $request->input('image_metadata', []);
            foreach ($request->file('images') as $index => $imageFile) {
                $path = $imageFile->store('products', 'public');
                $image = $this->createImageRecord($product, $path, $imageFile->getClientOriginalName(), $imageFile->getSize(), $imageFile->extension(), $index === 0);

                $metadata = $imageMetadata[$index] ?? null;
                if ($metadata && !empty($metadata['color_temp_id'])) {
                    $this->associateImageWithColor($image, $metadata['color_temp_id'], $colorIdMap);
                }
            }
        } elseif ($imageInputType === 'url' && $request->has('images')) {
            $client = new Client();
            foreach ($request->images as $index => $imageInfo) {
                try {
                    $imageUrl = $imageInfo['url'];
                    $imageContent = $client->get($imageUrl)->getBody()->getContents();
                    $imageName = basename(parse_url($imageUrl, PHP_URL_PATH));
                    $path = 'products/' . $product->id . '-' . Str::random(8) . '-' . $imageName;
                    Storage::disk('public')->put($path, $imageContent);

                    $image = $this->createImageRecord($product, $path, $imageName, strlen($imageContent), pathinfo($imageName, PATHINFO_EXTENSION), $index === 0);

                    if (!empty($imageInfo['color_temp_id'])) {
                        $this->associateImageWithColor($image, $imageInfo['color_temp_id'], $colorIdMap);
                    }
                } catch (\Exception $e) {
                    Log::error("Failed to download image from URL: {$imageInfo['url']}", ['error' => $e->getMessage()]);
                }
            }
        }
    }

    private function createImageRecord(Product $product, $path, $originalName, $size, $extension, $isMain): Image
    {
        $image = new Image([
            'version' => 'original',
            'storage' => 'public',
            'path' => $path,
            'name' => basename($path),
            'original_name' => $originalName,
            'size' => $size,
            'extension' => $extension,
            'is_main' => $isMain
        ]);
        $product->images()->save($image);
        return $image;
    }

    private function associateImageWithColor(Image $image, string $colorTempId, array $colorIdMap)
    {
        $resolvedColorId = $colorIdMap[$colorTempId] ?? null;
        if ($resolvedColorId && ProductColor::where('id', $resolvedColorId)->exists()) {
            $image->colors()->syncWithoutDetaching([
                $resolvedColorId => ['id' => (string) Str::ulid()]
            ]);
        }
    }

    private function decodeJsonStrings(Request &$request, array $keys)
    {
        foreach ($keys as $key) {
            if ($request->has($key) && is_string($request->$key)) {
                $decoded = json_decode($request->$key, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $request->merge([$key => $decoded]);
                }
            }
        }
    }

    /**
     * Create inventory records for the product in all warehouses.
     * Assumes Warehouse and Inventory models exist and are related.
     * Inventory should have product_id, warehouse_id, stock (default 0).
     */
    private function createInventoryForWarehouses(Product $product)
    {
        // Fetch all warehouses
        $warehouses = \App\Models\Warehouse::all();
        foreach ($warehouses as $warehouse) {
            // Check if inventory already exists for this product/warehouse
            $exists = \App\Models\Inventory::where('product_id', $product->id)
                ->where('warehouse_id', $warehouse->id)
                ->exists();
            if (!$exists) {
                \App\Models\Inventory::create([
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouse->id,
                    'stock' => 0,
                ]);
            }
        }
    }
}
