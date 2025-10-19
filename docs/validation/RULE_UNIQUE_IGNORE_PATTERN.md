# Rule::unique()->ignore() Pattern

**Last Updated**: 2025-10-18  
**Category**: Validation  
**Status**: Final

## Overview

Dokumentasi tentang penggunaan `Rule::unique()->ignore()` pattern untuk validation yang lebih clean dan type-safe dibanding string concatenation.

## Problem: String Concatenation (Old Way)

**Before (String Concatenation):**
```php
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function rules(): array
    {
        $userId = $this->route('user')->id;

        return [
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,'.$userId,
            'member_number' => 'nullable|string|max:255|unique:users,member_number,'.$userId,
        ];
    }
}
```

**Issues:**
- ❌ Hard to read (string concatenation with dots)
- ❌ Error-prone (easy to forget comma or column name)
- ❌ Less IDE support
- ❌ Less type-safe

## Solution: Rule::unique()->ignore() (Modern Way)

**After (Rule::unique()->ignore()):**
```php
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function rules(): array
    {
        $userId = $this->route('user')->id;

        return [
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'member_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('users', 'member_number')->ignore($userId),
            ],
        ];
    }
}
```

**Benefits:**
- ✅ More readable (explicit method calls)
- ✅ Type-safe (IDE autocomplete works)
- ✅ Easier to debug
- ✅ Follows Laravel best practices
- ✅ Chainable methods for complex rules

## Pattern Breakdown

### 1. Import Rule Class
```php
use Illuminate\Validation\Rule;
```

### 2. Convert String to Array
```php
// Before: String with pipe separator
'email' => 'sometimes|required|string|email|max:255|unique:users,email,'.$userId,

// After: Array with explicit rules
'email' => [
    'sometimes',
    'required',
    'string',
    'email',
    'max:255',
    Rule::unique('users', 'email')->ignore($userId),
],
```

### 3. Rule::unique() Syntax
```php
Rule::unique(
    table: 'users',           // Table name
    column: 'email'           // Column to check (optional, defaults to field name)
)->ignore(
    id: $userId               // ID to ignore (current record)
);
```

## Advanced Patterns

### Ignore with Different Column
```php
Rule::unique('users', 'email')
    ->ignore($user->id, 'user_id'); // Ignore where user_id = $user->id
```

### Ignore with Additional Where Clause
```php
Rule::unique('users', 'email')
    ->ignore($userId)
    ->where('account_id', $accountId); // Add WHERE condition
```

### Ignore Soft Deleted
```php
Rule::unique('users', 'email')
    ->ignore($userId)
    ->whereNull('deleted_at'); // Ignore soft-deleted records
```

## Real-World Example: UpdateUserRequest

**Complete Implementation:**
```php
<?php

namespace App\Http\Requests\Admin\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === 'admin';
    }

    public function rules(): array
    {
        $userId = $this->route('user')->id;

        return [
            'name' => 'sometimes|required|string|max:255',
            
            // Email: unique except current user
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'nullable|string|in:admin,user',
            
            // Member number: unique except current user
            'member_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('users', 'member_number')->ignore($userId),
            ],
            
            'full_name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'join_date' => 'nullable|date',
            'note' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'is_active' => 'boolean',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'Nama',
            'email' => 'Email',
            'member_number' => 'Nomor Anggota',
            'full_name' => 'Nama Lengkap',
            'address' => 'Alamat',
            'phone' => 'Telepon',
            'join_date' => 'Tanggal Bergabung',
            'note' => 'Catatan',
            'image' => 'Gambar',
            'is_active' => 'Status',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => ':attribute wajib diisi.',
            'email.required' => ':attribute wajib diisi.',
            'email.email' => ':attribute harus berupa alamat email yang valid.',
            'email.unique' => ':attribute sudah terdaftar.',
            'member_number.unique' => ':attribute sudah terdaftar.',
            'full_name.required' => ':attribute wajib diisi.',
            'address.required' => ':attribute wajib diisi.',
            'phone.required' => ':attribute wajib diisi.',
            'image.image' => ':attribute harus berupa gambar.',
            'image.mimes' => ':attribute harus berupa file dengan tipe: :values.',
            'image.max' => ':attribute tidak boleh lebih dari :max kilobyte.',
        ];
    }
}
```

## Testing

**Test unique validation works correctly:**
```php
it('user update validates email uniqueness excluding current user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user1 = User::factory()->create(['email' => 'user1@example.com']);
    $user2 = User::factory()->create(['email' => 'user2@example.com']);

    // Try to update user2 with user1's email - should fail
    $response = actingAs($admin)
        ->put(route('admin.users.update', $user2), [
            'email' => 'user1@example.com',
        ]);

    $response->assertSessionHasErrors('email');
});

it('user update allows same email for same user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create(['email' => 'user@example.com']);

    // Update user with their own email - should pass
    $response = actingAs($admin)
        ->put(route('admin.users.update', $user), [
            'email' => 'user@example.com',
            'name' => 'Updated Name',
        ]);

    $response->assertRedirect(route('admin.users.index'));
});
```

## When to Use

**Use `Rule::unique()->ignore()` when:**
- ✅ Update operations (need to ignore current record)
- ✅ Complex unique rules (with additional WHERE clauses)
- ✅ Multiple unique constraints on same field
- ✅ Need better IDE support and type safety

**Use string concatenation when:**
- ❌ Simple create operations (no ignore needed)
- ❌ Very simple rules without complexity
- ❌ Legacy codebase (maintain consistency)

## Related Files

- `app/Http/Requests/Admin/Users/UpdateUserRequest.php` - Implementation example
- `app/Http/Requests/Admin/Users/StoreUserRequest.php` - Create request (no ignore needed)
- `tests/Feature/Admin/UserControllerTest.php` - Test validation

## References

- Laravel Validation Docs: https://laravel.com/docs/11.x/validation#rule-unique
- Laravel Rule Class: https://laravel.com/api/11.x/Illuminate/Validation/Rule.html

## Summary

| Aspect | String Concatenation | Rule::unique()->ignore() |
|--------|---------------------|--------------------------|
| **Readability** | ❌ Hard to read | ✅ Very readable |
| **Type Safety** | ❌ String-based | ✅ Object-based |
| **IDE Support** | ❌ Limited | ✅ Full autocomplete |
| **Maintainability** | ❌ Error-prone | ✅ Easy to maintain |
| **Chaining** | ❌ Not possible | ✅ Chainable methods |
| **Laravel Standard** | ❌ Old style | ✅ Modern best practice |

**Recommendation**: Always use `Rule::unique()->ignore()` for update operations in new code.
