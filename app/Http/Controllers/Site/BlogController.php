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
        $query = Blog::with(['category', 'image'])
            // ->where('published', true)
            ->whereNotNull('published_at')
            // ->where('published_at', '<=', now())
        ;

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
        return Inertia::render('Site/Blog/Index', [
            'blogs' => $blogs,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    /**
     * Exibe um artigo específico do blog
     */
    public function show(Request $request, $slug)
    {
        // Buscar o artigo pelo slug
        $blog = Blog::with(['category', 'image'])
            ->where('slug', $slug)
            // ->where('published', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->firstOrFail();

        // Buscar artigos relacionados (da mesma categoria)
        $relatedPosts = Blog::with(['category', 'image'])
            ->where('blog_category_id', $blog->blog_category_id)
            ->where('id', '!=', $blog->id) // Excluir o artigo atual
            ->where('published', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->orderBy('published_at', 'desc')
            ->limit(3)
            ->get();

        // Incrementar contador de visualizações
        // $blog->increment('views');

        // Retornar a view com os dados
        return Inertia::render('Site/Blog/Show', [
            'blog' => $blog,
            'relatedPosts' => $relatedPosts,
        ]);
    }
}
