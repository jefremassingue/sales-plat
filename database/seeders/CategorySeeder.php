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
            // Criação das categorias principais e suas subcategorias
            $this->createCategoryWithChildren([
                'name' => 'Calçados',
                'description' => 'Calçados de segurança e proteção para ambientes de trabalho',
                'children' => [
                    [
                        'name' => 'Botas',
                        'description' => 'Botas de segurança para diversos ambientes de trabalho'
                    ],
                    [
                        'name' => 'Sapatos',
                        'description' => 'Sapatos de segurança confortáveis e resistentes'
                    ],
                    [
                        'name' => 'Tamancos',
                        'description' => 'Tamancos profissionais para ambientes específicos'
                    ]
                ]
            ]);

            $this->createCategoryWithChildren([
                'name' => 'Vestuário',
                'description' => 'Vestuário de proteção para diversos ambientes de trabalho',
                'children' => [
                    [
                        'name' => 'Alta Visibilidade',
                        'description' => 'Vestuário de alta visibilidade para trabalhos em áreas de baixa luminosidade ou tráfego'
                    ],
                    [
                        'name' => 'Térmico e Impermeável',
                        'description' => 'Vestuário para proteção contra condições climáticas adversas'
                    ],
                    [
                        'name' => 'Protecção Química',
                        'description' => 'Vestuário para proteção contra exposição a substâncias químicas nocivas'
                    ]
                ]
            ]);

            $this->createCategoryWithChildren([
                'name' => 'Luvas',
                'description' => 'Equipamentos para proteção das mãos em diversos ambientes de trabalho',
                'children' => [
                    [
                        'name' => 'Uso Geral',
                        'description' => 'Luvas para proteção em tarefas gerais'
                    ],
                    [
                        'name' => 'Corte e Perfuração',
                        'description' => 'Luvas resistentes a cortes e perfurações'
                    ],
                    [
                        'name' => 'Química e Térmica',
                        'description' => 'Luvas para proteção contra produtos químicos e altas temperaturas'
                    ]
                ]
            ]);

            $this->createCategoryWithChildren([
                'name' => 'Cabeça e Rosto',
                'description' => 'Equipamentos para proteção da cabeça e rosto',
                'children' => [
                    [
                        'name' => 'Capacetes',
                        'description' => 'Capacetes de segurança para proteção contra impactos'
                    ],
                    [
                        'name' => 'Protetores Faciais',
                        'description' => 'Equipamentos para proteção facial contra impactos e respingos'
                    ],
                    [
                        'name' => 'Toucas e Balaclavas',
                        'description' => 'Proteção para cabeça em ambientes específicos'
                    ]
                ]
            ]);

            $this->createCategoryWithChildren([
                'name' => 'Máscaras e Respiradores',
                'description' => 'Equipamentos para proteção das vias respiratórias',
                'children' => [
                    [
                        'name' => 'Máscaras Descartáveis',
                        'description' => 'Máscaras de uso único para proteção contra partículas'
                    ],
                    [
                        'name' => 'Respiradores Reutilizáveis',
                        'description' => 'Respiradores de uso prolongado com filtros substituíveis'
                    ],
                    [
                        'name' => 'Filtros e Peças',
                        'description' => 'Peças de reposição e filtros para respiradores'
                    ]
                ]
            ]);

            $this->createCategoryWithChildren([
                'name' => 'Protecção Auditiva',
                'description' => 'Equipamentos para proteção dos ouvidos contra ruídos',
                'children' => [
                    [
                        'name' => 'Plugues',
                        'description' => 'Proteção auditiva interna de fácil utilização'
                    ],
                    [
                        'name' => 'Abafadores',
                        'description' => 'Proteção auditiva externa para ambientes com elevado nível de ruído'
                    ]
                ]
            ]);

            $this->createCategoryWithChildren([
                'name' => 'Trabalhos em Altura',
                'description' => 'Equipamentos para segurança em trabalhos em altura',
                'children' => [
                    [
                        'name' => 'Linhas de Vida e Ancoragem',
                        'description' => 'Sistemas para fixação e segurança em trabalhos em altura'
                    ],
                    [
                        'name' => 'Cintos e Talabartes',
                        'description' => 'Equipamentos para suporte e limitação de queda'
                    ],
                    [
                        'name' => 'Kits de Resgate',
                        'description' => 'Conjuntos de equipamentos para resgate em altura'
                    ]
                ]
            ]);

            $this->createCategoryWithChildren([
                'name' => 'Segurança Operacional',
                'description' => 'Equipamentos para segurança em operações diversas',
                'children' => [
                    [
                        'name' => 'Sinalização e Barreiras',
                        'description' => 'Equipamentos para demarcação e sinalização de áreas de risco'
                    ],
                    [
                        'name' => 'Lockout-Tagout e Cadeados',
                        'description' => 'Sistemas para bloqueio e etiquetagem de equipamentos em manutenção'
                    ],
                    [
                        'name' => 'Kits de Primeiros Socorros',
                        'description' => 'Conjuntos de materiais para atendimento de emergência'
                    ],
                    [
                        'name' => 'Iluminação e Sinalizadores',
                        'description' => 'Equipamentos para iluminação de emergência e sinalização'
                    ]
                ]
            ]);

            $this->createCategoryWithChildren([
                'name' => 'Acessórios e Kits Combinados',
                'description' => 'Acessórios e conjuntos de equipamentos de segurança',
                'children' => [
                    [
                        'name' => 'Kits Modulares',
                        'description' => 'Conjuntos de equipamentos de segurança para necessidades específicas'
                    ],
                    [
                        'name' => 'Kits de Primeiros Socorros para Viaturas',
                        'description' => 'Conjuntos de materiais para atendimento de emergência em veículos'
                    ],
                    [
                        'name' => 'Bolsas e Estojos',
                        'description' => 'Acessórios para transporte e armazenamento de equipamentos'
                    ],
                    [
                        'name' => 'Peças de Reposição',
                        'description' => 'Componentes para substituição em equipamentos de segurança'
                    ]
                ]
            ]);

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
                'slug' => Str::slug($categoryData['name']),
                'description' => $categoryData['description'] ?? null,
                'active' => true,
                'order' => 0
            ]);

            // Criar subcategorias
            if (isset($categoryData['children']) && is_array($categoryData['children'])) {
                foreach ($categoryData['children'] as $index => $childData) {
                    Category::create([
                        'name' => $childData['name'],
                        'slug' => Str::slug($childData['name']),
                        'description' => $childData['description'] ?? null,
                        'parent_id' => $category->id,
                        'active' => true,
                        'order' => $index
                    ]);
                }
            }
        } catch (\Exception $e) {
            throw new \Exception('Erro ao criar categoria ' . $categoryData['name'] . ': ' . $e->getMessage());
        }
    }
}
