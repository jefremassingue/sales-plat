<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sale extends Model
{
    use HasFactory, SoftDeletes, HasUlids;

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
        'commission_rate',
        'backup_rate',
        'total_cost',
        'commission_amount',
        'backup_amount'
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
     * Relação com as despesas
     */
    public function expenses()
    {
        return $this->hasMany(SaleExpense::class);
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
     * Get all warehouses associated with this sale through items
     */
    public function warehouses()
    {
        return $this->belongsToMany(Warehouse::class, 'sale_items')
            ->distinct();
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

    public function deliveryGuides()
    {
        return $this->hasMany(DeliveryGuide::class);
    }


    /**
     * Calcular os totais da venda
     */
    public function calculateTotals(): void
    {
        $items = $this->items;

        // 1. Calcular os totais básicos a partir dos itens.
        $subtotal = $items->sum('subtotal');
        $taxAmount = $items->sum('tax_amount');
        $discountAmount = $items->sum('discount_amount');
        $totalCost = $items->sum(function ($item) {
            return $item->quantity * $item->cost;
        });

        // 2. Definir a base de cálculo para comissões.
        // Este é o valor real da receita da empresa, sobre o qual a comissão incide.
        // (Subtotal - Descontos). Não inclui IVA nem frete.
        $commissionableValue = $subtotal - $discountAmount;

        // 3. Calcular a comissão e o backup sobre a base de cálculo correta.
        $commissionAmount = $commissionableValue * ($this->commission_rate / 100);
        $backupAmount = $commissionableValue * ($this->backup_rate / 100);

        // 4. Calcular o valor total final da fatura (o que o cliente paga).
        $total = $commissionableValue; // Começa com a base
        if ($this->include_tax) {
            $total += $taxAmount; // Adiciona o IVA
        }
        $total += $this->shipping_amount ?? 0; // Adiciona o frete

        // 5. Calcular o valor pendente com base no total da fatura.
        $amountDue = $total - $this->amount_paid;

        // 6. Atualizar o registo da venda com todos os valores corretos.
        $this->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'discount_amount' => $discountAmount,
            'total' => $total,                      // Valor final da fatura
            'amount_due' => $amountDue,
            'total_cost' => $totalCost,
            'commission_amount' => $commissionAmount, // Valor de comissão corrigido
            'backup_amount' => $backupAmount        // Valor de backup corrigido
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
