<?php

namespace Tests\Unit;

use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategorySlugTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Testa se o slug é gerado automaticamente a partir do nome quando não é fornecido.
     */
    public function test_slug_is_generated_from_name_when_not_provided(): void
    {
        $category = Category::create([
            'name' => 'Categoria de Teste',
            'order' => 0,
            'active' => true
        ]);

        $this->assertEquals('categoria-de-teste', $category->slug);
    }

    /**
     * Testa se os slugs duplicados são tratados corretamente e se geram versões únicas.
     */
    public function test_duplicate_slugs_become_unique(): void
    {
        // Criar a primeira categoria
        $category1 = Category::create([
            'name' => 'Categoria Duplicada',
            'order' => 0,
            'active' => true
        ]);

        // Criar a segunda categoria com o mesmo nome
        $category2 = Category::create([
            'name' => 'Categoria Duplicada',
            'order' => 1,
            'active' => true
        ]);

        // Verificar se os slugs são diferentes
        $this->assertEquals('categoria-duplicada', $category1->slug);
        $this->assertEquals('categoria-duplicada-1', $category2->slug);

        // Criar a terceira categoria com o mesmo nome
        $category3 = Category::create([
            'name' => 'Categoria Duplicada',
            'order' => 2,
            'active' => true
        ]);

        // Verificar se o slug é único
        $this->assertEquals('categoria-duplicada-2', $category3->slug);
    }

    /**
     * Testa se o slug fornecido é mantido e verificado quanto à unicidade.
     */
    public function test_provided_slug_is_kept_and_unique(): void
    {
        // Criar categoria com slug personalizado
        $category1 = Category::create([
            'name' => 'Categoria Com Slug Personalizado',
            'slug' => 'meu-slug-personalizado',
            'order' => 0,
            'active' => true
        ]);

        // Verificar se o slug foi mantido
        $this->assertEquals('meu-slug-personalizado', $category1->slug);

        // Tentar criar outra categoria com o mesmo slug
        $category2 = Category::create([
            'name' => 'Outra Categoria',
            'slug' => 'meu-slug-personalizado',
            'order' => 1,
            'active' => true
        ]);

        // Verificar se o segundo slug foi modificado para ser único
        $this->assertEquals('meu-slug-personalizado-1', $category2->slug);
    }

    /**
     * Testa se o slug é atualizado quando o nome muda e o slug não é alterado manualmente.
     */
    public function test_slug_updates_when_name_changes_without_manual_slug_edit(): void
    {
        // Criar categoria
        $category = Category::create([
            'name' => 'Nome Inicial',
            'order' => 0,
            'active' => true
        ]);

        $this->assertEquals('nome-inicial', $category->slug);

        // Atualizar apenas o nome
        $category->update(['name' => 'Nome Alterado']);
        $this->assertEquals('nome-alterado', $category->slug);
    }

    /**
     * Testa se o slug não é atualizado quando o nome muda mas o slug foi editado manualmente.
     */
    public function test_slug_stays_when_manually_edited_and_name_changes(): void
    {
        // Criar categoria
        $category = Category::create([
            'name' => 'Nome Inicial',
            'slug' => 'slug-personalizado',
            'order' => 0,
            'active' => true
        ]);

        // Atualizar apenas o nome
        $category->update(['name' => 'Nome Alterado']);

        // O slug deve permanecer o mesmo porque foi definido manualmente
        $this->assertEquals('slug-personalizado', $category->slug);
    }

    /**
     * Testa se o slug é normalizado (remove acentos, espaços e caracteres especiais).
     */
    public function test_slug_is_normalized(): void
    {
        // Criar categoria com nome contendo acentos e caracteres especiais
        $category = Category::create([
            'name' => 'Câtégorìa çòm Àçêntõs & Símbolos!',
            'order' => 0,
            'active' => true
        ]);

        // Verificar se o slug foi normalizado corretamente
        $this->assertEquals('categoria-com-acentos-simbolos', $category->slug);
    }
}
