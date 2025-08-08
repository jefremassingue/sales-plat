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
use App\Models\QuotationItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class QuotationController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:admin-quotation.index', only: ['index']),
            new Middleware('permission:admin-quotation.create', only: ['create', 'store']),
            new Middleware('permission:admin-quotation.edit', only: ['edit', 'update']),
            new Middleware('permission:admin-quotation.show', only: ['show']),
            new Middleware('permission:admin-quotation.destroy', only: ['destroy']),
            new Middleware('permission:admin-quotation.updatestatus', only: ['updateStatus']),
            new Middleware('permission:admin-quotation.generatepdf', only: ['generatePdf']),
            new Middleware('permission:admin-quotation.sendemail', only: ['sendEmail']),
            new Middleware('permission:admin-quotation.duplicate', only: ['duplicate']),
            new Middleware('permission:admin-quotation.converttosale', only: ['convertToSale']),
        ];
    }

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

        // Calcular estatísticas
        $stats = $this->calculateQuotationStats();

        // Dados para filtros
        $customers = Customer::select('id', 'name', 'email')->orderBy('name')->get();
        $statuses = $this->getQuotationStatuses();

        // Obter a moeda padrão para formatação de valores
        $defaultCurrency = Currency::where('is_default', true)->first();

        return Inertia::render('Admin/Quotations/Index', [
            'quotations' => $quotations,
            'customers' => $customers,
            'statuses' => $statuses,
            'currency' => $defaultCurrency,
            'stats' => $stats,
            'filters' => $request->all(['search', 'customer_id', 'status', 'date_from', 'date_to', 'sort_field', 'sort_order']),
        ]);
    }

    /**
     * Calcular estatísticas das cotações
     */
    private function calculateQuotationStats()
    {
        try {
            // Cache as estatísticas por um curto período para melhor performance
            return Cache::remember('quotation_stats', 60, function () {
                $total = Quotation::count();
                $draftCount = Quotation::where('status', 'draft')->count();
                $sentCount = Quotation::where('status', 'sent')->count();
                $approvedCount = Quotation::where('status', 'approved')->count();
                $rejectedCount = Quotation::where('status', 'rejected')->count();
                $expiredCount = Quotation::where('status', 'expired')->count();
                $convertedCount = Quotation::where('status', 'converted')->count();

                // Calcular valores financeiros (usando a moeda base)
                $totalValue = Quotation::sum('total');
                $pendingValue = Quotation::whereIn('status', ['draft', 'sent'])->sum('total');

                return [
                    'total' => $total,
                    'draft' => $draftCount,
                    'sent' => $sentCount,
                    'approved' => $approvedCount,
                    'rejected' => $rejectedCount,
                    'expired' => $expiredCount,
                    'converted' => $convertedCount,
                    'total_value' => $totalValue,
                    'pending_value' => $pendingValue
                ];
            });
        } catch (\Exception $e) {
            Log::error('Erro ao calcular estatísticas das cotações: ' . $e->getMessage());

            // Retornar valores padrão em caso de erro
            return [
                'total' => 0,
                'draft' => 0,
                'sent' => 0,
                'approved' => 0,
                'rejected' => 0,
                'expired' => 0,
                'converted' => 0,
                'total_value' => 0,
                'pending_value' => 0
            ];
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            $placeholderNumber = 'AUTO-' . date('Ym');
            $customers = Customer::select('id', 'name', 'email', 'phone', 'address')->orderBy('name')->get();
            $products = Product::select('id', 'name', 'price', 'sku', 'cost', 'unit')->with('variants')->get();
            $warehouses = Warehouse::select('id', 'name', 'is_main')->where('active', true)->orderBy('name')->get();
            $currencies = Currency::where('is_active', true)->orderBy('is_default', 'desc')->get();
            $defaultCurrency = Currency::where('is_default', true)->first() ?: new Currency(['code' => 'MZN', 'name' => 'Metical Moçambicano', 'symbol' => 'MT']);
            $units = UnitEnum::toArray();

            return Inertia::render('Admin/Quotations/Create', [
                'quotationPlaceholder' => $placeholderNumber,
                'customers' => $customers,
                'products' => $products,
                'warehouses' => $warehouses,
                'currencies' => $currencies,
                'defaultCurrency' => $defaultCurrency,
                'taxRates' => $this->getTaxRates(),
                'statuses' => $this->getQuotationStatuses(),
                'discountTypes' => $this->getDiscountTypes(),
                'units' => $units,
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao carregar formulário de cotação: ' . $e->getMessage(), [
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
                $quotationNumber = $this->generateUniqueQuotationNumber();
                $quotationData = $request->except('items');
                $quotationData['user_id'] = Auth::id();
                $quotationData['quotation_number'] = $quotationNumber;

                $quotation = Quotation::create($quotationData);

                $sort = 0;
                foreach ($request->items as $itemData) {
                    $itemData['quotation_id'] = $quotation->id;
                    $itemData['sort_order'] = $sort++;

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

                    $item = new QuotationItem($itemData);
                    $item->calculateValues();
                    $item->save();
                }

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
     * Gera um número de cotação único com bloqueio para evitar duplicação em ambiente multi-usuário
     */
    private function generateUniqueQuotationNumber()
    {
        $lockName = 'quotation_number_generation_lock';
        $lockAcquired = Cache::lock($lockName, 10)->get();

        if (!$lockAcquired) {
            sleep(1);
            return $this->generateUniqueQuotationNumber();
        }

        try {
            $prefix = 'QT-' . date('Ym') . '-';
            $lastQuotation = Quotation::where('quotation_number', 'LIKE', $prefix . '%')
                ->orderByRaw('CAST(SUBSTRING(quotation_number, ' . (strlen($prefix) + 1) . ') AS UNSIGNED) DESC')
                ->first();

            if ($lastQuotation) {
                $lastNumber = substr($lastQuotation->quotation_number, strlen($prefix));
                $nextNumber = intval($lastNumber) + 1;
            } else {
                $nextNumber = 1;
            }

            $quotationNumber = $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

            while (Quotation::where('quotation_number', $quotationNumber)->exists()) {
                $nextNumber++;
                $quotationNumber = $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
            }

            return $quotationNumber;
        } finally {
            Cache::lock($lockName)->release();
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

        $quotation->updateStatusIfExpired();

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
        $units = UnitEnum::toArray();

        return Inertia::render('Admin/Quotations/Edit', [
            'quotation' => $quotation,
            'customers' => $customers,
            'products' => $products,
            'warehouses' => $warehouses,
            'currencies' => $currencies,
            'taxRates' => $this->getTaxRates(),
            'statuses' => $this->getQuotationStatuses(),
            'discountTypes' => $this->getDiscountTypes(),
            'units' => $units,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Quotation $quotation)
    {
        try {
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
                $quotationData = $request->except('items');
                $quotation->update($quotationData);

                $existingItemIds = [];
                $sort = 0;

                foreach ($request->items as $itemData) {
                    $itemData['sort_order'] = $sort++;

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

                QuotationItem::where('quotation_id', $quotation->id)
                    ->whereNotIn('id', $existingItemIds)
                    ->delete();

                $quotation->calculateTotals();

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
        // Carregar a cotação com seus relacionamentos
        $quotation->load(['customer', 'user', 'items' => function ($query) {
            $query->with(['product', 'productVariant', 'warehouse']);
        }]);

        // Obter informações de inventário para cada item
        foreach ($quotation->items as $item) {
            $item->available_quantity = $item->getInventoryAvailability();
        }

        // Carregar informações da empresa e dados bancários
        $company = DB::table('settings')->where('group', 'company')->get()->keyBy('key');
        $bank = DB::table('settings')->where('group', 'bank')->get()->keyBy('key');

        // Obter dados de moeda
        $currency = Currency::where('code', $quotation->currency_code)->first() ?: null;

        // Gerar o PDF usando a view
        $pdf = \PDF::setOptions([
            'isPhpEnabled'        => true,
            'isHtml5ParserEnabled'=> true,
            'isRemoteEnabled'        => true,            // <-- permite URLs remotas (http/https)
            'enable_local_file_access'=> true,           // <-- permite file:// e acessos locais
            'chroot'                 => public_path(),
        ])->loadView('pdf.quotation', [
            'quotation' => $quotation,
            'company' => $company,
            'currency' => $currency,
            'bank' => $bank
        ]);

        // Definir o nome do arquivo
        $filename = 'cotacao_' . $quotation->quotation_number . '.pdf';

        // Verificar se é para download ou visualização
        if (request()->has('download') && request()->download === 'true') {
            // Download do arquivo
            return $pdf->download($filename);
        } else {
            // Visualização no navegador
            return $pdf->stream($filename);
        }
    }

    /**
     * Enviar cotação por e-mail para o cliente
     */
    public function sendEmail(Quotation $quotation)
    {
        try {
            DB::beginTransaction();

            // Verificar se o cliente existe e tem email
            if (!$quotation->customer || !$quotation->customer->email) {
                return redirect()->back()->with('error', 'Cliente sem endereço de email válido para envio.');
            }

            // Carregar relações necessárias
            $quotation->load(['customer', 'items' => function ($query) {
                $query->with(['product', 'productVariant', 'warehouse']);
            }]);

            // Obter informações da empresa e dados bancários
            $company = DB::table('settings')->where('group', 'company')->get()->keyBy('key');
            $bank = DB::table('settings')->where('group', 'bank')->get()->keyBy('key');

            // Obter dados de moeda
            $currency = Currency::where('code', $quotation->currency_code)->first() ?: null;

            // Gerar PDF anexo
            $pdf = \PDF::setOptions([
                'isPhpEnabled'        => true,
                'isHtml5ParserEnabled'=> true,
                'isRemoteEnabled'     => true,
                'enable_local_file_access'=> true,
                'chroot'              => public_path(),
            ])->loadView('pdf.quotation', [
                'quotation' => $quotation,
                'company' => $company,
                'currency' => $currency,
                'bank' => $bank
            ]);

            $pdfContent = $pdf->output();
            $pdfFilename = 'cotacao_' . $quotation->quotation_number . '.pdf';

            // Enviar email com o PDF anexo
            \Mail::send('emails.quotation', [
                'quotation' => $quotation,
                'company' => $company,
            ], function($message) use ($quotation, $pdfContent, $pdfFilename, $company) {
                $message->to($quotation->customer->email, $quotation->customer->name)
                        ->subject('Cotação ' . $quotation->quotation_number)
                        ->attachData($pdfContent, $pdfFilename, [
                            'mime' => 'application/pdf',
                        ]);

                // Adicionar remetente se configurado
                if (isset($company['email'])) {
                    $senderName = $company['name'] ?? 'Matony';
                    $message->from($company['email']->value, $senderName->value);
                }
            });

            // Se o status for rascunho e o envio foi bem-sucedido, altera para enviado
            if ($quotation->status === 'draft') {
                $quotation->status = 'sent';
                $quotation->save();
            }

            DB::commit();

            return redirect()->back()->with('success', 'Cotação enviada com sucesso para ' . $quotation->customer->email);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erro ao enviar cotação por email: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'quotation_id' => $quotation->id
            ]);

            return redirect()->back()->with('error', 'Ocorreu um erro ao enviar o email: ' . $e->getMessage());
        }
    }

    /**
     * Duplicar uma cotação existente
     */
    public function duplicate(Quotation $quotation)
    {
        try {
            DB::beginTransaction();

            // Carregar itens da cotação
            $quotation->load('items');

            // Criar nova cotação com os mesmos dados mas com status rascunho
            $newQuotation = $quotation->replicate([
                'quotation_number',
                'status',
                'created_at',
                'updated_at'
            ]);

            $newQuotation->quotation_number = $this->generateUniqueQuotationNumber();
            $newQuotation->status = 'draft';
            $newQuotation->issue_date = now()->format('Y-m-d');

            // Se a cotação original tinha data de validade, definir nova data de validade
            if ($quotation->expiry_date) {
                $daysValid = now()->diffInDays($quotation->expiry_date);
                $newQuotation->expiry_date = now()->addDays($daysValid)->format('Y-m-d');
            }

            $newQuotation->save();

            // Duplicar os itens da cotação
            foreach ($quotation->items as $item) {
                $newItem = $item->replicate(['quotation_id', 'created_at', 'updated_at']);
                $newItem->quotation_id = $newQuotation->id;
                $newItem->save();
            }

            $newQuotation->calculateTotals();

            DB::commit();

            return redirect()->route('admin.quotations.edit', $newQuotation)
                ->with('success', 'Cotação duplicada com sucesso. Você está a editar a nova cotação.');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erro ao duplicar cotação: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'quotation_id' => $quotation->id
            ]);

            return redirect()->back()->with('error', 'Ocorreu um erro ao duplicar a cotação: ' . $e->getMessage());
        }
    }

    /**
     * Converte uma cotação em uma venda.
     */
    public function convertToSale(Quotation $quotation)
    {
        try {
            // Verificar se a cotação pode ser convertida
            if (!in_array($quotation->status, ['sent', 'approved'])) {
                return redirect()->back()->with('error', 'Apenas cotações enviadas ou aprovadas podem ser convertidas em venda.');
            }

            if ($quotation->converted_to_sale_id) {
                return redirect()->back()->with('error', 'Esta cotação já foi convertida na venda ID: ' . $quotation->converted_to_sale_id);
            }

            DB::beginTransaction();

            // 1. Criar a Venda
            $sale = Sale::create([
                'customer_id' => $quotation->customer_id,
                'user_id' => Auth::id(),
                'sale_number' => $this->generateUniqueSaleNumber(),
                'issue_date' => now()->format('Y-m-d'),
                'due_date' => now()->addDays(30)->format('Y-m-d'), // Padrão de 30 dias, pode ser ajustado
                'status' => 'pending', // Inicia como pendente
                'currency_code' => $quotation->currency_code,
                'exchange_rate' => $quotation->exchange_rate,
                'subtotal' => $quotation->subtotal,
                'discount_amount' => $quotation->discount_amount,
                'tax_amount' => $quotation->tax_amount,
                'shipping_amount' => $quotation->shipping_amount,
                'total' => $quotation->total,
                'amount_paid' => 0,
                'shipping_amount' => 0,
                'amount_due' => $quotation->total,
                'notes' => $quotation->notes,
                'terms' => $quotation->terms,
                'include_tax' => $quotation->include_tax,
                'quotation_id' => $quotation->id,
            ]);

            // 2. Copiar os Itens da Cotação para a Venda e atualizar inventário
            $quotation->load('items');
            foreach ($quotation->items as $quotationItem) {
                $saleItem = SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $quotationItem->product_id,
                    'product_variant_id' => $quotationItem->product_variant_id,
                    'warehouse_id' => $quotationItem->warehouse_id,
                    'name' => $quotationItem->name,
                    'description' => $quotationItem->description,
                    'quantity' => $quotationItem->quantity,
                    'unit' => $quotationItem->unit,
                    'unit_price' => $quotationItem->unit_price,
                    'subtotal' => $quotationItem->subtotal,
                    'discount_type' => $quotationItem->discount_type,
                    'discount_value' => $quotationItem->discount_value,
                    'discount_amount' => $quotationItem->discount_amount,
                    'tax_percentage' => $quotationItem->tax_percentage,
                    'tax_amount' => $quotationItem->tax_amount,
                    'total' => $quotationItem->total,
                    'sort_order' => $quotationItem->sort_order,
                ]);

                // Atualizar o inventário
                if ($saleItem->product_id && $saleItem->warehouse_id) {
                    $inventory = Inventory::where('product_id', $saleItem->product_id)
                        ->where('warehouse_id', $saleItem->warehouse_id)
                        ->where('product_variant_id', $saleItem->product_variant_id)
                        ->first();

                    if ($inventory) {
                        $inventory->quantity -= $saleItem->quantity;
                        $inventory->save();
                    }
                }
            }

            // 3. Atualizar a Cotação
            $quotation->status = 'converted';
            $quotation->converted_to_sale_id = $sale->id;
            $quotation->save();

            DB::commit();

            return redirect()->route('admin.sales.show', $sale->id)
                ->with('success', 'Cotação convertida em venda com sucesso!');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao converter cotação em venda: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'quotation_id' => $quotation->id,
            ]);
            return redirect()->back()->with('error', 'Ocorreu um erro ao converter a cotação: ' . $e->getMessage());
        }
    }

    /**
     * Gera um número de venda único.
     * NOTA: Idealmente, esta lógica estaria em um Trait ou Service para evitar duplicação.
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

        while (Sale::where('sale_number', $saleNumber)->exists()) {
            $nextNumber++;
            $saleNumber = $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        }

        return $saleNumber;
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

            $query = Inventory::where('product_id', $productId)
                ->where('warehouse_id', $warehouseId);

            if ($variantId) {
                $query->where('product_variant_id', $variantId);
            } else {
                $query->whereNull('product_variant_id');
            }

            $inventory = $query->first();

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
            ['id' => 1, 'value' => 0, 'label' => 'Isento (0%)', 'is_default' => false],
            ['id' => 2, 'value' => 16, 'label' => 'IVA (16%)', 'is_default' => true],
        ];
    }
}
