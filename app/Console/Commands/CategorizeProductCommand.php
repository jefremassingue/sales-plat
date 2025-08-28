<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\ProductCategorizationService;
use Illuminate\Console\Command;
use Exception;

class CategorizeProductCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'products:categorize {product_id? : The ID of the product to categorize}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Categorizes a specific product or all uncategorized products using an AI service.';

    /**
     * The ProductCategorizationService instance.
     *
     * @var ProductCategorizationService
     */
    protected $categorizationService;

    /**
     * Create a new command instance.
     *
     * @param ProductCategorizationService $categorizationService
     */
    public function __construct(ProductCategorizationService $categorizationService)
    {
        parent::__construct();
        $this->categorizationService = $categorizationService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $productId = $this->argument('product_id');

        if ($productId) {
            $product = Product::find($productId);
            if (!$product) {
                $this->error("Product with ID {$productId} not found.");
                return 1;
            }
            $products = collect([$product]);
        } else {
            $this->info('Fetching all uncategorized products...');
            $products = Product::whereNull('category_id')->get();
        }

        if ($products->isEmpty()) {
            $this->info('No products to categorize.');
            return 0;
        }

        $this->info("Found {$products->count()} product(s) to categorize.");

        $progressBar = $this->output->createProgressBar($products->count());
        $progressBar->start();

        foreach ($products as $product) {
            $this->line("\n<info>Processing Product #{$product->id}:</info> {$product->name}");

            try {
                $this->categorizationService->categorize($product);
                $this->line("<fg=green>  \xE2\x9C\x94 Success:</> Product categorized as '{$product->category->name}' with brand '{$product->brand->name}'.");
            } catch (Exception $e) {
                $this->line("<fg=red>  \xE2\x9C\x97 Error:</> Failed to categorize product #{$product->id}. Reason: {$e->getMessage()}");
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->info("\n\nCategorization process completed.");

        return 0;
    }
}