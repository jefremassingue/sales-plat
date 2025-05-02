<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
            $query = Warehouse::query();

            // Filtro de busca
            if ($request->has('search') && $request->search !== null && trim($request->search) !== '') {
                $search = trim($request->search);
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                      ->orWhere('code', 'like', '%' . $search . '%')
                      ->orWhere('email', 'like', '%' . $search . '%')
                      ->orWhere('phone', 'like', '%' . $search . '%')
                      ->orWhere('city', 'like', '%' . $search . '%');
                });
            }

            // Filtro por estado (ativo/inativo)
            if ($request->has('active') && $request->active !== null) {
                $query->where('active', $request->active === 'true');
            }

            // Filtro por principal
            if ($request->has('is_main') && $request->is_main !== null) {
                $query->where('is_main', $request->is_main === 'true');
            }

            // Ordenação
            $sortField = $request->input('sort_field', 'name');
            $sortOrder = $request->input('sort_order', 'asc');
            $query->orderBy($sortField, $sortOrder);

            // Incluir o gestor associado, se existir
            $query->with('manager:id,name,email');

            // Paginação
            $warehouses = $query->paginate(10)->withQueryString();

            return Inertia::render('Admin/Warehouses/Index', [
                'warehouses' => $warehouses,
                'filters' => $request->only(['search', 'active', 'is_main', 'sort_field', 'sort_order']),
            ]);

    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            // Obter todos os utilizadores para listar como possíveis gestores
            $users = User::orderBy('name')->select('id', 'name', 'email')->get();

            return Inertia::render('Admin/Warehouses/Create', [
                'users' => $users,
                'hasMainWarehouse' => Warehouse::where('is_main', true)->exists(),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Ocorreu um erro ao carregar o formulário: ' . $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Validar os dados do armazém
            $validator = Validator::make($request->all(), [
                // Informações principais do armazém
                'name' => 'required|string|max:255',
                'code' => 'nullable|string|max:50|unique:warehouses',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'active' => 'boolean',
                'is_main' => 'boolean',
                'manager_id' => 'nullable|exists:users,id',

                // Endereço
                'address' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:100',
                'province' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'country' => 'nullable|string|max:100',

                // Informações adicionais
                'description' => 'nullable|string',
            ], [
                'name.required' => 'O nome do armazém é obrigatório',
                'code.unique' => 'Este código já está em uso por outro armazém',
                'email.email' => 'O email deve ser um endereço válido',
                'manager_id.exists' => 'O gestor selecionado não existe',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();

            // Se o armazém for definido como principal, atualizar os outros para não principal
            if ($request->is_main) {
                Warehouse::where('is_main', true)->update(['is_main' => false]);
            }

            // Criar o armazém
            $warehouse = Warehouse::create($request->all());

            DB::commit();

            return redirect()->route('admin.warehouses.index')
                ->with('success', 'Armazém criado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao criar o armazém: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Warehouse $warehouse)
    {
        try {
            // Carregar o gestor associado, se existir
            $warehouse->load('manager:id,name,email');

            // Obter contagem de produtos no armazém
            $productCount = 0; #$warehouse->products()->count();

            return Inertia::render('Admin/Warehouses/Show', [
                'warehouse' => $warehouse,
                'productCount' => $productCount,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Ocorreu um erro ao mostrar os detalhes do armazém: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Warehouse $warehouse)
    {
        try {
            // Carregar o gestor associado, se existir
            $warehouse->load('manager:id,name,email');

            // Obter todos os utilizadores para listar como possíveis gestores
            $users = User::orderBy('name')->select('id', 'name', 'email')->get();

            // Verificar se existe algum armazém principal além deste
            $hasOtherMainWarehouse = false;
            if (!$warehouse->is_main) {
                $hasOtherMainWarehouse = Warehouse::where('is_main', true)->exists();
            }

            return Inertia::render('Admin/Warehouses/Edit', [
                'warehouse' => $warehouse,
                'users' => $users,
                'hasOtherMainWarehouse' => $hasOtherMainWarehouse,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Ocorreu um erro ao carregar o formulário de edição: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Warehouse $warehouse)
    {
        try {
            // Validar os dados do armazém
            $validator = Validator::make($request->all(), [
                // Informações principais do armazém
                'name' => 'required|string|max:255',
                'code' => 'nullable|string|max:50|unique:warehouses,code,' . $warehouse->id,
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'active' => 'boolean',
                'is_main' => 'boolean',
                'manager_id' => 'nullable|exists:users,id',

                // Endereço
                'address' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:100',
                'province' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'country' => 'nullable|string|max:100',

                // Informações adicionais
                'description' => 'nullable|string',
            ], [
                'name.required' => 'O nome do armazém é obrigatório',
                'code.unique' => 'Este código já está em uso por outro armazém',
                'email.email' => 'O email deve ser um endereço válido',
                'manager_id.exists' => 'O gestor selecionado não existe',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();

            // Se o armazém for definido como principal, atualizar os outros para não principal
            if ($request->is_main && !$warehouse->is_main) {
                Warehouse::where('is_main', true)->where('id', '!=', $warehouse->id)->update(['is_main' => false]);
            }

            // Atualizar o armazém
            $warehouse->update($request->all());

            DB::commit();

            return redirect()->route('admin.warehouses.index')
                ->with('success', 'Armazém atualizado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao atualizar o armazém: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Warehouse $warehouse)
    {
        try {
            DB::beginTransaction();

            // Verificar se o armazém tem produtos associados
            if ($warehouse->products()->count() > 0) {
                throw new \Exception('Não é possível eliminar um armazém com produtos associados.');
            }

            // Eliminar o armazém
            $warehouse->delete();

            DB::commit();

            return redirect()->route('admin.warehouses.index')
                ->with('success', 'Armazém eliminado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao eliminar o armazém: ' . $e->getMessage());
        }
    }
}
