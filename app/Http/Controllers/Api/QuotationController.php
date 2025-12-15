<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quotation;
use App\Models\QuotationItem;
use App\Models\Customer;
use App\Models\Currency;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Jobs\SendQuotationNotificationEmail;
use App\Jobs\SendQuotationConfirmationEmail;

class QuotationController extends Controller
{
    /**
     * Store a newly created quotation.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|min:3|max:100',
            'company_name' => 'nullable|string|max:150',
            'phone' => 'required|string|max:30',
            'email' => 'required|email|max:150',
            'notes' => 'nullable|string|max:1000',
            'payment_method' => 'nullable|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.name' => 'required_if:items.*.product_id,null|string|max:255',
            'items.*.description' => 'nullable|string',
            'items.*.unit' => 'nullable|string|max:50',
            'items.*.quantity' => 'required|numeric|gt:0',
            'items.*.product_color_id' => 'nullable|exists:product_colors,id',
            'items.*.product_size_id' => 'nullable|exists:product_sizes,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $customer = Customer::firstOrCreate([
                'email' => $request->email,
                'phone' => $request->phone,
            ], [
                'name' => $request->customer_name,
                'company_name' => $request->company_name,
                'address' => $request->customer_address,
                'city' => $request->city,
                'active' => true,
                'client_type' => $request->company_name ? 'company' : 'individual',
            ]);

            $currency = Currency::getDefaultCurrency();
            $currencyCode = $currency?->code ?? 'MZN';
            $exchangeRate = $currency?->exchange_rate ?: 1.0;

            $quotation = Quotation::create([
                'quotation_number' => Quotation::generateQuotationNumber('W'),
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
                $product = null;
                if (isset($itemData['product_id'])) {
                    $product = Product::find($itemData['product_id']);
                    if (!$product) { continue; }
                    $unitPrice = (float) ($product->price ?? 0);
                    $name = $product->name;
                    $description = $product->description;
                    $unit = $product->unit ?? 'unit';
                } else {
                    $unitPrice = 0.0;
                    $name = $itemData['name'];
                    $description = $itemData['description'] ?? '';
                    $unit = $itemData['unit'] ?? 'unit';
                }

                $quantity = (float) $itemData['quantity'];
                $itemSubtotal = $quantity * $unitPrice;
                $itemDiscountAmount = 0;
                $itemTaxPercentage = 16;
                $itemTaxAmount = ($itemSubtotal - $itemDiscountAmount) * ($itemTaxPercentage / 100);
                $itemTotal = $itemSubtotal - $itemDiscountAmount + $itemTaxAmount;

                QuotationItem::create([
                    'quotation_id' => $quotation->id,
                    'product_id' => $product ? $product->id : null,
                    'product_variant_id' => null,
                    'product_color_id' => $itemData['product_color_id'] ?? null,
                    'product_size_id' => $itemData['product_size_id'] ?? null,
                    'warehouse_id' => null,
                    'name' => $name,
                    'description' => $description,
                    'quantity' => $quantity,
                    'unit' => $unit,
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
                return response()->json(['error' => 'No valid items were provided.'], 400);
            }

            $quotation->update([
                'subtotal' => $subtotal,
                'discount_amount' => $discountTotal,
                'tax_amount' => $taxTotal,
                'total' => $grandTotal,
            ]);

            // Send confirmation email to customer
            if ($customer->email) {
                SendQuotationConfirmationEmail::dispatch($quotation->id, $customer->email);
            }

            // Send notification emails to admins
            $recipients = config('mail.quotation_notify', []);
            if (is_array($recipients) && !empty($recipients)) {
                foreach ($recipients as $email) {
                    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                        SendQuotationNotificationEmail::dispatch($quotation->id, $email);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => 'Quotation created successfully!',
                'quotation_number' => $quotation->quotation_number,
                'quotation' => $quotation->load(['customer', 'items.product'])
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Error creating quotation via API', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'An error occurred while processing your quotation.'], 500);
        }
    }

    private function buildNotes(Request $request): string
    {
        $parts = [];
        if ($request->notes) { $parts[] = 'Customer notes: ' . $request->notes; }
        if ($request->payment_method) { $parts[] = 'Preferred payment method: ' . $request->payment_method; }
        return implode("\n\n", $parts);
    }
}
