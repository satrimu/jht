---
applyTo: '**'
---

# CRUD Generation Instructions for GitHub Copilot

## Overview
Panduan ini menjelaskan bagaimana GitHub Copilot harus merespons permintaan pembuatan CRUD dari developer melalui chat command.

## Chat Command Pattern
**Format Input**: `"buat crud [NamaResource]. field: [field1], [field2], [field3]"`

**Contoh**: 
- `"buat crud Category. field: name, note"`
- `"buat crud Product. field: name, price, description, category_id"`
- `"buat crud Payment. field: user_id, amount, payment_date, status, notes"`

## Auto-Generated Files & Structure

Ketika menerima command CRUD, Copilot HARUS membuat file-file berikut dalam satu changeset:

### 1. Migration
**File**: `database/migrations/YYYY_MM_DD_HHMMSS_create_[resources]_table.php`
```php
// Auto-generate berdasarkan field yang disebutkan
// Tambahkan timestamps, soft deletes jika perlu
// Gunakan tipe data yang sesuai berdasarkan nama field
```

**Field Type Detection**:
- `*_id` → `foreignId()` dengan constraint
- `name`, `title` → `string()`
- `description`, `note`, `notes` → `text()`
- `price`, `amount` → `decimal(15,2)`
- `email` → `string()->unique()`
- `*_date`, `*_at` → `timestamp()`
- `status` → `enum()` dengan default values
- `is_*`, `has_*` → `boolean()->default(false)`
- `image`, `avatar`, `photo` → `string()->nullable()` (stores filename only)

### 2. Model
**File**: `app/Models/[Resource].php`
```php
// Fillable fields berdasarkan input
// Relationships jika ada foreign key
// Casts untuk dates, booleans, JSON
// Soft deletes jika diperlukan
// WAJIB: Gunakan LogsActivity trait untuk audit logging
// WAJIB: Implement getActivitylogOptions() method
```

**Audit Logging Pattern (WAJIB untuk semua model)**:
```php
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class [Resource] extends Model
{
    use LogsActivity;

    // ... other code ...

    /**
     * Configure activity logging using Spatie
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name',           // Field utama
                'status',         // Status fields
                'is_active',      // Boolean fields
                // Tambahkan field penting lainnya
            ])
            ->logOnlyDirty()      // Hanya log perubahan
            ->dontSubmitEmptyLogs(); // Jangan log kosong
    }
}
```

**Image Field Pattern (jika ada field image)**:
```php
/**
 * Get the [resource]'s image URL with fallback to default.
 */
public function getImageUrlAttribute(): string
{
    if (empty($this->attributes['image'])) {
        return asset('[resource]-default.svg'); // Default image
    }

    // Image stored as '[storage_path]/filename.webp'
    $filename = ltrim($this->attributes['image'], '/');
    return asset('storage/[storage_path]/'.$filename);
}

protected $appends = ['image_url']; // Append to JSON
```

### 3. Controller (Admin)
**File**: `app/Http/Controllers/Admin/[Resource]Controller.php`
```php
// Full CRUD: index, create, store, show, edit, update, destroy
// Inject Repository interface
// Return Inertia responses
// Eager load relationships untuk mencegah N+1
```

