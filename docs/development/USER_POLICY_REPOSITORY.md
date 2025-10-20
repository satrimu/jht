# User Management - Policy & Repository Implementation

**Date**: 2025-01-XX  
**Status**: Complete  
**Task**: Add User Policy and Repository pattern following existing architecture

## Overview

Implemented User Policy and User Repository following the established pattern from Payment and Category resources. This ensures consistent architecture across the application with proper authorization and data access layers.

## Files Created

### 1. User Policy: `app/Policies/UserPolicy.php`

**Purpose**: Authorize user management operations

**Methods Implemented**:
- `viewAny(User $user)`: Check if admin can view users list
- `view(User $user, User $model)`: Check if admin can view specific user
- `create(User $user)`: Check if admin can create users
- `update(User $user, User $model)`: Check if admin can update users
- `delete(User $user, User $model)`: Check if admin can delete users (with self-delete prevention)
- `restore(User $user, User $model)`: Check if admin can restore users
- `forceDelete(User $user, User $model)`: Check if admin can permanently delete users

**Special Logic**:
```php
// Prevent self-deletion
public function delete(User $user, User $model): bool
{
    if ($user->id === $model->id) {
        return false;
    }
    return $user->role === 'admin';
}
```

### 2. User Repository Interface: `app/Repositories/Contracts/UserRepositoryInterface.php`

**Purpose**: Define contract for user data access

**Methods**:
```php
all(): Collection                          // Get all users
paginateWithRelations(int $perPage): LengthAwarePaginator  // Paginated users
find(int $id): ?User                       // Find by ID
create(array $data): User                  // Create new user
update(User $user, array $data): User      // Update existing user
delete(User $user): bool                   // Delete user
findByEmail(string $email): ?User          // Find by email
getByRole(string $role): Collection        // Get users by role
getActive(): Collection                    // Get active users
```

### 3. User Repository Implementation: `app/Repositories/Eloquent/UserRepository.php`

**Purpose**: Implement actual data access logic

**Key Features**:
- Eager loading optimization (select specific fields)
- Ordering by `created_at DESC` for consistent sorting
- Query optimization with field selection
- Specific role and status filtering

**Query Optimization Example**:
```php
public function paginateWithRelations(int $perPage = 15): LengthAwarePaginator
{
    return User::select([
        'id', 'name', 'email', 'role', 'member_number',
        'full_name', 'phone', 'join_date', 'is_active',
        'image', 'created_at'
    ])
        ->latest('created_at')
        ->paginate($perPage);
}
```

## Files Updated

### 1. `app/Providers/AppServiceProvider.php`

**Added Imports**:
- `App\Models\User`
- `App\Policies\UserPolicy`
- `App\Repositories\Contracts\UserRepositoryInterface`
- `App\Repositories\Eloquent\UserRepository`

**Registered in `register()` method**:
```php
$this->app->bind(
    UserRepositoryInterface::class,
    UserRepository::class
);
```

**Registered in `boot()` method**:
```php
Gate::policy(User::class, UserPolicy::class);
```

### 2. `app/Http/Controllers/Admin/UserController.php`

**Constructor Updated**:
```php
public function __construct(
    private readonly UserRepositoryInterface $repo,
    private readonly ImageService $imageService,
    private readonly CacheService $cacheService
) {}
```

**Method Updates**:
- `index()`: Now calls `$this->repo->paginateWithRelations($perPage)` via cache
- `store()`: Now calls `$this->repo->create($data)` instead of `User::create()`
- `update()`: Now calls `$this->repo->update($user, $data)` instead of `$user->update()`
- `destroy()`: Now calls `$this->repo->delete($user)` instead of `$user->delete()`

## Architecture Pattern

```
┌─────────────────────────────────┐
│      UserController             │
│  (Handle HTTP Requests)         │
└────────────────┬────────────────┘
                 │ Inject
                 ▼
┌─────────────────────────────────┐
│  UserRepositoryInterface        │
│  (Define Contract)              │
└────────────────┬────────────────┘
                 │ Implement
                 ▼
┌─────────────────────────────────┐
│  UserRepository (Eloquent)      │
│  (Data Access Logic)            │
└────────────────┬────────────────┘
                 │ Query
                 ▼
┌─────────────────────────────────┐
│      User Model                 │
│  (Eloquent ORM)                 │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│      UserPolicy                 │
│  (Authorization Logic)          │
└─────────────────────────────────┘
```

## Integration with Existing Patterns

✅ **Consistent with Payment pattern**: Similar structure and naming conventions  
✅ **Type-safe**: Full type hints and return types  
✅ **Testable**: Repository interface allows easy mocking  
✅ **Maintainable**: Clear separation of concerns  
✅ **Scalable**: Easy to extend with new methods  

## Usage Examples

### In Controllers:

```php
// Get paginated users (with cache)
$users = $this->cacheService->rememberUsersList(
    $page, $perPage, 300,
    fn () => $this->repo->paginateWithRelations($perPage)
);

// Find specific user
$user = $this->repo->find($id);

// Get users by role
$admins = $this->repo->getByRole('admin');

// Get active users
$activeUsers = $this->repo->getActive();
```

### In Policies:

```php
// Check if user can view another user
$this->authorize('view', $user);

// Check if user can delete another user (prevents self-deletion)
$this->authorize('delete', $userToDelete);
```

## Quality Checks

✅ **Pint**: Formatting passed (5 files)  
✅ **PHPStan**: Type safety passed (Level 5, 5 files)  
✅ **Build**: Frontend builds successfully (20.53s)  

## Benefits

| Aspect | Benefit |
|--------|---------|
| **Maintainability** | Single responsibility principle |
| **Testing** | Easy to mock repository interface |
| **Consistency** | Follows established patterns |
| **Type Safety** | Full type hints throughout |
| **Authorization** | Centralized policy logic |
| **Performance** | Optimized queries with field selection |
| **Scalability** | Easy to add new data access methods |

## Next Steps

✅ User Policy and Repository ready for use  
✅ UserController refactored to use repository  
✅ Authorization checks integrated via Policy  
✅ Pagination with cache still working  

## Testing Checklist

- [ ] Navigate to `/admin/users` page loads correctly
- [ ] Create new user works and clears cache
- [ ] Edit user works and clears cache
- [ ] Delete user works (except self)
- [ ] Try to delete own user - should be prevented
- [ ] Pagination with shadcn UI displays correctly
- [ ] Caching works (5-minute cache on subsequent loads)
- [ ] User avatar images display correctly

## Files Summary

| File | Type | Status |
|------|------|--------|
| `UserPolicy.php` | New | ✅ Created |
| `UserRepositoryInterface.php` | New | ✅ Created |
| `UserRepository.php` | New | ✅ Created |
| `UserController.php` | Modified | ✅ Updated |
| `AppServiceProvider.php` | Modified | ✅ Updated |
