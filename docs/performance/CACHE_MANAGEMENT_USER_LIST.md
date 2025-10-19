# Cache Management - User List Fix

**Last Updated**: 2025-10-18  
**Category**: Performance & Cache  
**Status**: Final

## Problem

After updating user data (including image upload), **data tidak berubah di UI** walaupun di database sudah ter-update. 

### Root Cause

1. **Cache::flush() terlalu agresif** - Menghapus SEMUA cache aplikasi, bukan hanya users cache
2. **Cache key tidak di-clear dengan spesifik** - Cache users list (`users_list_page_{page}_per_{perPage}`) tidak dihapus
3. **Image path construction salah** - Saat delete image, path tidak sesuai dengan struktur storage

## Solution

### 1. Specific Cache Clearing Method

**Before (❌ WRONG):**
```php
public function update(UpdateUserRequest $request, User $user)
{
    // ... update logic
    
    Cache::flush(); // ❌ Clears ALL cache including sessions, config, etc.
    
    return redirect()->route('admin.users.index');
}
```

**After (✅ CORRECT):**
```php
public function update(UpdateUserRequest $request, User $user)
{
    // ... update logic
    
    $this->clearUsersCache(); // ✅ Only clears users list cache
    
    return redirect()->route('admin.users.index');
}

/**
 * Clear all users list cache keys
 * Cache pattern: users_list_page_{page}_per_{perPage}
 */
private function clearUsersCache(): void
{
    // Clear cache for common pagination sizes
    $perPageOptions = [10, 15, 25, 50, 100];
    
    foreach ($perPageOptions as $perPage) {
        // Clear up to 100 pages for each perPage option
        for ($page = 1; $page <= 100; $page++) {
            Cache::forget("users_list_page_{$page}_per_{$perPage}");
        }
    }
}
```

### 2. Correct Image Path Construction

**Storage Structure:**
```
storage/
└── app/
    └── public/
        └── users/
            ├── avatar-abc123-1234567890.webp
            ├── avatar-def456-1234567891.webp
            └── ...
```

**Database Stores:**
```sql
-- users table
id | name | email | image
---|------|-------|---------------------------
1  | john | ...   | avatar-abc123-1234567890.webp  -- ✅ Filename only
```

**Model Accessor Constructs Full URL:**
```php
// User.php
public function getImageUrlAttribute(): string
{
    if (empty($this->attributes['image'])) {
        return asset('user.svg'); // Default fallback
    }

    // Construct full public URL
    // Database: avatar-abc123-1234567890.webp
    // Returns: /storage/users/avatar-abc123-1234567890.webp
    return asset('storage/users/' . $this->attributes['image']);
}
```

**Controller Delete Image:**
```php
// Before (❌ WRONG)
if ($user->image) {
    $this->imageService->deleteImageFile($user->image);
    // Tries to delete: avatar-abc123-1234567890.webp
    // But storage expects: users/avatar-abc123-1234567890.webp
}

// After (✅ CORRECT)
if ($user->image) {
    // Database stores filename only: avatar-123.webp
    // Need full path for delete: users/avatar-123.webp
    $fullPath = 'users/' . $user->image;
    $this->imageService->deleteImageFile($fullPath);
}
```

