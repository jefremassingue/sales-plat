<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Helpers\SearchSynonyms;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class SynonymController extends Controller
{
    /**
     * Display a listing of synonyms
     */
    public function index()
    {
        $synonyms = SearchSynonyms::getAllSynonyms();
        
        // Convert to a format better for the frontend
        $formattedSynonyms = [];
        foreach ($synonyms as $mainTerm => $synonymList) {
            $formattedSynonyms[] = [
                'id' => $mainTerm,
                'main_term' => $mainTerm,
                'synonyms' => $synonymList,
                'synonyms_text' => implode(', ', $synonymList),
                'count' => count($synonymList)
            ];
        }

        return Inertia::render('Admin/Synonyms/Index', [
            'synonyms' => $formattedSynonyms
        ]);
    }

    /**
     * Store a new synonym configuration
     */
    public function store(Request $request)
    {
        $request->validate([
            'main_term' => 'required|string|max:255',
            'synonyms' => 'required|string'
        ]);

        $mainTerm = strtolower(trim($request->main_term));
        $synonyms = array_map('trim', explode(',', $request->synonyms));
        $synonyms = array_filter($synonyms); // Remove empty values

        try {
            $this->updateConfigFile($mainTerm, $synonyms, 'add');
            
            return redirect()->back()->with('success', 'Sinônimos adicionados com sucesso!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao adicionar sinônimos: ' . $e->getMessage());
        }
    }

    /**
     * Update synonym configuration
     */
    public function update(Request $request, string $mainTerm)
    {
        $request->validate([
            'synonyms' => 'required|string'
        ]);

        $synonyms = array_map('trim', explode(',', $request->synonyms));
        $synonyms = array_filter($synonyms);

        try {
            $this->updateConfigFile($mainTerm, $synonyms, 'update');
            
            return redirect()->back()->with('success', 'Sinônimos atualizados com sucesso!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao atualizar sinônimos: ' . $e->getMessage());
        }
    }

    /**
     * Remove synonym configuration
     */
    public function destroy(string $mainTerm)
    {
        try {
            $this->updateConfigFile($mainTerm, [], 'remove');
            
            return redirect()->back()->with('success', 'Sinônimos removidos com sucesso!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao remover sinônimos: ' . $e->getMessage());
        }
    }

    /**
     * Test synonym expansion
     */
    public function test(Request $request)
    {
        $request->validate([
            'search_term' => 'required|string|max:255'
        ]);

        $searchTerm = $request->search_term;
        
        $result = [
            'original_term' => $searchTerm,
            'expanded_terms' => SearchSynonyms::expandTerm($searchTerm),
            'expanded_phrase' => SearchSynonyms::expandPhrase($searchTerm),
            'boolean_query' => SearchSynonyms::createBooleanQuery($searchTerm)
        ];

        return response()->json($result);
    }

    /**
     * Update the configuration file
     */
    private function updateConfigFile(string $mainTerm, array $synonyms, string $action): void
    {
        $configPath = config_path('search_synonyms.php');
        
        if (!File::exists($configPath)) {
            // Create file if it doesn't exist
            File::put($configPath, "<?php\n\nreturn [];\n");
        }

        $currentConfig = include $configPath;
        
        switch ($action) {
            case 'add':
            case 'update':
                $currentConfig[$mainTerm] = $synonyms;
                break;
            case 'remove':
                unset($currentConfig[$mainTerm]);
                break;
        }

        // Format the array for writing
        $content = "<?php\n\n/**\n * Configuração de sinônimos para busca de produtos\n * \n * Retorna um array onde cada chave é o termo principal\n * e o valor é um array de sinônimos para esse termo\n */\n\nreturn " . var_export($currentConfig, true) . ";\n";

        File::put($configPath, $content);
    }

    /**
     * Export synonyms configuration
     */
    public function export()
    {
        $synonyms = SearchSynonyms::getAllSynonyms();
        
        $filename = 'synonyms_export_' . date('Y-m-d_H-i-s') . '.json';
        
        return response()->json($synonyms)
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Import synonyms configuration
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:json'
        ]);

        try {
            $content = File::get($request->file('file')->path());
            $importedSynonyms = json_decode($content, true);

            if (!is_array($importedSynonyms)) {
                throw new \Exception('Formato de arquivo inválido');
            }

            // Merge with existing synonyms
            $currentSynonyms = SearchSynonyms::getAllSynonyms();
            $mergedSynonyms = array_merge($currentSynonyms, $importedSynonyms);

            // Update config file
            $configPath = config_path('search_synonyms.php');
            $content = "<?php\n\n/**\n * Configuração de sinônimos para busca de produtos\n * \n * Retorna um array onde cada chave é o termo principal\n * e o valor é um array de sinônimos para esse termo\n */\n\nreturn " . var_export($mergedSynonyms, true) . ";\n";

            File::put($configPath, $content);

            return redirect()->back()->with('success', 'Sinônimos importados com sucesso!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao importar sinônimos: ' . $e->getMessage());
        }
    }
}
