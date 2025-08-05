<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('currencies')->insert([
            'id' => \Illuminate\Support\Str::ulid(),
            'code' => 'MZN',
            'name' => 'Metical Moçambicano',
            'symbol' => 'MT',
            'exchange_rate' => 1.0000,
            'is_default' => true,
            'is_active' => true,
            'decimal_separator' => ',',
            'thousand_separator' => '.',
            'decimal_places' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
