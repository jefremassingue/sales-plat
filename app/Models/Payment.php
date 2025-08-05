<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes, HasUlids;

    protected $fillable = [
        'sale_id',
        'amount',
        'payment_date',
        'payment_method',
        'reference',
        'notes',
        'user_id',
    ];

    protected $casts = [
        'amount' => 'float',
        'payment_date' => 'date',
    ];

    /**
     * Relação com a venda
     */
    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    /**
     * Relação com o usuário que registrou o pagamento
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
