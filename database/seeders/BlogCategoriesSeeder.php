<?php

namespace Database\Seeders;

use Illuminate\Support\Str;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BlogCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Blog categories for epis site
        $categories = [
            'Eventos',
            'Curiosidades',
            'Notícias',
            'Novidades',
            'Dicas',
            'Tutoriais',
            'Histórias',
            'Anúncios',
            'Descontos',
            'Promoções',
        ];

        foreach ($categories as $category) {
            \App\Models\BlogCategory::create([
                'name' => $category,
                'slug' => Str::slug($category),
                'active' => true,
            ]);
        }
    }
}
