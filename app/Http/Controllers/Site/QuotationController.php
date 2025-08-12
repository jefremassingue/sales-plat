<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Quotation;
use App\Models\QuotationItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Jobs\SendQuotationNotificationEmail;

class QuotationController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fullName' => 'required|string|min:3|max:100',
            'companyName' => 'nullable|string|max:150',
            'phone' => 'required|string|max:30',
            'email' => 'required|email|max:150',
            'notes' => 'nullable|string|max:1000',
            'paymentMethod' => 'nullable|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|string',
            'items.*.quantity' => 'required|numeric|gt:0',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            $customer = Customer::firstOrCreate([
                'email' => $request->email,
            ], [
                'name' => $request->fullName,
                'company_name' => $request->companyName,
                'phone' => $request->phone,
                'address' => $request->streetAndNumber,
                'city' => $request->city,
                'active' => true,
                'client_type' => $request->companyName ? 'company' : 'individual',
            ]);

            $currency = Currency::getDefaultCurrency();
            $currencyCode = $currency?->code ?? 'MZN';
            $exchangeRate = $currency?->exchange_rate ?: 1.0;

            $quotation = Quotation::create([
                'quotation_number' => Quotation::generateQuotationNumber(),
                'customer_id' => $customer->id,
                'user_id' => null,
                'issue_date' => now()->toDateString(),
                'expiry_date' => now()->addDays(15)->toDateString(),
                'status' => 'draft',
                'currency_code' => $currencyCode,
                'exchange_rate' => $exchangeRate,
                'include_tax' => true,
                'notes' => $this->buildNotes($request),
            ]);

            $sort = 0; $subtotal = 0; $discountTotal = 0; $taxTotal = 0; $grandTotal = 0;
            foreach ($request->items as $itemData) {
                $product = Product::find($itemData['product_id']);
                if (!$product) { continue; }
                $quantity = (float) $itemData['quantity'];
                $unitPrice = (float) ($product->price ?? 0);
                $itemSubtotal = $quantity * $unitPrice;
                $itemDiscountAmount = 0;
                $itemTaxPercentage = 16;
                $itemTaxAmount = ($itemSubtotal - $itemDiscountAmount) * ($itemTaxPercentage / 100);
                $itemTotal = $itemSubtotal - $itemDiscountAmount + $itemTaxAmount;

                QuotationItem::create([
                    'quotation_id' => $quotation->id,
                    'product_id' => $product->id,
                    'product_variant_id' => null,
                    'warehouse_id' => null,
                    'name' => $product->name,
                    'description' => $product->description,
                    'quantity' => $quantity,
                    'unit' => $product->unit ?? 'unit',
                    'unit_price' => $unitPrice,
                    'discount_percentage' => 0,
                    'discount_amount' => $itemDiscountAmount,
                    'tax_percentage' => $itemTaxPercentage,
                    'tax_amount' => $itemTaxAmount,
                    'subtotal' => $itemSubtotal,
                    'total' => $itemTotal,
                    'sort_order' => $sort++,
                ]);

                $subtotal += $itemSubtotal;
                $discountTotal += $itemDiscountAmount;
                $taxTotal += $itemTaxAmount;
                $grandTotal += $itemTotal;
            }

            if ($sort === 0) {
                DB::rollBack();
                return back()->withErrors(['items' => 'Nenhum item válido foi enviado.'])->withInput();
            }

            $quotation->update([
                'subtotal' => $subtotal,
                'discount_amount' => $discountTotal,
                'tax_amount' => $taxTotal,
                'total' => $grandTotal,
            ]);

            // Disparar Job por destinatário (fila)
            $recipients = config('mail.quotation_notify', []);
            if (is_array($recipients) && !empty($recipients)) {
                foreach ($recipients as $email) {
                    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { continue; }
                    SendQuotationNotificationEmail::dispatch($quotation->id, $email);
                }
            }

            DB::commit();

            return redirect()->route('quotation')->with([
                'success' => 'Cotação enviada com sucesso!',
                'quotation_number' => $quotation->quotation_number,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Erro ao criar cotação pública', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return back()->withErrors(['error' => 'Ocorreu um erro ao processar a sua cotação.'])->withInput();
        }
    }

    private function buildNotes(Request $request): string
    {
        $parts = [];
        if ($request->notes) { $parts[] = 'Notas do cliente: '.$request->notes; }
        if ($request->paymentMethod) { $parts[] = 'Método de pagamento preferido: '.$request->paymentMethod; }
        return implode("\n\n", $parts);
    }
}
