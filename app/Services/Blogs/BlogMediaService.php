<?php

namespace App\Services\Blogs;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BlogMediaService
{
    public function storeEditorImage(UploadedFile $file): string
    {
        $disk = Storage::disk(config('blog.disk'));
        $path = $disk->putFile(trim(config('blog.prefix'), '/').'/editor-images', $file);
        if (! $path) {
            throw ValidationException::withMessages(['image' => 'The image could not be stored. Please try again.']);
        }

        return $disk->url($path);
    }

    public function store(UploadedFile $file): array
    {
        $disk = Storage::disk(config('blog.disk'));
        $directory = trim(config('blog.prefix'), '/').'/hero-images/'.Str::uuid();
        $original = $disk->putFile($directory, $file);
        if (! $original) {
            throw ValidationException::withMessages(['heroImageUpload' => 'The image could not be stored. Please try again.']);
        }
        $paths = ['original' => $original];
        foreach (['thumbnail' => 480, 'medium' => 960, 'large' => 1600] as $variant => $width) {
            $paths[$variant] = $original;
            if (! class_exists(\Imagick::class)) {
                continue;
            }
            try {
                $image = new \Imagick($file->getRealPath().'[0]');
                $image->autoOrientImage();
                $image->setImageBackgroundColor('white');
                $image = $image->mergeImageLayers(\Imagick::LAYERMETHOD_FLATTEN);
                $image->thumbnailImage($width, 0);
                $image->setImageFormat('jpeg');
                $image->setImageCompressionQuality(85);
                $image->stripImage();
                $path = $directory.'/'.$variant.'.jpg';
                if ($disk->put($path, $image->getImageBlob())) {
                    $paths[$variant] = $path;
                }
                $image->clear();
            } catch (\Throwable $e) {
                Log::warning('Blog image variant failed', ['variant' => $variant, 'error' => $e->getMessage()]);
            }
        }

        // Immutable paths may be shared by duplicates. Never delete them on replacement.
        return $paths;
    }

    public function url(?array $image, string $variant = 'large'): ?string
    {
        $path = $image[$variant] ?? $image['original'] ?? null;

        return is_string($path) && $path !== '' ? Storage::disk(config('blog.disk'))->url($path) : null;
    }
}
