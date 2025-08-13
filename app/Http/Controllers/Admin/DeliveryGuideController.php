<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryGuide;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use App\Models\Setting;
use Barryvdh\DomPDF\Facade\Pdf;

class DeliveryGuideController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Sale $sale)
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.sale_item_id' => 'required|string|exists:sale_items,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Custom validation to check pending quantities
        foreach ($request->items as $itemData) {
            $saleItem = SaleItem::find($itemData['sale_item_id']);
            if ($itemData['quantity'] > $saleItem->pending_quantity) {
                return redirect()->back()->withErrors([
                    'items' => "A quantidade para o item '{$saleItem->name}' excede a quantidade pendente de {$saleItem->pending_quantity}."
                ])->withInput();
            }
        }

        DB::beginTransaction();
        try {
            $deliveryGuide = $sale->deliveryGuides()->create([
                'notes' => $request->notes,
                'code' => $this->generateUniqueDeliveryNumber()
            ]);

            foreach ($request->items as $itemData) {
                // dd($itemData['sale_item_id']);
                $deliveryGuide->items()->create([
                    'sale_item_id' => $itemData['sale_item_id'],
                    'quantity' => $itemData['quantity'],
                    'notes' => $itemData['notes'] ?? '',
                ]);
            }

            DB::commit();

            return redirect()->route('admin.sales.show', $sale);
        } catch (\Exception $e) {
            DB::rollBack();
            // dd($e);
            return redirect()->back()->with('error', 'Ocorreu um erro ao criar a guia de entrega: ' . $e->getMessage())->withInput();
        }
    }

      /**
     * Gera um número de venda único com bloqueio para evitar duplicação
     */
    private function generateUniqueDeliveryNumber()
    {
        $prefix = 'ENT-' . date('Ym') . '-';
        $lastSale = DeliveryGuide::where('code', 'LIKE', $prefix . '%')
            ->orderByRaw('CAST(SUBSTRING(code, ' . (strlen($prefix) + 1) . ') AS UNSIGNED) DESC')
            ->first();

        if ($lastSale) {
            $lastNumber = substr($lastSale->code, strlen($prefix));
            $nextNumber = intval($lastNumber) + 1;
        } else {
            $nextNumber = 1;
        }

        $saleNumber = $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

        // Verificar se o número gerado já existe
        while (Sale::where('code', $saleNumber)->exists()) {
            $nextNumber++;
            $saleNumber = $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        }

        return $saleNumber;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Sale $sale, DeliveryGuide $deliveryGuide)
    {
        // Check if this is the last delivery guide for the sale
        $lastGuide = $sale->deliveryGuides()->latest('id')->first();
        if ($lastGuide && $deliveryGuide->id !== $lastGuide->id) {
            return redirect()->back()->with('error', 'Apenas a última guia de entrega pode ser editada.');
        }

        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.sale_item_id' => 'required|string|exists:sale_items,id',
            'items.*.quantity' => 'required|numeric|min:0', // 0 is allowed to remove an item
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Custom validation for update
        foreach ($request->items as $itemData) {
            $saleItem = SaleItem::find($itemData['sale_item_id']);
            $originalGuideItem = $deliveryGuide->items()->where('sale_item_id', $saleItem->id)->first();
            $originalQuantity = $originalGuideItem ? $originalGuideItem->quantity : 0;
            
            // The max allowed quantity is the current pending quantity plus what was originally on this guide
            $maxAllowed = $saleItem->pending_quantity + $originalQuantity;

            if ($itemData['quantity'] > $maxAllowed) {
                return redirect()->back()->withErrors([
                    'items' => "A quantidade para o item '{$saleItem->name}' excede o máximo permitido de {$maxAllowed}."
                ])->withInput();
            }
        }

        DB::beginTransaction();
        try {
            $deliveryGuide->update([
                'notes' => $request->notes,
            ]);

            // Sync items
            $deliveryGuide->items()->delete(); // Remove old items
            foreach ($request->items as $itemData) {
                if ($itemData['quantity'] > 0) { // Only add items with quantity > 0
                    $deliveryGuide->items()->create([
                        'sale_item_id' => $itemData['sale_item_id'],
                        'quantity' => $itemData['quantity'],
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('admin.sales.show', $sale)->with('success', 'Guia de entrega atualizada com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Ocorreu um erro ao atualizar a guia de entrega: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale, DeliveryGuide $deliveryGuide)
    {
        // Check if this is the last delivery guide for the sale
        $lastGuide = $sale->deliveryGuides()->latest('id')->first();
        if ($lastGuide && $deliveryGuide->id !== $lastGuide->id) {
            return redirect()->back()->with('error', 'Apenas a última guia de entrega pode ser eliminada.');
        }

        DB::beginTransaction();
        try {
            // Delete the associated file if it exists
            if ($deliveryGuide->verified_file) {
                // Assuming the path is relative to the 'public' disk's root
                $filePath = str_replace('/storage/', '', $deliveryGuide->verified_file);
                if (Storage::disk('public')->exists($filePath)) {
                    Storage::disk('public')->delete($filePath);
                }
            }

            $deliveryGuide->delete();
            DB::commit();

            return redirect()->route('admin.sales.show', $sale)->with('success', 'Guia de entrega eliminada com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Ocorreu um erro ao eliminar a guia de entrega: ' . $e->getMessage());
        }
    }

    /**
     * Handle file upload for a delivery guide.
     */
    public function uploadAttachment(Request $request, DeliveryGuide $deliveryGuide)
    {
        $request->validate([
            'attachment' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        DB::beginTransaction();
        try {
            // Delete the old file if it exists
            if ($deliveryGuide->verified_file) {
                $oldFilePath = str_replace('/storage/', '', $deliveryGuide->verified_file);
                if (Storage::disk('public')->exists($oldFilePath)) {
                    Storage::disk('public')->delete($oldFilePath);
                }
            }

            $file = $request->file('attachment');
            $path = $file->store('delivery-guides', 'public');

            $deliveryGuide->update([
                'verified_file' => Storage::url($path),
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Anexo carregado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Falha ao carregar o anexo: ' . $e->getMessage());
        }
    }

    /**
     * Generate a PDF for the delivery guide.
     */
    public function print(DeliveryGuide $deliveryGuide)
    {
        $sale = $deliveryGuide->sale()->with('customer', 'items.product')->firstOrFail();
        $companySettings = Setting::whereIn('key', ['company_name', 'company_address', 'company_phone', 'company_email', 'company_tax_number', 'header_image', 'footer_image', 'footer_text'])->get()->keyBy('key');
        $bankSettings = Setting::whereIn('key', ['bank_name', 'account_number', 'nib'])->get()->keyBy('key');

        $data = [
            'sale' => $sale,
            'deliveryGuide' => $deliveryGuide,
            'company' => $companySettings,
            'bank' => $bankSettings,
            'documentTitle' => 'GUIA DE ENTREGA',
            'documentNumber' => $deliveryGuide->code,
        ];

        $pdf = Pdf::loadView('pdf.delivery_guide', $data);
        return $pdf->stream('guia_entrega_' . $deliveryGuide->code . '.pdf');
    }
}
