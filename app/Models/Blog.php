<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Blog extends Model
{
    use HasFactory, SoftDeletes;

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
        return $this->belongsTo(BlogCategory::class);
    }
}
