<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Quotation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'quotation_number',
        'customer_id',
        'user_id',
        'issue_date',
        'expiry_date',
        'status',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total',
        'currency_code',
        'exchange_rate',
        'notes',
        'terms',
        'include_tax',
        'converted_to_order_id',
        'converted_to_sale_id',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
        'subtotal' => 'float',
        'tax_amount' => 'float',
        'discount_amount' => 'float',
        'total' => 'float',
        'exchange_rate' => 'float',
        'include_tax' => 'boolean',
    ];

    /**
     * Gerar automaticamente o número da cotação
     */
    public static function generateQuotationNumber(): string
    {
        $lastQuotation = self::withTrashed()->orderBy('id', 'desc')->first();
        $nextId = $lastQuotation ? $lastQuotation->id + 1 : 1;
        $year = date('Y');

        return "COT-{$year}-" . str_pad($nextId, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Relação com o cliente
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Relação com o utilizador que criou a cotação
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relação com os itens da cotação
     */
    public function items()
    {
        return $this->hasMany(QuotationItem::class)->orderBy('sort_order');
    }

    /**
     * Relação com a encomenda, caso a cotação tenha sido convertida
     */
    public function order()
    {
        return $this->belongsTo(Order::class, 'converted_to_order_id');
    }

    /**
     * Relação com a venda, caso a cotação tenha sido convertida
     */
    public function sale()
    {
        return $this->belongsTo(Sale::class, 'converted_to_sale_id');
    }

    /**
     * Relação com a moeda
     */
    public function currency()
    {
        return $this->belongsTo(Currency::class, 'currency_code', 'code');
    }

    /**
     * Verificar se a cotação é editável
     */
    public function isEditable(): bool
    {
        return in_array($this->status, ['draft']);
    }

    /**
     * Verificar se a cotação ainda é válida
     */
    public function isValid(): bool
    {
        if ($this->status === 'expired' || $this->status === 'rejected') {
            return false;
        }

        if (!$this->expiry_date) {
            return true;
        }

        return !$this->expiry_date->isPast();
    }

    /**
     * Calcular os totais da cotação
     */
    public function calculateTotals(): void
    {
        $items = $this->items;

        $subtotal = $items->sum('subtotal');
        $taxAmount = $items->sum('tax_amount');
        $discountAmount = $items->sum('discount_amount');

        $total = $subtotal - $discountAmount;
        if ($this->include_tax) {
            $total += $taxAmount;
        }

        $this->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'discount_amount' => $discountAmount,
            'total' => $total,
        ]);
    }

    /**
     * Atualizar o status da cotação para "expired" se estiver vencida
     */
    public function updateStatusIfExpired(): bool
    {
        if ($this->expiry_date && $this->expiry_date->isPast() && $this->status !== 'expired') {
            $this->status = 'expired';
            $this->save();
            return true;
        }
        return false;
    }
}
