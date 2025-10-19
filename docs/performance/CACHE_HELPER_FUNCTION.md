# Cache Helper Function - Global Access to CacheService

**Last Updated**: 2025-10-18  
**Category**: Performance & Cache  
**Status**: Final

## Overview

The `cache_service()` helper function provides convenient global access to the centralized `CacheService` instance throughout the application. This helper simplifies cache operations and makes the code more Laravel-idiomatic.

## Purpose

- **Convenient Access**: Use cache operations without dependency injection in every class
- **Cleaner Code**: Shorter, more readable syntax for one-off cache operations
- **Consistent API**: Same functionality as injecting CacheService directly
- **Laravel Conventions**: Follows Laravel's pattern of global helper functions

## Location

- **Helper File**: `app/helpers.php`
- **Autoloaded**: Via `composer.json` autoload files configuration
- **Service Class**: `App\Services\CacheService`

## Usage

### Basic Usage

```php
// Get users list with caching
$users = cache_service()->rememberUsersList($page, $perPage, 300, function() {
    return User::select(['id', 'name', 'email'])->paginate($perPage);
});

// Clear users list cache after mutations
cache_service()->clearUsersList();

// Check if cache driver supports tags
if (cache_service()->supportsTags()) {
    // Use tag-based operations
}

// Get cache key for specific page
$key = cache_service()->usersListKey(1, 15); // returns: 'users_list_page_1_per_15'
```

### In Controllers

**Example: Using in UserController**

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 10);
        $page = (int) $request->get('page', 1);

        // Use cache_service() helper for convenient access
        $users = cache_service()->rememberUsersList($page, $perPage, 300, function () use ($perPage) {
            return User::select(['id', 'name', 'email', 'role'])
                ->latest('created_at')
                ->paginate($perPage);
        });

        return Inertia::render('admin/users/Index', [
            'users' => $users,
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        User::create($data);

        // Clear cache after creating new user
        cache_service()->clearUsersList();

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }
}
```

### In Services

```php
<?php

namespace App\Services;

class ReportService
{
    public function getUserStatistics(): array
    {
        // Check cache capabilities
        if (cache_service()->supportsTags()) {
            // Use tag-aware caching if available
            $stats = Cache::tags(['users', 'stats'])->remember('user_stats', 3600, function() {
                return $this->calculateStats();
            });
        } else {
            // Fallback to regular caching
            $stats = Cache::remember('user_stats', 3600, function() {
                return $this->calculateStats();
            });
        }

        return $stats;
    }
}
```

### In Routes/Closures

```php
Route::get('/api/users/cached', function() {
    return cache_service()->rememberUsersList(1, 10, 300, function() {
        return User::select(['id', 'name'])->limit(10)->get();
    });
});
```

## When to Use Helper vs Dependency Injection

### Use Helper Function (`cache_service()`) When:

✅ Making one-off cache operations  
✅ In routes or closures  
✅ Quick access without heavy setup  
✅ Following Laravel's convention  
✅ Code readability is priority

**Example:**
```php
public function quickAction()
{
    cache_service()->clearUsersList();
    // Simple, readable, no DI needed
}
```

### Use Dependency Injection When:

✅ Class uses CacheService in multiple methods  
✅ Better testability with mocking needed  
✅ Following strict SOLID principles  
✅ Constructor injection is already used  
✅ Type hinting benefits are important

**Example:**
```php
class UserService
{
    public function __construct(private readonly CacheService $cacheService) {}

    public function createUser($data)
    {
        User::create($data);
        $this->cacheService->clearUsersList();
    }

    public function updateUser($id, $data)
    {
        User::find($id)->update($data);
        $this->cacheService->clearUsersList();
    }
    
    // Multiple methods use cacheService - DI is better here
}
```

## Available Methods

The helper provides access to all `CacheService` methods:

| Method | Description | Return Type |
|--------|-------------|-------------|
| `supportsTags()` | Check if cache driver supports tags | `bool` |
| `usersListKey($page, $perPage)` | Generate cache key for users list | `string` |
| `rememberUsersList($page, $perPage, $ttl, $callback)` | Remember users list with caching | `mixed` |
| `clearUsersList()` | Clear all users list cache entries | `void` |

## Implementation Details

### Helper Function Definition

```php
<?php
// app/helpers.php

use App\Services\CacheService;

if (! function_exists('cache_service')) {
    /**
     * Get the CacheService instance for convenient cache operations.
     *
     * @return \App\Services\CacheService
     */
    function cache_service(): CacheService
    {
        return app(CacheService::class);
    }
}
```

### Autoload Configuration

```json
// composer.json
{
    "autoload": {
        "psr-4": {
            "App\\": "app/"
        },
        "files": [
            "app/helpers.php"
        ]
    }
}
```

After adding or modifying helpers, run:
```bash
composer dump-autoload
```

## Testing

Tests for the cache helper are located at `tests/Unit/CacheHelperTest.php`:

```php
<?php

use App\Services\CacheService;

test('cache_service helper returns CacheService instance', function () {
    $cacheService = cache_service();
    expect($cacheService)->toBeInstanceOf(CacheService::class);
});

test('cache_service helper returns the same instance on multiple calls', function () {
    $instance1 = cache_service();
    $instance2 = cache_service();
    expect($instance1)->toBe($instance2);
});

test('cache_service can generate users list key', function () {
    $key = cache_service()->usersListKey(1, 15);
    expect($key)->toBe('users_list_page_1_per_15');
});
```

Run tests:
```bash
php artisan test --filter=CacheHelperTest
```

## Benefits

### 1. **Reduced Boilerplate**
No need to inject CacheService in every controller for simple operations.

### 2. **Laravel Conventions**
Follows Laravel's pattern of global helpers like `auth()`, `cache()`, `config()`.

### 3. **Backward Compatible**
Existing code using dependency injection continues to work unchanged.

### 4. **Consistent API**
Same methods and behavior as directly using CacheService.

### 5. **Easy Migration**
Simple to switch between helper and DI based on needs:

```php
// Using helper
cache_service()->clearUsersList();

// Using DI (same result)
$this->cacheService->clearUsersList();
```

## Best Practices

1. **Use Helper for Simple Operations**: Quick cache clear/remember operations
2. **Use DI for Complex Logic**: When CacheService is used extensively
3. **Don't Mix Both**: In same class, prefer one approach (usually DI)
4. **Document Usage**: Add comments when helper usage might not be obvious
5. **Test Both Paths**: Test code using both helper and DI approaches

## Related Documentation

- [Cache Management - User List](./CACHE_MANAGEMENT_USER_LIST.md)
- [User CRUD Performance Optimization](./USER_CRUD_PERFORMANCE_OPTIMIZATION.md)
- [CacheService Class](../../app/Services/CacheService.php)

## Copilot Instructions

When writing code that needs cache operations:

1. For **one-off operations**, use `cache_service()` helper
2. For **multiple operations** in same class, use dependency injection
3. Always clear cache after mutations (create/update/delete)
4. Follow existing patterns in `UserController` for consistency
5. Add tests for cache operations

Example instruction patterns:
```
"Add cache clearing using cache_service() helper"
"Inject CacheService for this service class"
"Use cache_service()->rememberUsersList() for caching"
```

---

**Note**: This helper was added to improve developer experience and code readability. It complements but does not replace dependency injection where appropriate.
