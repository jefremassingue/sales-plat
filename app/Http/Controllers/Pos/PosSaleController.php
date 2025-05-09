<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Currency;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\SalePayment;

class PosSaleController extends Controller
{
    /**
     * Exibe a interface do POS.
     */
    public function index(Request $request)
    {
        $products = Product::with(['inventories' => function ($query) {
            $query->where('status', 'active');
        }])->get();

        $customers = Customer::orderBy('name')->get();
        $currencies = Currency::orderBy('code')->get();
        $warehouses = Warehouse::where('active', true)->orderBy('is_main', 'desc')->get();
        $recentSales = Sale::with('customer')
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get();

        return Inertia::render('Pos/Sale/Pos', [
            'products' => $products,
            'customers' => $customers,
            'currencies' => $currencies,
            'defaultCurrency' => Currency::where('code', 'MZN')->first(),
            'warehouses' => $warehouses,
            'recentSales' => $recentSales,
        ]);
    }

    /**
     * Registra uma nova venda.
     */
    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.warehouse_id' => 'required|exists:warehouses,id',
            'items.*.name' => 'required|string|max:255',
            'items.*.unit' => 'required|string|max:10',
            'items.*.is_custom' => 'boolean',
            'amount_paid' => 'required|numeric|min:0',
            'currency_code' => 'required|exists:currencies,code',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'payment_method' => 'required|string|in:cash,card,mpesa,emola,bank_transfer,check,credit,other',
            'payment_reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            // Verificar disponibilidade de estoque apenas para produtos não personalizados
            foreach ($request->items as $item) {
                if (!$item['is_custom'] && $item['product_id']) {
                    $inventory = DB::table('inventories')
                        ->where('product_id', $item['product_id'])
                        ->where('warehouse_id', $item['warehouse_id'])
                        ->where('status', 'active')
                        ->first();

                    if (!$inventory || $inventory->quantity < $item['quantity']) {
                        throw new \Exception("Produto sem estoque suficiente no armazém selecionado.");
                    }
                }
            }

            // Criar a venda
            $sale = Sale::create([
                'sale_number' => $this->generateUniqueSaleNumber(),
                'customer_id' => $request->customer_id,
                'currency_code' => $request->currency_code,
                'amount_paid' => $request->amount_paid,
                'discount_percentage' => $request->discount_percentage ?? 0,
                'status' => $this->determineSaleStatus($request->amount_paid, $request->items),
                'user_id' => auth()->id(),
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
                'issue_date' => now(),
            ]);

            // Criar os itens da venda e atualizar o inventário
            foreach ($request->items as $item) {
                // Criar item da venda
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['is_custom'] ? null : $item['product_id'],
                    'warehouse_id' => $item['warehouse_id'],
                    'name' => $item['name'],
                    'quantity' => $item['quantity'],
                    'unit' => $item['unit'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                    'total' => $item['quantity'] * $item['unit_price'],
                ]);

                // Atualizar inventário apenas para produtos não personalizados
                if (!$item['is_custom'] && $item['product_id']) {
                    DB::table('inventories')
                        ->where('product_id', $item['product_id'])
                        ->where('warehouse_id', $item['warehouse_id'])
                        ->where('status', 'active')
                        ->decrement('quantity', $item['quantity']);
                }
            }

            // Registrar o pagamento
            SalePayment::create([
                'sale_id' => $sale->id,
                'amount' => $request->amount_paid,
                'payment_method' => $request->payment_method,
                'payment_date' => now(),
                'reference' => $request->payment_reference,
                'notes' => $request->notes,
                'status' => 'completed',
                'user_id' => auth()->id()
            ]);

            DB::commit();
            return response()->json(['message' => 'Venda registrada com sucesso!']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Gera um número único para a venda.
     */
    private function generateUniqueSaleNumber()
    {
        $prefix = 'POS';
        $date = now()->format('Ymd');
        $lastSale = Sale::where('sale_number', 'like', "{$prefix}{$date}%")
            ->orderBy('sale_number', 'desc')
            ->first();

        if ($lastSale) {
            $lastNumber = (int) substr($lastSale->sale_number, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "{$prefix}{$date}{$newNumber}";
    }

    /**
     * Gera o PDF do recibo da venda.
     */
    public function printSale($id)
    {
        $sale = Sale::with(['items.product', 'customer', 'currency'])
            ->findOrFail($id);

        return view('pos.sales.print', [
            'sale' => $sale,
        ]);
    }

    /**
     * Determina o status da venda com base no valor pago
     */
    private function determineSaleStatus($amountPaid, $items)
    {
        // Calcular o total da venda
        $total = 0;
        foreach ($items as $item) {
            $subtotal = $item['quantity'] * $item['unit_price'];
            $discount = $subtotal * (($item['discount_percentage'] ?? 0) / 100);
            $total += $subtotal - $discount;
        }

        // Aplicar desconto geral se existir
        if (isset($request->discount_percentage)) {
            $total = $total * (1 - ($request->discount_percentage / 100));
        }

        // Determinar status com base no pagamento
        if (abs($amountPaid - $total) < 0.01) {
            // Se o valor pago é igual (ou quase igual) ao total, status é 'paid'
            return 'paid';
        } elseif ($amountPaid > 0) {
            // Se pagou parte, status é 'partial'
            return 'partial';
        } else {
            // Se não pagou nada, status é 'pending'
            return 'pending';
        }
    }
} 