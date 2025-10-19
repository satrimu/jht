# ImageService Usage Guide

**Last Updated**: 2025-01-29  
**Category**: Architecture  
**Status**: Final

## Overview

`ImageService` adalah service generic untuk image processing yang dapat digunakan oleh **semua controller** (User, Article, Payment, dll). Service ini menggunakan Intervention Image v3 dengan Imagick driver dan otomatis mengkonversi ke WebP.

---

## Table of Contents

- [Key Features](#key-features)
- [Generic Methods](#generic-methods)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Configuration Guidelines](#configuration-guidelines)

---

## Key Features

✅ **Generic & Reusable** - Dapat digunakan untuk semua entity (User, Article, Payment, dll)  
✅ **WebP Conversion** - Otomatis konversi ke WebP untuk file size lebih kecil  
✅ **Flexible Dimensions** - Width & height ditentukan oleh controller  
✅ **Flexible Storage** - Folder path ditentukan oleh controller  
✅ **Quality Control** - WebP quality adjustable (0-100)  
✅ **MIME Validation** - Validates JPEG, PNG, GIF, WebP  
✅ **Size Limit** - Max 10MB per file  
✅ **Cover Fit** - Crops to exact dimensions (no distortion)

---

## Generic Methods

### 1. processImageWithDimensions()

**Purpose**: Process and store image with custom dimensions

**Signature**:
```php
public function processImageWithDimensions(
    UploadedFile $file,
    string $storagePath,
    int $width,
    int $height,
    ?string $prefix = null,
    int $quality = 85
): string|false
```

**Parameters**:
- `$file` - The uploaded file from request
- `$storagePath` - Storage folder (e.g., 'users', 'articles', 'payments')
- `$width` - Target width in pixels
- `$height` - Target height in pixels
- `$prefix` - Filename prefix (e.g., 'avatar', 'article', 'payment') - optional
- `$quality` - WebP quality 0-100 (default: 85) - optional

**Returns**:
- `string` - Full path to stored file (e.g., 'users/avatar-abc123-1738139456.webp')
- `false` - On failure

**Throws**:
- `\Exception` - If validation fails or processing error

---

### 2. deleteImageFile()

**Purpose**: Delete image from storage

**Signature**:
```php
public function deleteImageFile(?string $imagePath): bool
```

**Parameters**:
- `$imagePath` - Full path to image (e.g., 'users/avatar-abc123.webp')

**Returns**:
- `true` - If deleted successfully
- `false` - If file not found or deletion failed

---

## Usage Examples

### Example 1: User Avatar (200x200px)

**Controller**: `UserController`

```php
use App\Services\ImageService;

class UserController extends Controller
{
    public function __construct(private ImageService $imageService) {}

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();

        // User avatars: 200x200px, stored in 'users' folder
        if ($request->hasFile('image')) {
            try {
                $data['image'] = $this->imageService->processImageWithDimensions(
                    file: $request->file('image'),
                    storagePath: 'users',
                    width: 200,
                    height: 200,
                    prefix: 'avatar',
                    quality: 85
                );
            } catch (\Exception $e) {
                return back()->withErrors(['image' => $e->getMessage()]);
            }
        }

        User::create($data);
        return redirect()->route('admin.users.index');
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            try {
                // Delete old image first
                if ($user->image) {
                    $this->imageService->deleteImageFile($user->image);
                }

                // Upload new image
                $data['image'] = $this->imageService->processImageWithDimensions(
                    file: $request->file('image'),
                    storagePath: 'users',
                    width: 200,
                    height: 200,
                    prefix: 'avatar',
                    quality: 85
                );
            } catch (\Exception $e) {
                return back()->withErrors(['image' => $e->getMessage()]);
            }
        }

        $user->update($data);
        return redirect()->route('admin.users.index');
    }

    public function destroy(User $user)
    {
        // Delete image before deleting user
        if ($user->image) {
            $this->imageService->deleteImageFile($user->image);
        }

        $user->delete();
        return redirect()->route('admin.users.index');
    }
}
```

**Result**:
- Stored in: `storage/public/users/`
- Filename: `avatar-abc12345-1738139456.webp`
- Dimensions: 200x200px
- Format: WebP (quality 85)

---

### Example 2: Article Featured Image (800x450px)

**Controller**: `ArticleController`

```php
use App\Services\ImageService;

class ArticleController extends Controller
{
    public function __construct(private ImageService $imageService) {}

    public function store(StoreArticleRequest $request)
    {
        $data = $request->validated();

        // Article featured image: 800x450px (16:9 ratio)
        if ($request->hasFile('featured_image')) {
            try {
                $data['featured_image'] = $this->imageService->processImageWithDimensions(
                    file: $request->file('featured_image'),
                    storagePath: 'articles',
                    width: 800,
                    height: 450,
                    prefix: 'article',
                    quality: 90  // Higher quality for featured images
                );
            } catch (\Exception $e) {
                return back()->withErrors(['featured_image' => $e->getMessage()]);
            }
        }

        Article::create($data);
        return redirect()->route('admin.articles.index');
    }
}
```

**Result**:
- Stored in: `storage/public/articles/`
- Filename: `article-xyz98765-1738139456.webp`
- Dimensions: 800x450px (16:9 ratio)
- Format: WebP (quality 90)

---

### Example 3: Payment Receipt (1200x1600px)

**Controller**: `PaymentController`

```php
use App\Services\ImageService;

class PaymentController extends Controller
{
    public function __construct(private ImageService $imageService) {}

    public function store(StorePaymentRequest $request)
    {
        $data = $request->validated();

        // Payment receipt: 1200x1600px (portrait)
        if ($request->hasFile('receipt')) {
            try {
                $data['receipt'] = $this->imageService->processImageWithDimensions(
                    file: $request->file('receipt'),
                    storagePath: 'payments',
                    width: 1200,
                    height: 1600,
                    prefix: 'receipt',
                    quality: 95  // Highest quality for documents
                );
            } catch (\Exception $e) {
                return back()->withErrors(['receipt' => $e->getMessage()]);
            }
        }

        Payment::create($data);
        return redirect()->route('admin.payments.index');
    }
}
```

**Result**:
- Stored in: `storage/public/payments/`
- Filename: `receipt-def45678-1738139456.webp`
- Dimensions: 1200x1600px (portrait)
- Format: WebP (quality 95)

---

### Example 4: Product Thumbnail (300x300px)

**Controller**: `ProductController`

```php
use App\Services\ImageService;

class ProductController extends Controller
{
    public function __construct(private ImageService $imageService) {}

    public function store(StoreProductRequest $request)
    {
        $data = $request->validated();

        // Product thumbnail: 300x300px (square)
        if ($request->hasFile('thumbnail')) {
            try {
                $data['thumbnail'] = $this->imageService->processImageWithDimensions(
                    file: $request->file('thumbnail'),
                    storagePath: 'products',
                    width: 300,
                    height: 300,
                    prefix: 'thumb',
                    quality: 80  // Lower quality for thumbnails
                );
            } catch (\Exception $e) {
                return back()->withErrors(['thumbnail' => $e->getMessage()]);
            }
        }

        Product::create($data);
        return redirect()->route('admin.products.index');
    }
}
```

**Result**:
- Stored in: `storage/public/products/`
- Filename: `thumb-mno12345-1738139456.webp`
- Dimensions: 300x300px (square)
- Format: WebP (quality 80)

---

## Best Practices

### 1. Choose Appropriate Dimensions

| Use Case | Recommended Size | Aspect Ratio | Quality |
|----------|------------------|--------------|---------|
| **User Avatar** | 200x200 | 1:1 (square) | 85 |
| **Profile Cover** | 1200x400 | 3:1 | 85 |
| **Article Featured** | 800x450 | 16:9 | 90 |
| **Article Thumbnail** | 300x200 | 3:2 | 80 |
| **Product Image** | 600x600 | 1:1 | 85 |
| **Product Thumbnail** | 300x300 | 1:1 | 80 |
| **Payment Receipt** | 1200x1600 | 3:4 (portrait) | 95 |
| **Banner** | 1920x400 | Wide | 90 |
| **Logo** | 180x180 | 1:1 | 85 |

### 2. Quality Guidelines

- **Documents/Receipts**: 95 (highest detail)
- **Featured Images**: 90 (high quality)
- **Standard Images**: 85 (balanced)
- **Thumbnails**: 80 (smaller file size)

### 3. Folder Structure

```
storage/public/
├── users/          # User avatars and profile images
├── articles/       # Article featured images
├── payments/       # Payment receipts
├── products/       # Product images
├── banners/        # Banner images
└── settings/       # App logos and settings images
```

### 4. Error Handling Pattern

```php
if ($request->hasFile('image')) {
    try {
        $data['image'] = $this->imageService->processImageWithDimensions(
            file: $request->file('image'),
            storagePath: 'folder',
            width: 200,
            height: 200,
            prefix: 'prefix',
            quality: 85
        );
    } catch (\Exception $e) {
        // Return validation error to user
        return back()->withErrors(['image' => $e->getMessage()]);
    }
}
```

### 5. Delete Pattern

```php
// Always delete old image before uploading new one
if ($model->image) {
    $this->imageService->deleteImageFile($model->image);
}

// Delete on destroy
if ($model->image) {
    $this->imageService->deleteImageFile($model->image);
}
$model->delete();
```

---

## Configuration Guidelines

### Named Arguments (Recommended)

Use named arguments for clarity:

```php
$this->imageService->processImageWithDimensions(
    file: $request->file('image'),
    storagePath: 'users',
    width: 200,
    height: 200,
    prefix: 'avatar',
    quality: 85
);
```

### Positional Arguments (Alternative)

```php
$this->imageService->processImageWithDimensions(
    $request->file('image'),  // file
    'users',                  // storagePath
    200,                      // width
    200,                      // height
    'avatar',                 // prefix
    85                        // quality
);
```

### Minimal Usage (Using Defaults)

```php
// Uses default quality (85) and no prefix
$this->imageService->processImageWithDimensions(
    file: $request->file('image'),
    storagePath: 'users',
    width: 200,
    height: 200
);
```

---

## File Size Comparison

| Original Format | Size (200x200) | WebP Size | Savings |
|-----------------|----------------|-----------|---------|
| JPEG (quality 85) | ~45 KB | ~12 KB | 73% |
| PNG (8-bit) | ~60 KB | ~12 KB | 80% |
| GIF | ~35 KB | ~10 KB | 71% |
| **WebP (quality 85)** | - | **~12 KB** | Baseline |

**For larger images**:

| Original Format | Size (800x450) | WebP Size | Savings |
|-----------------|----------------|-----------|---------|
| JPEG (quality 90) | ~180 KB | ~55 KB | 69% |
| PNG (8-bit) | ~250 KB | ~60 KB | 76% |
| **WebP (quality 90)** | - | **~55 KB** | Baseline |

---

## Validation

### MIME Types Allowed
- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`

### File Size Limit
- Maximum: **10MB**

### Automatic Validation
- Service validates MIME type automatically
- Throws exception if invalid file type
- Throws exception if file size > 10MB

---

## Related Documentation

- [User Image Service Migration](../audit/USER_IMAGE_SERVICE_MIGRATION.md)
- [Image Processing Overview](./IMAGE_PROCESSING.md)
- [Storage Configuration](./STORAGE.md)

---

## Summary

**ImageService** adalah **generic service** yang dapat digunakan oleh semua controller dengan konfigurasi:
- ✅ Folder path di controller (users, articles, payments, dll)
- ✅ Dimensions di controller (200x200, 800x450, dll)
- ✅ Quality di controller (80, 85, 90, 95)
- ✅ Prefix di controller (avatar, article, receipt, dll)

**Keuntungan**:
- Reusable across all controllers
- Flexible configuration per use case
- Automatic WebP conversion
- Consistent error handling
- Type-safe with named arguments

---

**Status**: ✅ **Production Ready**
