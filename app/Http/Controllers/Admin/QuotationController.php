<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\Customer;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Quotation;
use App\Models\QuotationItem;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class QuotationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Quotation::query()
            ->with(['customer', 'user'])
            ->withCount('items');

        // Filtros
        if ($request->has('search') && $request->search !== null && trim($request->search) !== '') {
            $search = trim($request->search);
            $query->where('quotation_number', 'like', "%{$search}%")
                ->orWhere('notes', 'like', "%{$search}%")
                ->orWhereHas('customer', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
        }

        if ($request->has('customer_id') && $request->customer_id) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('issue_date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('issue_date', '<=', $request->date_to);
        }

        // Verificar e atualizar cotações expiradas
        if (!$request->has('include_expired') || !$request->include_expired) {
            $expiredQuotes = Quotation::whereNotIn('status', ['expired', 'rejected', 'converted'])
                ->whereNotNull('expiry_date')
                ->whereDate('expiry_date', '<', now()->toDateString())
                ->get();

            foreach ($expiredQuotes as $quote) {
                $quote->status = 'expired';
                $quote->save();
            }
        }

        // Ordenação
        $sortField = $request->input('sort_field', 'issue_date');
        $sortOrder = $request->input('sort_order', 'desc');

        $allowedSortFields = ['quotation_number', 'issue_date', 'expiry_date', 'status', 'total'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortOrder);
        }

        $quotations = $query->paginate(15)->withQueryString();

        // Dados para filtros
        $customers = Customer::select('id', 'name', 'email')->orderBy('name')->get();
        $statuses = $this->getQuotationStatuses();

        return Inertia::render('Admin/Quotations/Index', [
            'quotations' => $quotations,
            'customers' => $customers,
            'statuses' => $statuses,
            'filters' => $request->all(['search', 'customer_id', 'status', 'date_from', 'date_to', 'sort_field', 'sort_order']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
            $quotationNumber = Quotation::generateQuotationNumber();
            $customers = Customer::select('id', 'name', 'email', 'phone', 'address')->orderBy('name')->get();
            $products = Product::select('id', 'name', 'price', 'sku', 'cost')->with('variants')->get();
            $warehouses = Warehouse::select('id', 'name', 'is_main')->where('active', true)->orderBy('name')->get();
            $currencies = Currency::where('is_active', true)->orderBy('is_default', 'desc')->get();
            $defaultCurrency = Currency::where('is_default', true)->first() ?: new Currency(['code' => 'MZN', 'name' => 'Metical Moçambicano', 'symbol' => 'MT']);

            return Inertia::render('Admin/Quotations/Create', [
                'quotationNumber' => $quotationNumber,
                'customers' => $customers,
                'products' => $products,
                'warehouses' => $warehouses,
                'currencies' => $currencies,
                'defaultCurrency' => $defaultCurrency,
                'taxRates' => $this->getTaxRates(),
                'statuses' => $this->getQuotationStatuses(),
                'discountTypes' => $this->getDiscountTypes(),
            ]);

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'quotation_number' => 'required|string|unique:quotations',
                'customer_id' => 'nullable|exists:customers,id',
                'issue_date' => 'required|date',
                'expiry_date' => 'nullable|date|after_or_equal:issue_date',
                'status' => 'required|string|in:draft,sent,approved,rejected',
                'currency_code' => 'required|string|size:3|exists:currencies,code',
                'exchange_rate' => 'required|numeric|gt:0',
                'notes' => 'nullable|string',
                'terms' => 'nullable|string',
                'include_tax' => 'boolean',
                'items' => 'required|array|min:1',
                'items.*.name' => 'required|string',
                'items.*.quantity' => 'required|numeric|gt:0',
                'items.*.unit_price' => 'required|numeric|gte:0',
                'items.*.product_id' => 'nullable|exists:products,id',
                'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
                'items.*.warehouse_id' => 'nullable|exists:warehouses,id',
                'items.*.discount_percentage' => 'nullable|numeric|gte:0|lte:100',
                'items.*.tax_percentage' => 'nullable|numeric|gte:0',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();
            try {
                // Criar a cotação
                $quotationData = $request->except('items');
                $quotationData['user_id'] = Auth::id();

                $quotation = Quotation::create($quotationData);

                // Adicionar os itens
                $sort = 0;
                foreach ($request->items as $itemData) {
                    $itemData['quotation_id'] = $quotation->id;
                    $itemData['sort_order'] = $sort++;

                    // Buscar produto se existir
                    if (!empty($itemData['product_id'])) {
                        $product = Product::find($itemData['product_id']);
                        if (!$product) {
                            continue;
                        }

                        if (empty($itemData['name'])) {
                            $itemData['name'] = $product->name;
                        }

                        if (empty($itemData['description']) && $product->description) {
                            $itemData['description'] = $product->description;
                        }

                        if (empty($itemData['unit_price'])) {
                            $itemData['unit_price'] = $product->price;
                        }
                    }

                    // Calcular valores do item
                    $item = new QuotationItem($itemData);
                    $item->calculateValues();
                    $item->save();
                }

                // Calcular totais da cotação
                $quotation->calculateTotals();

                DB::commit();

                return redirect()->route('admin.quotations.show', $quotation)
                    ->with('success', 'Cotação criada com sucesso!');
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error('Erro ao criar cotação: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                    'request' => $request->all()
                ]);

                return redirect()->back()
                    ->withErrors(['error' => 'Ocorreu um erro ao criar a cotação: ' . $e->getMessage()])
                    ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Erro na validação da cotação: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withErrors(['error' => 'Ocorreu um erro ao validar os dados: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Quotation $quotation)
    {
            $quotation->load(['customer', 'user', 'currency', 'items' => function ($query) {
                $query->with(['product', 'productVariant', 'warehouse']);
            }]);

            // Verificar e atualizar status se a cotação expirou
            $quotation->updateStatusIfExpired();

            // Verificar disponibilidade de produtos nos armazéns
            $quotation->items->map(function ($item) {
                $item->available_quantity = $item->getInventoryAvailability();
                return $item;
            });

            return Inertia::render('Admin/Quotations/Show', [
                'quotation' => $quotation,
                'statuses' => $this->getQuotationStatuses(),
                'currency' => Currency::where('code', $quotation->currency)->first() ?: null,
            ]);

    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Quotation $quotation)
    {
            // Verificar se a cotação pode ser editada
            if (!$quotation->isEditable()) {
                return redirect()->route('admin.quotations.show', $quotation)
                    ->with('error', 'Esta cotação não pode ser editada devido ao seu status atual.');
            }

            $quotation->load(['customer', 'items' => function ($query) {
                $query->with(['product', 'productVariant', 'warehouse']);
            }]);

            $customers = Customer::select('id', 'name', 'email', 'phone', 'address')->orderBy('name')->get();
            $products = Product::select('id', 'name', 'price', 'sku', 'cost')->with('variants')->get();
            $warehouses = Warehouse::select('id', 'name', 'is_main')->where('active', true)->orderBy('name')->get();
            $currencies = Currency::where('is_active', true)->orderBy('is_default', 'desc')->get();

            return Inertia::render('Admin/Quotations/Edit', [
                'quotation' => $quotation,
                'customers' => $customers,
                'products' => $products,
                'warehouses' => $warehouses,
                'currencies' => $currencies,
                'taxRates' => $this->getTaxRates(),
                'statuses' => $this->getQuotationStatuses(),
                'discountTypes' => $this->getDiscountTypes(),
            ]);

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Quotation $quotation)
    {
        try {
            // Verificar se a cotação pode ser editada
            if (!$quotation->isEditable()) {
                return redirect()->route('admin.quotations.show', $quotation)
                    ->with('error', 'Esta cotação não pode ser editada devido ao seu status atual.');
            }

            $validator = Validator::make($request->all(), [
                'quotation_number' => 'required|string|unique:quotations,quotation_number,' . $quotation->id,
                'customer_id' => 'nullable|exists:customers,id',
                'issue_date' => 'required|date',
                'expiry_date' => 'nullable|date|after_or_equal:issue_date',
                'status' => 'required|string|in:draft,sent,approved,rejected',
                'currency_code' => 'required|string|size:3|exists:currencies,code',
                'exchange_rate' => 'required|numeric|gt:0',
                'notes' => 'nullable|string',
                'terms' => 'nullable|string',
                'include_tax' => 'boolean',
                'items' => 'required|array|min:1',
                'items.*.id' => 'nullable|exists:quotation_items,id',
                'items.*.name' => 'required|string',
                'items.*.quantity' => 'required|numeric|gt:0',
                'items.*.unit_price' => 'required|numeric|gte:0',
                'items.*.product_id' => 'nullable|exists:products,id',
                'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
                'items.*.warehouse_id' => 'nullable|exists:warehouses,id',
                'items.*.discount_percentage' => 'nullable|numeric|gte:0|lte:100',
                'items.*.tax_percentage' => 'nullable|numeric|gte:0',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();
            try {
                // Atualizar a cotação
                $quotationData = $request->except('items');
                $quotation->update($quotationData);

                // Processar os itens
                $existingItemIds = [];
                $sort = 0;

                foreach ($request->items as $itemData) {
                    $itemData['sort_order'] = $sort++;

                    // Buscar produto se existir
                    if (!empty($itemData['product_id'])) {
                        $product = Product::find($itemData['product_id']);

                        if ($product) {
                            if (empty($itemData['name'])) {
                                $itemData['name'] = $product->name;
                            }

                            if (empty($itemData['description']) && $product->description) {
                                $itemData['description'] = $product->description;
                            }
                        }
                    }

                    // Atualizar item existente ou criar novo
                    if (!empty($itemData['id'])) {
                        $item = QuotationItem::find($itemData['id']);
                        if ($item && $item->quotation_id == $quotation->id) {
                            $item->fill($itemData);
                            $item->calculateValues();
                            $item->save();
                            $existingItemIds[] = $item->id;
                        }
                    } else {
                        $itemData['quotation_id'] = $quotation->id;
                        $item = new QuotationItem($itemData);
                        $item->calculateValues();
                        $item->save();
                        $existingItemIds[] = $item->id;
                    }
                }

                // Remover itens que não estão mais presentes
                QuotationItem::where('quotation_id', $quotation->id)
                    ->whereNotIn('id', $existingItemIds)
                    ->delete();

                // Recalcular totais da cotação
                $quotation->calculateTotals();

                // Finalizar
                DB::commit();

                return redirect()->route('admin.quotations.show', $quotation)
                    ->with('success', 'Cotação atualizada com sucesso!');
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error('Erro ao atualizar cotação: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                    'request' => $request->all()
                ]);

                return redirect()->back()
                    ->withErrors(['error' => 'Ocorreu um erro ao atualizar a cotação: ' . $e->getMessage()])
                    ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Erro na validação da cotação: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withErrors(['error' => 'Ocorreu um erro ao validar os dados: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Quotation $quotation)
    {
        try {
            DB::beginTransaction();

            // Excluir a cotação (soft delete)
            $quotation->delete();

            DB::commit();

            return redirect()->route('admin.quotations.index')
                ->with('success', 'Cotação excluída com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erro ao excluir cotação: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao excluir a cotação: ' . $e->getMessage());
        }
    }

    /**
     * Alterar o status da cotação
     */
    public function updateStatus(Request $request, Quotation $quotation)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|string|in:draft,sent,approved,rejected,expired',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();

            $quotation->status = $request->status;
            $quotation->save();

            DB::commit();

            return redirect()->back()
                ->with('success', 'Status da cotação atualizado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erro ao atualizar status da cotação: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao atualizar o status da cotação: ' . $e->getMessage());
        }
    }

    /**
     * Gerar PDF da cotação
     */
    public function generatePdf(Quotation $quotation)
    {
        try {
            $quotation->load(['customer', 'user', 'items' => function ($query) {
                $query->with(['product', 'productVariant', 'warehouse']);
            }]);

            // Verificar disponibilidade de produtos nos armazéns para essa cotação
            foreach ($quotation->items as $item) {
                $item->available_quantity = $item->getInventoryAvailability();
            }

            // Aqui você implementaria a geração do PDF
            // Por exemplo, usando Dompdf, Mpdf ou Snappy PDF

            return redirect()->back()->with('error', 'Funcionalidade de geração de PDF ainda não implementada.');
        } catch (\Exception $e) {
            Log::error('Erro ao gerar PDF da cotação: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao gerar o PDF: ' . $e->getMessage());
        }
    }

    /**
     * Get inventory information for a product in a warehouse
     */
    public function getProductInventory(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_id' => 'required|exists:products,id',
                'warehouse_id' => 'required|exists:warehouses,id',
                'product_variant_id' => 'nullable|exists:product_variants,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $productId = $request->input('product_id');
            $warehouseId = $request->input('warehouse_id');
            $variantId = $request->input('product_variant_id');

            // Buscar inventário com preço específico para este produto/variante/armazém
            $query = Inventory::where('product_id', $productId)
                ->where('warehouse_id', $warehouseId);

            if ($variantId) {
                $query->where('product_variant_id', $variantId);
            } else {
                $query->whereNull('product_variant_id');
            }

            $inventory = $query->first();

            // Se não encontrar inventário, buscar o produto para preço padrão
            if (!$inventory) {
                $product = Product::find($productId);

                return response()->json([
                    'success' => true,
                    'inventory' => null,
                    'product' => $product,
                    'message' => 'Produto não encontrado neste armazém, utilizando preço padrão.'
                ]);
            }

            return response()->json([
                'success' => true,
                'inventory' => $inventory,
                'message' => 'Informações do inventário obtidas com sucesso.'
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao obter informações do inventário: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ocorreu um erro ao obter informações do inventário.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Valores constantes para status de cotação
     */
    private function getQuotationStatuses()
    {
        return [
            ['value' => 'draft', 'label' => 'Rascunho', 'color' => 'secondary'],
            ['value' => 'sent', 'label' => 'Enviada', 'color' => 'info'],
            ['value' => 'approved', 'label' => 'Aprovada', 'color' => 'success'],
            ['value' => 'rejected', 'label' => 'Rejeitada', 'color' => 'destructive'],
            ['value' => 'expired', 'label' => 'Expirada', 'color' => 'outline'],
            ['value' => 'converted', 'label' => 'Convertida', 'color' => 'primary'],
        ];
    }

    /**
     * Tipos de descontos disponíveis
     */
    private function getDiscountTypes()
    {
        return [
            ['value' => 'percentage', 'label' => 'Percentagem (%)'],
            ['value' => 'fixed', 'label' => 'Valor fixo'],
        ];
    }

    /**
     * Taxas de IVA comuns
     */
    private function getTaxRates()
    {
        return [
            ['value' => 0, 'label' => 'Isento (0%)'],
            ['value' => 17, 'label' => 'IVA (17%)'],
        ];
    }
}
