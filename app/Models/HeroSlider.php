<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class HeroSlider extends Model
{
    use HasFactory;

    protected $fillable = [
        'supertitle',
        'title',
        'subtitle',
        'cta_text',
        'cta_link',
        'text_position',
        'text_color',
        'overlay_color',
        'active',
        'order',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    protected $appends = ['image_url'];

    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'typeable');
    }

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return $this->image->url;
        }

        return null;
    }
}