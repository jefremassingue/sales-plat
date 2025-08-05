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

class RoleController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:admin-role.index', only: ['index']),
            new Middleware('permission:admin-role.create', only: ['create', 'store']),
            new Middleware('permission:admin-role.edit', only: ['edit', 'update']),
            new Middleware('permission:admin-role.show', only: ['show']),
            new Middleware('permission:admin-role.destroy', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Role::query();

        // Filtro de busca
        if ($request->has('search') && $request->search !== null && trim($request->search) !== '') {
            $search = trim($request->search);
            $query->where('name', 'like', '%' . $search . '%');
        }

        // Ordenação
        $sortField = $request->input('sort_field', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortField, $sortOrder);

        // Incluir permissões relacionadas
        $query->with('permissions:id,name,guard_name');

        // Paginação
        $roles = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'filters' => $request->only(['search', 'sort_field', 'sort_order']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Obter todas as permissões disponíveis
        $permissions = Permission::orderBy('name')->get();

        return Inertia::render('Admin/Roles/Create', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validar os dados da função
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id',
        ], [
            'name.required' => 'O nome da função é obrigatório',
            'name.unique' => 'Este nome de função já está em uso',
            'permissions.required' => 'Deve selecionar pelo menos uma permissão',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Criar nova função (role)
            $role = Role::create([
                'name' => $request->name,
                'guard_name' => 'web',
            ]);

            // Atribuir permissões à função
            $role->syncPermissions($request->permissions);

            DB::commit();

            return redirect()->route('admin.roles.index')
                ->with('success', 'Função criada com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao criar a função: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        // Carregar as permissões relacionadas
        $role->load('permissions');

        return Inertia::render('Admin/Roles/Show', [
            'role' => $role,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        // Obter todas as permissões disponíveis
        $permissions = Permission::orderBy('name')->get();

        // Obter IDs das permissões atualmente atribuídas à função
        $rolePermissions = $role->permissions->pluck('id')->toArray();

        return Inertia::render('Admin/Roles/Edit', [
            'role' => $role,
            'permissions' => $permissions,
            'rolePermissions' => $rolePermissions,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        // Validar os dados da função
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id',
        ], [
            'name.required' => 'O nome da função é obrigatório',
            'name.unique' => 'Este nome de função já está em uso',
            'permissions.required' => 'Deve selecionar pelo menos uma permissão',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Não permitir modificar funções do sistema
            if ($role->name === 'Super Admin' && $request->name !== 'Super Admin') {
                throw new \Exception('A função de Super Admin não pode ser modificada.');
            }

            // Atualizar função
            $role->update([
                'name' => $request->name,
            ]);

            // Atualizar permissões
            $role->syncPermissions($request->permissions);

            DB::commit();

            return redirect()->route('admin.roles.index')
                ->with('success', 'Função atualizada com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao atualizar a função: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        try {
            // Não permitir eliminar funções do sistema
            if ($role->name === 'Super Admin') {
                throw new \Exception('A função de Super Admin não pode ser eliminada.');
            }

            // Verificar se a função está atribuída a utilizadores
            if ($role->users->count() > 0) {
                throw new \Exception('Esta função está atribuída a utilizadores e não pode ser eliminada.');
            }

            DB::beginTransaction();

            // Remover a função
            $role->delete();

            DB::commit();

            return redirect()->route('admin.roles.index')
                ->with('success', 'Função eliminada com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao eliminar a função: ' . $e->getMessage());
        }
    }
}
