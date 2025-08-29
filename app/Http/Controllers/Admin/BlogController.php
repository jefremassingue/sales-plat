<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class BlogController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:admin-blog.index', only: ['index']),
            new Middleware('permission:admin-blog.create', only: ['create', 'store']),
            new Middleware('permission:admin-blog.edit', only: ['edit', 'update']),
            new Middleware('permission:admin-blog.show', only: ['show']),
            new Middleware('permission:admin-blog.destroy', only: ['destroy']),
        ];
    }

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
        $categories = BlogCategory::orderBy('name')->get();

        return Inertia::render('Admin/Blog/Index', [
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
        $categories = BlogCategory::orderBy('name')->get();

        return Inertia::render('Admin/Blog/Create', [
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
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Alterado para aceitar upload de imagem
            'status' => 'boolean',
            'published_at' => 'nullable|date',
            'category_id' => 'nullable|string|exists:categories,id',
        ], [
            'slug.regex' => 'O slug deve conter apenas letras minúsculas, números e hífens.',
            'slug.unique' => 'Este slug já está a ser utilizado por outro post.',
            'featured_image.image' => 'O arquivo deve ser uma imagem.',
            'featured_image.mimes' => 'A imagem deve ser do tipo: jpeg, png, jpg ou gif.',
            'featured_image.max' => 'A imagem não pode ter mais de 2MB.'
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
            if (empty($data['published_at'])) {
                $data['published_at'] = now();
            }

            // Processar o upload da imagem, se fornecida
            if ($request->hasFile('featured_image')) {
                $image = $request->file('featured_image');
                // dd($image);
                // $imageName = time() . '_' . Str::slug($data['title']) . '.' . $image->getClientOriginalExtension();
                // $image->storeAs('public/blogs', $imageName);
                $path = $image->store('blog', 'public');


                $data['featured_image'] = basename($path);
            }

            $blog = Blog::create($data);

            if ($request->hasFile('featured_image')) {

                $image = new Image([
                    'version' => 'original',
                    'storage' => 'public',
                    'path' => $path,
                    'name' => basename($path),
                    'original_name' => $image->getClientOriginalName(),
                    'size' => $image->getSize(),
                    'extension' => $image->extension(),
                    'is_main' => true,
                    'typeable_type' => Blog::class,
                    'typeable_id' => $blog->id,
                ]);

                // dd($image);
                $image->save();
            }

            DB::commit();

            return redirect()->route('admin.blog.index')
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
    public function show($id)
    {
        $blog = Blog::where('slug', $id)->firstOrFail();

        $blog->load('user', 'category', 'image.versions');

        // return $blog;
        return Inertia::render('Admin/Blog/Show', [
            'blog' => $blog,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Blog $blog)
    {
        $categories = BlogCategory::orderBy('name')->get();

        return Inertia::render('Admin/Blog/Edit', [
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
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Alterado para aceitar upload de imagem
            'status' => 'boolean',
            'published_at' => 'nullable|date',
            'category_id' => 'nullable|string|exists:categories,id',
        ], [
            'slug.regex' => 'O slug deve conter apenas letras minúsculas, números e hífens.',
            'slug.unique' => 'Este slug já está a ser utilizado por outro post.',
            'featured_image.image' => 'O arquivo deve ser uma imagem.',
            'featured_image.mimes' => 'A imagem deve ser do tipo: jpeg, png, jpg ou gif.',
            'featured_image.max' => 'A imagem não pode ter mais de 2MB.'
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
           
                // Se não vier imagem, não sobrescrever o campo
                if (!$request->hasFile('featured_image')) {
                    unset($data['featured_image']);
                }

            // Se o slug foi fornecido, garantir que esteja no formato correto
            if (isset($data['slug'])) {
                $data['slug'] = Str::slug($data['slug']);
            }

            // Se o status mudou para publicado e não há data de publicação, definir agora
            if ($data['status'] && !$blog->status && empty($data['published_at'])) {
                $data['published_at'] = now();
            }

            // Processar o upload da imagem, se fornecida
            if ($request->hasFile('featured_image')) {
                // Remover imagem antiga se existir
                if ($blog->featured_image) {
                    Storage::delete('public/' . $blog->featured_image);
                }

                $image = $request->file('featured_image');
                $imageName = time() . '_' . Str::slug($data['title']) . '.' . $image->getClientOriginalExtension();
                $image->storeAs('public/blogs', $imageName);
                $data['featured_image'] = 'blogs/' . $imageName;
            }

            $blog->update($data);

            DB::commit();

            return redirect()->route('admin.blog.index')
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

            return redirect()->route('admin.blog.index')
                ->with('success', 'Post eliminado com sucesso!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Ocorreu um erro ao eliminar o post: ' . $e->getMessage());
        }
    }
}
