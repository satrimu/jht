<?php

namespace App\Services;

use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManagerStatic;

class ImageUploadService
{
    public function uploadSecure(UploadedFile $file, string $directory = 'uploads', int $maxWidth = 1000): string
    {
        $allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        if (! in_array($file->getMimeType(), $allowedMimes)) {
            throw new Exception('Invalid file type');
        }

        if ($file->getSize() > 2048 * 1024) {
            throw new Exception('File too large');
        }

        try {
            if (! class_exists(ImageManagerStatic::class)) {
                throw new Exception('Intervention Image package is not installed. Please run: composer require intervention/image');
            }
            $image = ImageManagerStatic::make($file->path());
        } catch (Exception) {
            throw new Exception('Invalid image file');
        }

        if ($image->width() > $maxWidth) {
            $image->resize($maxWidth, null, function ($constraint): void {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
        }

        $mimeToExt = [
            'image/jpeg' => 'jpg',
            'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
        ];

        $originalMime = $file->getMimeType();
        $ext = $mimeToExt[$originalMime] ?? 'jpg';
        $filename = Str::random(40).'.'.$ext;
        $path = trim($directory, '/').'/'.$filename;

        $encoded = match ($ext) {
            'png' => (string) $image->encode('png'),
            'gif' => (string) $image->encode('gif'),
            default => (string) $image->encode('jpg', 85),
        };

        Storage::disk('public')->put($path, $encoded);

        return $path;
    }

    public function deleteSecure(?string $path, string $allowedDirectory = 'uploads'): bool
    {
        if (in_array($path, [null, '', '0'], true)) {
            return false;
        }

        if (! str_starts_with($path, trim($allowedDirectory, '/').'/')) {
            return false;
        }

        if (! Storage::disk('public')->exists($path)) {
            return false;
        }

        return Storage::disk('public')->delete($path);
    }
}
