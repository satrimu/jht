# ImageService API

This document provides a concise API reference for `App\Services\ImageService`.

Overview
- `ImageService` centralizes validation, resizing, conversion (to WebP), and deletion.
- It uses Intervention Image (Imagick driver when available) and Laravel's `Storage` facade.

Main methods

1. processImageWithDimensions(UploadedFile $file, string $storagePath, int $width, int $height, ?string $prefix = null, int $quality = 85): string|false
- Purpose: Convert the uploaded file to WebP, resize (cover) to exact dimensions, store under the `public` disk at `{storagePath}/{filename}.webp` and return the filename only.
- Returns: filename on success (e.g., `avatar-abc123.webp`), or throws an Exception on failure.
- Example:
```php
$filename = $imageService->processImageWithDimensions(
    $request->file('image'),
    'users',
    200,
    200,
    'avatar',
    85
);
// Save $filename to DB in users.image column
```

2. deleteImageFile(?string $imagePath): bool
- Purpose: Delete an image from the `public` disk by relative path (e.g., `users/avatar-abc123.webp`).
- Example:
```php
// If DB stores filename only, prepend folder
$imageService->deleteImageFile('users/'.$user->image);
```

3. processImage(...) and processImageLogo(...)
- Variants for other formats (logo PNG) and slightly different behaviors are available. See `app/Services/ImageService.php` for full signatures.

Validation
- The service validates with multiple layers:
  1. MIME type
  2. File extension
  3. getimagesize() based header check
  4. Intervention Image read
  5. File size (10MB max)

Error handling
- `processImageWithDimensions()` will throw an Exception when validation or processing fails. Controllers should catch and return a user-friendly message.

Best practices
- Controllers should pass only the storage folder name and dimensions (keep size/paths in controllers).
- Store only filename in DB (e.g., `avatar-xxx.webp`). Build public URL using `asset('storage/{folder}/' . $filename)` or a model accessor like `getImageUrlAttribute()`.
- Ensure `php artisan storage:link` is run for public access.

Notes
- Imagick/WebP availability depends on the environment. In test/CI environments without WebP support, Intervention may output JPEG; tests should allow for that fallback if strict WebP can't be guaranteed.
