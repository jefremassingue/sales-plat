<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogController extends Controller
{
    /**
     * Exibe a lista de artigos do blog com suporte a filtros
     */
    public function index(Request $request)
    {
        // Buscar categorias para o filtro
        $categories = BlogCategory::orderBy('name')->get();

        // Iniciar a query
        $query = Blog::with(['category', 'image.versions', 'user'])
            ->published();

        // Aplicar filtro por categoria se fornecido
        if ($request->has('category_id') && $request->category_id !== 'all') {
            $query->where('blog_category_id', $request->category_id);
        }

        // Aplicar busca por termo se fornecido
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', $searchTerm)
                    ->orWhere('excerpt', 'like', $searchTerm)
                    ->orWhere('content', 'like', $searchTerm);
            });
        }

        // Ordenar por data de publicação (mais recentes primeiro)
        $query->orderBy('published_at', 'desc');

        // Paginar os resultados
        $blogs = $query->paginate(9)->withQueryString();

        // dd(json_encode($blogs));
        // Retornar a view com os dados
        $response = Inertia::render('Site/Blog/Index', [
            'blogs' => $blogs,
            '_categories' => $categories,
            'filters' => $request->only(['search', 'category_id']),
        ]);

        $title = 'Blog - Novidades e Dicas';
        $description = 'Acompanhe nosso blog para ficar por dentro das últimas novidades, dicas e tendências do setor de construção e equipamentos industriais.';

        if ($request->filled('search')) {
            $searchTerm = e($request->search);
            $title = "Busca por \"{$searchTerm}\" no Blog - Matony Serviços";
            $description = "Resultados da busca por \"{$searchTerm}\" em nosso blog. Encontre artigos e dicas sobre o que você procura.";
        } elseif ($request->filled('category_id') && $request->category_id !== 'all') {
            $category = $categories->firstWhere('id', $request->category_id);
            if ($category) {
                $title = "Artigos sobre {$category->name} - Blog da Matony Serviços";
                $description = "Explore nossos artigos na categoria {$category->name} e aprofunde seus conhecimentos.";
            }
        }

        return $response->title($title)
            ->description($description, 160)
            ->image(asset('og.png'))
            ->ogMeta()
            ->twitterLargeCard();
    }

    /**
     * Exibe um artigo específico do blog
     */
    public function show(Request $request, $slug)
    {
        // Buscar o artigo pelo slug
        $blog = Blog::with(['category', 'image.versions', 'user'])
            ->where('slug', $slug)
            ->published()
            ->firstOrFail();

        // Buscar artigos relacionados (da mesma categoria)
        $relatedPosts = Blog::with(['category', 'image.versions', 'user'])
            ->where('blog_category_id', $blog->blog_category_id)
            ->where('id', '!=', $blog->id) // Excluir o artigo atual
            ->published()
            ->orderBy('published_at', 'desc')
            ->limit(3)
            ->get();

        // Incrementar contador de visualizações
        // $blog->increment('views');

        $imageUrl = null;

        if (!empty($blog->image)) {
            $versions = $blog->image->versions ?? [];

            foreach (['sm', 'md', 'lg'] as $size) {
                foreach ($versions as $img) {
                    if (($img->version ?? null) === $size) {
                        $imageUrl = $img->url ?? null;
                        break 2;
                    }
                }
            }

            if (!$imageUrl && !empty($blog->image->url)) {
                $imageUrl = $blog->image->url;
            }
        }

        // fallback final
        $imageUrl = $imageUrl ?? '/og-image.png';

        return Inertia::render('Site/Blog/Show', [
            'blog' => $blog,
            'relatedPosts' => $relatedPosts,
        ])
            ->title($blog->title)
            ->description($blog->excerpt ?: str($blog->content)->limit(140))
            ->image($imageUrl ?? asset('og.png'))
            ->ogMeta()
            ->twitterLargeCard();
    }
}
