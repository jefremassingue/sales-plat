<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;

class TestFullTextSearch extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:fulltext-search {search : The search term}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test full-text search functionality for products';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $searchTerm = $this->argument('search');
        
        $this->info("Testing full-text search for: '{$searchTerm}'");
        $this->line('');
        
        // Teste da busca full-text
        $this->line('--- Full-Text Search Results ---');
        $fullTextResults = Product::fullTextSearch($searchTerm)
            ->where('active', true)
            ->limit(5)
            ->get(['id', 'name', 'sku', 'description']);
        
        if ($fullTextResults->count() > 0) {
            $this->table(
                ['ID', 'Name', 'SKU', 'Description (preview)'],
                $fullTextResults->map(function ($product) {
                    return [
                        $product->id,
                        $product->name,
                        $product->sku ?? 'N/A',
                        str($product->description ?? '')->limit(50)
                    ];
                })->toArray()
            );
        } else {
            $this->warn('No results found with full-text search.');
        }
        
        $this->line('');
        
        // Teste da busca tradicional LIKE para comparação
        $this->line('--- Traditional LIKE Search Results ---');
        $likeResults = Product::where('active', true)
            ->where(function ($query) use ($searchTerm) {
                $query->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%")
                    ->orWhere('sku', 'like', "%{$searchTerm}%");
            })
            ->limit(5)
            ->get(['id', 'name', 'sku', 'description']);
        
        if ($likeResults->count() > 0) {
            $this->table(
                ['ID', 'Name', 'SKU', 'Description (preview)'],
                $likeResults->map(function ($product) {
                    return [
                        $product->id,
                        $product->name,
                        $product->sku ?? 'N/A',
                        str($product->description ?? '')->limit(50)
                    ];
                })->toArray()
            );
        } else {
            $this->warn('No results found with LIKE search.');
        }
        
        $this->line('');
        $this->info('Full-text search test completed!');
        
        return 0;
    }
}
