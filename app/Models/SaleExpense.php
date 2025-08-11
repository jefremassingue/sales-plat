<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleExpense extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'sale_id',
        'description',
        'amount',
    ];

    protected $casts = [
        'amount' => 'float',
    ];

    /**
     * Relação com a venda
     */
    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }
}
