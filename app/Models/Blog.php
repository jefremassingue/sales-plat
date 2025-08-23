<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Blog extends Model
{
    use HasFactory, SoftDeletes, HasUlids;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'excerpt',
        'featured_image',
        'status',
        'published_at',
        'user_id',
        'blog_category_id'
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'status' => 'boolean'
    ];

    /**
     * Extra attributes to be appended when the model is serialized.
     * These provide aliases expected by the frontend components.
     */
    protected $appends = [
        'blog_category',
        'author',
    ];

    public function image()
    {
        return $this->morphOne(Image::class, 'typeable');
    }


    /**
     * Relacionamento com o usuário autor do post
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relacionamento com a categoria do post
     */
    public function category()
    {
        return $this->belongsTo(BlogCategory::class, 'blog_category_id');
    }

    /**
     * Alias the category relation as blog_category for the frontend.
     */
    public function getBlogCategoryAttribute()
    {
    return $this->relationLoaded('category') ? $this->getRelation('category') : null;
    }

    /**
     * Alias the user relation as author for the frontend.
     */
    public function getAuthorAttribute()
    {
    return $this->relationLoaded('user') ? $this->getRelation('user') : null;
    }

    /**
     * Scope for published blogs (status true and published_at in the past).
     */
    public function scopePublished($query)
    {
        return $query->where('status', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }
}
