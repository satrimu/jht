# Image Upload (Avatars)

This project centralizes image handling through `App\Services\ImageService`.

Key points

- All images are validated with multiple security layers (MIME, extension, getimagesize, Intervention read, size limit).
- Avatars are converted to WebP and resized to 200x200 using `processImageWithDimensions()`.
- Controllers pass `storagePath` and dimensions to the image service; the service returns filename-only (e.g. `avatar-123.webp`).
- Files are stored on the `public` disk under `storage/app/public/{storagePath}`. Public URL: `/storage/{storagePath}/{filename}`.

Usage example (controller):

```php
$data['image'] = $this->imageService->processImageWithDimensions(
    file: $request->file('image'),
    storagePath: 'users',
    width: 200,
    height: 200,
    prefix: 'avatar',
    quality: 85
);
```

Deletion
- To delete previous images call `imageService->deleteImageFile('users/'.$user->image)`.

Notes and troubleshooting
- Ensure `php artisan storage:link` has been run so `/storage` is available.
- If images are not saved, check:
  - Frontend sends multipart/form-data (Inertia `forceFormData: true` plus `_method: 'PUT'` for updates).
  - Check logs for `ImageService` errors (they are logged).
  - Confirm `storage/app/public/users` exists and is writeable.
