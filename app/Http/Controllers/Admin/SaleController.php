<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UnitEnum;
use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\Customer;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Quotation;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalePayment;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Sale::query()
                ->with(['customer', 'user'])
                ->withCount('items');

            // Filtros
            if ($request->has('search') && $request->search !== null && trim($request->search) !== '') {
                $search = trim($request->search);
                $query->where('sale_number', 'like', "%{$search}%")
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

            // Filtro de armazém
            if ($request->has('warehouse_id') && $request->warehouse_id !== 'none') {
                $query->whereHas('items', function ($q) use ($request) {
                    $q->where('warehouse_id', $request->warehouse_id);
                });
            }

            // Ordenação
            $sortField = $request->input('sort_field', 'issue_date');
            $sortOrder = $request->input('sort_order', 'desc');

            $allowedSortFields = ['sale_number', 'issue_date', 'due_date', 'status', 'total', 'amount_paid'];
            if (in_array($sortField, $allowedSortFields)) {
                $query->orderBy($sortField, $sortOrder);
            }

            $sales = $query->paginate(15)->withQueryString();

            // Dados para filtros
            $customers = Customer::select('id', 'name', 'email')->orderBy('name')->get();
            $warehouses = Warehouse::select('id', 'name')->where('active', true)->orderBy('name')->get();
            $statuses = $this->getSaleStatuses();

            // Obter a moeda padrão para formatação de valores
            $defaultCurrency = Currency::where('is_default', true)->first();

            // Calcular estatísticas
            $stats = $this->calculateSalesStats();

            return Inertia::render('Admin/Sales/Index', [
                'sales' => $sales,
                'customers' => $customers,
                'warehouses' => $warehouses, // Add warehouses to the response
                'statuses' => $statuses,
                'currency' => $defaultCurrency,
                'stats' => $stats,
                'filters' => $request->all(['search', 'customer_id', 'warehouse_id', 'status', 'date_from', 'date_to', 'sort_field', 'sort_order']),
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao listar vendas: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Ocorreu um erro ao carregar as vendas: ' . $e->getMessage());
        }
    }

    /**
     * Calcular estatísticas das vendas
     */
    private function calculateSalesStats()
    {
        try {
            $query = Sale::query();

            // Aplicar filtro de armazém se existir
            if (request()->has('warehouse_id') && request()->warehouse_id !== 'none') {
                $query->whereHas('items', function ($q) {
                    $q->where('warehouse_id', request()->warehouse_id);
                });
            }

            // Obter estatísticas básicas
            $total = (clone $query)->count();
            $draftCount = (clone $query)->where('status', 'draft')->count();
            $pendingCount = (clone $query)->where('status', 'pending')->count();
            $paidCount = (clone $query)->where('status', 'paid')->count();
            $partialCount = (clone $query)->where('status', 'partial')->count();
            $cancelledCount = (clone $query)->where('status', 'cancelled')->count();

            // Cálculo de valores financeiros
            $totalValue = (clone $query)->sum('total');
            $paidValue = (clone $query)->sum('amount_paid');
            $dueValue = (clone $query)->whereIn('status', ['pending', 'partial'])->sum('amount_due');
            $overdueValue = (clone $query)->where('due_date', '<', now())
                ->whereIn('status', ['pending', 'partial'])
                ->sum('amount_due');

            // Contar vendas vencidas
            $overdueCount = (clone $query)->where('due_date', '<', now())
                ->whereIn('status', ['pending', 'partial'])
                ->count();

            return [
                'total' => $total,
                'draft' => $draftCount,
                'pending' => $pendingCount,
                'paid' => $paidCount,
                'partial' => $partialCount,
                'cancelled' => $cancelledCount,
                'overdue' => $overdueCount,
                'total_value' => $totalValue,
                'paid_value' => $paidValue,
                'due_value' => $dueValue,
                'overdue_value' => $overdueValue
            ];
        } catch (\Exception $e) {
            Log::error('Erro ao calcular estatísticas das vendas: ' . $e->getMessage());

            // Retornar valores padrão em caso de erro
            return [
                'total' => 0,
                'draft' => 0,
                'pending' => 0,
                'paid' => 0,
                'partial' => 0,
                'cancelled' => 0,
                'overdue' => 0,
                'total_value' => 0,
                'paid_value' => 0,
                'due_value' => 0,
                'overdue_value' => 0
            ];
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        try {
            $quotationId = $request->quotation_id;
            $quotation = null;

            // Se estiver convertendo uma cotação, carregar os dados da cotação
            if ($quotationId) {
                $quotation = Quotation::with(['items', 'customer'])->find($quotationId);
                if (!$quotation) {
                    return redirect()->route('admin.sales.create')
                        ->with('error', 'A cotação especificada não foi encontrada.');
                }
            }

            $placeholderNumber = 'AUTO-' . date('Ym');
            $customers = Customer::select('id', 'name', 'email', 'phone', 'address')->orderBy('name')->get();
            $products = Product::select('id', 'name', 'price', 'sku', 'cost', 'unit', 'stock_quantity')
                ->with('category')
                ->get();
            $warehouses = Warehouse::select('id', 'name', 'is_main')->where('active', true)->orderBy('name')->get();
            $currencies = Currency::where('is_active', true)->orderBy('is_default', 'desc')->get();
            $defaultCurrency = Currency::where('is_default', true)->first() ?: new Currency([
                'code' => 'MZN',
                'name' => 'Metical Moçambicano',
                'symbol' => 'MT',
                'decimal_places' => 2,
                'decimal_separator' => ',',
                'thousand_separator' => '.'
            ]);

            $units = UnitEnum::toArray();
            $paymentMethods = $this->getPaymentMethods();

            return Inertia::render('Admin/Sales/Create', [
                'salePlaceholder' => $placeholderNumber,
                'customers' => $customers,
                'products' => $products,
                'warehouses' => $warehouses,
                'currencies' => $currencies,
                'defaultCurrency' => $defaultCurrency,
                'taxRates' => $this->getTaxRates(),
                'statuses' => $this->getSaleStatuses(),
                'discountTypes' => $this->getDiscountTypes(),
                'units' => $units,
                'paymentMethods' => $paymentMethods,
                'quotation' => $quotation
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao carregar formulário de venda: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Ocorreu um erro ao carregar o formulário: ' . $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'customer_id' => 'nullable|exists:customers,id',
                'issue_date' => 'required|date',
                'due_date' => 'nullable|date|after_or_equal:issue_date',
                'status' => 'required|string|in:draft,pending,paid,partial',
                'currency_code' => 'required|string|size:3|exists:currencies,code',
                'exchange_rate' => 'required|numeric|gt:0',
                'notes' => 'nullable|string',
                'terms' => 'nullable|string',
                'include_tax' => 'boolean',
                'shipping_amount' => 'nullable|numeric|min:0',
                'amount_paid' => 'nullable|numeric|min:0',
                'payment_method' => 'nullable|string',
                'quotation_id' => 'nullable|exists:quotations,id',
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
                // Gerar número da venda único
                $saleNumber = $this->generateUniqueSaleNumber();

                // Preparar os dados da venda
                $saleData = $request->except('items');
                $saleData['user_id'] = Auth::id();
                $saleData['sale_number'] = $saleNumber;

                // Verificar pagamento e status
                $amountPaid = $request->amount_paid ?? 0;
                $shippingAmount = $request->shipping_amount ?? 0;

                // Calcular totais antes de salvar
                $subtotal = 0;
                $taxAmount = 0;
                $discountAmount = 0;

                foreach ($request->items as $itemData) {
                    $quantity = $itemData['quantity'];
                    $unitPrice = $itemData['unit_price'];
                    $discountPercentage = $itemData['discount_percentage'] ?? 0;
                    $taxPercentage = $itemData['tax_percentage'] ?? 0;

                    $itemSubtotal = $quantity * $unitPrice;
                    $itemDiscountAmount = $itemSubtotal * ($discountPercentage / 100);
                    $itemTaxAmount = ($itemSubtotal - $itemDiscountAmount) * ($taxPercentage / 100);

                    $subtotal += $itemSubtotal;
                    $discountAmount += $itemDiscountAmount;
                    $taxAmount += $itemTaxAmount;
                }

                // Calcular total
                $total = $subtotal - $discountAmount;
                if ($request->include_tax) {
                    $total += $taxAmount;
                }
                $total += $shippingAmount;

                // Determinar status com base no pagamento
                if (abs($amountPaid - $total) < 0.01) {
                    // Se o valor pago é igual (ou quase igual) ao total, status é 'paid'
                    $saleData['status'] = 'paid';
                } elseif ($amountPaid > 0 && $amountPaid < $total) {
                    // Se pagou parte, status é 'partial'
                    $saleData['status'] = 'partial';
                } elseif ($amountPaid <= 0) {
                    // Se não pagou nada, status é 'pending'
                    $saleData['status'] = 'pending';
                }

                // Atualizar os totais calculados
                $saleData['subtotal'] = $subtotal;
                $saleData['tax_amount'] = $taxAmount;
                $saleData['discount_amount'] = $discountAmount;
                $saleData['total'] = $total;
                $saleData['amount_due'] = $total - $amountPaid;

                // Criar a venda
                $sale = Sale::create($saleData);

                // Processar os itens
                foreach ($request->items as $itemData) {
                    $itemData['sale_id'] = $sale->id;

                    // Se o item tem produto associado, obter informações adicionais
                    if (!empty($itemData['product_id'])) {
                        $product = Product::find($itemData['product_id']);

                        if ($product) {
                            if (empty($itemData['name'])) {
                                $itemData['name'] = $product->name;
                            }

                            if (empty($itemData['description']) && $product->description) {
                                $itemData['description'] = $product->description;
                            }

                            // Verificar se há inventário suficiente
                            if (!empty($itemData['warehouse_id'])) {
                                $inventory = Inventory::where('product_id', $itemData['product_id'])
                                    ->where('warehouse_id', $itemData['warehouse_id'])
                                    ->first();

                                if ($inventory) {
                                    // Atualizar o inventário
                                    $inventory->quantity -= $itemData['quantity'];
                                    $inventory->save();
                                }
                            }
                        }
                    }

                    // Calcular valores do item
                    $item = new SaleItem($itemData);
                    $item->calculateValues();
                    $item->save();
                }

                // Se houve pagamento, registrar
                if ($amountPaid > 0) {
                    SalePayment::create([
                        'sale_id' => $sale->id,
                        'amount' => $amountPaid,
                        'payment_method' => $request->payment_method ?? 'cash',
                        'payment_date' => now(),
                        'notes' => 'Pagamento inicial',
                        'status' => 'completed',
                        'user_id' => Auth::id()
                    ]);
                }

                // Se a venda foi criada a partir de uma cotação, atualizar a cotação
                if (!empty($request->quotation_id)) {
                    $quotation = Quotation::find($request->quotation_id);
                    if ($quotation) {
                        $quotation->status = 'converted';
                        $quotation->converted_to_sale_id = $sale->id;
                        $quotation->save();
                    }
                }

                DB::commit();

                return redirect()->route('admin.sales.show', $sale)
                    ->with('success', 'Venda criada com sucesso!');
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Erro ao criar venda: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                    'request' => $request->all()
                ]);

                return redirect()->back()
                    ->withErrors(['error' => 'Ocorreu um erro ao criar a venda: ' . $e->getMessage()])
                    ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Erro na validação da venda: ' . $e->getMessage(), [
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
    public function show(Sale $sale)
    {
        $sale->load(['customer', 'user', 'currency', 'items' => function ($query) {
            $query->with(['product', 'productVariant', 'warehouse']);
        }, 'payments']);

        return Inertia::render('Admin/Sales/Show', [
            'sale' => $sale,
            'statuses' => $this->getSaleStatuses(),
            'paymentMethods' => $this->getPaymentMethods(),
        ]);
    }

    /**
     * Registrar um novo pagamento para a venda
     */
    public function registerPayment(Sale $sale, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'amount' => 'required|numeric|min:0.01|max:' . $sale->amount_due,
                'payment_date' => 'required|date',
                'payment_method' => 'required|string',
                'reference' => 'nullable|string|max:255',
                'notes' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();
            try {
                // Criar o registo de pagamento
                $payment = SalePayment::create([
                    'sale_id' => $sale->id,
                    'amount' => $request->amount,
                    'payment_method' => $request->payment_method,
                    'payment_date' => $request->payment_date,
                    'reference' => $request->reference,
                    'notes' => $request->notes,
                    'status' => 'completed',
                    'user_id' => Auth::id()
                ]);

                // Atualizar os valores da venda
                $sale->amount_paid += $request->amount;
                $sale->amount_due = $sale->total - $sale->amount_paid;

                // Atualizar o status da venda com base no pagamento
                if ($sale->amount_due <= 0) {
                    $sale->status = 'paid';
                } elseif ($sale->amount_paid > 0) {
                    $sale->status = 'partial';
                }

                $sale->save();

                DB::commit();

                return redirect()->back()->with('success', 'Pagamento registrado com sucesso!');
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Erro ao registrar pagamento: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                    'sale_id' => $sale->id,
                    'request' => $request->all()
                ]);

                return redirect()->back()
                    ->withErrors(['error' => 'Ocorreu um erro ao registrar o pagamento: ' . $e->getMessage()])
                    ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Erro na validação do pagamento: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withErrors(['error' => 'Ocorreu um erro ao validar os dados: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Obter informação de inventário para um produto em um armazém específico
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

            $query = Inventory::where('product_id', $productId)
                ->where('warehouse_id', $warehouseId);

            if ($variantId) {
                $query->where('product_variant_id', $variantId);
            } else {
                $query->whereNull('product_variant_id');
            }

            $inventory = $query->first();

            // Se não encontrou inventário, buscar o preço padrão do produto
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
     * Obter status de inventário para múltiplos produtos em um armazém
     */
    public function getInventoryStatus(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'warehouse_id' => 'required|exists:warehouses,id',
                'product_ids' => 'nullable|string', // lista de IDs separados por vírgula
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $warehouseId = $request->input('warehouse_id');
            $productIds = $request->input('product_ids');

            $query = Inventory::where('warehouse_id', $warehouseId)
                ->whereNull('product_variant_id'); // apenas produtos sem variantes

            if ($productIds) {
                $idsArray = explode(',', $productIds);
                $query->whereIn('product_id', $idsArray);
            }

            // Obter os dados do inventário em formato mais eficiente
            $inventory = $query->get(['product_id', 'quantity', 'unit_cost']);

            // Transformar em um array associativo para fácil acesso por product_id
            $result = [];
            foreach ($inventory as $item) {
                $result[$item->product_id] = $item->quantity;
            }

            return response()->json([
                'success' => true,
                'inventory' => $result,
                'message' => 'Status do inventário obtido com sucesso.'
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao obter status do inventário: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ocorreu um erro ao obter o status do inventário.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Gera um número de venda único com bloqueio para evitar duplicação
     */
    private function generateUniqueSaleNumber()
    {
        $prefix = 'SAL-' . date('Ym') . '-';
        $lastSale = Sale::where('sale_number', 'LIKE', $prefix . '%')
            ->orderByRaw('CAST(SUBSTRING(sale_number, ' . (strlen($prefix) + 1) . ') AS UNSIGNED) DESC')
            ->first();

        if ($lastSale) {
            $lastNumber = substr($lastSale->sale_number, strlen($prefix));
            $nextNumber = intval($lastNumber) + 1;
        } else {
            $nextNumber = 1;
        }

        $saleNumber = $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

        // Verificar se o número gerado já existe
        while (Sale::where('sale_number', $saleNumber)->exists()) {
            $nextNumber++;
            $saleNumber = $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        }

        return $saleNumber;
    }

    /**
     * Valores constantes para status de venda
     */
    private function getSaleStatuses()
    {
        return [
            ['value' => 'draft', 'label' => 'Rascunho', 'color' => 'secondary'],
            ['value' => 'pending', 'label' => 'Pendente', 'color' => 'warning'],
            ['value' => 'paid', 'label' => 'Paga', 'color' => 'success'],
            ['value' => 'partial', 'label' => 'Parcialmente Paga', 'color' => 'info'],
            ['value' => 'cancelled', 'label' => 'Cancelada', 'color' => 'destructive'],
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
     * Métodos de pagamento disponíveis
     */
    private function getPaymentMethods()
    {
        return [
            ['value' => 'cash', 'label' => 'Dinheiro'],
            ['value' => 'card', 'label' => 'Cartão'],
            ['value' => 'mpesa', 'label' => 'M-Pesa'],
            ['value' => 'emola', 'label' => 'eMola'],
            ['value' => 'bank_transfer', 'label' => 'Transferência Bancária'],
            ['value' => 'check', 'label' => 'Cheque'],
            ['value' => 'credit', 'label' => 'Crédito'],
            ['value' => 'other', 'label' => 'Outro'],
        ];
    }

    /**
     * Taxas de IVA comuns
     */
    private function getTaxRates()
    {
        return [
            ['id' => 1, 'value' => 0, 'label' => 'Isento (0%)', 'is_default' => false],
            ['id' => 2, 'value' => 16, 'label' => 'IVA (16%)', 'is_default' => true],
        ];
    }

    /**
     * Alterar o status da venda
     */
    public function updateStatus(Request $request, Sale $sale)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|string|in:draft,pending,paid,partial,cancelled',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();

            $sale->status = $request->status;
            $sale->save();

            DB::commit();

            return redirect()->back()
                ->with('success', 'Status da venda atualizado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erro ao atualizar status da venda: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao atualizar o status da venda: ' . $e->getMessage());
        }
    }

    /**
     * Gerar PDF da venda
     */
    public function generatePdf(Sale $sale, Request $request)
    {
        try {
            // Carregar relações necessárias primeiramente
            $sale->load(['customer', 'user', 'currency', 'items' => function ($query) {
                $query->with(['product', 'productVariant', 'warehouse']);
            }]);

            // Determinar tipo de documento e pagamento
            $type = $request->input('type', 'invoice');

            $sale->load(['payments' => function ($query) {
                $query->orderBy('payment_date', 'asc');
            }]);

            // Obter informações da empresa e dados bancários
            $company = DB::table('settings')->where('group', 'company')->get()->keyBy('key');
            $bank = DB::table('settings')->where('group', 'bank')->get()->keyBy('key');

            $documentTitle = match (true) {
                ($sale->status === 'paid' && count($sale->payments) === 1) || ($sale->status === 'paid' && $sale->amount_paid >= $sale->amount_due) => 'RECIBO',
                $sale->status === 'partial' && count($sale->payments) => 'RECIBO',
                default => 'FATURA'
            };

            // Gerar número do documento
            $sufix = '';
            $documentNumber = $sale->sale_number;
            if ($sale->status === 'partial' && count($sale->payments)) {
                // Se for pagamento parcial, adicionar sufixo P + número do pagamento
                $documentNumber .= '/P' . count($sale->payments);
                $sufix = 'P';
            } elseif ($sale->status === 'paid') {
                // Se estiver pago, adicionar sufixo R de recibo
                $documentNumber .= '/R';
                $sufix = 'R';
            }
            // Gerar o PDF
            $pdf = \PDF::setOptions([
                'isPhpEnabled' => true,
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'enable_local_file_access' => true,
                'chroot' => public_path(),
            ])->loadView('pdf.sale', [
                'sale' => $sale,
                'company' => $company,
                'bank' => $bank,
                'documentTitle' => $documentTitle,
                'documentNumber' => $documentNumber,
                'documentSufix' => $sufix,
            ]);

            // Definir nome do arquivo
            $filename = match (true) {
                $type === 'receipt' && $sale->status === 'paid' => 'recibo_' . $sale->sale_number . '_R',
                $type === 'payment_proof' && $payment !== null => 'pagamento_' . $sale->sale_number . '_P' . $payment->id,
                default => 'fatura_' . $sale->sale_number
            };
            $filename .= '.pdf';

            // Retornar o PDF conforme solicitado
            return $request->boolean('download') ? $pdf->download($filename) : $pdf->stream($filename);
        } catch (\Exception $e) {
            Log::error('Erro ao gerar PDF: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'sale_id' => $sale->id,
                'type' => $type ?? null,
                'payment_id' => $paymentId ?? null
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erro ao gerar PDF: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Ocorreu um erro ao gerar o PDF: ' . $e->getMessage());
        }
    }

    /**
     * Enviar venda por e-mail para o cliente
     */
    public function sendEmail(Sale $sale)
    {
        try {
            DB::beginTransaction();

            // Verificar se o cliente existe e tem email
            if (!$sale->customer || !$sale->customer->email) {
                return redirect()->back()->with('error', 'Cliente sem endereço de email válido para envio.');
            }

            // Carregar relações necessárias
            $sale->load(['customer', 'currency', 'items' => function ($query) {
                $query->with(['product', 'productVariant', 'warehouse']);
            }, 'payments']);

            // Obter informações da empresa e dados bancários
            $company = DB::table('settings')->where('group', 'company')->get()->keyBy('key');
            $bank = DB::table('settings')->where('group', 'bank')->get()->keyBy('key');

            // Gerar PDF anexo
            $pdf = \PDF::setOptions([
                'isPhpEnabled' => true,
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'enable_local_file_access' => true,
                'chroot' => public_path(),
            ])->loadView('pdf.sale', [
                'sale' => $sale,
                'company' => $company,
                'bank' => $bank
            ]);

            $pdfContent = $pdf->output();
            $pdfFilename = 'venda_' . $sale->sale_number . '.pdf';

            // Enviar email com o PDF anexo
            \Mail::send('emails.sale', [
                'sale' => $sale,
                'company' => $company,
            ], function ($message) use ($sale, $pdfContent, $pdfFilename, $company) {
                $message->to($sale->customer->email, $sale->customer->name)
                    ->subject('Venda ' . $sale->sale_number)
                    ->attachData($pdfContent, $pdfFilename, [
                        'mime' => 'application/pdf',
                    ]);

                // Adicionar remetente se configurado
                if (isset($company['email'])) {
                    $senderName = $company['name'] ?? 'Matony';
                    $message->from($company['email']->value, $senderName->value);
                }
            });

            DB::commit();

            return redirect()->back()->with('success', 'Venda enviada com sucesso para ' . $sale->customer->email);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erro ao enviar venda por email: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Ocorreu um erro ao enviar o email: ' . $e->getMessage());
        }
    }

    /**
     * Duplicar uma venda existente
     */
    public function duplicate(Sale $sale)
    {
        try {
            DB::beginTransaction();

            // Carregar itens da venda
            $sale->load('items');

            // Criar nova venda com os mesmos dados mas com status rascunho
            $newSale = $sale->replicate([
                'sale_number',
                'status',
                'amount_paid',
                'amount_due',
                'created_at',
                'updated_at'
            ]);

            $newSale->sale_number = $this->generateUniqueSaleNumber();
            $newSale->status = 'draft';
            $newSale->issue_date = now()->format('Y-m-d');
            $newSale->amount_paid = 0;
            $newSale->amount_due = $sale->total;

            // Se a venda original tinha data de vencimento, definir nova data
            if ($sale->due_date) {
                $daysValid = now()->diffInDays($sale->due_date);
                $newSale->due_date = now()->addDays($daysValid)->format('Y-m-d');
            }

            $newSale->save();

            // Duplicar os itens da venda
            foreach ($sale->items as $item) {
                $newItem = $item->replicate(['sale_id', 'created_at', 'updated_at']);
                $newItem->sale_id = $newSale->id;
                $newItem->save();
            }

            DB::commit();

            return redirect()->route('admin.sales.edit', $newSale)
                ->with('success', 'Venda duplicada com sucesso. Você está a editar a nova venda.');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erro ao duplicar venda: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Ocorreu um erro ao duplicar a venda: ' . $e->getMessage());
        }
    }
}
