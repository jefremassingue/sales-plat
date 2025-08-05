<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class WarehouseController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:admin-warehouse.index', only: ['index']),
            new Middleware('permission:admin-warehouse.create', only: ['create', 'store']),
            new Middleware('permission:admin-warehouse.edit', only: ['edit', 'update']),
            new Middleware('permission:admin-warehouse.show', only: ['show']),
            new Middleware('permission:admin-warehouse.destroy', only: ['destroy']),
        ];
    }

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
        // Obter todos os utilizadores para listar como possíveis gestores
        $users = User::orderBy('name')->select('id', 'name', 'email')->get();

        return Inertia::render('Admin/Warehouses/Create', [
            'users' => $users,
            'hasMainWarehouse' => Warehouse::where('is_main', true)->exists(),
        ]);
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

            // Obter estatísticas de inventário
            $inventoryStats = DB::table('inventories')
                ->select(
                    DB::raw('COUNT(DISTINCT product_id) as total_products'),
                    DB::raw('SUM(quantity) as total_items'),
                    DB::raw('COUNT(*) as total_records'),
                    DB::raw('SUM(quantity * IFNULL(unit_cost, 0)) as total_value')
                )
                ->where('warehouse_id', $warehouse->id)
                ->first();

            // Obter resumo dos produtos em stock no armazém
            $inventoryItems = Inventory::where('warehouse_id', $warehouse->id)
                ->with(['product:id,name,sku,price', 'productVariant:id,product_id,sku'])
                ->orderBy('quantity', 'desc')
                ->take(10) // Limitar a 10 produtos mais vendidos para não sobrecarregar
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'product_name' => $item->product->name,
                        'sku' => $item->product->sku ?? ($item->productVariant->sku ?? 'N/A'),
                        'variant_id' => $item->product_variant_id,
                        'variant_name' => $item->productVariant ? $item->productVariant->name : null,
                        'quantity' => $item->quantity,
                        'min_quantity' => $item->min_quantity,
                        'location' => $item->location,
                        'status' => $item->status,
                        'unit_cost' => $item->unit_cost ?? $item->product->price, // Incluindo preço do produto como fallback
                        'product_price' => $item->product->price, // Adicionando preço do produto
                    ];
                });

            // Obter produtos com estoque baixo (abaixo do mínimo)
            $lowStockCount = Inventory::where('warehouse_id', $warehouse->id)
                ->whereRaw('quantity < min_quantity')
                ->where('min_quantity', '>', 0)
                ->count();

            // Obter dados para gráficos ou visualizações (exemplo simplificado)
            $inventoryByStatus = Inventory::where('warehouse_id', $warehouse->id)
                ->select('status', DB::raw('COUNT(*) as count'), DB::raw('SUM(quantity) as total_quantity'))
                ->groupBy('status')
                ->get();

            return Inertia::render('Admin/Warehouses/Show', [
                'warehouse' => $warehouse,
                'inventoryStats' => [
                    'totalProducts' => $inventoryStats->total_products ?? 0,
                    'totalItems' => $inventoryStats->total_items ?? 0,
                    'totalRecords' => $inventoryStats->total_records ?? 0,
                    'totalValue' => $inventoryStats->total_value ?? 0,
                    'lowStockCount' => $lowStockCount,
                ],
                'inventoryItems' => $inventoryItems,
                'inventoryByStatus' => $inventoryByStatus,
            ]);
        } catch (\Exception $e) {
            return redirect()->route('admin.warehouses.index')
                ->with('error', 'Ocorreu um erro ao visualizar o armazém: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Warehouse $warehouse)
    {
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
