<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sale extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sale_number',
        'customer_id',
        'user_id',
        'issue_date',
        'due_date',
        'status',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'shipping_amount',
        'total',
        'amount_paid',
        'amount_due',
        'payment_method',
        'currency_code',
        'exchange_rate',
        'notes',
        'terms',
        'include_tax',
        'reference',
        'quotation_id',
        'shipping_address',
        'billing_address',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'float',
        'tax_amount' => 'float',
        'discount_amount' => 'float',
        'shipping_amount' => 'float',
        'total' => 'float',
        'amount_paid' => 'float',
        'amount_due' => 'float',
        'exchange_rate' => 'float',
        'include_tax' => 'boolean',
    ];

    /**
     * Relação com o cliente
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Relação com o utilizador que criou a venda
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relação com os itens da venda
     */
    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    /**
     * Relação com os pagamentos
     */
    public function payments()
    {
        return $this->hasMany(SalePayment::class);
    }

    /**
     * Relação com a moeda
     */
    public function currency()
    {
        return $this->belongsTo(Currency::class, 'currency_code', 'code');
    }

    /**
     * Relação com a cotação original, se aplicável
     */
    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
    }

    /**
     * Verificar se a venda está vencida
     */
    public function isOverdue(): bool
    {
        if ($this->status === 'paid' || !$this->due_date) {
            return false;
        }

        return $this->due_date->isPast();
    }

    /**
     * Verificar se a venda é editável
     */
    public function isEditable(): bool
    {
        return in_array($this->status, ['draft', 'pending']);
    }

    /**
     * Calcular os totais da venda
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

        $total += $this->shipping_amount ?? 0;
        $amountDue = $total - $this->amount_paid;

        $this->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'discount_amount' => $discountAmount,
            'total' => $total,
            'amount_due' => $amountDue
        ]);
    }

    /**
     * Atualizar o status baseado no valor pago
     */
    public function updateStatus(): void
    {
        $total = $this->total;
        $amountPaid = $this->amount_paid;

        if ($amountPaid >= $total && $this->status !== 'paid') {
            $this->status = 'paid';
            $this->amount_due = 0;
            $this->save();
        } elseif ($amountPaid > 0 && $amountPaid < $total && $this->status !== 'partial') {
            $this->status = 'partial';
            $this->amount_due = $total - $amountPaid;
            $this->save();
        } elseif ($amountPaid <= 0 && in_array($this->status, ['paid', 'partial'])) {
            $this->status = 'pending';
            $this->amount_due = $total;
            $this->save();
        }
    }
}
