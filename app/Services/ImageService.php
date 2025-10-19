<?php

namespace App\Services;

use Exception;
use Log;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Imagick\Driver;
use Intervention\Image\ImageManager;

class ImageService
{
    protected ImageManager $imageManager;

    public function __construct()
    {
        $this->imageManager = new ImageManager(new Driver);
    }

    /**
     * Process and store an uploaded image (converts to WebP)
     *
     * @return string|false
     */
    public function processImage(
        UploadedFile $file,
        string $storagePath,
        ?int $scaleHeight = null,
        ?string $title = null
    ): string|false {
        try {
            // Validate the uploaded file
            if (! $file->isValid() || ! $this->isValidImage($file)) {
                throw new Exception('Invalid image file');
            }

            // Create storage directory if it doesn't exist
            $this->ensureDirectoryExists($storagePath);

            // Generate unique filename (always WebP)
            $filename = $this->generateFilename($file, $title, 'webp');

            // Process the image
            $image = $this->imageManager->read($file->getRealPath());

            // Scale down if height is specified
            if ($scaleHeight !== null) {
                $image->scaleDown(height: $scaleHeight);
            }

            // Convert to WebP
            $image->toWebp();

            // Save the processed image using Laravel's Storage facade
            $filePath = $storagePath.'/'.$filename;

            // Save to temporary file first
            $tempPath = tempnam(sys_get_temp_dir(), 'webp_');
            $image->save($tempPath);

            // Store using Laravel's filesystem
            $result = Storage::disk('public')->put($filePath, file_get_contents($tempPath));

            // Clean up temporary file
            unlink($tempPath);

            return $result ? $filename : false;

        } catch (Exception $e) {
            Log::error('Error processing image: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Delete an image from storage
     */
    public function deleteImage(?string $filename, string $storagePath): bool
    {
        if (in_array($filename, [null, '', '0'], true)) {
            return false;
        }

        try {
            // Extract just the filename
            $cleanFilename = $this->extractFilenameFromUrl($filename);
            $filePath = $storagePath.'/'.$cleanFilename;

            if (Storage::disk('public')->exists($filePath)) {
                return Storage::disk('public')->delete($filePath);
            }

            return false;
        } catch (Exception $e) {
            Log::error('Error deleting image: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Generate a unique filename
     */
    protected function generateFilename(UploadedFile $file, ?string $title, string $format): string
    {
        $baseName = $title !== null && $title !== '' && $title !== '0' ? Str::slug($title) : Str::random(10);
        $timestamp = time();
        $extension = $format;

        return "{$baseName}-{$timestamp}.{$extension}";
    }

    /**
     * Ensure the storage directory exists
     */
    protected function ensureDirectoryExists(string $path): void
    {
        if (! Storage::disk('public')->exists($path)) {
            Storage::disk('public')->makeDirectory($path);
        }
    }

    /**
     * Extract filename from URL if full URL is provided
     */
    protected function extractFilenameFromUrl(string $filename): string
    {
        // If it's a URL, extract the filename part
        if (filter_var($filename, FILTER_VALIDATE_URL)) {
            $path = parse_url($filename, PHP_URL_PATH);

            return basename($path);
        }

        // If it's already just a filename, return as is
        return $filename;
    }

    /**
     * Process and store logo PNG with specific size (180x180)
     *
     * @return string|false
     */
    public function processImageLogo(
        UploadedFile $file,
        string $storagePath,
        int $size = 180,
        string $filename = 'logo'
    ) {
        try {
            // Validate the uploaded file
            if (! $file->isValid() || ! $this->isValidImage($file)) {
                throw new Exception('Invalid image file');
            }

            // Create storage directory if it doesn't exist
            $this->ensureDirectoryExists($storagePath);

            // Fixed filename for logo
            $logoFilename = $filename.'.png';

            // Process the image
            $image = $this->imageManager->read($file->getRealPath());

            // Resize to exact dimensions (180x180) and maintain aspect ratio
            $image->resize($size, $size);

            // Convert to PNG
            $image->toPng();

            // Save the processed image using Laravel's Storage facade
            $filePath = $storagePath.'/'.$logoFilename;

            // Save to temporary file first
            $tempPath = tempnam(sys_get_temp_dir(), 'png_logo_');
            $image->save($tempPath);

            // Store using Laravel's filesystem
            $result = Storage::disk('public')->put($filePath, file_get_contents($tempPath));

            // Clean up temporary file
            unlink($tempPath);

            return $result ? $logoFilename : false;

        } catch (Exception $e) {
            Log::error('Error processing logo image: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Validate if file is a valid image with multiple security checks
     *
     * Security layers:
     * 1. MIME type validation (can be spoofed - first check only)
     * 2. File extension validation
     * 3. Actual image content validation using getimagesize()
     * 4. Intervention Image validation (can it be read as image?)
     * 5. File size limit
     */
    protected function isValidImage(UploadedFile $file): bool
    {
        // Layer 1: MIME type check (basic, can be spoofed)
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (! in_array($file->getMimeType(), $allowedMimes, true)) {
            Log::warning('File rejected: Invalid MIME type', [
                'mime' => $file->getMimeType(),
                'filename' => $file->getClientOriginalName(),
            ]);

            return false;
        }

        // Layer 2: File extension validation
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $extension = strtolower($file->getClientOriginalExtension());
        if (! in_array($extension, $allowedExtensions, true)) {
            Log::warning('File rejected: Invalid extension', [
                'extension' => $extension,
                'filename' => $file->getClientOriginalName(),
            ]);

            return false;
        }

        // Layer 3: Actual image content validation using getimagesize()
        // This reads the file header to verify it's a real image
        try {
            $imageInfo = @getimagesize($file->getRealPath());
            if ($imageInfo === false) {
                Log::warning('File rejected: Not a valid image file (getimagesize failed)', [
                    'filename' => $file->getClientOriginalName(),
                ]);

                return false;
            }

            // Verify MIME type from actual file content matches declared MIME
            // getimagesize() returned a non-false value above, so the 'mime' index
            // is guaranteed to exist for valid images. Use direct access to satisfy
            // static analysis (PHPStan) while preserving runtime behavior.
            $actualMimeType = $imageInfo['mime'];
            if (! in_array($actualMimeType, $allowedMimes, true)) {
                Log::warning('File rejected: Content MIME type mismatch', [
                    'declared_mime' => $file->getMimeType(),
                    'actual_mime' => $actualMimeType,
                    'filename' => $file->getClientOriginalName(),
                ]);

                return false;
            }
        } catch (Exception $e) {
            Log::error('File validation error: '.$e->getMessage(), [
                'filename' => $file->getClientOriginalName(),
            ]);

            return false;
        }

        // Layer 4: Intervention Image validation
        // Try to read the image with Intervention - if it fails, it's not a valid image
        try {
            $testImage = $this->imageManager->read($file->getRealPath());
            // If we can get dimensions, it's a real image
            $width = $testImage->width();
            $height = $testImage->height();

            if ($width <= 0 || $height <= 0) {
                Log::warning('File rejected: Invalid image dimensions', [
                    'width' => $width,
                    'height' => $height,
                    'filename' => $file->getClientOriginalName(),
                ]);

                return false;
            }

            // Reasonable dimension limits to prevent attacks
            if ($width > 10000 || $height > 10000) {
                Log::warning('File rejected: Image dimensions too large', [
                    'width' => $width,
                    'height' => $height,
                    'filename' => $file->getClientOriginalName(),
                ]);

                return false;
            }
        } catch (Exception $e) {
            Log::warning('File rejected: Intervention Image cannot read file', [
                'error' => $e->getMessage(),
                'filename' => $file->getClientOriginalName(),
            ]);

            return false;
        }

        // Layer 5: File size limit (10MB max)
        $maxSize = 10 * 1024 * 1024; // 10MB
        if ($file->getSize() > $maxSize) {
            Log::warning('File rejected: File size exceeds limit', [
                'size' => $file->getSize(),
                'max_size' => $maxSize,
                'filename' => $file->getClientOriginalName(),
            ]);

            return false;
        }

        // All checks passed
        return true;
    }

    /**
     * Process and store image with custom dimensions (converts to WebP)
     * Generic method for all controllers (User, Article, Payment, etc.)
     *
     * @param  UploadedFile  $file  The uploaded file
     * @param  string  $storagePath  Storage folder (e.g., 'users', 'articles', 'payments')
     * @param  int  $width  Target width in pixels
     * @param  int  $height  Target height in pixels
     * @param  string|null  $prefix  Filename prefix (e.g., 'avatar', 'article', 'payment')
     * @param  int  $quality  WebP quality (0-100, default 85)
     * @return string|false Full path to stored file (e.g., 'users/avatar-123456.webp')
     */
    public function processImageWithDimensions(
        UploadedFile $file,
        string $storagePath,
        int $width,
        int $height,
        ?string $prefix = null,
        int $quality = 85
    ) {
        try {
            // Validate the uploaded file
            if (! $file->isValid() || ! $this->isValidImage($file)) {
                throw new Exception('Invalid image file. Allowed types: JPEG, PNG, GIF, WebP. Max size: 10MB.');
            }

            // Create storage directory if it doesn't exist
            $this->ensureDirectoryExists($storagePath);

            // Generate unique filename
            $baseName = $prefix !== null && $prefix !== '' && $prefix !== '0' ? $prefix.'-'.Str::random(8) : Str::random(10);
            $timestamp = time();
            $filename = "{$baseName}-{$timestamp}.webp";

            // Process the image
            $image = $this->imageManager->read($file->getRealPath());

            // Resize to exact dimensions (cover fit - crops to exact size)
            $image->cover($width, $height);

            // Convert to WebP with specified quality
            $image->toWebp($quality);

            // Save the processed image
            $filePath = $storagePath.'/'.$filename;

            // Save to temporary file first
            $tempPath = tempnam(sys_get_temp_dir(), 'image_');
            $image->save($tempPath);

            // Store using Laravel's filesystem
            $result = Storage::disk('public')->put($filePath, file_get_contents($tempPath));

            // Clean up temporary file
            unlink($tempPath);

            // Return only filename, NOT full path
            // Database stores: avatar-xyz-123.webp
            // Storage location: storage/app/public/users/avatar-xyz-123.webp
            // Public URL: storage/users/avatar-xyz-123.webp
            return $result ? $filename : false;

        } catch (Exception $e) {
            Log::error('Error processing image: '.$e->getMessage());

            throw new Exception('Failed to process image: '.$e->getMessage(), $e->getCode(), $e);
        }
    }

    /**
     * Delete image from storage (generic method for all controllers)
     *
     * @param  string|null  $imagePath  Full path to image (e.g., 'users/avatar-123.webp')
     */
    public function deleteImageFile(?string $imagePath): bool
    {
        if (in_array($imagePath, [null, '', '0'], true)) {
            return false;
        }

        try {
            if (Storage::disk('public')->exists($imagePath)) {
                return Storage::disk('public')->delete($imagePath);
            }

            return false;
        } catch (Exception $e) {
            Log::error('Error deleting image: '.$e->getMessage());

            return false;
        }
    }
}
