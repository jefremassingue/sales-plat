<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class InventoryController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:admin-inventory.index', only: ['index']),
            new Middleware('permission:admin-inventory.create', only: ['create', 'store']),
            new Middleware('permission:admin-inventory.edit', only: ['edit', 'update']),
            new Middleware('permission:admin-inventory.show', only: ['show']),
            new Middleware('permission:admin-inventory.destroy', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Inventory::query()
            ->with('product', 'productVariant', 'warehouse');

        // Filtros
        if ($request->has('search') && $request->search !== null && trim($request->search) !== '') {
            $search = trim($request->search);
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('sku', 'like', '%' . $search . '%');
            })
                ->orWhereHas('warehouse', function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%');
                })
                // ->orWhere('location', 'like', '%' . $search . '%')
                ->orWhere('batch_number', 'like', '%' . $search . '%');
        }

        if ($request->has('product_id') && $request->product_id) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('warehouse_id') && $request->warehouse_id) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Ordenação
        $sortField = $request->input('sort_field', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');

        $allowedSortFields = ['quantity', 'min_quantity', 'batch_number', 'expiry_date', 'status', 'created_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortOrder);
        }

        $inventories = $query->paginate(15)->withQueryString();
        $products = Product::select('id', 'name', 'sku')->get();
        $warehouses = Warehouse::select('id', 'name')->get();

        return Inertia::render('Admin/Inventories/Index', [
            'inventories' => $inventories,
            'products' => $products,
            'warehouses' => $warehouses,
            'filters' => $request->only(['search', 'product_id', 'warehouse_id', 'status', 'sort_field', 'sort_order']),
            'statuses' => [
                ['value' => 'active', 'label' => 'Ativo'],
                ['value' => 'inactive', 'label' => 'Inativo'],
                ['value' => 'reserved', 'label' => 'Reservado'],
                ['value' => 'damaged', 'label' => 'Danificado'],
                ['value' => 'expired', 'label' => 'Expirado']
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $products = Product::select('id', 'name', 'sku')->with('variants')->get();
        $warehouses = Warehouse::select('id', 'name')->get();

        return Inertia::render('Admin/Inventories/Create', [
            'products' => $products,
            'warehouses' => $warehouses,
            'statuses' => [
                ['value' => 'active', 'label' => 'Ativo'],
                ['value' => 'inactive', 'label' => 'Inativo'],
                ['value' => 'reserved', 'label' => 'Reservado'],
                ['value' => 'damaged', 'label' => 'Danificado'],
                ['value' => 'expired', 'label' => 'Expirado']
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_id' => 'required|string|exists:products,id',
                'product_variant_id' => 'nullable|string|exists:product_variants,id',
                'warehouse_id' => 'required|string|exists:warehouses,id',
                'quantity' => 'required|integer|min:0',
                'min_quantity' => 'nullable|integer|min:0',
                'max_quantity' => 'nullable|integer|min:0',
                // 'location' => 'nullable|string|max:255',
                'batch_number' => 'nullable|string|max:255',
                'expiry_date' => 'nullable|date|after_or_equal:today',
                'unit_cost' => 'nullable|numeric|min:0',
                'status' => 'required|string|in:active,reserved,damaged,expired,inactive',
                'notes' => 'nullable|string',
            ], [
                'product_id.required' => 'O produto é obrigatório.',
                'product_id.exists' => 'O produto selecionado não existe.',
                'warehouse_id.required' => 'O armazém é obrigatório.',
                'warehouse_id.exists' => 'O armazém selecionado não existe.',
                'quantity.required' => 'A quantidade é obrigatória.',
                'quantity.integer' => 'A quantidade deve ser um número inteiro.',
                'quantity.min' => 'A quantidade não pode ser negativa.',
                'min_quantity.integer' => 'A quantidade mínima deve ser um número inteiro.',
                'min_quantity.min' => 'A quantidade mínima não pode ser negativa.',
                'max_quantity.integer' => 'A quantidade máxima deve ser um número inteiro.',
                'max_quantity.min' => 'A quantidade máxima não pode ser negativa.',
                'expiry_date.date' => 'A data de validade deve ser uma data válida.',
                'expiry_date.after_or_equal' => 'A data de validade deve ser igual ou posterior à data atual.',
                'unit_cost.numeric' => 'O custo unitário deve ser um valor numérico.',
                'unit_cost.min' => 'O custo unitário não pode ser negativo.',
                'status.required' => 'O estado é obrigatório.',
                'status.in' => 'O estado selecionado não é válido.',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();

            try {
                // Preparar os dados para criação
                $data = $request->all();
                $data['user_id'] = Auth::id(); // Registar o utilizador que criou o registo

                // Se não forneceu unit_cost, usar o preço padrão do produto
                if (empty($data['unit_cost'])) {
                    $product = Product::find($data['product_id']);
                    $productVariant = null;

                    if (!empty($data['product_variant_id'])) {
                        $productVariant = ProductVariant::find($data['product_variant_id']);
                    }

                    // Usar o preço da variante se disponível, caso contrário usar o preço do produto
                    if ($productVariant && $productVariant->price) {
                        $data['unit_cost'] = $productVariant->price;
                    } elseif ($product) {
                        $data['unit_cost'] = $product->price;
                    }
                }

                // Verificar se já existe um registo com o mesmo produto/variante e armazém
                $existingInventory = Inventory::where('product_id', $data['product_id'])
                    // ->where('product_variant_id', $data['product_variant_id'] ?? null)
                    ->where('warehouse_id', $data['warehouse_id'])
                    ->where('batch_number', $data['batch_number'] ?? null)
                    ->first();

                if ($existingInventory) {
                    // Se existir, atualizar a quantidade em vez de criar novo registo
                    $existingInventory->quantity += $data['quantity'];
                    $existingInventory->user_id = Auth::id();

                    // Atualizar o custo unitário se fornecido
                    if (!empty($data['unit_cost'])) {
                        $existingInventory->unit_cost = $data['unit_cost'];
                    }

                    $existingInventory->save();
                    $inventory = $existingInventory;
                } else {
                    // Criar novo registo de inventário
                    $inventory = Inventory::create($data);
                }

                DB::commit();

                return redirect()->route('admin.inventories.index')
                    ->with('success', 'Registo de inventário criado com sucesso!');
            } catch (\Exception $e) {
                DB::rollback();

                Log::error('Erro ao criar registo de inventário: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                    'request' => $request->all()
                ]);

                return redirect()->back()
                    ->withErrors(['general' => 'Ocorreu um erro ao criar o registo de inventário: ' . $e->getMessage()])
                    ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Erro na validação do inventário: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withErrors(['general' => 'Ocorreu um erro ao validar os dados: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Inventory $inventory)
    {
        try {
            // Carregar o inventário com relações
            $inventory->load(['product', 'productVariant', 'warehouse', 'user']);

            // Carregar os últimos 5 ajustes
            $recentAdjustments = $inventory->adjustments()
                ->with(['supplier', 'user'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            return Inertia::render('Admin/Inventories/Show', [
                'inventory' => $inventory,
                'recentAdjustments' => $recentAdjustments,
                'adjustmentTypes' => $this->getAdjustmentTypes(),
                'statuses' => [
                    ['value' => 'active', 'label' => 'Ativo'],
                    ['value' => 'reserved', 'label' => 'Reservado'],
                    ['value' => 'damaged', 'label' => 'Danificado'],
                    ['value' => 'expired', 'label' => 'Expirado']
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao visualizar registo de inventário: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Ocorreu um erro ao visualizar o registo de inventário: ' . $e->getMessage());
        }
    }

    /**
     * Obter lista de tipos de ajuste com traduções.
     *
     * @return array
     */
    private function getAdjustmentTypes()
    {
        return [
            ['value' => 'addition', 'label' => 'Adição', 'description' => 'Adicionar produtos ao inventário'],
            ['value' => 'subtraction', 'label' => 'Subtração', 'description' => 'Remover produtos do inventário'],
            ['value' => 'correction', 'label' => 'Correção', 'description' => 'Acertar quantidade do inventário'],
            ['value' => 'transfer', 'label' => 'Transferência', 'description' => 'Transferência entre armazéns'],
            ['value' => 'loss', 'label' => 'Perda', 'description' => 'Produtos perdidos ou danificados'],
            ['value' => 'damaged', 'label' => 'Danificado', 'description' => 'Produtos danificados'],
            ['value' => 'expired', 'label' => 'Expirado', 'description' => 'Produtos com prazo expirado'],
            ['value' => 'initial', 'label' => 'Estoque Inicial', 'description' => 'Contagem inicial de estoque'],
        ];
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Inventory $inventory)
    {

        $inventory->load(['product', 'productVariant', 'warehouse']);
        $products = Product::select('id', 'name', 'sku')->with('variants')->get();
        $warehouses = Warehouse::select('id', 'name')->get();

        return Inertia::render('Admin/Inventories/Edit', [
            'inventory' => $inventory,
            'products' => $products,
            'warehouses' => $warehouses,
            'statuses' => [
                ['value' => 'active', 'label' => 'Ativo'],
                ['value' => 'inactive', 'label' => 'Inativo'],
                ['value' => 'reserved', 'label' => 'Reservado'],
                ['value' => 'damaged', 'label' => 'Danificado'],
                ['value' => 'expired', 'label' => 'Expirado']
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Inventory $inventory)
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_id' => 'required|exists:products,id',
                'product_variant_id' => 'nullable|exists:product_variants,id',
                'warehouse_id' => 'required|exists:warehouses,id',
                'quantity' => 'required|integer|min:0',
                'min_quantity' => 'nullable|integer|min:0',
                'max_quantity' => 'nullable|integer|min:0',
                // 'location' => 'nullable|string|max:255',
                'batch_number' => 'nullable|string|max:255',
                'expiry_date' => 'nullable|date',
                'unit_cost' => 'nullable|numeric|min:0',
                'status' => 'required|string|in:active,reserved,damaged,expired,inactive',
                'notes' => 'nullable|string',
            ], [
                'product_id.required' => 'O produto é obrigatório.',
                'product_id.exists' => 'O produto selecionado não existe.',
                'warehouse_id.required' => 'O armazém é obrigatório.',
                'warehouse_id.exists' => 'O armazém selecionado não existe.',
                'quantity.required' => 'A quantidade é obrigatória.',
                'quantity.integer' => 'A quantidade deve ser um número inteiro.',
                'quantity.min' => 'A quantidade não pode ser negativa.',
                'min_quantity.integer' => 'A quantidade mínima deve ser um número inteiro.',
                'min_quantity.min' => 'A quantidade mínima não pode ser negativa.',
                'max_quantity.integer' => 'A quantidade máxima deve ser um número inteiro.',
                'max_quantity.min' => 'A quantidade máxima não pode ser negativa.',
                'expiry_date.date' => 'A data de validade deve ser uma data válida.',
                'unit_cost.numeric' => 'O custo unitário deve ser um valor numérico.',
                'unit_cost.min' => 'O custo unitário não pode ser negativo.',
                'status.required' => 'O estado é obrigatório.',
                'status.in' => 'O estado selecionado não é válido.',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();

            try {
                // Verificar se está a tentar alterar para uma combinação já existente de produto/variante e armazém
                if (
                    $inventory->product_id != $request->product_id ||
                    $inventory->product_variant_id != $request->product_variant_id ||
                    $inventory->warehouse_id != $request->warehouse_id ||
                    $inventory->batch_number != $request->batch_number
                ) {

                    $existingInventory = Inventory::where('product_id', $request->product_id)
                        // ->where('product_variant_id', $request->product_variant_id)
                        ->where('warehouse_id', $request->warehouse_id)
                        ->where('batch_number', $request->batch_number)
                        ->where('id', '!=', $inventory->id)
                        ->first();

                    if ($existingInventory) {
                        return redirect()->back()
                            ->withErrors(['conflict' => 'Já existe um registo de inventário para esta combinação de produto/variante e armazém.'])
                            ->withInput();
                    }
                }

                // Verificar se houve alteração na quantidade para registar um ajuste
                $oldQuantity = $inventory->quantity;
                $newQuantity = $request->input('quantity');

                // Preparar os dados para atualização
                $data = $request->all();
                $data['user_id'] = Auth::id(); // Registar o utilizador que atualizou o registo

                // Atualizar o registo de inventário
                $inventory->update($data);

                // Se a quantidade foi alterada, criar um ajuste automático
                if ($oldQuantity != $newQuantity) {
                    $quantityDifference = $newQuantity - $oldQuantity;
                    $adjustmentType = $quantityDifference > 0 ? 'addition' : 'correction';

                    // Criar o ajuste
                    $adjustment = new \App\Models\InventoryAdjustment([
                        'inventory_id' => $inventory->id,
                        'quantity' => $quantityDifference,
                        'type' => $adjustmentType,
                        'reference_number' => null,
                        'supplier_id' => null,
                        'reason' => 'Ajuste automático devido a edição manual do inventário',
                        'notes' => 'Este ajuste foi gerado automaticamente pelo sistema quando a quantidade foi alterada de ' .
                            $oldQuantity . ' para ' . $newQuantity . ' na edição do inventário.',
                        'user_id' => Auth::id(),
                    ]);

                    $adjustment->save();
                }

                DB::commit();

                return redirect()->route('admin.inventories.index')
                    ->with('success', 'Registo de inventário atualizado com sucesso!');
            } catch (\Exception $e) {
                DB::rollback();

                Log::error('Erro ao atualizar registo de inventário: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                    'request' => $request->all()
                ]);

                return redirect()->back()
                    ->withErrors(['general' => 'Ocorreu um erro ao atualizar o registo de inventário: ' . $e->getMessage()])
                    ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Erro na validação do inventário: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withErrors(['general' => 'Ocorreu um erro ao validar os dados: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inventory $inventory)
    {
        try {
            DB::beginTransaction();

            // Excluir o registo de inventário
            $inventory->delete();

            DB::commit();

            return redirect()->route('admin.inventories.index')
                ->with('success', 'Registo de inventário eliminado com sucesso!');
        } catch (\Exception $e) {
            DB::rollback();

            Log::error('Erro ao eliminar registo de inventário: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao eliminar o registo de inventário: ' . $e->getMessage());
        }
    }

    /**
     * Obter variantes de um produto específico.
     */
    public function getVariants(Request $request)
    {
        try {
            $productId = $request->input('product_id');

            if (!$productId) {
                return response()->json(['variants' => []]);
            }

            $variants = ProductVariant::where('product_id', $productId)
                ->with(['color', 'size'])
                ->get()
                ->map(function ($variant) {
                    $name = '';

                    if ($variant->color) {
                        $name .= $variant->color->name;
                    }

                    if ($variant->size) {
                        $name .= $name ? ' / ' . $variant->size->name : $variant->size->name;
                    }

                    if (!$name) {
                        $name = 'Variante ' . $variant->id;
                    }

                    return [
                        'id' => $variant->id,
                        'name' => $name,
                        'sku' => $variant->sku
                    ];
                });

            return response()->json(['variants' => $variants]);
        } catch (\Exception $e) {
            Log::error('Erro ao carregar variantes: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['error' => 'Ocorreu um erro ao carregar as variantes.'], 500);
        }
    }
}
