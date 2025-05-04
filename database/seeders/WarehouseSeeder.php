<?php

namespace Database\Seeders;

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
                'address' => 'Moçambique, Maputo',
                'city' => 'Maputo',
                'province' => 'Maputo',
                'country' => 'Moçambique',
                'manager_id' => $admin?->id,
            ]);

            // Criar o armazém de e-commerce
            Warehouse::create([
                'name' => 'Armazém E-commerce',
                'code' => 'ECOM',
                'description' => 'Armazém dedicado às vendas online',
                'is_main' => false,
                'active' => true,
                'address' => 'Moçambique, Maputo',
                'city' => 'Maputo',
                'province' => 'Maputo',
                'country' => 'Moçambique',
                'manager_id' => $admin?->id,
            ]);

            DB::commit();

            $this->command->info('Armazéns criados com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Erro ao criar armazéns: ' . $e->getMessage());
        }
    }
}
