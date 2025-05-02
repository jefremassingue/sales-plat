<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserRoleController extends Controller
{
    /**
     * Display a listing of the users with their roles.
     */
    public function index(Request $request)
    {
        $query = User::query()->with('roles');

        // Filtro de busca
        if ($request->has('search') && $request->search !== null && trim($request->search) !== '') {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        // Ordenação
        $sortField = $request->input('sort_field', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortField, $sortOrder);

        // Paginação
        $users = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/UserRoles/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'sort_field', 'sort_order']),
        ]);
    }

    /**
     * Show the form for editing the user's roles.
     */
    public function edit(User $user)
    {
        // Carregar as funções do utilizador
        $user->load('roles');

        // Obter todas as funções disponíveis
        $allRoles = Role::orderBy('name')->get();

        return Inertia::render('Admin/UserRoles/Edit', [
            'user' => $user,
            'allRoles' => $allRoles,
            'userRoles' => $user->roles->pluck('id')->toArray(),
        ]);
    }

    /**
     * Update the user's roles.
     */
    public function update(Request $request, User $user)
    {
        // Validar os dados
        $validator = Validator::make($request->all(), [
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Atualizar funções do utilizador
            $user->syncRoles($request->roles ?? []);

            DB::commit();

            return redirect()->route('admin.user-roles.index')
                ->with('success', 'Funções do utilizador atualizadas com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao atualizar as funções do utilizador: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Show user with their permissions
     */
    public function show(User $user)
    {
        // Carregar as funções e permissões do utilizador
        $user->load('roles.permissions');

        // Obter todas as permissões do utilizador (diretas e através de funções)
        $userPermissions = $user->getAllPermissions();

        return Inertia::render('Admin/UserRoles/Show', [
            'user' => $user,
            'userPermissions' => $userPermissions,
        ]);
    }
}
