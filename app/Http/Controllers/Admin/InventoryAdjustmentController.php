<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\InventoryAdjustment;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class InventoryAdjustmentController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:admin-inventoryadjustment.index', only: ['index']),
            new Middleware('permission:admin-inventoryadjustment.create', only: ['create', 'store']),
            new Middleware('permission:admin-inventoryadjustment.edit', only: ['edit', 'update']),
            new Middleware('permission:admin-inventoryadjustment.show', only: ['show']),
            new Middleware('permission:admin-inventoryadjustment.destroy', only: ['destroy']),
        ];
    }

    /**
     * Mostrar a lista de ajustes para um item específico do inventário.
     *
     * @param  \App\Models\Inventory  $inventory
     * @return \Inertia\Response
     */
    public function index(Request $request, Inventory $inventory)
    {
        try {
            $inventory->load(['product', 'productVariant', 'warehouse']);

            $query = $inventory->adjustments()
                ->with(['supplier', 'user'])
                ->orderBy('created_at', 'desc');

            // Aplicar filtros
            if ($request->has('type') && $request->type !== null) {
                $query->where('type', $request->type);
            }

            if ($request->has('supplier_id') && $request->supplier_id !== null) {
                $query->where('supplier_id', $request->supplier_id);
            }

            // Paginação
            $adjustments = $query->paginate(10)->withQueryString();

            // Lista de fornecedores para o filtro
            $suppliers = Supplier::select('id', 'name', 'company_name')->orderBy('name')->get();

            return Inertia::render('Admin/Inventories/Adjustments/Index', [
                'inventory' => $inventory,
                'adjustments' => $adjustments,
                'suppliers' => $suppliers,
                'adjustmentTypes' => $this->getAdjustmentTypes(),
                'filters' => $request->only(['type', 'supplier_id']),
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao listar ajustes de inventário: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Ocorreu um erro ao carregar os ajustes: ' . $e->getMessage());
        }
    }

    /**
     * Mostrar o formulário para criar um novo ajuste.
     *
     * @param  \App\Models\Inventory  $inventory
     * @return \Inertia\Response
     */
    public function create(Inventory $inventory)
    {
        try {
            $inventory->load(['product', 'productVariant', 'warehouse']);

            // Lista de fornecedores para o select
            $suppliers = Supplier::select('id', 'name', 'company_name')
                ->orderBy('name')
                ->get()
                ->map(function ($supplier) {
                    return [
                        'id' => $supplier->id,
                        'name' => $supplier->company_name
                            ? $supplier->name . ' (' . $supplier->company_name . ')'
                            : $supplier->name
                    ];
                });

            return Inertia::render('Admin/Inventories/Adjustments/Create', [
                'inventory' => $inventory,
                'suppliers' => $suppliers,
                'adjustmentTypes' => $this->getAdjustmentTypes(),
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao mostrar formulário de ajuste de inventário: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Ocorreu um erro ao carregar o formulário: ' . $e->getMessage());
        }
    }

    /**
     * Armazenar um novo ajuste de inventário.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Inventory  $inventory
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request, Inventory $inventory)
    {
        try {
            $validator = Validator::make($request->all(), [
                'quantity' => ['required', 'numeric', 'not_in:0'],
                'type' => ['required', 'string', 'max:255', 'in:addition,subtraction,correction,transfer,loss,damaged,expired,initial'],
                'reference_number' => ['nullable', 'string', 'max:255'],
                'supplier_id' => ['nullable', 'exists:suppliers,id'],
                'reason' => ['nullable', 'string', 'max:1000'],
                'notes' => ['nullable', 'string', 'max:1000'],
            ], [
                'quantity.required' => 'A quantidade é obrigatória.',
                'quantity.numeric' => 'A quantidade deve ser um número.',
                'quantity.not_in' => 'A quantidade não pode ser zero.',
                'type.required' => 'O tipo de ajuste é obrigatório.',
                'type.in' => 'O tipo de ajuste selecionado não é válido.',
                'supplier_id.exists' => 'O fornecedor selecionado não existe.',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();

            try {
                // Transformar quantidade em positiva ou negativa com base no tipo de ajuste
                $adjustmentQuantity = abs($request->quantity);
                if (in_array($request->type, ['subtraction', 'transfer', 'loss', 'damaged', 'expired'])) {
                    $adjustmentQuantity = -$adjustmentQuantity;

                    // Verificar se há estoque suficiente
                    if (($inventory->quantity + $adjustmentQuantity) < 0) {
                        return redirect()->back()
                            ->withErrors(['quantity' => 'Quantidade insuficiente em estoque para este ajuste.'])
                            ->withInput();
                    }
                }

                // Criar o ajuste
                $adjustment = new InventoryAdjustment([
                    'inventory_id' => $inventory->id,
                    'quantity' => $adjustmentQuantity,
                    'type' => $request->type,
                    'reference_number' => $request->reference_number,
                    'supplier_id' => $request->supplier_id,
                    'reason' => $request->reason,
                    'notes' => $request->notes,
                    'user_id' => Auth::id(),
                ]);

                $adjustment->save();

                // Atualizar quantidade no inventário
                $inventory->quantity += $adjustmentQuantity;
                $inventory->save();

                DB::commit();

                return redirect()->route('admin.inventories.adjustments.index', $inventory->id)
                    ->with('success', 'Ajuste de inventário realizado com sucesso!');
            } catch (\Exception $e) {
                DB::rollback();

                Log::error('Erro ao criar ajuste de inventário: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                    'request' => $request->all()
                ]);

                return redirect()->back()
                    ->withErrors(['general' => 'Ocorreu um erro ao processar o ajuste: ' . $e->getMessage()])
                    ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Erro na validação do ajuste de inventário: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withErrors(['general' => 'Ocorreu um erro ao validar os dados: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Exibir detalhes de um ajuste específico.
     *
     * @param  \App\Models\Inventory  $inventory
     * @param  \App\Models\InventoryAdjustment  $adjustment
     * @return \Inertia\Response
     */
    public function show(Inventory $inventory, InventoryAdjustment $adjustment)
    {
        try {
            // Verificar se o ajuste pertence ao inventário especificado
            if ($adjustment->inventory_id !== $inventory->id) {
                return redirect()->route('admin.inventories.adjustments.index', $inventory->id)
                    ->with('error', 'O ajuste solicitado não pertence a este item do inventário.');
            }

            $adjustment->load(['supplier', 'user']);
            $inventory->load(['product', 'productVariant', 'warehouse']);

            return Inertia::render('Admin/Inventories/Adjustments/Show', [
                'inventory' => $inventory,
                'adjustment' => $adjustment,
                'adjustmentTypes' => $this->getAdjustmentTypes(),
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao mostrar detalhes do ajuste de inventário: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Ocorreu um erro ao carregar os detalhes do ajuste: ' . $e->getMessage());
        }
    }

    /**
     * Mostrar formulário de edição de um ajuste.
     *
     * @param  \App\Models\Inventory  $inventory
     * @param  \App\Models\InventoryAdjustment  $adjustment
     * @return \Inertia\Response
     */
    public function edit(Inventory $inventory, InventoryAdjustment $adjustment)
    {
        try {
            // Verificar se o ajuste pertence ao inventário especificado
            if ($adjustment->inventory_id !== $inventory->id) {
                return redirect()->route('admin.inventories.adjustments.index', $inventory->id)
                    ->with('error', 'O ajuste solicitado não pertence a este item do inventário.');
            }

            $inventory->load(['product', 'productVariant', 'warehouse']);
            $adjustment->load('supplier');

            // Lista de fornecedores para o select
            $suppliers = Supplier::select('id', 'name', 'company_name')
                ->orderBy('name')
                ->get()
                ->map(function ($supplier) {
                    return [
                        'id' => $supplier->id,
                        'name' => $supplier->company_name
                            ? $supplier->name . ' (' . $supplier->company_name . ')'
                            : $supplier->name
                    ];
                });

            return Inertia::render('Admin/Inventories/Adjustments/Edit', [
                'inventory' => $inventory,
                'adjustment' => $adjustment,
                'suppliers' => $suppliers,
                'adjustmentTypes' => $this->getAdjustmentTypes(),
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao mostrar formulário de edição de ajuste: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Ocorreu um erro ao carregar o formulário de edição: ' . $e->getMessage());
        }
    }

    /**
     * Atualizar um ajuste existente.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Inventory  $inventory
     * @param  \App\Models\InventoryAdjustment  $adjustment
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Inventory $inventory, InventoryAdjustment $adjustment)
    {
        try {
            // Verificar se o ajuste pertence ao inventário especificado
            if ($adjustment->inventory_id !== $inventory->id) {
                return redirect()->route('admin.inventories.adjustments.index', $inventory->id)
                    ->with('error', 'O ajuste solicitado não pertence a este item do inventário.');
            }

            $validator = Validator::make($request->all(), [
                'reference_number' => ['nullable', 'string', 'max:255'],
                'supplier_id' => ['nullable', 'exists:suppliers,id'],
                'reason' => ['nullable', 'string', 'max:1000'],
                'notes' => ['nullable', 'string', 'max:1000'],
            ], [
                'supplier_id.exists' => 'O fornecedor selecionado não existe.',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();

            try {
                // Atualizar apenas os campos permitidos (não permitimos alterar quantidade ou tipo)
                $adjustment->reference_number = $request->reference_number;
                $adjustment->supplier_id = $request->supplier_id;
                $adjustment->reason = $request->reason;
                $adjustment->notes = $request->notes;
                $adjustment->save();

                DB::commit();

                return redirect()->route('admin.inventories.adjustments.index', $inventory->id)
                    ->with('success', 'Ajuste de inventário atualizado com sucesso!');
            } catch (\Exception $e) {
                DB::rollback();

                Log::error('Erro ao atualizar ajuste de inventário: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                    'request' => $request->all()
                ]);

                return redirect()->back()
                    ->withErrors(['general' => 'Ocorreu um erro ao atualizar o ajuste: ' . $e->getMessage()])
                    ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Erro na validação da atualização do ajuste: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withErrors(['general' => 'Ocorreu um erro ao validar os dados: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remover um ajuste de inventário.
     * Nota: Normalmente não permitimos excluir ajustes em sistemas de inventário reais,
     * mas para fins didáticos, permitimos aqui com reversão da quantidade.
     *
     * @param  \App\Models\Inventory  $inventory
     * @param  \App\Models\InventoryAdjustment  $adjustment
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Inventory $inventory, InventoryAdjustment $adjustment)
    {
        try {
            // Verificar se o ajuste pertence ao inventário especificado
            if ($adjustment->inventory_id !== $inventory->id) {
                return redirect()->route('admin.inventories.adjustments.index', $inventory->id)
                    ->with('error', 'O ajuste solicitado não pertence a este item do inventário.');
            }

            DB::beginTransaction();

            try {
                // Reverter a quantidade do inventário (subtrair o que foi adicionado ou adicionar o que foi subtraído)
                $inventory->quantity -= $adjustment->quantity;
                $inventory->save();

                // Excluir o ajuste
                $adjustment->delete();

                DB::commit();

                return redirect()->route('admin.inventories.adjustments.index', $inventory->id)
                    ->with('success', 'Ajuste de inventário excluído com sucesso e quantidade revertida.');
            } catch (\Exception $e) {
                DB::rollback();

                Log::error('Erro ao excluir ajuste de inventário: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString()
                ]);

                return redirect()->back()
                    ->with('error', 'Ocorreu um erro ao excluir o ajuste: ' . $e->getMessage());
            }
        } catch (\Exception $e) {
            Log::error('Erro ao processar exclusão de ajuste de inventário: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao processar a exclusão: ' . $e->getMessage());
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
}
