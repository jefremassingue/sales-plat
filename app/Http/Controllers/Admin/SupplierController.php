<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class SupplierController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:admin-supplier.index', only: ['index']),
            new Middleware('permission:admin-supplier.create', only: ['create', 'store']),
            new Middleware('permission:admin-supplier.edit', only: ['edit', 'update']),
            new Middleware('permission:admin-supplier.show', only: ['show']),
            new Middleware('permission:admin-supplier.destroy', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Supplier::query();

        // Filtro de busca
        if ($request->has('search') && $request->search !== null && trim($request->search) !== '') {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('company_name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%')
                    ->orWhere('tax_id', 'like', '%' . $search . '%')
                    ->orWhere('phone', 'like', '%' . $search . '%')
                    ->orWhere('mobile', 'like', '%' . $search . '%');
            });
        }

        // Filtro de tipo de fornecedor
        if ($request->has('supplier_type') && $request->supplier_type !== null) {
            $query->where('supplier_type', $request->supplier_type);
        }

        // Filtro de estado (ativo/inativo)
        if ($request->has('active') && $request->active !== null) {
            $query->where('active', $request->active === 'true');
        }

        // Ordenação
        $sortField = $request->input('sort_field', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortField, $sortOrder);

        // Incluir o utilizador associado, se existir
        $query->with('user:id,name,email');

        // Paginação
        $suppliers = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters' => $request->only(['search', 'supplier_type', 'active', 'sort_field', 'sort_order']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            return Inertia::render('Admin/Suppliers/Create');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Ocorreu um erro ao carregar o formulário: ' . $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validar os dados do fornecedor
        $validator = Validator::make($request->all(), [
            // Informações principais do fornecedor
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'supplier_type' => ['required', Rule::in(['products', 'services', 'both'])],
            'active' => 'boolean',

            // Endereço
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'billing_address' => 'nullable|string|max:255',

            // Informações bancárias
            'bank_name' => 'nullable|string|max:255',
            'bank_account' => 'nullable|string|max:50',
            'bank_branch' => 'nullable|string|max:50',

            // Informações adicionais
            'contact_person' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'payment_terms' => 'nullable|string|max:255',
            'credit_limit' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',

            // Dados do utilizador (opcional)
            'connect_user' => 'boolean',
            'user_id' => 'nullable|exists:users,id|required_if:connect_user,true',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Dados para criar o fornecedor
            $supplierData = $request->except(['connect_user', 'user_id']);

            // Se a opção de associar utilizador estiver marcada
            if ($request->connect_user && $request->user_id) {
                // Verificar se o utilizador existe
                $user = User::find($request->user_id);
                if (!$user) {
                    throw new \Exception('O utilizador selecionado não existe.');
                }

                // Adicionar ID do utilizador aos dados do fornecedor
                $supplierData['user_id'] = $user->id;
            }

            // Criar o fornecedor
            $supplier = Supplier::create($supplierData);

            DB::commit();

            return redirect()->route('admin.suppliers.index')
                ->with('success', 'Fornecedor criado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao criar o fornecedor: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Supplier $supplier)
    {
        // Carregar o utilizador associado, se existir
        $supplier->load('user:id,name,email');

        return Inertia::render('Admin/Suppliers/Show', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Supplier $supplier)
    {
        // Carregar o utilizador associado, se existir
        $supplier->load('user:id,name,email');

        return Inertia::render('Admin/Suppliers/Edit', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Supplier $supplier)
    {
        // Validar os dados do fornecedor
        $validator = Validator::make($request->all(), [
            // Informações principais do fornecedor
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'supplier_type' => ['required', Rule::in(['products', 'services', 'both'])],
            'active' => 'boolean',

            // Endereço
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'billing_address' => 'nullable|string|max:255',

            // Informações bancárias
            'bank_name' => 'nullable|string|max:255',
            'bank_account' => 'nullable|string|max:50',
            'bank_branch' => 'nullable|string|max:50',

            // Informações adicionais
            'contact_person' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'payment_terms' => 'nullable|string|max:255',
            'credit_limit' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',

            // Dados do utilizador (opcional)
            'connect_user' => 'boolean',
            'user_id' => 'nullable|exists:users,id|required_if:connect_user,true',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Dados para atualizar o fornecedor
            $supplierData = $request->except(['connect_user', 'user_id']);

            // Atualizar associação de utilizador
            if ($request->connect_user) {
                // Se solicitou conectar a um utilizador
                if ($request->user_id) {
                    // Verificar se o utilizador existe
                    $user = User::find($request->user_id);
                    if (!$user) {
                        throw new \Exception('O utilizador selecionado não existe.');
                    }
                    $supplierData['user_id'] = $user->id;
                }
            } else {
                // Se não solicitou conectar a utilizador, remover a associação
                $supplierData['user_id'] = null;
            }

            // Atualizar o fornecedor
            $supplier->update($supplierData);

            DB::commit();

            return redirect()->route('admin.suppliers.index')
                ->with('success', 'Fornecedor atualizado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao atualizar o fornecedor: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        try {
            DB::beginTransaction();

            // Não remove o utilizador associado, apenas o fornecedor
            $supplier->delete();

            DB::commit();

            return redirect()->route('admin.suppliers.index')
                ->with('success', 'Fornecedor eliminado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao eliminar o fornecedor: ' . $e->getMessage());
        }
    }

    /**
     * Pesquisar utilizadores pelo termo.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function searchUsers(Request $request)
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
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
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
