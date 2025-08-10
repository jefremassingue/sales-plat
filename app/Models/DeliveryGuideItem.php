<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryGuideItem extends Model
{
    use HasFactory, HasUlids;
    
    protected $fillable = [
        'delivery_guide_id',
        'sale_item_id',
        'quantity',
        'notes'
    ];

    public function deliveryGuide()
    {
        return $this->belongsTo(DeliveryGuide::class);
    }
    public function saleItem()
    {
        return $this->belongsTo(SaleItem::class);
    }
}