**ImageService Pattern (jika ada field image)**:
```php
use App\Services\ImageService;

class [Resource]Controller extends Controller
{
    public function __construct(
        private readonly [Resource]RepositoryInterface $repo,
        private readonly ImageService $imageService
    ) {}

    public function store(Store[Resource]Request $request)
    {
        $data = $request->validated();
        
        // Handle image upload if present
        if ($request->hasFile('image')) {
            try {
                $filename = $this->imageService->processImageWithDimensions(
                    $request->file('image'),
                    storagePath: '[resources]', // Storage folder
                    width: 400,                // Target width
                    height: 400,               // Target height
                    quality: 85,               // WebP quality
                    prefix: '[resource]'       // Filename prefix
                );
                $data['image'] = $filename;
            } catch (\Exception $e) {
                return redirect()->back()->withErrors(['image' => 'Failed to process image']);
            }
        }

        $[resource] = $this->repo->create($data);
        return redirect()->route('admin.[resources].index')
            ->with('success', '[Resource] berhasil dibuat!');
    }

    public function update(Update[Resource]Request $request, [Resource] $[resource])
    {
        $data = $request->validated();
        
        // Handle image upload if present
        if ($request->hasFile('image')) {
            try {
                // Delete old image if exists
                if ($[resource]->image) {
                    $this->imageService->deleteImage('[resources]/' . $[resource]->image);
                }
                
                $filename = $this->imageService->processImageWithDimensions(
                    $request->file('image'),
                    storagePath: '[resources]',
                    width: 400,
                    height: 400,
                    quality: 85,
                    prefix: '[resource]'
                );
                $data['image'] = $filename;
            } catch (\Exception $e) {
                return redirect()->back()->withErrors(['image' => 'Failed to process image']);
            }
        }

        $this->repo->update($[resource], $data);
        return redirect()->route('admin.[resources].index')
            ->with('success', '[Resource] berhasil diperbarui!');
    }

    public function destroy([Resource] $[resource])
    {
        // Delete image if exists
        if ($[resource]->image) {
            $this->imageService->deleteImage('[resources]/' . $[resource]->image);
        }
        
        $this->repo->delete($[resource]);
        return redirect()->route('admin.[resources].index')
            ->with('success', '[Resource] berhasil dihapus!');
    }
}
```

### 4. Repository Pattern
**Interface**: `app/Repositories/Contracts/[Resource]RepositoryInterface.php`
**Implementation**: `app/Repositories/Eloquent/[Resource]Repository.php`

### 5. Form Requests
**Store**: `app/Http/Requests/Admin/Store[Resource]Request.php`
**Update**: `app/Http/Requests/Admin/Update[Resource]Request.php`
```php
// Validation rules berdasarkan field types
// Authorization dengan policy check
```

### 6. Policy
**File**: `app/Policies/[Resource]Policy.php`
```php
// viewAny, view, create, update, delete methods
// Register di AuthServiceProvider
```

### 7. Frontend Pages (Admin)
**Index**: `resources/js/pages/admin/[resources]/Index.tsx`
**Modal Components**:
- `resources/js/pages/admin/[resources]/Create[Resource]Modal.tsx`
- `resources/js/pages/admin/[resources]/Edit[Resource]Modal.tsx`
- `resources/js/pages/admin/[resources]/Delete[Resource]Modal.tsx`
- `resources/js/pages/admin/[resources]/Show[Resource]Modal.tsx` (optional)

**IMPORTANT**: Gunakan **Modal pattern**, bukan separate pages untuk Create/Edit!

**Features yang harus ada**:
- **Layout**: `AppLayout` dengan breadcrumbs prop
- **Modal-based CRUD**: Create, Edit, Delete menggunakan Dialog components
- **State Management**: useState untuk modal open/close states
- **Table Structure**: shadcn/ui Table components
- **Pagination**: shadcn/ui Pagination components
- **Actions**: Button dengan icons (Eye, Edit, Trash2, Plus)
- **Toast Notifications**: Sonner toast untuk feedback

### 8. Routes
**File**: `routes/admin.php`
```php
Route::resource('[resources]', [Resource]Controller::class)
    ->names('admin.[resources]');
```

### 9. Tests
**Feature**: `tests/Feature/Admin/[Resource]ControllerTest.php`
**Unit**: `tests/Unit/[Resource]Test.php`

## Field-Specific Patterns

### Foreign Key Fields
Jika field berakhiran `_id`:
```php
// Migration
$table->foreignId('category_id')->constrained()->cascadeOnDelete();

// Model relationship
public function category(): BelongsTo
{
    return $this->belongsTo(Category::class);
}

// Controller eager loading
->with('category')

// Frontend display
{item.category?.name}
```

