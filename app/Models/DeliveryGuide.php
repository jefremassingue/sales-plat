<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DeliveryGuide extends Model
{
    use HasFactory, SoftDeletes, HasUlids;


    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'sale_id',
        'code',
        'notes',
        'reference',
        'verified_file'
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }
    public function items()
    {
        return $this->hasMany(DeliveryGuideItem::class);
    }

}