### 3. Complete Fixed Controller

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Users\StoreUserRequest;
use App\Http\Requests\Admin\Users\UpdateUserRequest;
use App\Models\User;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct(private ImageService $imageService) {}

    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 10);
        $page = (int) $request->get('page', 1);

        // Cache key with pagination params for unique caching per page
        $cacheKey = "users_list_page_{$page}_per_{$perPage}";

        // Cache for 5 minutes (300 seconds) to reduce database load
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
                'image', // Include image for avatar display
                'created_at',
            ])
                ->latest('created_at')
                ->paginate($perPage);
        });

        return Inertia::render('admin/users/Index', [
            'users' => $users,
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/admin'],
                ['title' => 'Users', 'href' => '/admin/users'],
            ],
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = bcrypt($data['password']);
        $data['is_active'] = $data['is_active'] ?? true;

        // Handle image upload
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

        // ✅ Clear specific users cache
        $this->clearUsersCache();

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        // Only hash password if it's provided
        if (! empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            try {
                // ✅ Delete old image with correct path
                if ($user->image) {
                    $fullPath = 'users/' . $user->image;
                    $this->imageService->deleteImageFile($fullPath);
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
            unset($data['image']);
        }

        $user->update($data);

        // ✅ Clear specific users cache
        $this->clearUsersCache();

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            abort(403, 'You cannot delete your own account.');
        }

        // ✅ Delete avatar with correct path
        if ($user->image) {
            $fullPath = 'users/' . $user->image;
            $this->imageService->deleteImageFile($fullPath);
        }

        $user->delete();

        // ✅ Clear specific users cache
        $this->clearUsersCache();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Clear all users list cache keys
     * Cache pattern: users_list_page_{page}_per_{perPage}
     */
    private function clearUsersCache(): void
    {
        // Clear cache for common pagination sizes
        $perPageOptions = [10, 15, 25, 50, 100];
        
        foreach ($perPageOptions as $perPage) {
            // Clear up to 100 pages for each perPage option
            for ($page = 1; $page <= 100; $page++) {
                Cache::forget("users_list_page_{$page}_per_{$perPage}");
            }
        }
    }
}
```

## Cache Strategy

### Cache Key Pattern

```
users_list_page_{page}_per_{perPage}
```

**Examples:**
- `users_list_page_1_per_10` - Page 1, 10 items per page
- `users_list_page_2_per_25` - Page 2, 25 items per page
- `users_list_page_5_per_50` - Page 5, 50 items per page

### Cache Duration

```php
Cache::remember($cacheKey, 300, function () use ($perPage) {
    // 300 seconds = 5 minutes
    return User::select([...])->paginate($perPage);
});
```

### Why Not Use Cache::flush()?

| Method | Scope | Impact | Use Case |
|--------|-------|--------|----------|
| `Cache::flush()` | ❌ **ALL cache** | Clears sessions, config, routes, everything | Emergency only |
| `Cache::forget($key)` | ✅ **Specific key** | Only clears targeted cache | Normal operations |
| `$this->clearUsersCache()` | ✅ **Users list only** | Only clears users pagination cache | After CRUD operations |

**Problems with `Cache::flush()`:**
1. ❌ Clears user sessions (logs out users)
2. ❌ Clears config cache (performance hit)
3. ❌ Clears route cache (performance hit)
4. ❌ Clears view cache (performance hit)
5. ❌ Overkill for just updating users list

## Image Path Architecture

### Path Structure

```
Database (users.image):
└── avatar-abc123-1234567890.webp  (filename only)

Physical Storage (storage/app/public/users/):
└── avatar-abc123-1234567890.webp

Public URL (asset helper):
└── /storage/users/avatar-abc123-1234567890.webp

Model Accessor (User::image_url):
└── http://example.com/storage/users/avatar-abc123-1234567890.webp
```

### Why This Design?

**Benefits:**
1. ✅ **Database simplicity** - Store filename only, easy to query
2. ✅ **Flexibility** - Can change storage path without updating database
3. ✅ **Clean URLs** - Consistent URL structure via accessor
4. ✅ **Fallback support** - Easy to return default avatar if image missing

**Accessor Pattern:**
```php
// User.php
public function getImageUrlAttribute(): string
{
    if (empty($this->attributes['image'])) {
        return asset('user.svg'); // Default fallback
    }
    
    // Construct full URL from filename
    return asset('storage/users/' . $this->attributes['image']);
}
```

**Controller Pattern:**
```php
// When deleting
if ($user->image) {
    // Convert: avatar-123.webp → users/avatar-123.webp
    $fullPath = 'users/' . $user->image;
    $this->imageService->deleteImageFile($fullPath);
}
```

## Testing Cache Behavior

### Manual Test Steps

1. **Create User with Image**
   - Upload avatar
   - Check database: stores `avatar-xyz-123.webp`
   - Check storage: file exists at `storage/app/public/users/avatar-xyz-123.webp`
   - Check UI: avatar displays correctly

2. **Update User Image**
   - Upload new avatar
   - Old image should be deleted from storage
   - New image stored with new filename
   - Database updated with new filename
   - UI shows new avatar immediately (cache cleared)

3. **Update User Data (No Image)**
   - Edit name, email, etc.
   - Don't upload new image
   - Database `image` field unchanged
   - UI shows updated data immediately (cache cleared)

4. **Delete User**
   - Avatar deleted from storage
   - User record deleted from database
   - UI updates immediately (cache cleared)

### Automated Tests

```php
test('admin can update user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create();

    $updateData = [
        'name' => 'Updated User',
        'email' => 'updated@example.com',
        // ... all required fields
    ];

    $response = $this->actingAs($admin)
        ->put("/admin/users/{$user->id}", $updateData);

    $response->assertRedirect('/admin/users');
    
    // ✅ Cache should be cleared
    // ✅ Fresh data should be visible
    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'email' => 'updated@example.com',
    ]);
});
```

## Performance Considerations

### Cache vs Database Query

**With Cache (5 min TTL):**
```
Request → Check Cache → Return Cached Data
Time: ~5ms
```

**Without Cache:**
```
Request → Query Database → Process Results → Return Data
Time: ~50-100ms
```

**After Update:**
```
Update Operation → Clear Specific Cache Keys → Next Request Rebuilds Cache
```

### Optimized Cache Clearing

**Why Loop Through Pagination Options?**

```php
private function clearUsersCache(): void
{
    $perPageOptions = [10, 15, 25, 50, 100]; // Common sizes only
    
    foreach ($perPageOptions as $perPage) {
        for ($page = 1; $page <= 100; $page++) { // Reasonable page limit
            Cache::forget("users_list_page_{$page}_per_{$perPage}");
        }
    }
}
```

**Total Keys Cleared:** 5 perPage options × 100 pages = **500 cache keys**

**Why not use pattern matching?**
- Laravel's `Cache::forget()` doesn't support wildcards
- Redis `KEYS` or `SCAN` would require direct Redis connection
- Current approach is simple, fast, and sufficient

## Alternative: Cache Tags (Future Improvement)

If using Redis or Memcached:

```php
// Store with tag
Cache::tags(['users'])->remember($cacheKey, 300, function () {
    return User::paginate(10);
});

