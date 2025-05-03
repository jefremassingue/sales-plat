<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\InventoryAdjustment;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class InventoryAdjustmentController extends Controller
{
    /**
     * Tipos de ajuste de inventário disponíveis
     */
    protected function getAdjustmentTypes()
    {
        return [
            [
                'value' => 'addition',
                'label' => 'Adição',
                'description' => 'Adicionar itens ao inventário (ex: recebimento de mercadoria).',
            ],
            [
                'value' => 'subtraction',
                'label' => 'Subtração',
                'description' => 'Remover itens do inventário (ex: vendas, envios).',
            ],
            [
                'value' => 'correction',
                'label' => 'Correção',
                'description' => 'Corrigir a quantidade de inventário após contagem física.',
            ],
            [
                'value' => 'transfer',
                'label' => 'Transferência',
                'description' => 'Transferir itens para outro armazém ou localização.',
            ],
            [
                'value' => 'loss',
                'label' => 'Perda',
                'description' => 'Registar perda de itens (ex: itens perdidos, roubados).',
            ],
            [
                'value' => 'damaged',
                'label' => 'Danificado',
                'description' => 'Registar itens danificados que não podem ser vendidos.',
            ],
            [
                'value' => 'expired',
                'label' => 'Expirado',
                'description' => 'Registar itens expirados que devem ser removidos do inventário.',
            ],
            [
                'value' => 'initial',
                'label' => 'Inicial',
                'description' => 'Configuração inicial de inventário para um novo produto.',
            ],
        ];
    }

    /**
     * Exibe uma lista de ajustes para um inventário específico
     */
    public function index(Request $request, Inventory $inventory)
    {
        $filters = $request->only(['type', 'supplier_id']);

        $query = $inventory->adjustments()->with(['supplier', 'user']);

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['supplier_id'])) {
            $query->where('supplier_id', $filters['supplier_id']);
        }

        $adjustments = $query->latest()->paginate(10);
        $suppliers = Supplier::orderBy('name')->get(['id', 'name', 'company_name']);

        return Inertia::render('Admin/Inventories/Adjustments/Index', [
            'inventory' => $inventory->load(['product', 'productVariant', 'warehouse']),
            'adjustments' => $adjustments,
            'suppliers' => $suppliers,
            'adjustmentTypes' => $this->getAdjustmentTypes(),
            'filters' => $filters,
        ]);
    }

    /**
     * Mostrar formulário para criar um novo ajuste de inventário
     */
    public function create(Inventory $inventory)
    {
        $suppliers = Supplier::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Inventories/Adjustments/Create', [
            'inventory' => $inventory->load(['product', 'productVariant', 'warehouse']),
            'suppliers' => $suppliers,
            'adjustmentTypes' => $this->getAdjustmentTypes(),
        ]);
    }

    /**
     * Armazenar um novo ajuste de inventário
     */
    public function store(Request $request, Inventory $inventory)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|gt:0',
            'type' => 'required|string|in:addition,subtraction,correction,transfer,loss,damaged,expired,initial',
            'reference_number' => 'nullable|string|max:255',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'reason' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Verificar se é um tipo de ajuste que reduz a quantidade
        $negativeTypes = ['subtraction', 'transfer', 'loss', 'damaged', 'expired'];
        $isNegativeAdjustment = in_array($validated['type'], $negativeTypes);

        // Converter para valor negativo se necessário
        if ($isNegativeAdjustment) {
            // Verificar se há quantidade suficiente
            if ($inventory->quantity < $validated['quantity']) {
                throw ValidationException::withMessages([
                    'quantity' => 'Não existe quantidade suficiente em stock para este ajuste.',
                ]);
            }

            $validated['quantity'] = -1 * abs($validated['quantity']);
        }

        DB::beginTransaction();
        try {
            // Criar o ajuste
            $adjustment = $inventory->adjustments()->create([
                'quantity' => $validated['quantity'],
                'type' => $validated['type'],
                'reference_number' => $validated['reference_number'],
                'supplier_id' => $validated['supplier_id'],
                'reason' => $validated['reason'],
                'notes' => $validated['notes'],
                'user_id' => Auth::id(),
            ]);

            // Atualizar a quantidade do inventário
            $inventory->quantity += $validated['quantity'];
            $inventory->save();

            DB::commit();

            return redirect()->route('inventories.adjustments.index', $inventory)
                ->with('success', 'Ajuste de inventário criado com sucesso.');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors([
                'error' => 'Ocorreu um erro ao criar o ajuste de inventário: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Exibir um ajuste de inventário específico
     */
    public function show(Inventory $inventory, InventoryAdjustment $adjustment)
    {
        if ($adjustment->inventory_id !== $inventory->id) {
            abort(404);
        }

        $adjustment->load(['supplier', 'user']);

        return Inertia::render('Admin/Inventories/Adjustments/Show', [
            'inventory' => $inventory->load(['product', 'productVariant', 'warehouse']),
            'adjustment' => $adjustment,
            'adjustmentTypes' => $this->getAdjustmentTypes(),
        ]);
    }

    /**
     * Exibir formulário para editar um ajuste
     */
    public function edit(Inventory $inventory, InventoryAdjustment $adjustment)
    {
        if ($adjustment->inventory_id !== $inventory->id) {
            abort(404);
        }

        $suppliers = Supplier::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Inventories/Adjustments/Edit', [
            'inventory' => $inventory->load(['product', 'productVariant', 'warehouse']),
            'adjustment' => $adjustment,
            'suppliers' => $suppliers,
            'adjustmentTypes' => $this->getAdjustmentTypes(),
        ]);
    }

    /**
     * Atualizar um ajuste de inventário
     *
     * Observação: Por questões de integridade dos dados, não permitimos
     * alterar o tipo e quantidade do ajuste. Apenas metadados como
     * referência, fornecedor, motivo e notas.
     */
    public function update(Request $request, Inventory $inventory, InventoryAdjustment $adjustment)
    {
        if ($adjustment->inventory_id !== $inventory->id) {
            abort(404);
        }

        $validated = $request->validate([
            'reference_number' => 'nullable|string|max:255',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'reason' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();
        try {
            $adjustment->update($validated);
            DB::commit();

            return redirect()->route('inventories.adjustments.show', [$inventory->id, $adjustment->id])
                ->with('success', 'Ajuste de inventário atualizado com sucesso.');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors([
                'error' => 'Ocorreu um erro ao atualizar o ajuste de inventário: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Excluir um ajuste de inventário e reverter seu efeito no inventário
     */
    public function destroy(Inventory $inventory, InventoryAdjustment $adjustment)
    {
        if ($adjustment->inventory_id !== $inventory->id) {
            abort(404);
        }

        DB::beginTransaction();
        try {
            // Reverter o efeito do ajuste no inventário
            $inventory->quantity -= $adjustment->quantity;
            $inventory->save();

            // Excluir o ajuste
            $adjustment->delete();

            DB::commit();

            return redirect()->route('inventories.adjustments.index', $inventory)
                ->with('success', 'Ajuste de inventário eliminado com sucesso e quantidade restaurada.');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors([
                'error' => 'Ocorreu um erro ao eliminar o ajuste de inventário: ' . $e->getMessage(),
            ]);
        }
    }
}
