# User Management Improvements

**Last Updated**: 2025-10-18  
**Status**: Complete  
**Category**: Features / Bug Fixes  

---

## Overview

Perbaikan pada fitur user management untuk meningkatkan UX, keamanan data, dan layout tampilan.

---

## Perubahan yang Dilakukan

### 1. **UserController - Safe Update Pattern** ✅

**Problem**: Ketika update user dengan image baru, data lain bisa terhapus jika tidak dikirim dalam request.

**Solution**: Implementasi pattern yang lebih aman seperti pada Extra controller.

**File**: `app/Http/Controllers/Admin/UserController.php`

**Perubahan**:
```php
public function update(UpdateUserRequest $request, User $user)
{
    $data = $request->validated();

    // Only hash password if it's provided
    if (! empty($data['password'])) {
        $data['password'] = bcrypt($data['password']);
    } else {
        unset($data['password']);
    }

    // Handle image upload with WebP conversion
    if ($request->hasFile('image')) {
        try {
            // Delete old image if exists
            if ($user->image) {
                $this->imageService->deleteImageFile($user->image);
            }

            // Process new image
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
    } else {
        // ✅ PENTING: Jika tidak ada file baru, jangan ubah kolom image
        // Ini mencegah image di-set null secara tidak sengaja
        unset($data['image']);
    }

    $user->update($data);
    Cache::flush();

    return redirect()->route('admin.users.index')
        ->with('success', 'User updated successfully.');
}
```

**Benefit**:
- ✅ Data aman, hanya field yang dikirim yang diupdate
- ✅ Image tidak terhapus jika tidak ada upload baru
- ✅ Password hanya di-hash jika ada input baru
- ✅ Konsisten dengan pattern controller lain (Extra, Article, dll)

---

### 2. **UpdateUserRequest - Flexible Validation** ✅

**Problem**: 
- Validasi `name` dan `email` menggunakan `required`
- Ketika upload image saja, muncul error: "Nama wajib diisi. Email wajib diisi."

**Solution**: Gunakan `sometimes|required` untuk field yang harus ada **jika** dikirim.

**File**: `app/Http/Requests/Admin/Users/UpdateUserRequest.php`

**Perubahan**:
```php
public function rules(): array
{
    $userId = $this->route('user')->id;

    return [
        'name' => 'sometimes|required|string|max:255',  // ✅ sometimes
        'email' => 'sometimes|required|string|email|max:255|unique:users,email,'.$userId,  // ✅ sometimes
        'password' => 'nullable|string|min:8|confirmed',
        'role' => 'nullable|string|in:admin,user',
        'member_number' => 'nullable|string|max:255|unique:users,member_number,'.$userId,
        'full_name' => 'nullable|string|max:255',
        'address' => 'nullable|string|max:500',
        'phone' => 'nullable|string|max:20',
        'join_date' => 'nullable|date',
        'note' => 'nullable|string|max:1000',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // ✅ 10MB max, support webp
        'is_active' => 'boolean',
    ];
}
```

**Perbedaan `required` vs `sometimes|required`**:

| Rule | Behavior |
|------|----------|
| `required` | Field **HARUS ADA** di request |
| `sometimes\|required` | Jika field **ADA**, maka harus diisi. Jika **TIDAK ADA**, skip validasi |

**Benefit**:
- ✅ Tidak ada error saat upload image saja (partial update)
- ✅ Jika field dikirim, tetap tervalidasi
- ✅ Lebih fleksibel untuk berbagai skenario update

**Skenario yang didukung**:
1. Update image saja → ✅ OK (tidak perlu kirim name/email)
2. Update name saja → ✅ OK (jika name dikirim, harus valid)
3. Update email saja → ✅ OK (jika email dikirim, harus valid dan unique)
4. Update semua field → ✅ OK (semua field tervalidasi)

---

### 3. **ShowUserModal - Improved Layout** ✅

**Problem**: 
- Layout 3 kolom terlalu sempit di modal
- Informasi kurang terorganisir
- Action buttons terpisah di bawah

**Solution**: Redesign dengan layout 2 kolom yang lebih luas dan rapi.

**File**: `resources/js/pages/admin/users/ShowUserModal.tsx`

**Perubahan Layout**:

#### **Before** (3 Columns):
```
┌────────────────────────────────────────┐
│ Avatar + Name                          │
├────────────────────────────────────────┤
│ [Edit]  [Delete]                       │
├────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐               │
│ │Basic│ │Notes│ │Role │               │ ← Terlalu sempit
│ └─────┘ └─────┘ └─────┘               │
├────────────────────────────────────────┤
│ System Info (3 cols)                   │
├────────────────────────────────────────┤
│ Quick Actions                          │
└────────────────────────────────────────┘
```

