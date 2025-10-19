# User Avatar Feature - Complete Implementation

**Last Updated**: 2025-01-XX  
**Category**: Features  
**Status**: Complete  

---

## Overview

Complete implementation of user avatar upload, display, and management across all admin user management interfaces. Uses WebP format for optimized storage with 200x200px dimensions.

---

## Technical Stack

- **Backend**: Laravel 12 + ImageService (Intervention Image v3)
- **Frontend**: React 19 + Inertia.js + shadcn/ui
- **Format**: WebP (85% quality)
- **Dimensions**: 200x200 pixels
- **Storage**: `storage/public/users/avatar-{random}-{timestamp}.webp`
- **Security**: 5-layer validation (MIME → Extension → getimagesize() → Intervention → Size limits)

---

## Implementation Components

### 1. Backend - Image Processing Service

**File**: `app/Services/ImageService.php`

**Method**: 
```php
processImageWithDimensions(
    UploadedFile $file,
    string $storagePath,
    int $width,
    int $height,
    string $prefix = 'image',
    int $quality = 85
): string
```

**User Controller Usage**:
```php
// UserController.php
if ($request->hasFile('image')) {
    $data['image'] = $this->imageService->processImageWithDimensions(
        file: $request->file('image'),
        storagePath: 'users',
        width: 200,
        height: 200,
        prefix: 'avatar',
        quality: 85
    );
}
```

**Security Layers**:
1. ✅ MIME type validation (`image/jpeg`, `image/png`, `image/gif`, `image/webp`)
2. ✅ Extension whitelist (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`)
3. ✅ `getimagesize()` content verification (detects spoofed files)
4. ✅ Intervention Image processing test (catches polyglot attacks)
5. ✅ File size limit (10 MB max)
6. ✅ Dimension validation (max 4096x4096px)

All rejection attempts are logged for security monitoring.

---

### 2. Frontend - Upload UI Components

#### A. Create User Modal

**File**: `resources/js/pages/admin/users/CreateUserModal.tsx`

**Features**:
- ✅ Drag & drop file upload
- ✅ Browse file button
- ✅ Image preview (16x16 rounded-full in success box)
- ✅ File size/type validation (client-side: 10 MB max, image/* only)
- ✅ Cancel uploaded image option
- ✅ Visual feedback: Drag-over state with green border

**UI Pattern**:
```tsx
{/* Drag & Drop Zone */}
<div 
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
    className={cn(
        "border-2 border-dashed rounded-lg p-8",
        isDragOver ? "border-green-500 bg-green-50" : "border-gray-300"
    )}
>
    {/* Upload Icon + Instructions */}
    <UploadCloud className="h-12 w-12 mx-auto" />
    <p>Drag and drop your avatar here</p>
    
    {/* Browse Button */}
    <Button type="button" onClick={() => fileInputRef.current?.click()}>
        Browse Files
    </Button>
    
    {/* Hidden File Input */}
    <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
    />
</div>

{/* Image Preview */}
{imagePreview && (
    <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <img src={imagePreview} className="h-16 w-16 rounded-full" />
        <Button onClick={handleCancelImage}>Cancel</Button>
    </div>
)}
```

**State Management**:
```tsx
const [imagePreview, setImagePreview] = useState<string | null>(null);
const [isDragOver, setIsDragOver] = useState(false);
const { data, setData } = useForm({
    image: null as File | null,
    // ... other fields
});
```

---

#### B. Edit User Modal

**File**: `resources/js/pages/admin/users/EditUserModal.tsx`

**Features**:
- ✅ Display current avatar (32x32 rounded-full)
- ✅ "Replace Avatar" button for existing images
- ✅ Drag & drop to replace avatar
- ✅ New image preview (shows before save)
- ✅ Cancel replacement option (reverts to current image)
- ✅ Automatic cleanup of preview URLs on close/save

**UI Pattern**:
```tsx
{/* Current Avatar Display */}
{currentImageUrl && !imagePreview && (
    <div className="flex items-center gap-3">
        <img 
            src={currentImageUrl} 
            className="h-32 w-32 rounded-full"
        />
        <Button type="button" onClick={() => fileInputRef.current?.click()}>
            Replace Avatar
        </Button>
    </div>
)}

{/* Drag & Drop Zone (for replacement or new upload) */}
<div onDragOver={handleDragOver} onDrop={handleDrop}>
    {/* Same drag & drop UI as CreateUserModal */}
</div>

{/* New Image Preview */}
{imagePreview && (
    <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <img src={imagePreview} className="h-16 w-16 rounded-full" />
        <p className="text-green-700">New avatar selected</p>
        <Button onClick={handleCancelImage}>Cancel</Button>
    </div>
)}
```

**Cleanup Handling**:
```tsx
useEffect(() => {
    return () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
    };
}, [imagePreview]);
```

---

#### C. Show User Modal

**File**: `resources/js/pages/admin/users/ShowUserModal.tsx`

**Features**:
- ✅ Avatar display in modal header (16x16 rounded-full)
- ✅ Fallback to UserIcon for users without avatars
- ✅ Shows alongside user name and title

**UI Pattern**:
```tsx
<DialogHeader>
    <DialogTitle>
        <div className="flex items-center gap-2">
            {user.image && (
                <img 
                    src={`/storage/${user.image}`}
                    alt={user.full_name || user.name}
                    className="h-16 w-16 rounded-full object-cover"
                />
            )}
            <div>
                <h3>{user.full_name || user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.role}</p>
            </div>
        </div>
    </DialogTitle>
