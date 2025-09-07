<?php

namespace App\Console\Commands;

use App\Helpers\SearchSynonyms;
use Illuminate\Console\Command;

class ManageSynonyms extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'synonyms:manage 
                           {action : Action to perform (list, add, remove, test)}
                           {--term= : Main term}
                           {--synonyms= : Synonyms (comma-separated)}
                           {--search= : Test search term}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage search synonyms for products';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');

        switch ($action) {
            case 'list':
                $this->listSynonyms();
                break;
            case 'add':
                $this->addSynonyms();
                break;
            case 'remove':
                $this->removeSynonyms();
                break;
            case 'test':
                $this->testSearch();
                break;
            default:
                $this->error('Invalid action. Use: list, add, remove, or test');
                return 1;
        }

        return 0;
    }

    /**
     * List all configured synonyms
     */
    private function listSynonyms(): void
    {
        $synonyms = SearchSynonyms::getAllSynonyms();

        if (empty($synonyms)) {
            $this->info('No synonyms configured.');
            return;
        }

        $this->info('Configured Synonyms:');
        $this->line('');

        foreach ($synonyms as $mainTerm => $synonymList) {
            $this->line("<fg=yellow>{$mainTerm}</fg=yellow>:");
            foreach ($synonymList as $synonym) {
                $this->line("  - {$synonym}");
            }
            $this->line('');
        }
    }

    /**
     * Add synonyms for a term
     */
    private function addSynonyms(): void
    {
        $term = $this->option('term');
        $synonymsOption = $this->option('synonyms');

        if (!$term) {
            $term = $this->ask('Enter the main term');
        }

        if (!$synonymsOption) {
            $synonymsOption = $this->ask('Enter synonyms (comma-separated)');
        }

        if (!$term || !$synonymsOption) {
            $this->error('Both term and synonyms are required.');
            return;
        }

        $synonyms = array_map('trim', explode(',', $synonymsOption));
        
        SearchSynonyms::addSynonyms($term, $synonyms);
        
        $this->info("Synonyms added for '{$term}':");
        foreach ($synonyms as $synonym) {
            $this->line("  - {$synonym}");
        }
        
        $this->warn('Note: This only adds to memory. To persist, update config/search_synonyms.php');
    }

    /**
     * Remove synonyms for a term
     */
    private function removeSynonyms(): void
    {
        $term = $this->option('term');
        $synonymsOption = $this->option('synonyms');

        if (!$term) {
            $term = $this->ask('Enter the term');
        }

        if (!$synonymsOption) {
            if ($this->confirm("Remove all synonyms for '{$term}'?")) {
                SearchSynonyms::removeSynonyms($term);
                $this->info("All synonyms removed for '{$term}'");
                return;
            } else {
                $synonymsOption = $this->ask('Enter specific synonyms to remove (comma-separated)');
            }
        }

        if ($synonymsOption) {
            $synonyms = array_map('trim', explode(',', $synonymsOption));
            SearchSynonyms::removeSynonyms($term, $synonyms);
            $this->info("Specific synonyms removed for '{$term}':");
            foreach ($synonyms as $synonym) {
                $this->line("  - {$synonym}");
            }
        }
        
        $this->warn('Note: This only removes from memory. To persist, update config/search_synonyms.php');
    }

    /**
     * Test synonym expansion
     */
    private function testSearch(): void
    {
        $searchTerm = $this->option('search');

        if (!$searchTerm) {
            $searchTerm = $this->ask('Enter search term to test');
        }

        if (!$searchTerm) {
            $this->error('Search term is required.');
            return;
        }

        $this->info("Testing synonym expansion for: '{$searchTerm}'");
        $this->line('');

        // Test single term expansion
        $expandedTerms = SearchSynonyms::expandTerm($searchTerm);
        $this->line('<fg=yellow>Single term expansion:</fg=yellow>');
        foreach ($expandedTerms as $term) {
            $indicator = $term === strtolower($searchTerm) ? ' (original)' : '';
            $this->line("  - {$term}{$indicator}");
        }
        $this->line('');

        // Test phrase expansion
        $expandedPhrase = SearchSynonyms::expandPhrase($searchTerm);
        $this->line('<fg=yellow>Phrase expansion:</fg=yellow>');
        $this->line("  {$expandedPhrase}");
        $this->line('');

        // Test boolean query creation
        $booleanQuery = SearchSynonyms::createBooleanQuery($searchTerm);
        $this->line('<fg=yellow>Boolean query for MySQL:</fg=yellow>');
        $this->line("  {$booleanQuery}");
    }
}
