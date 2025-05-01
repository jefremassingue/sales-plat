<?php

namespace App\Jobs;

use App\Models\Image;
use App\Models\ImageResizeLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Imagick\Driver;

class ResizeImageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $data = [];
    protected $imageId = null;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($imageId, array $data)
    {
        $this->data = $data;
        $this->imageId = $imageId;

        // dd($this->path, $this->file, $this->dimensions);
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        try {
            $manager = new ImageManager(new Driver());
            $image = $manager->read(Storage::disk(config('filesystems.default_public_files_storage'))->get($this->data['path'] . '/' . $this->data['file']));

            $originalWidth = $image->width();
            $originalHeight = $image->height();

            if ($originalWidth > $this->data['width'] && $originalHeight > $this->data['height']) {

                $image->scale(
                    $this->data['width'],
                    $this->data['height']
                );

                $new_path =
                    $this->data['path'] .
                    '/' .
                    $this->data['prefix'] .
                    '-' .
                    $this->data['file'];
                ;

                Storage::disk(config('filesystems.default_public_files_storage'))->put($new_path, $image->toJpeg()->__toString());

                $image = new Image();

                $image->parent_id = $this->imageId;
                $image->storage = config('filesystems.default_public_files_storage');
                $image->path = $this->data['path'];
                $image->name = $this->data['prefix'] . '-' . $this->data['file'];
                $image->original_name = $this->data['file'];
                $image->size = Storage::disk(config('filesystems.default_public_files_storage'))->size($new_path);
                $image->extension = pathinfo($this->data['file'], PATHINFO_EXTENSION);
                $image->version = $this->data['prefix'];
                $image->typeable_id = $this->imageId;
                $image->typeable_type = Image::class;
                $image->save();

            }
        } catch (\Exception $e) {
            ImageResizeLog::create([
                'path' => $this->data['path'],
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