### Status/Enum Fields
```php
// Migration
$table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');

// Model
protected $casts = [
    'status' => 'string',
];

// Form options
const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
];
```

### Date Fields
```php
// Migration
$table->timestamp('payment_date')->nullable();

// Model
protected $casts = [
    'payment_date' => 'datetime',
];

// Frontend formatting
{format(new Date(item.payment_date), 'dd/MM/yyyy')}
```

### Boolean Fields
```php
// Migration
$table->boolean('is_active')->default(true);

// Model
protected $casts = [
    'is_active' => 'boolean',
];

// Frontend
<Switch checked={item.is_active} />
```

## Validation Rules Auto-Generation

Berdasarkan field name, generate validation rules:
```php
// name, title
'name' => ['required', 'string', 'max:255'],

// email
'email' => ['required', 'email', 'unique:users,email'],

// *_id
'category_id' => ['required', 'exists:categories,id'],

// price, amount
'amount' => ['required', 'numeric', 'min:0'],

// description, note
'description' => ['nullable', 'string', 'max:1000'],

// status
'status' => ['required', 'in:pending,approved,rejected'],

// dates
'payment_date' => ['required', 'date'],

// boolean
'is_active' => ['boolean'],

// image (if field type includes image)
'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:10240'], // 10MB max
```

## Frontend Pattern & Components

### Index Page Pattern:
```tsx
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import Create[Resource]Modal from './Create[Resource]Modal';
import Edit[Resource]Modal from './Edit[Resource]Modal';
import Delete[Resource]Modal from './Delete[Resource]Modal';

export default function Index({ [resources], breadcrumbs }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selected[Resource], setSelected[Resource]] = useState(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="[Resources] Management" />
            {/* Content dengan Table dan Actions */}
            
            {/* Modals */}
            <Create[Resource]Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
            <Edit[Resource]Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                [resource]={selected[Resource]}
            />
            <Delete[Resource]Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                [resource]={selected[Resource]}
            />
        </AppLayout>
    );
}
```

### Modal Components Pattern:
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface Create[Resource]ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Create[Resource]Modal({ isOpen, onClose }: Create[Resource]ModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        // form fields
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/[resources]', {
            forceFormData: true, // WAJIB jika ada file upload
            onSuccess: () => {
                toast.success('[Resource] berhasil dibuat!'); // Indonesian message
                reset();
                onClose();
            },
            onError: () => {
                toast.error('Gagal membuat [resource]. Silakan periksa form.');
            },
            preserveScroll: true,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create [Resource]</DialogTitle>
                </DialogHeader>
                {/* Form content */}
            </DialogContent>
        </Dialog>
    );
}
```

**Toast Pattern (WAJIB - Bahasa Indonesia)**:
```tsx
// Import
import { toast } from 'sonner';

// Success messages
toast.success('[Resource] berhasil dibuat!');
toast.success('[Resource] berhasil diperbarui!');
toast.success('[Resource] berhasil dihapus!');

// Error messages  
toast.error('Gagal membuat [resource]. Silakan periksa form.');
toast.error('Gagal memperbarui [resource]. Silakan coba lagi.');
toast.error('Gagal menghapus [resource]. Silakan coba lagi.');

// File validation errors
toast.error('Ukuran file harus kurang dari 10MB');
toast.error('Harap upload file gambar yang valid (JPG, PNG, GIF, WebP)');

// Form validation errors (manual)
toast.error('Nama wajib diisi.');
toast.error('Email wajib diisi.');
```

**Image Upload Pattern (jika ada field image)**:
```tsx
import { UploadCloud, X } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

// State untuk image
const [imagePreview, setImagePreview] = useState<string | null>(null);
const [isDragOver, setIsDragOver] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);

