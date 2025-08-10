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
use Illuminate\Support\Facades\Log;
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
            $image = $manager->read(Storage::disk($this->data['storage'])->get($this->data['path']));

            $originalWidth = $image->width();
            $originalHeight = $image->height();

            if ($originalWidth > $this->data['width'] && $originalHeight > $this->data['height']) {

                // Redimensionar
                $image->scale(
                    $this->data['width'],
                    $this->data['height']
                );

                // Marca d’água sempre aplicada
                $watermark = $manager->read(public_path('logo.png'));

                // Ajusta a largura da marca d’água para 25% da imagem
                $watermark->scale(
                    intval($image->width() * 0.25),
                    null
                );

                // Insere no canto inferior direito com margem de 10px
                $image->place($watermark, 'bottom-right', 10, 10);

                // Criar caminho para a nova imagem
                $new_path = str_replace(
                    $this->data['file'],
                    $this->data['prefix'] . '-' . $this->data['file'],
                    $this->data['path']
                );

                $new_path =
                    str_replace(
                        $this->data['file'],
                        $this->data['prefix'] .
                            '-' .
                            $this->data['file'],
                        $this->data['path']
                    );;

                Storage::disk($this->data['storage'])->put($new_path, $image->toJpeg()->__toString());

                $image = new Image();

                $image->parent_id = $this->imageId;
                $image->storage = $this->data['storage'];
                $image->path = $new_path;
                $image->name = $this->data['prefix'] . '-' . $this->data['file'];
                $image->original_name = $this->data['file'];
                $image->size = Storage::disk($this->data['storage'])->size($new_path);
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
