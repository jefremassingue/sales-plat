<?php

namespace Database\Seeders;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WarehouseSeeder extends Seeder
{
    /**
     * Executar os seeders de armazéns.
     */
    public function run(): void
    {
        try {
            DB::beginTransaction();

            // Obter um administrador para usar como gestor (se existir)
            $admin = User::role('Admin')->first();

            // Criar o armazém principal
            Warehouse::create([
                'name' => 'Armazém Principal',
                'code' => 'PRINCIPAL',
                'description' => 'Armazém principal para todas as operações físicas',
                'is_main' => true,
                'active' => true,
                'available_for_ecommerce' => false,
                'address' => 'Moçambique, Maputo',
                'city' => 'Maputo',
                'province' => 'Maputo',
                'country' => 'Moçambique',
                'manager_id' => $admin?->id,
            ]);

            // Criar o armazém de e-commerce
            $ecommerce = Warehouse::create([
                'name' => 'Armazém E-commerce',
                'code' => 'ECOM',
                'description' => 'Armazém dedicado às vendas online',
                'is_main' => false,
                'active' => true,
                'available_for_ecommerce' => true,
                'address' => 'Moçambique, Maputo',
                'city' => 'Maputo',
                'province' => 'Maputo',
                'country' => 'Moçambique',
                'manager_id' => $admin?->id,
            ]);


            Product::limit(30)->get()->each(function ($product) use ($ecommerce) {
                Inventory::create([
                    'product_id' => $product->id,
                    'warehouse_id' => $ecommerce->id,
                    'quantity' => 100,
                    'min_quantity' => 50,

                ]);
            });
            DB::commit();

            $this->command->info('Armazéns criados com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Erro ao criar armazéns: ' . $e->getMessage());
        }
    }
}
