<?php

namespace App\Helpers;

class SearchSynonyms
{
    /**
     * Dicionário de sinônimos
     * Cada chave representa o termo principal e o valor é um array de sinônimos
     */
    private static ?array $synonyms = null;

    /**
     * Inicializa os sinônimos carregando do arquivo de configuração
     */
    private static function initializeSynonyms(): void
    {
        if (self::$synonyms === null) {
            $configPath = config_path('search_synonyms.php');
            if (file_exists($configPath)) {
                self::$synonyms = include $configPath;
            } else {
                self::$synonyms = [];
            }
        }
    }

    /**
     * Expande um termo de busca incluindo seus sinônimos
     * 
     * @param string $searchTerm
     * @return array Array com o termo original e todos os sinônimos
     */
    public static function expandTerm(string $searchTerm): array
    {
        self::initializeSynonyms();
        
        $searchTerm = strtolower(trim($searchTerm));
        $expandedTerms = [$searchTerm];

        // Procurar sinônimos diretos
        if (isset(self::$synonyms[$searchTerm])) {
            $expandedTerms = array_merge($expandedTerms, self::$synonyms[$searchTerm]);
        }

        // Procurar se o termo é sinônimo de alguma palavra principal
        foreach (self::$synonyms as $mainTerm => $synonyms) {
            if (in_array($searchTerm, $synonyms)) {
                $expandedTerms[] = $mainTerm;
                $expandedTerms = array_merge($expandedTerms, $synonyms);
                break;
            }
        }

        return array_unique($expandedTerms);
    }

    /**
     * Expande uma frase de busca incluindo sinônimos para cada palavra
     * 
     * @param string $searchPhrase
     * @return string String com todos os termos expandidos separados por espaço
     */
    public static function expandPhrase(string $searchPhrase): string
    {
        $words = explode(' ', trim($searchPhrase));
        $expandedTerms = [];

        foreach ($words as $word) {
            $word = trim($word);
            if (!empty($word)) {
                $expandedTerms = array_merge($expandedTerms, self::expandTerm($word));
            }
        }

        return implode(' ', array_unique($expandedTerms));
    }

    /**
     * Cria uma query BOOLEAN MODE para MySQL com sinônimos
     * 
     * @param string $searchTerm
     * @return string Query formatada para BOOLEAN MODE
     */
    public static function createBooleanQuery(string $searchTerm): string
    {
        $words = explode(' ', trim($searchTerm));
        $booleanTerms = [];

        foreach ($words as $word) {
            $word = trim($word);
            if (!empty($word)) {
                $synonyms = self::expandTerm($word);
                // Criar um grupo OR com todos os sinônimos
                $synonymGroup = '(' . implode(' ', array_map(fn($term) => "+{$term}*", $synonyms)) . ')';
                $booleanTerms[] = $synonymGroup;
            }
        }

        return implode(' ', $booleanTerms);
    }

    /**
     * Adiciona sinônimos dinamicamente
     * 
     * @param string $mainTerm
     * @param array $synonyms
     */
    public static function addSynonyms(string $mainTerm, array $synonyms): void
    {
        self::initializeSynonyms();
        
        $mainTerm = strtolower(trim($mainTerm));
        
        if (!isset(self::$synonyms[$mainTerm])) {
            self::$synonyms[$mainTerm] = [];
        }
        
        self::$synonyms[$mainTerm] = array_unique(
            array_merge(self::$synonyms[$mainTerm], array_map('strtolower', $synonyms))
        );
    }

    /**
     * Remove sinônimos
     * 
     * @param string $mainTerm
     * @param array|null $synonymsToRemove Se null, remove todos os sinônimos do termo
     */
    public static function removeSynonyms(string $mainTerm, ?array $synonymsToRemove = null): void
    {
        self::initializeSynonyms();
        
        $mainTerm = strtolower(trim($mainTerm));
        
        if (!isset(self::$synonyms[$mainTerm])) {
            return;
        }

        if ($synonymsToRemove === null) {
            unset(self::$synonyms[$mainTerm]);
        } else {
            $synonymsToRemove = array_map('strtolower', $synonymsToRemove);
            self::$synonyms[$mainTerm] = array_diff(self::$synonyms[$mainTerm], $synonymsToRemove);
            
            if (empty(self::$synonyms[$mainTerm])) {
                unset(self::$synonyms[$mainTerm]);
            }
        }
    }

    /**
     * Obtém todos os sinônimos configurados
     * 
     * @return array
     */
    public static function getAllSynonyms(): array
    {
        self::initializeSynonyms();
        return self::$synonyms;
    }

    /**
     * Carrega sinônimos de um arquivo de configuração
     * 
     * @param string $filePath
     */
    public static function loadFromFile(string $filePath): void
    {
        if (file_exists($filePath)) {
            $synonymsData = include $filePath;
            if (is_array($synonymsData)) {
                self::initializeSynonyms();
                self::$synonyms = array_merge(self::$synonyms, $synonymsData);
            }
        }
    }
}
