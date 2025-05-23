<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Executar o seeder de categorias
        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
            UserSeeder::class,
            WarehouseSeeder::class,
            CompanySettingsSeeder::class,
            BankSettingsSeeder::class,
            CustomerSeeder::class,
            BlogCategoriesSeeder::class,
        ]);
    }
}
