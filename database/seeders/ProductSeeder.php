<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Importa produtos do arquivo JSON e associa às categorias existentes.
     */
    public function run(): void
    {
        DB::beginTransaction();

        try {
            // Carregar produtos do arquivo JSON
            $jsonPath = database_path('products.json');

            if (!file_exists($jsonPath)) {
                $this->command->error('O ficheiro products.json não foi encontrado em ' . database_path());
                return;
            }

            $products = json_decode(file_get_contents($jsonPath), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->command->error('Erro ao descodificar o ficheiro JSON: ' . json_last_error_msg());
                return;
            }

            // Criar cada produto do JSON
            foreach ($products as $productData) {
                try {
                    // Encontrar categoria pelo slug
                    $category = Category::where('slug', $productData['category_slug'])->first();

                    if (!$category) {
                        $this->command->warn("Categoria não encontrada para o slug: {$productData['category_slug']}");
                        continue;
                    }

                    // Criar produto com slug único usando nome + sku
                    Product::create([
                        'sku' => $productData['sku'],
                        'name' => $productData['name'],
                        'slug' => Str::slug($productData['name']) . '-' . Str::lower($productData['sku']),
                        'price' => $productData['price'],
                        'category_id' => $category->id,
                        'description' => $productData['description'] ?? null,
                        'active' => true // valor padrão
                    ]);

                } catch (\Exception $e) {
                    $this->command->error("Erro ao criar produto {$productData['sku']}: " . $e->getMessage());
                    throw $e;
                }
            }

            $this->command->info('Produtos importados com sucesso do ficheiro JSON');
            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Erro ao inserir produtos: ' . $e->getMessage());
        }
    }
}
