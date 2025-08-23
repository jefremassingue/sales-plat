<?php

namespace Database\Seeders;

use App\Models\HeroSlider;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HeroSliderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $slides = [
            [
                'supertitle' => 'SEGURANÇA EM PRIMEIRO LUGAR',
                'title' => 'Capacetes de Alta Resistência',
                'subtitle' => 'Proteção certificada para sua cabeça em qualquer ambiente de trabalho.',
                'cta_text' => 'Ver Capacetes',
                'cta_link' => '/products',
                'text_position' => 'right',
                'text_color' => 'text-white',
                'overlay_color' => 'bg-black/40',
                'active' => true,
                'order' => 1,
                'image_path' => 'images/capacete.jpg',
            ],
            [
                'supertitle' => 'PROTEÇÃO PARA SUAS MÃOS',
                'title' => 'Luvas para Todas as Necessidades',
                'subtitle' => 'Desde proteção contra cortes até manuseio de químicos, temos a luva ideal.',
                'cta_text' => 'Explorar Luvas',
                'cta_link' => '/products',
                'text_position' => 'center',
                'text_color' => 'text-white',
                'overlay_color' => 'bg-gradient-to-t from-slate-800/70 via-slate-800/50 to-transparent',
                'active' => true,
                'order' => 2,
                'image_path' => 'images/luvas.svg',
            ],
            [
                'supertitle' => 'VISÃO SEGURA, TRABALHO PRECISO',
                'title' => 'Óculos de Proteção Avançados',
                'subtitle' => 'Lentes anti-embaçantes e resistentes a impacto para máxima clareza e segurança.',
                'cta_text' => 'Ver Óculos',
                'cta_link' => '/products',
                'text_position' => 'right',
                'text_color' => 'text-white',
                'overlay_color' => 'bg-sky-800/40',
                'active' => true,
                'order' => 3,
                'image_path' => 'images/oculos.jpg',
            ],
            [
                'supertitle' => 'RESPIRE COM SEGURANÇA',
                'title' => 'Proteção Respiratória Eficaz',
                'subtitle' => 'Máscaras e respiradores contra poeira, gases e vapores.',
                'cta_text' => 'Linha Respiratória',
                'cta_link' => '/products',
                'text_position' => 'left',
                'text_color' => 'text-white',
                'overlay_color' => 'bg-neutral-900/50',
                'active' => true,
                'order' => 4,
                'image_path' => 'images/mascara.jpg',
            ],
        ];

        foreach ($slides as $slideData) {
            $imagePath = $slideData['image_path'];
            unset($slideData['image_path']);

            $slide = HeroSlider::create($slideData);

            $slide->image()->create([
                'storage' => 'public',
                'path' => $imagePath,
                'name' => basename($imagePath),
                'original_name' => basename($imagePath),
                'size' => 0,
                'extension' => pathinfo($imagePath, PATHINFO_EXTENSION),
                'version' => 'original',
                'is_main' => true,
            ]);
        }
    }
}