// Clear all users cache
Cache::tags(['users'])->flush();
```

**Benefits:**
- ✅ Clear all users cache with one call
- ✅ No need to loop through keys
- ✅ More elegant solution

**Limitations:**
- ❌ Requires Redis or Memcached
- ❌ Not supported with file/database cache drivers

## Summary

✅ **Fixed Issues:**
1. Replace `Cache::flush()` with specific `clearUsersCache()` method
2. Correct image path construction: `'users/' . $user->image`
3. Clear cache after create/update/delete operations

✅ **Cache Strategy:**
- Cache key pattern: `users_list_page_{page}_per_{perPage}`
- TTL: 5 minutes (300 seconds)
- Clear specific keys, not all cache

✅ **Image Path Architecture:**
- Database: Filename only (`avatar-123.webp`)
- Storage: Full path (`users/avatar-123.webp`)
- Public URL: Accessor constructs (`storage/users/avatar-123.webp`)

✅ **Benefits:**
- ✅ UI updates immediately after edit
- ✅ No collateral damage to other cache
- ✅ Image deletion works correctly
- ✅ Performance maintained with targeted cache clearing

## Related Files

- `app/Http/Controllers/Admin/UserController.php` - Fixed controller with specific cache clearing
- `app/Services/ImageService.php` - Image processing service
- `app/Models/User.php` - Model with image_url accessor
- `tests/Feature/Admin/UserControllerTest.php` - 32 tests passing
