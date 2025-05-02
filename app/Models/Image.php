<?php

namespace App\Models;

use App\Jobs\ResizeImageJob;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;

class Image extends Model
{
    use HasFactory;

    public $timestamps = false;

    public $fillable = [
        'typeable_id',
        'typeable_type',
        'storage',
        'path',
        'name',
        'original_name',
        'size',
        'extension',
        'parent_id',
        'version',
        'is_main',
    ];

    protected $hidden = ['typeable_type', 'storage', 'typeable_id', 'path'];
    public $appends = ['url'];

    public function getUrlAttribute()
    {
        return url('storage/' . $this->path);
    }
    public function typeable()
    {
        return $this->morphTo('typeable');
    }
    public function parent()
    {
        return $this->belongsTo(Image::class, 'parent_id');
    }
    public function versions()
    {
        return $this->hasMany(Image::class, 'parent_id');
    }

    // call resize on create and update
    public static function boot()
    {
        parent::boot();

        static::created(function ($image) {
            $image->resize();
        });

        // static::updating(function ($image) {
        //     $image->resize();
        // });
    }

    public function resize()
    {
        if ($this->version == 'original') {
            $dimensions = [
                ['width' => 320, 'height' => 320, 'height2' => 240, 'prefix' => 'sm'],
                ['width' => 640, 'height' => 640, 'height2' => 480, 'prefix' => 'md'],
                ['width' => 960, 'height' => 960, 'height2' => 720, 'prefix' => 'lg'],
                ['width' => 1280, 'height' => 1280,  'height2' => 960, 'prefix' => 'xl'],
                // ['width' => 1920, 'height' => 1920,  'height2' => 1440, 'prefix' => 'xxl'],
            ];

            foreach ($dimensions as $dimension) {
                $data = [
                    'storage' => $this->storage,
                    'path' => $this->path,
                    'file' => $this->name,
                    'width' => $dimension['width'],
                    'height' => $dimension['height'],
                    'prefix' => $dimension['prefix'],
                ];
                ResizeImageJob::dispatch($this->id, $data)->delay(now()->addSeconds(15));
            }
        }
    }
}
