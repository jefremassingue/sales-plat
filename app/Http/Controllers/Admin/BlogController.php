<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BlogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Blog::query()
            ->with(['user', 'category'])
            ->orderBy('created_at', 'desc');

        // Filtro de busca
        if ($request->has('search') && $request->search !== null && trim($request->search) !== '') {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                    ->orWhere('slug', 'like', '%' . $search . '%')
                    ->orWhere('content', 'like', '%' . $search . '%');
            });
        }

        // Filtro de estado (ativo/inativo)
        if ($request->has('status') && $request->status !== null) {
            $query->where('status', $request->status === 'true');
        }

        // Filtro por categoria
        if ($request->has('category_id') && $request->category_id !== null) {
            $query->where('category_id', $request->category_id);
        }

        // Paginação e retorno
        $blogs = $query->paginate(10)->withQueryString();

        // Carregar categorias para o filtro
        $categories = Category::orderBy('name')->get();

        return Inertia::render('Admin/Blogs/Index', [
            'blogs' => $blogs,
            'categories' => $categories,
            'filters' => $request->only(['search', 'status', 'category_id']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::orderBy('name')->get();

        return Inertia::render('Admin/Blogs/Create', [
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', // Formato de slug válido
                Rule::unique('blogs', 'slug')
            ],
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'status' => 'boolean',
            'published_at' => 'nullable|date',
            'category_id' => 'nullable|exists:categories,id',
        ], [
            'slug.regex' => 'O slug deve conter apenas letras minúsculas, números e hífens.',
            'slug.unique' => 'Este slug já está a ser utilizado por outro post.'
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Preparar os dados para criação
            $data = $request->all();
            $data['user_id'] = Auth::id();

            // Se o slug não foi fornecido, gerar a partir do título
            if (empty($data['slug'])) {
                $data['slug'] = Str::slug($data['title']);
            } else {
                // Garantir que o slug esteja no formato correto
                $data['slug'] = Str::slug($data['slug']);
            }

            // Se a data de publicação não foi fornecida, usar a data atual
            if (empty($data['published_at']) && $data['status']) {
                $data['published_at'] = now();
            }

            $blog = Blog::create($data);

            DB::commit();

            return redirect()->route('admin.blogs.index')
                ->with('success', 'Post criado com sucesso!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao criar o post: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Blog $blog)
    {
        try {
            $blog->load('user', 'category');

            return Inertia::render('Admin/Blogs/Show', [
                'blog' => $blog,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Ocorreu um erro ao apresentar o post: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Blog $blog)
    {
        $categories = Category::orderBy('name')->get();

        return Inertia::render('Admin/Blogs/Edit', [
            'blog' => $blog,
            'categories' => $categories
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Blog $blog)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', // Formato de slug válido
                Rule::unique('blogs', 'slug')->ignore($blog->id)
            ],
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'status' => 'boolean',
            'published_at' => 'nullable|date',
            'category_id' => 'nullable|exists:categories,id',
        ], [
            'slug.regex' => 'O slug deve conter apenas letras minúsculas, números e hífens.',
            'slug.unique' => 'Este slug já está a ser utilizado por outro post.'
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Preparar os dados para atualização
            $data = $request->all();

            // Se o slug foi fornecido, garantir que esteja no formato correto
            if (isset($data['slug'])) {
                $data['slug'] = Str::slug($data['slug']);
            }

            // Se o status mudou para publicado e não há data de publicação, definir agora
            if ($data['status'] && !$blog->status && empty($data['published_at'])) {
                $data['published_at'] = now();
            }

            $blog->update($data);

            DB::commit();

            return redirect()->route('admin.blogs.index')
                ->with('success', 'Post atualizado com sucesso!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao atualizar o post: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Blog $blog)
    {
        try {
            DB::beginTransaction();

            $blog->delete();

            DB::commit();

            return redirect()->route('admin.blogs.index')
                ->with('success', 'Post eliminado com sucesso!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Ocorreu um erro ao eliminar o post: ' . $e->getMessage());
        }
    }
}
