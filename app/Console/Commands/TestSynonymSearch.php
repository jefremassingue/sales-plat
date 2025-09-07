<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Helpers\SearchSynonyms;
use Illuminate\Console\Command;

class TestSynonymSearch extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:synonyms {search_term}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test synonym search functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $searchTerm = $this->argument('search_term');

        $this->info("Testing search for: '{$searchTerm}'");
        $this->line('');

        // Test 1: Synonym expansion
        $this->line('<fg=yellow>1. Synonym Expansion:</fg=yellow>');
        $expandedTerms = SearchSynonyms::expandTerm($searchTerm);
        foreach ($expandedTerms as $term) {
            $indicator = $term === strtolower($searchTerm) ? ' (original)' : '';
            $this->line("   - {$term}{$indicator}");
        }
        $this->line('');

        // Test 2: Phrase expansion
        $this->line('<fg=yellow>2. Phrase Expansion:</fg=yellow>');
        $expandedPhrase = SearchSynonyms::expandPhrase($searchTerm);
        $this->line("   {$expandedPhrase}");
        $this->line('');

        // Test 3: Boolean query
        $this->line('<fg=yellow>3. Boolean Query for MySQL:</fg=yellow>');
        $booleanQuery = SearchSynonyms::createBooleanQuery($searchTerm);
        $this->line("   {$booleanQuery}");
        $this->line('');

        // Test 4: Actual search without synonyms
        $this->line('<fg=yellow>4. Search WITHOUT synonyms:</fg=yellow>');
        $productsWithoutSynonyms = Product::smartSearch($searchTerm, true, false)->limit(5)->get();
        if ($productsWithoutSynonyms->count() > 0) {
            foreach ($productsWithoutSynonyms as $product) {
                $this->line("   - {$product->name} (SKU: {$product->sku})");
            }
        } else {
            $this->line('   No products found');
        }
        $this->line('');

        // Test 5: Actual search with synonyms
        $this->line('<fg=yellow>5. Search WITH synonyms:</fg=yellow>');
        $productsWithSynonyms = Product::smartSearch($searchTerm, true, true)->limit(5)->get();
        if ($productsWithSynonyms->count() > 0) {
            foreach ($productsWithSynonyms as $product) {
                $this->line("   - {$product->name} (SKU: {$product->sku})");
            }
        } else {
            $this->line('   No products found');
        }
        $this->line('');

        // Test 6: Count comparison
        $countWithout = Product::smartSearch($searchTerm, true, false)->count();
        $countWith = Product::smartSearch($searchTerm, true, true)->count();
        
        $this->line('<fg=yellow>6. Results Comparison:</fg=yellow>');
        $this->line("   Without synonyms: {$countWithout} products");
        $this->line("   With synonyms: {$countWith} products");
        $improvement = $countWith - $countWithout;
        if ($improvement > 0) {
            $this->line("   <fg=green>Improvement: +{$improvement} products found</fg=green>");
        } elseif ($improvement < 0) {
            $this->line("   <fg=red>Reduction: {$improvement} products found</fg=red>");
        } else {
            $this->line("   <fg=yellow>No difference in results</fg=yellow>");
        }
    }
}
