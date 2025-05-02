<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Adiciona as categorias principais e suas subcategorias
     * para produtos de segurança do trabalho.
     */
    public function run(): void
    {
        // Usar transação para garantir integridade dos dados
        DB::beginTransaction();

        try {
            // Carregar categorias do arquivo JSON
            $jsonPath = database_path('categories.json');

            if (!file_exists($jsonPath)) {
                $this->command->error('O ficheiro categories.json não foi encontrado em ' . database_path());
                return;
            }

            $categories = json_decode(file_get_contents($jsonPath), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->command->error('Erro ao descodificar o ficheiro JSON: ' . json_last_error_msg());
                return;
            }

            // Processar cada categoria do JSON
            foreach ($categories as $index => $categoryData) {
                $children = $categoryData['children'] ?? [];
                unset($categoryData['children']);

                // Adicionar ordem sequencial se não existir no JSON
                $categoryData['order'] = $categoryData['order'] ?? $index;

                $this->createCategoryWithChildren([
                    'name' => $categoryData['name'],
                    'description' => $categoryData['description'] ?? null,
                    'active' => $categoryData['active'] ?? true,
                    'order' => $categoryData['order'],
                    'children' => $children
                ]);
            }

            $this->command->info('Categorias importadas com sucesso do ficheiro JSON');
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Erro ao inserir categorias: ' . $e->getMessage());
        }
    }

    /**
     * Cria uma categoria principal e suas subcategorias.
     *
     * @param array $categoryData Dados da categoria principal e filhas
     * @return void
     */
    private function createCategoryWithChildren(array $categoryData): void
    {
        try {
            // Criar categoria principal
            $category = Category::create([
                'name' => $categoryData['name'],
                'slug' => $categoryData['slug'] ?? Str::slug($categoryData['name']),
                'description' => $categoryData['description'] ?? null,
                'active' => $categoryData['active'] ?? true,
                'order' => $categoryData['order'] ?? 0
            ]);

            // Criar subcategorias
            if (isset($categoryData['children']) && is_array($categoryData['children'])) {
                foreach ($categoryData['children'] as $index => $childData) {
                    Category::create([
                        'name' => $childData['name'],
                        'slug' => $childData['slug'] ?? Str::slug($childData['name']),
                        'description' => $childData['description'] ?? null,
                        'parent_id' => $category->id,
                        'active' => $childData['active'] ?? true,
                        'order' => $childData['order'] ?? $index
                    ]);
                }
            }
        } catch (\Exception $e) {
            throw new \Exception('Erro ao criar categoria ' . $categoryData['name'] . ': ' . $e->getMessage());
        }
    }
}