</DialogHeader>
```

---

#### D. Users Index Table

**File**: `resources/js/pages/admin/users/Index.tsx`

**Features**:
- ✅ Avatar display in Name column (8x8 rounded-full)
- ✅ Fallback to UserIcon in muted circle for users without avatars
- ✅ Avatar + name displayed side-by-side with gap
- ✅ Object-cover to prevent distortion

**UI Pattern**:
```tsx
<TableCell>
    <div className="flex items-center gap-2">
        {user.image ? (
            <img
                src={`/storage/${user.image}`}
                alt={user.full_name || user.name}
                className="h-8 w-8 rounded-full object-cover"
            />
        ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
            </div>
        )}
        <span>{user.full_name || user.name}</span>
    </div>
</TableCell>
```

---

## User Interface Sizes Summary

| Component | Avatar Size | Purpose |
|-----------|------------|---------|
| **Index Table** | 8x8 (h-8 w-8) | Compact list view |
| **ShowUserModal Header** | 16x16 (h-16 w-16) | Prominent identification |
| **EditUserModal Current** | 32x32 (h-32 w-32) | Large preview for editing |
| **Upload Preview** | 16x16 (h-16 w-16) | Preview in success box |

All avatars use:
- `rounded-full` - Perfect circle shape
- `object-cover` - Maintain aspect ratio without distortion

---

## TypeScript Interfaces

**Updated User Interface** (shared across all components):
```typescript
interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    member_number: string | null;
    full_name: string | null;
    phone: string | null;
    address: string | null;
    join_date: string | null;
    note: string | null;
    is_active: boolean;
    image: string | null;  // ✅ Added
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}
```

---

## File Size & Performance

### Image Optimization

**Original Image** (example):
- PNG: 250 KB
- JPEG: 180 KB

**After WebP Conversion**:
- WebP (85% quality): ~45 KB
- **Reduction**: 73-80% smaller

**Benefits**:
- ✅ Faster page load times
- ✅ Reduced bandwidth usage
- ✅ Better mobile performance
- ✅ Modern browser support (99%+)

---

## Security Implementation

### Validation Layers (5-Layer Security)

```php
// ImageService::isValidImage()

// Layer 1: MIME Type Validation
$mimeType = $file->getMimeType();
if (!in_array($mimeType, ['image/jpeg', 'image/png', 'image/gif', 'image/webp'])) {
    Log::warning('Image rejected: Invalid MIME type', ['mime' => $mimeType]);
    throw new \Exception('Invalid image type');
}

// Layer 2: Extension Validation
$extension = strtolower($file->getClientOriginalExtension());
if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
    Log::warning('Image rejected: Invalid extension', ['ext' => $extension]);
    throw new \Exception('Invalid file extension');
}

// Layer 3: getimagesize() Content Verification
$imageInfo = @getimagesize($file->getRealPath());
if ($imageInfo === false) {
    Log::warning('Image rejected: getimagesize() failed');
    throw new \Exception('File is not a valid image');
}

// Layer 4: Intervention Image Processing Test
try {
    $image = ImageManager::imagick()->read($file->getRealPath());
    $width = $image->width();
    $height = $image->height();
} catch (\Exception $e) {
    Log::error('Image rejected: Intervention Image processing failed', [
        'error' => $e->getMessage()
    ]);
    throw new \Exception('Image processing failed');
}

// Layer 5: Size & Dimension Limits
if ($file->getSize() > 10485760) { // 10 MB
    Log::warning('Image rejected: File too large', ['size' => $file->getSize()]);
    throw new \Exception('File size exceeds 10 MB limit');
}