#### **After** (2 Columns):
```
┌──────────────────────────────────────────────┐
│ ┌──────┐  Name              [Edit][Delete] │ ← Header + Actions
│ │Avatar│  email@example.com                │
│ └──────┘                                    │
├──────────────────────────────────────────────┤
│ ┌─────────────┐  ┌─────────────┐           │
│ │   Basic     │  │ Role/Status │           │ ← 2 Columns (lebih luas)
│ │ Information │  │             │           │
│ └─────────────┘  └─────────────┘           │
├──────────────────────────────────────────────┤
│ ┌──────────────────────────────┐           │
│ │          Notes               │           │ ← Full width jika ada
│ └──────────────────────────────┘           │
├──────────────────────────────────────────────┤
│ System Information (3 cols)                 │
├──────────────────────────────────────────────┤
│ Quick Actions (Email, Call, Delete)         │
└──────────────────────────────────────────────┘
```

**UI Improvements**:

1. **Header**:
   - ✅ Avatar lebih besar (20x20) dengan ring border
   - ✅ Fallback avatar jika tidak ada gambar
   - ✅ Email ditampilkan di description dengan icon
   - ✅ Action buttons (Edit/Delete) di header sebelah kanan

2. **Card Layout**:
   - ✅ 2 kolom lebih luas (Basic Info + Role/Status)
   - ✅ Border bottom pada setiap row untuk separator
   - ✅ Icon ukuran 3.5 (lebih kecil, lebih rapih)
   - ✅ Font size konsisten (text-sm)

3. **Notes Section**:
   - ✅ Full width jika ada note
   - ✅ Conditional rendering (hanya tampil jika ada note)
   - ✅ Background muted dengan padding yang nyaman

4. **System Info**:
   - ✅ 3 kolom grid (ID, Created, Updated)
   - ✅ Format tanggal Indonesia: `toLocaleString('id-ID')`
   - ✅ Icon `Info` untuk section title

5. **Quick Actions**:
   - ✅ Email button dengan `mailto:`
   - ✅ Call button dengan `tel:` (jika ada phone)
   - ✅ Responsive wrapping

**Perubahan Detail**:

```tsx
// Avatar dengan fallback
{user.image ? (
    <img
        src={`/storage/${user.image}`}
        alt={user.full_name || user.name}
        className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
    />
) : (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted ring-2 ring-border">
        <UserIcon className="h-10 w-10 text-muted-foreground" />
    </div>
)}

// Row dengan border-b separator
<div className="flex justify-between border-b pb-2">
    <span className="text-sm font-medium text-muted-foreground">
        Username
    </span>
    <span className="text-sm font-semibold">
        {user.name}
    </span>
</div>

// Notes conditional rendering
{user.note && (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
                <StickyNote className="h-5 w-5" />
                Notes
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="rounded-md bg-muted p-4 text-sm leading-relaxed">
                {user.note}
            </p>
        </CardContent>
    </Card>
)}
```

**Benefit**:
- ✅ Lebih mudah dibaca (2 kolom vs 3 kolom)
- ✅ Informasi terorganisir dengan baik
- ✅ Action buttons accessible di header
- ✅ Responsive dan mobile-friendly
- ✅ Visual hierarchy lebih jelas

---

### 4. **UserController Index - Include Image Field** ✅

**Problem**: Field `image` tidak dikirim ke frontend untuk ditampilkan di tabel.

**Solution**: Tambahkan `image` ke query select.

**File**: `app/Http/Controllers/Admin/UserController.php`

**Perubahan**:
```php
$users = Cache::remember($cacheKey, 300, function () use ($perPage) {
    return User::select([
        'id',
        'name',
        'email',
        'role',
        'member_number',
        'full_name',
        'phone',
        'join_date',
        'is_active',
        'image', // ✅ Include image for avatar display
        'created_at',
        // Exclude: password, address, note, updated_at, etc.
    ])
        ->latest('created_at')
        ->paginate($perPage);
});
```

**Benefit**:
- ✅ Avatar dapat ditampilkan di Index table
- ✅ Konsisten dengan data yang dibutuhkan frontend
- ✅ Tidak expose sensitive fields (password, address, note)

---

## Testing & Verification

### Backend Tests ✅

```bash
./vendor/bin/pest --filter=UserControllerTest --no-coverage
```

**Result**:
```
PASS  Tests\Feature\Admin\UserControllerTest
✓ admin can view users index            0.64s  
✓ admin can create user                 0.08s  
✓ admin can update user                 0.06s  
✓ admin can delete user                 0.06s  
✓ user update allows nullable fields    0.06s  
... (24 more tests)

Tests:    29 passed (116 assertions)
Duration: 2.82s
```

### Code Formatting ✅

```bash
./vendor/bin/pint
```

**Result**:
```
PASS   .......................... 107 files
```

### TypeScript Compilation ✅

```bash
npx tsc --noEmit
```

**Result**: ✅ No errors

---

## Pattern Comparison

### Update Pattern (Before vs After)

#### **Before** (Unsafe):
```php
public function update(UpdateUserRequest $request, User $user)
{
    $data = $request->validated();
    
    if ($request->hasFile('image')) {
        $data['image'] = $this->imageService->processImage(...);
    }
    
    $user->update($data); // ❌ image bisa jadi null jika tidak ada file
}
```

