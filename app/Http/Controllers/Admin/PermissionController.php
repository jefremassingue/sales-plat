<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Jefre\SpatiePermissionGenerate\SpatiePermissionGenerate;

class PermissionController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:admin-permission.index', only: ['index']),
            new Middleware('permission:admin-permission.create', only: ['create', 'store']),
            new Middleware('permission:admin-permission.edit', only: ['edit', 'update']),
            new Middleware('permission:admin-permission.show', only: ['show']),
            new Middleware('permission:admin-permission.destroy', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Permission::query();

        // Filtro de busca
        if ($request->has('search') && $request->search !== null && trim($request->search) !== '') {
            $search = trim($request->search);
            $query->where('name', 'like', '%' . $search . '%');
        }

        // Ordenação
        $sortField = $request->input('sort_field', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortField, $sortOrder);

        // Incluir funções relacionadas
        $query->with('roles:id,name,guard_name');

        // Paginação
        $permissions = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Permissions/Index', [
            'permissions' => $permissions,
            'filters' => $request->only(['search', 'sort_field', 'sort_order']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Permissions/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validar os dados da permissão
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:permissions,name',
            'guard_name' => 'required|string|max:255',
        ], [
            'name.required' => 'O nome da permissão é obrigatório',
            'name.unique' => 'Este nome de permissão já está em uso',
            'guard_name.required' => 'O nome do guard é obrigatório',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Criar nova permissão
            Permission::create([
                'name' => $request->name,
                'guard_name' => $request->guard_name,
            ]);

            DB::commit();

            return redirect()->route('admin.permissions.index')
                ->with('success', 'Permissão criada com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao criar a permissão: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Permission $permission)
    {
        // Carregar as funções relacionadas
        $permission->load('roles');

        return Inertia::render('Admin/Permissions/Show', [
            'permission' => $permission,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Permission $permission)
    {
        return Inertia::render('Admin/Permissions/Edit', [
            'permission' => $permission,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Permission $permission)
    {
        // Validar os dados da permissão
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:permissions,name,' . $permission->id,
            'guard_name' => 'required|string|max:255',
        ], [
            'name.required' => 'O nome da permissão é obrigatório',
            'name.unique' => 'Este nome de permissão já está em uso',
            'guard_name.required' => 'O nome do guard é obrigatório',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Atualizar permissão
            $permission->update([
                'name' => $request->name,
                'guard_name' => $request->guard_name,
            ]);

            DB::commit();

            return redirect()->route('admin.permissions.index')
                ->with('success', 'Permissão atualizada com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao atualizar a permissão: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function updatePermissions()
    {
        try {
            $hasGenarate = SpatiePermissionGenerate::synchronizelPermission();


            Permission::all()->each(function ($permission) {
                // Substituir apenas o último hífen por um ponto
                $lastHyphenPos = strrpos($permission->name, '-');
                if ($lastHyphenPos !== false) {
                    $permission->name = substr_replace($permission->name, '.', $lastHyphenPos, 1);
                    if (Permission::where('name', $permission->name)->exists()) {
                        // Se já existir uma permissão com o novo nome, eliminar a permissão atual
                        $permission->delete();
                        return; // Sair da função de callback
                    }
                }
                $permission->save();
            });
            $permissions = Permission::pluck('id', 'id')->all();
            $role = Role::where('name', 'Admin')->first();
            $role->syncPermissions($permissions);

            if ($hasGenarate) {
                return redirect()->route('admin.permissions.index')
                    ->with('success', 'Permissões atualizadas com sucesso!');
            } else {
                return redirect()->route('admin.permissions.index')
                    ->with('error', 'Ocorreu um erro ao atualizar as permissões.');
            }
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao atualizar as permissões: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Permission $permission)
    {
        try {
            // Verificar se a permissão está atribuída a funções
            if ($permission->roles->count() > 0) {
                throw new \Exception('Esta permissão está atribuída a funções e não pode ser eliminada. Remova-a das funções primeiro.');
            }

            DB::beginTransaction();

            // Remover a permissão
            $permission->delete();

            DB::commit();

            return redirect()->route('admin.permissions.index')
                ->with('success', 'Permissão eliminada com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao eliminar a permissão: ' . $e->getMessage());
        }
    }
}
