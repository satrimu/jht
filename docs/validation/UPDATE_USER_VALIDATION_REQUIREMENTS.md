# Update User Validation Requirements

**Last Updated**: 2025-10-18  
**Category**: Validation  
**Status**: Final

## Overview

Dokumentasi tentang validation requirements untuk **UpdateUserRequest** - form edit user yang mengharuskan user mengisi semua field (kecuali `note` dan `image` yang nullable).

## Context

Karena ini adalah **EditUserModal** (form edit lengkap), user harus memasukkan semua parameter wajib. Hanya `note` dan `image` yang bersifat nullable.

## Validation Rules

### UpdateUserRequest.php

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
            // Required fields - must be sent
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'role' => 'required|string|in:admin,user',
            'member_number' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'member_number')->ignore($userId),
            ],
            'full_name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'phone' => 'required|string|max:20',
            'join_date' => 'required|date',
            'is_active' => 'required|boolean',
            
            // Optional fields - can be omitted
            'note' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB
            'password' => 'nullable|string|min:8|confirmed',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'Nama',
            'email' => 'Email',
            'password' => 'Password',
            'role' => 'Role',
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
            'password.min' => ':attribute harus terdiri dari minimal :min karakter.',
            'password.confirmed' => ':attribute konfirmasi tidak cocok.',
            'role.required' => ':attribute wajib diisi.',
            'role.in' => ':attribute yang dipilih tidak valid.',
            'member_number.unique' => ':attribute sudah terdaftar.',
            'member_number.required' => ':attribute wajib diisi.',
            'full_name.required' => ':attribute wajib diisi.',
            'address.required' => ':attribute wajib diisi.',
            'phone.required' => ':attribute wajib diisi.',
            'join_date.required' => ':attribute wajib diisi.',
            'join_date.date' => ':attribute harus berupa tanggal yang valid.',
            'note.max' => ':attribute tidak boleh lebih dari :max karakter.',
            'image.image' => ':attribute harus berupa gambar.',
            'image.mimes' => ':attribute harus berupa file dengan tipe: :values.',
            'image.max' => ':attribute tidak boleh lebih dari :max kilobyte.',
            'is_active.required' => ':attribute wajib diisi.',
            'is_active.boolean' => ':attribute harus bernilai true atau false.',
        ];
    }
}
```

## Required vs Nullable Fields

| Field | Rule | Reason |
|-------|------|--------|
| `name` | **required** | Username untuk login |
| `email` | **required** | Unique identifier, login credential |
| `role` | **required** | Authorization control (admin/user) |
| `member_number` | **required** | Unique member identifier |
| `full_name` | **required** | Display name lengkap |
| `address` | **required** | Contact information |
| `phone` | **required** | Contact information |
| `join_date` | **required** | Membership tracking |
| `is_active` | **required** | Account status (active/inactive) |
| `note` | **nullable** | Optional additional information ✅ |
| `image` | **nullable** | Optional avatar upload ✅ |
| `password` | **nullable** | Only required if changing password ✅ |

## Frontend Implementation (EditUserModal)

### EditUserModal.tsx - All Required Fields Must Be Sent

```tsx
const { data, setData, put, processing, errors, reset } = useForm({
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'user',
    member_number: user.member_number || '',
    full_name: user.full_name || '',
    address: user.address || '',
    phone: user.phone || '',
    join_date: user.join_date || '',
    is_active: user.is_active ?? true,
    note: user.note || '',           // Nullable
    image: null,                      // Nullable
    password: '',                     // Nullable
    password_confirmation: '',        // Nullable
});

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // All fields are sent to backend
    put(`/admin/users/${user.id}`, {
        onSuccess: () => {
            onClose();
            reset();
        },
    });
};
```

## Testing Pattern

### Complete Request Data

```php
test('admin can update user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create();

    $updateData = [
        // Required fields
        'name' => 'Updated User',
        'email' => 'updated@example.com',
        'role' => 'admin',
        'member_number' => 'NEW001',
        'full_name' => 'Updated Full Name',
        'address' => 'Updated Address',
        'phone' => '081234567890',
        'join_date' => '2024-01-01',
        'is_active' => false,
        
        // Optional fields (can be omitted)
        'note' => 'Some note',  // Can be omitted
        // 'image' => null,     // Can be omitted
        // 'password' => null,  // Can be omitted
    ];

    $response = $this->actingAs($admin)
        ->put("/admin/users/{$user->id}", $updateData);

    $response->assertRedirect('/admin/users');
});
```

### Validation Error Test

```php
test('user update requires all required fields', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create();

    $updateData = [
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
        // Missing required fields: role, member_number, etc.
    ];

    $response = $this->actingAs($admin)
        ->put("/admin/users/{$user->id}", $updateData);

    $response->assertSessionHasErrors([
        'role',
        'member_number',
        'full_name',
        'address',
        'phone',
        'join_date',
        'is_active',
    ]);
});
```

## Comparison: Create vs Update

### StoreUserRequest (Create)

```php
return [
    'name' => 'required|string|max:255',
    'email' => 'required|string|email|max:255|unique:users',
    'password' => 'required|string|min:8|confirmed',  // Required on create
    'role' => 'required|string|in:admin,user',
    'member_number' => 'required|string|max:255|unique:users',
    'full_name' => 'required|string|max:255',
    'address' => 'required|string|max:500',
    'phone' => 'required|string|max:20',
    'join_date' => 'nullable|date',              // Nullable on create
    'note' => 'nullable|string|max:1000',
    'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    'is_active' => 'nullable|boolean',           // Nullable on create
];
```

### UpdateUserRequest (Edit)

```php
return [
    'name' => 'required|string|max:255',
    'email' => [
        'required',
        'string',
        'email',
        'max:255',
        Rule::unique('users', 'email')->ignore($userId),  // Ignore current user
    ],
    'password' => 'nullable|string|min:8|confirmed',  // Nullable on update
    'role' => 'required|string|in:admin,user',
    'member_number' => [
        'required',
        'string',
        'max:255',
        Rule::unique('users', 'member_number')->ignore($userId),  // Ignore current
    ],
    'full_name' => 'required|string|max:255',
    'address' => 'required|string|max:500',
    'phone' => 'required|string|max:20',
    'join_date' => 'required|date',               // Required on update
    'note' => 'nullable|string|max:1000',
    'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
    'is_active' => 'required|boolean',            // Required on update
];
```

## Key Differences

| Field | Create (Store) | Update (Edit) | Reason |
|-------|----------------|---------------|--------|
| `password` | **required** | **nullable** | Only change if user wants to update |
| `join_date` | **nullable** | **required** | Set default on create, must show on edit |
| `is_active` | **nullable** | **required** | Default `true` on create, must specify on edit |
| `email` unique | `unique:users` | `Rule::unique()->ignore($userId)` | Ignore current user on update |
| `member_number` unique | `unique:users` | `Rule::unique()->ignore($userId)` | Ignore current user on update |

## Why All Required on Update?

1. **Complete Form Display**: EditUserModal shows all user data, so all fields should be submitted
2. **Data Integrity**: Prevents accidentally clearing required fields
3. **User Experience**: User sees complete profile and makes conscious decisions about changes
4. **Validation Feedback**: Clear error messages if required fields are missing

## Exception: Password Field

```php
'password' => 'nullable|string|min:8|confirmed',
```

Password is **nullable** on update because:
- User may not want to change password
- Sending empty password means "keep current password"
- Only validated if user enters new password

## Safe Update Pattern in Controller

```php
public function update(UpdateUserRequest $request, User $user)
{
    $data = $request->validated();

    // Handle password update
    if (!empty($data['password'])) {
        $data['password'] = bcrypt($data['password']);
    } else {
        unset($data['password']);  // Don't update if empty
    }

    // Handle image update
    if ($request->hasFile('image')) {
        // Delete old image if exists
        if ($user->image) {
            $this->imageService->deleteImageFile($user->image, 'users');
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
    } else {
        unset($data['image']);  // Don't update if no new image
    }

    $user->update($data);

    return redirect()->route('admin.users.index')
        ->with('success', 'User updated successfully.');
}
```

## Related Files

- `app/Http/Requests/Admin/Users/UpdateUserRequest.php` - Validation rules
- `app/Http/Requests/Admin/Users/StoreUserRequest.php` - Create validation (comparison)
- `app/Http/Controllers/Admin/UserController.php` - Controller implementation
- `resources/js/pages/admin/users/EditUserModal.tsx` - Frontend form
- `tests/Feature/Admin/UserControllerTest.php` - Test suite

## Summary

✅ **Required Fields on Update:**
- `name`, `email`, `role`, `member_number`
- `full_name`, `address`, `phone`, `join_date`
- `is_active`

✅ **Nullable Fields on Update:**
- `note` - Optional additional information
- `image` - Optional avatar upload
- `password` - Only if changing password

✅ **Unique Validation:**
- Use `Rule::unique()->ignore($userId)` to exclude current user from uniqueness check

✅ **Form Behavior:**
- EditUserModal sends all required fields
- Frontend pre-fills all fields with current values
- User can modify any field
- Backend validates all required fields are present