#### **After** (Safe):
```php
public function update(UpdateUserRequest $request, User $user)
{
    $data = $request->validated();
    
    if ($request->hasFile('image')) {
        if ($user->image) {
            $this->imageService->deleteImageFile($user->image);
        }
        $data['image'] = $this->imageService->processImage(...);
    } else {
        unset($data['image']); // ✅ Jangan ubah image jika tidak ada file baru
    }
    
    $user->update($data); // ✅ Safe update
}
```

**Key Difference**:
- `unset($data['image'])` mencegah field `image` di-set null
- Hanya field yang ada di `$data` yang akan diupdate
- Image lama tetap aman jika tidak ada upload baru

---

## Validation Pattern Comparison

### UpdateUserRequest Rules

#### **Before** (Strict):
```php
'name' => 'required|string|max:255',  // ❌ Harus ada di request
'email' => 'required|string|email',   // ❌ Harus ada di request
```

**Problem**:
- Upload image saja → Error: "Nama wajib diisi"
- Partial update tidak bisa

#### **After** (Flexible):
```php
'name' => 'sometimes|required|string|max:255',  // ✅ Jika ada, harus valid
'email' => 'sometimes|required|string|email',   // ✅ Jika ada, harus valid
```

**Benefit**:
- Upload image saja → ✅ OK
- Update name saja → ✅ OK
- Update email saja → ✅ OK
- Full update → ✅ OK

---

## Use Cases Supported

### 1. Upload Image Only
```javascript
// Frontend
const formData = new FormData();
formData.append('image', fileInput.files[0]);

// Backend
// ✅ Validasi: image OK, name/email tidak required
// ✅ Update: hanya image yang berubah, data lain tetap
```

### 2. Update Name Only
```javascript
// Frontend
const formData = { name: 'New Name' };

// Backend
// ✅ Validasi: name required dan valid
// ✅ Update: hanya name yang berubah, image tetap
```

### 3. Update Image + Name
```javascript
// Frontend
const formData = new FormData();
formData.append('name', 'New Name');
formData.append('image', fileInput.files[0]);

// Backend
// ✅ Validasi: name + image valid
// ✅ Update: name + image berubah, delete old image
```

### 4. Delete Image (Future Enhancement)
```javascript
// Frontend
const formData = { remove_image: true };

// Backend (to be implemented)
if ($request->input('remove_image')) {
    $this->imageService->deleteImageFile($user->image);
    $data['image'] = null;
}
```

---

## Migration Guide

Jika ingin menerapkan pattern ini di controller lain (Article, Payment, Product, dll):

### Step 1: Update Controller
```php
if ($request->hasFile('image')) {
    // Delete old image
    if ($model->image) {
        $this->imageService->deleteImageFile($model->image);
    }
    
    // Process new image
    $data['image'] = $this->imageService->processImageWithDimensions(...);
} else {
    // Don't change image field
    unset($data['image']);
}
```

### Step 2: Update FormRequest
```php
public function rules(): array
{
    return [
        'name' => 'sometimes|required|string|max:255',  // ← Add sometimes
        'email' => 'sometimes|required|email',          // ← Add sometimes
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
        // ... other fields
    ];
}
```

### Step 3: Test Partial Update
```php
// Test image upload only
public function test_can_update_image_only()
{
    $user = User::factory()->create(['name' => 'Original Name']);
    
    $file = UploadedFile::fake()->image('avatar.jpg');
    
    $response = $this->actingAs($admin)->put("/admin/users/{$user->id}", [
        'image' => $file,
    ]);
    
    $user->refresh();
    
    $this->assertEquals('Original Name', $user->name); // ✅ Name tetap
    $this->assertNotNull($user->image); // ✅ Image updated
}
```

---

## Related Documentation

- [User Avatar Feature](./USER_AVATAR_FEATURE.md) - Complete avatar implementation
- [Image Service Usage](../IMAGE_SERVICE_USAGE.md) - Generic image service guide
- [Image Upload Security](../IMAGE_UPLOAD_SECURITY.md) - 5-layer security

---

## Changelog

**2025-10-18 - Improvements**
- ✅ UserController update menggunakan safe pattern (unset image jika tidak ada file)
- ✅ UpdateUserRequest validasi menggunakan `sometimes|required` untuk fleksibilitas
- ✅ ShowUserModal layout diubah dari 3 kolom ke 2 kolom yang lebih luas
- ✅ Avatar fallback ditambahkan (UserIcon jika tidak ada gambar)
- ✅ UserController index mengirim field `image` ke frontend
- ✅ Semua tests passing (29/29)
- ✅ Code formatting dengan Pint

---

**Status**: ✅ Production Ready  
**Tests**: ✅ 29/29 Passing  
**Pattern**: ✅ Safe Update (Extra Controller Pattern)  
**Validation**: ✅ Flexible (sometimes|required)  
**UI**: ✅ Improved Layout (2 Columns)
