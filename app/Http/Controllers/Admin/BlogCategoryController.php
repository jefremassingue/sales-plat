<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class BlogCategoryController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:admin-blogcategory.index', only: ['index']),
            new Middleware('permission:admin-blogcategory.create', only: ['create', 'store']),
            new Middleware('permission:admin-blogcategory.edit', only: ['edit', 'update']),
            new Middleware('permission:admin-blogcategory.show', only: ['show']),
            new Middleware('permission:admin-blogcategory.destroy', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Query base para categorias de nível superior
        $query = BlogCategory::query()
            ->with(['children' => function ($query) use ($request) {
                $query->orderBy('order');

                // Se houver filtro de busca ou estado, aplicar também nas subcategorias
                if ($request->has('search') && $request->search !== null && trim($request->search) !== '') {
                    $search = trim($request->search);
                    $query->where(function ($q) use ($search) {
                        $q->where('name', 'like', '%' . $search . '%')
                            ->orWhere('slug', 'like', '%' . $search . '%')
                            ->orWhere('description', 'like', '%' . $search . '%');
                    });
                }

                if ($request->has('active') && $request->active !== null) {
                    $query->where('active', $request->active === 'true');
                }
            }])
            ->whereNull('parent_id');

        // Filtro de busca para categorias principais
        if ($request->has('search') && $request->search !== null && trim($request->search) !== '') {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('slug', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        // Filtro de estado (ativo/inativo)
        if ($request->has('active') && $request->active !== null) {
            $query->where('active', $request->active === 'true');
        }

        // Ordenação
        $query->orderBy('order');

        // Paginação e retorno
        $rootCategories = $query->paginate(10)->withQueryString();

        // Carregar todas as categorias para o filtro e outras operações
        $allCategoriesQuery = BlogCategory::query();

        // Aplicar os mesmos filtros na consulta de todas as categorias
        if ($request->has('search') && $request->search !== null && trim($request->search) !== '') {
            $search = trim($request->search);
            $allCategoriesQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('slug', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        if ($request->has('active') && $request->active !== null) {
            $allCategoriesQuery->where('active', $request->active === 'true');
        }

        $allCategories = $allCategoriesQuery->orderBy('order')->get();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $rootCategories,
            'allCategories' => $allCategories,
            'filters' => $request->only(['search', 'active']),
        ]);
    }

    /**
     * Exibe uma visualização em árvore das categorias.
     */
    public function tree(Request $request)
    {
        $query = BlogCategory::with('childrenRecursive')
            ->whereNull('parent_id');

        // Filtro de busca
        if ($request->has('search') && $request->search !== null && trim($request->search) !== '') {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('slug', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        // Filtro de estado (ativo/inativo)
        if ($request->has('active') && $request->active !== null) {
            $query->where('active', $request->active === 'true');
        }

        $categories = $query->orderBy('order')->get();

        return Inertia::render('Admin/Categories/Tree', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'active']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = BlogCategory::whereNull('parent_id')
            ->orderBy('order')
            ->get();

        return Inertia::render('Admin/Categories/Create', [
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', // Formato de slug válido
                Rule::unique('categories', 'slug')
            ],
            'description' => 'nullable|string',
            'parent_id' => 'nullable|string|exists:categories,id',
            'active' => 'boolean',
            'order' => 'integer',
        ], [
            'slug.regex' => 'O slug deve conter apenas letras minúsculas, números e hífens.',
            'slug.unique' => 'Este slug já está a ser utilizado por outra categoria.'
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

            // Se o slug não foi fornecido, gerar a partir do nome
            if (empty($data['slug'])) {
                $data['slug'] = Str::slug($data['name']);
            } else {
                // Garantir que o slug esteja no formato correto
                $data['slug'] = Str::slug($data['slug']);
            }

            $category = BlogCategory::create($data);

            DB::commit();

            return redirect()->route('admin.categories.index')
                ->with('success', 'Categoria criada com sucesso!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao criar a categoria: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(BlogCategory $category)
    {
        try {
            $category->load('parent', 'children');

            return Inertia::render('Admin/Categories/Show', [
                'category' => $category,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Ocorreu um erro ao apresentar a categoria: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BlogCategory $category)
    {
        $categories = BlogCategory::where('id', '!=', $category->id)
            ->whereNotIn('id', $this->getBlogCategoryChildrenIds($category))
            ->get();

        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
            'categories' => $categories
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BlogCategory $category)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', // Formato de slug válido
                Rule::unique('categories', 'slug')->ignore($category->id)
            ],
            'description' => 'nullable|string',
            'parent_id' => [
                'nullable',
                'string',
                'exists:categories,id',
                function ($attribute, $value, $fail) use ($category) {
                    // Prevenir ciclos: uma categoria não pode ser sua própria filha/descendente
                    if ($value == $category->id || in_array($value, $this->getBlogCategoryChildrenIds($category))) {
                        $fail('Uma categoria não pode ser filha de si mesma ou de uma de suas subcategorias.');
                    }
                },
            ],
            'active' => 'boolean',
            'order' => 'integer',
        ], [
            'slug.regex' => 'O slug deve conter apenas letras minúsculas, números e hífens.',
            'slug.unique' => 'Este slug já está a ser utilizado por outra categoria.'
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

            $category->update($data);

            DB::commit();

            return redirect()->route('admin.categories.index')
                ->with('success', 'Categoria atualizada com sucesso!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao atualizar a categoria: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BlogCategory $category)
    {
        try {
            DB::beginTransaction();

            $category->delete();

            DB::commit();

            return redirect()->route('admin.categories.index')
                ->with('success', 'Categoria eliminada com sucesso!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Ocorreu um erro ao eliminar a categoria: ' . $e->getMessage());
        }
    }

    /**
     * Obter recursivamente os IDs de todas as categorias filho.
     */
    private function getBlogCategoryChildrenIds(BlogCategory $category, array &$ids = []): array
    {
        foreach ($category->children as $child) {
            $ids[] = $child->id;
            $this->getBlogCategoryChildrenIds($child, $ids);
        }

        return $ids;
    }
}