// Cleanup preview URL
useEffect(() => {
    return () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
    };
}, [imagePreview]);

// File change handler
const handleFileChange = (file: File | null) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        toast.error('Harap upload file gambar yang valid (JPG, PNG, GIF, WebP)');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        toast.error('Ukuran file harus kurang dari 10MB');
        return;
    }

    setData('image', file);
    setImagePreview(URL.createObjectURL(file));
};

// Image upload component
<div className="space-y-2">
    <Label>Image</Label>
    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
        <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="hidden"
        />
        
        {imagePreview ? (
            <div className="relative">
                <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                />
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2"
                    onClick={() => {
                        setImagePreview(null);
                        setData('image', null);
                        if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                        }
                    }}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        ) : (
            <div className="text-center">
                <UploadCloud className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                    Click to upload image
                </p>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2"
                >
                    Choose File
                </Button>
            </div>
        )}
    </div>
    {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
</div>
```

### Form Fields berdasarkan type:
```tsx
// String fields
<div>
    <Label htmlFor="name">Name *</Label>
    <Input
        id="name"
        value={data.name}
        onChange={(e) => setData('name', e.target.value)}
        className={errors.name ? 'border-destructive' : ''}
    />
    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
</div>

// Select for foreign keys
<div>
    <Label htmlFor="category_id">Category *</Label>
    <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
        <SelectTrigger className={errors.category_id ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
            {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
    {errors.category_id && <p className="text-sm text-destructive">{errors.category_id}</p>}
</div>

// Textarea for long text
<div>
    <Label htmlFor="description">Description</Label>
    <Textarea
        id="description"
        value={data.description}
        onChange={(e) => setData('description', e.target.value)}
        rows={4}
        className={errors.description ? 'border-destructive' : ''}
    />
    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
</div>
```

## Service Provider Binding

Auto-register repository binding:
```php
// app/Providers/AppServiceProvider.php
$this->app->bind(
    \App\Repositories\Contracts\CategoryRepositoryInterface::class,
    \App\Repositories\Eloquent\CategoryRepository::class
);
```

## Example Complete Flow

**Input**: `"buat crud Category. field: name, description, is_active"`

**Generated Files**:
1. `database/migrations/2024_01_01_120000_create_categories_table.php`
2. `app/Models/Category.php`
3. `app/Http/Controllers/Admin/CategoryController.php`
4. `app/Repositories/Contracts/CategoryRepositoryInterface.php`
5. `app/Repositories/Eloquent/CategoryRepository.php`
6. `app/Http/Requests/Admin/StoreCategoryRequest.php`
7. `app/Http/Requests/Admin/UpdateCategoryRequest.php`
8. `app/Policies/CategoryPolicy.php`
9. `resources/js/pages/admin/categories/Index.tsx`
10. `resources/js/pages/admin/categories/CreateCategoryModal.tsx`
11. `resources/js/pages/admin/categories/EditCategoryModal.tsx`
12. `resources/js/pages/admin/categories/DeleteCategoryModal.tsx`
13. `tests/Feature/Admin/CategoryControllerTest.php`
14. Update `routes/admin.php`
15. Update `app/Providers/AppServiceProvider.php`

## Code Pattern Requirements (MUST FOLLOW)

### Layout & Structure
- **Layout**: Gunakan `AppLayout` dari `@/layouts/app-layout` dengan breadcrumbs
- **Head Title**: Format `"[Resource] Management"` untuk index pages
- **Container**: Gunakan div dengan class `"flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"`

### Modal Architecture (WAJIB)
- **Index Page**: Hanya untuk display list dan mengatur modal states
- **Create/Edit/Delete**: Menggunakan Modal components, BUKAN separate pages
- **Modal Naming**: `Create[Resource]Modal.tsx`, `Edit[Resource]Modal.tsx`, `Delete[Resource]Modal.tsx`
- **State Management**: useState untuk `isCreateModalOpen`, `isEditModalOpen`, `isDeleteModalOpen`
- **Selected Item**: useState untuk `selected[Resource]` 

### UI Components & Icons
- **Actions**: Gunakan icons dari `lucide-react` (Plus, Edit, Trash2, Eye)
- **Buttons**: shadcn/ui Button components
- **Tables**: shadcn/ui Table components
- **Modals**: shadcn/ui Dialog components
- **Forms**: shadcn/ui Input, Select, Textarea, Label
- **Notifications**: Sonner toast (`toast.success`, `toast.error`)

### Event Handlers Pattern
```tsx
const handle[Action][Resource] = (resource: [Resource]) => {
    setSelected[Resource](resource);
    setIs[Action]ModalOpen(true);
};

// Example:
const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
};
```

### Props Interface Pattern
```tsx
interface [Resource]sIndexProps {
    [resources]: {
        data: [Resource][];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    breadcrumbs: Array<{
        title: string;
        href: string;
    }>;
}
```

## Behavioral Rules

1. **Always ask for confirmation** sebelum generate multiple files
2. **Follow naming conventions**: PascalCase untuk classes, snake_case untuk tables
3. **Add proper TypeScript types** untuk frontend
4. **Include proper error handling** dalam forms
5. **Generate realistic test data** dalam factories dan tests
6. **Add proper documentation** comments dalam kode
7. **Follow PSR-12** formatting standards
8. **Include proper accessibility** attributes (aria-label, etc.)
9. **WAJIB gunakan Modal pattern** untuk Create/Edit/Delete
10. **WAJIB gunakan AppLayout** dengan breadcrumbs
11. **WAJIB gunakan LogsActivity trait** untuk audit logging pada model
12. **WAJIB gunakan ImageService** untuk field image dengan WebP conversion
13. **WAJIB gunakan toast bahasa Indonesia** untuk feedback user
14. **WAJIB gunakan forceFormData: true** jika ada file upload

## Complete Example: Category CRUD Structure

### File Structure Generated:
```
resources/js/pages/admin/categories/
├── Index.tsx                    // Main list page dengan modals
├── CreateCategoryModal.tsx      // Create modal
├── EditCategoryModal.tsx        // Edit modal  
├── DeleteCategoryModal.tsx      // Delete confirmation modal
└── ShowCategoryModal.tsx        // Optional view modal
```

### Index.tsx Pattern:
```tsx
export default function Index({ categories, breadcrumbs }: CategoriesIndexProps) {
    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);  
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // Event handlers
    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setIsEditModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Content */}
                
                {/* Modals at bottom */}
                <CreateCategoryModal
                    isOpen={isCreateModalOpen} 
                    onClose={() => setIsCreateModalOpen(false)}
                />
                <EditCategoryModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    category={selectedCategory}
                />
            </div>
        </AppLayout>
    );
}
```

## Integration Notes

- **Bind repositories** di ServiceProvider
- **Register policies** di AuthServiceProvider  
- **Add navigation menu items** untuk admin pages
- **Update permission seeder** jika menggunakan permission system
- **Add factory** untuk testing data
- **Include soft deletes** jika resource butuh audit trail

## Quality Checklist

Setelah generate CRUD, pastikan:
- ✅ Migration dapat dijalankan tanpa error
- ✅ Model relationships benar
- ✅ Controller methods lengkap dan tested
- ✅ Form validation bekerja
- ✅ Frontend responsive dan accessible
- ✅ Tests pass
- ✅ Routes terdaftar dengan benar
- ✅ Repository pattern implemented
- ✅ Policy authorization active
- ✅ LogsActivity trait active untuk audit logging
- ✅ ImageService integration untuk image fields
- ✅ Toast notifications dalam bahasa Indonesia
- ✅ Image upload dengan validation dan preview
- ✅ forceFormData: true untuk file uploads