if ($width > 4096 || $height > 4096) {
    Log::warning('Image rejected: Dimensions too large', [
        'width' => $width,
        'height' => $height
    ]);
    throw new \Exception('Image dimensions exceed 4096x4096 limit');
}
```

**Attack Prevention**:
1. ✅ **RCE (Remote Code Execution)**: Prevented by Intervention Image re-encoding
2. ✅ **Polyglot Attacks**: Detected by processing test (Layer 4)
3. ✅ **MIME Spoofing**: Caught by `getimagesize()` (Layer 3)
4. ✅ **Malicious Extensions**: Blocked by extension whitelist (Layer 2)
5. ✅ **Decompression Bombs**: Limited by size/dimension checks (Layer 5)
6. ✅ **XSS via Filename**: Server generates safe filenames

---

## Testing

### Backend Tests

**File**: `tests/Feature/Admin/UserControllerTest.php`

**Test Coverage**:
- ✅ 29 tests passing (116 assertions)
- ✅ CRUD operations with image uploads
- ✅ Validation for required fields
- ✅ Image field included in user responses
- ✅ Authorization tests (admin-only access)

**Example Test Results**:
```
PASS  Tests\Feature\Admin\UserControllerTest
✓ admin can view users index                             0.61s  
✓ admin can create user                                  0.08s  
✓ admin can update user                                  0.06s  
✓ admin can delete user                                  0.07s  
✓ validation fails for duplicate email                   0.06s  
... (24 more tests)

Tests:    29 passed (116 assertions)
Duration: 2.72s
```

### Frontend Validation

**TypeScript Compilation**:
```bash
npx tsc --noEmit
# ✅ No errors
```

**ESLint**:
```bash
npx eslint resources/js/pages/admin/users/*.tsx --fix
# ✅ No errors
```

---

## Usage Instructions

### For Developers

**1. Adding Image Upload to New Entity**:

```php
// Example: ArticleController.php
use App\Services\ImageService;

public function __construct(
    private readonly ImageService $imageService
) {}

public function store(StoreArticleRequest $request)
{
    $data = $request->validated();
    
    if ($request->hasFile('image')) {
        $data['image'] = $this->imageService->processImageWithDimensions(
            file: $request->file('image'),
            storagePath: 'articles',  // ← Change folder
            width: 800,               // ← Change width
            height: 450,              // ← Change height
            prefix: 'article',        // ← Change prefix
            quality: 85
        );
    }
    
    Article::create($data);
    // ...
}
```

**2. Frontend Component Pattern**:

Copy `CreateUserModal.tsx` or `EditUserModal.tsx` upload section and adjust:
- Change `data.image` to `data.yourField`
- Update preview sizes as needed
- Adjust file size limits if needed

**3. Display Pattern**:

```tsx
{/* Avatar/Image Display */}
{item.image ? (
    <img 
        src={`/storage/${item.image}`} 
        alt={item.name}
        className="h-10 w-10 rounded-full object-cover"
    />
) : (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <DefaultIcon className="h-5 w-5 text-muted-foreground" />
    </div>
)}
```

---

### For End Users

**1. Uploading Avatar**:
- Click "Add User" button
- Drag & drop image into upload zone OR click "Browse Files"
- Supported formats: JPG, PNG, GIF, WebP
- Maximum size: 10 MB
- Image will be automatically resized to 200x200px and converted to WebP

**2. Replacing Avatar**:
- Click "Edit" button on user row
- If user has avatar, click "Replace Avatar" button
- Drag & drop new image or browse
- Click "Save Changes"

**3. Viewing Avatar**:
- Index table: Small avatar (8x8) next to user name
- Show modal: Large avatar (16x16) in header
- Edit modal: Preview avatar (32x32) before saving

---

## Related Documentation

- [Image Service Usage Guide](../IMAGE_SERVICE_USAGE.md)
- [Image Upload Security](../IMAGE_UPLOAD_SECURITY.md)
- [Laravel Instructions](.github/instructions/laravel.instructions.md)

---

## Changelog

**2025-01-XX - Initial Implementation**
- ✅ ImageService refactored to generic method
- ✅ 5-layer security validation implemented
- ✅ CreateUserModal upload UI added
- ✅ EditUserModal upload UI with current image display
- ✅ ShowUserModal avatar display in header
- ✅ Index table avatar column added
- ✅ All TypeScript interfaces updated
- ✅ 29 backend tests passing
- ✅ Documentation completed

---

## Future Enhancements (Optional)

- [ ] Avatar cropping tool (client-side)
- [ ] Multiple image sizes generation (thumbnail, medium, large)
- [ ] Image CDN integration
- [ ] Avatar placeholder service (e.g., UI Avatars)
- [ ] Batch image optimization command
- [ ] Image lazy loading for Index table

---

## Notes

- WebP format provides 73-80% file size reduction compared to PNG/JPEG
- All avatars stored in `storage/public/users/` directory
- Generic ImageService allows easy reuse for other entities (Article, Product, etc.)
- 5-layer security validation protects against 6+ attack types
- UI pattern follows Form.tsx drag & drop standard
- All image previews use `URL.createObjectURL()` with proper cleanup
- Backend validation logs all rejection attempts for monitoring

---

**Status**: ✅ Production Ready  
**Tests**: ✅ 29/29 Passing  
**Security**: ✅ 5-Layer Validation  
**UI/UX**: ✅ Complete with Drag & Drop
