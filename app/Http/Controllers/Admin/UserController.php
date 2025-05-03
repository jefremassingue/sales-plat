<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Filtro de busca
        if ($request->has('search') && $request->search !== null && trim($request->search) !== '') {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        // Filtro por função
        if ($request->has('role') && $request->role !== null && trim($request->role) !== '') {
            $roleId = trim($request->role);
            $query->whereHas('roles', function ($q) use ($roleId) {
                $q->where('roles.id', $roleId);
            });
        }

        // Ordenação
        $sortField = $request->input('sort_field', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortField, $sortOrder);

        // Incluir funções relacionadas
        $query->with('roles:id,name,guard_name');

        // Paginação
        $users = $query->paginate(10)->withQueryString();

        // Obter todas as funções para o filtro
        $roles = Role::orderBy('name')->get(['id', 'name', 'guard_name']);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role', 'sort_field', 'sort_order']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Obter todas as funções disponíveis
        $roles = Role::orderBy('name')->get();

        return Inertia::render('Admin/Users/Create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Validar os dados do utilizador
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
                'roles' => 'required|array',
                'roles.*' => 'exists:roles,id',
            ], [
                'name.required' => 'O nome é obrigatório',
                'email.required' => 'O email é obrigatório',
                'email.email' => 'O email deve ser válido',
                'email.unique' => 'Este email já está em uso',
                'password.required' => 'A senha é obrigatória',
                'password.confirmed' => 'A confirmação da senha não corresponde',
                'roles.required' => 'Deve selecionar pelo menos uma função',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();

            // Criar o utilizador
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Atribuir funções ao utilizador
            $user->assignRole($request->roles);

            DB::commit();

            return redirect()->route('admin.users.index')
                ->with('success', 'Utilizador criado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao criar o utilizador: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        // Carregar as funções relacionadas
        $user->load('roles');

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        // Obter todas as funções disponíveis
        $roles = Role::orderBy('name')->get();

        // Obter IDs das funções atualmente atribuídas ao utilizador
        $userRoles = $user->roles->pluck('id')->toArray();

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'roles' => $roles,
            'userRoles' => $userRoles,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        try {
            // Regras de validação
            $rules = [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
                'roles' => 'required|array',
                'roles.*' => 'exists:roles,id',
            ];

            // Adicionar validação de senha apenas se foi fornecida
            if ($request->filled('password')) {
                $rules['password'] = ['required', 'confirmed', Rules\Password::defaults()];
            }

            // Validar os dados
            $validator = Validator::make($request->all(), $rules, [
                'name.required' => 'O nome é obrigatório',
                'email.required' => 'O email é obrigatório',
                'email.email' => 'O email deve ser válido',
                'email.unique' => 'Este email já está em uso',
                'password.confirmed' => 'A confirmação da senha não corresponde',
                'roles.required' => 'Deve selecionar pelo menos uma função',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();

            // Preparar dados para atualização
            $userData = [
                'name' => $request->name,
                'email' => $request->email,
            ];

            // Atualizar senha apenas se foi fornecida
            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }

            // Atualizar o utilizador
            $user->update($userData);

            // Sincronizar funções
            $user->syncRoles($request->roles);

            DB::commit();

            return redirect()->route('admin.users.index')
                ->with('success', 'Utilizador atualizado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao atualizar o utilizador: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        try {
            // Verificar se está a tentar eliminar a si mesmo (utilizador atual)
            if ($user->id === auth()->id()) {
                throw new \Exception('Não pode eliminar o seu próprio utilizador.');
            }

            DB::beginTransaction();

            // Remover o utilizador
            $user->delete();

            DB::commit();

            return redirect()->route('admin.users.index')
                ->with('success', 'Utilizador eliminado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao eliminar o utilizador: ' . $e->getMessage());
        }
    }

    /**
     * Pesquisar utilizadores pelo termo.
     */
    public function search(Request $request)
    {
        try {
            $term = $request->input('term');

            if (empty($term) || strlen($term) < 2) {
                return response()->json([]);
            }

            $users = User::where('name', 'like', "%{$term}%")
                ->orWhere('email', 'like', "%{$term}%")
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->limit(10)
                ->get();

            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Ocorreu um erro ao pesquisar utilizadores'], 500);
        }
    }

    /**
     * Obter informações de um utilizador específico.
     */
    public function getUser($id)
    {
        try {
            $user = User::where('id', $id)
                ->select('id', 'name', 'email')
                ->first();

            if (!$user) {
                return response()->json(['error' => 'Utilizador não encontrado'], 404);
            }

            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Ocorreu um erro ao obter o utilizador'], 500);
        }
    }
}
