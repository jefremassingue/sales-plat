<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalePayment extends Model
{
    use HasFactory, SoftDeletes, HasUlids;

    protected $fillable = [
        'sale_id',
        'amount',
        'payment_method',
        'payment_date',
        'reference',
        'notes',
        'status',
        'user_id',
        'transaction_id',
    ];

    protected $casts = [
        'amount' => 'float',
        'payment_date' => 'datetime',
    ];

    /**
     * Relação com a venda
     */
    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    /**
     * Relação com o utilizador que registrou o pagamento
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Obter o nome do método de pagamento formatado
     */
    public function getPaymentMethodNameAttribute()
    {
        $methods = [
            'cash' => 'Dinheiro',
            'card' => 'Cartão',
            'mpesa' => 'M-Pesa',
            'emola' => 'eMola',
            'bank_transfer' => 'Transferência Bancária',
            'check' => 'Cheque',
            'credit' => 'Crédito',
            'other' => 'Outro',
        ];

        return $methods[$this->payment_method] ?? $this->payment_method;
    }

    // on created check is exist reference if not generate new reference
    public static function boot()
    {
        parent::boot();

        static::created(function ($model) {
            if (empty($model->reference)) {
                $model->reference = 'PAY-' . strtoupper(uniqid());
                $model->save();
            }
        });
    }
}
