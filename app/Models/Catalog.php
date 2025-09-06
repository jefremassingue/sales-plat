<?php

namespace App\Models;

use App\Enums\CatalogStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Catalog extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'cover',
        'file',
        'status',
        'version',
        'publish_year',
        'user_id',
    ];

    protected $casts = [
        'status' => CatalogStatus::class,
    ];

    protected $appends = ['cover_url', 'file_url'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'typeable');
    }

    public function getCoverUrlAttribute()
    {
        if ($this->cover) {
            return asset('files/' . $this->cover);
        }

        return null;
    }

    public function getFileUrlAttribute()
    {
        if ($this->file) {
            return asset('files/' . $this->file);
        }

        return null;
    }
}
