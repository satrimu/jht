# Username Unique Validation

**Last Updated**: 2025-10-18  
**Category**: Validation  
**Status**: Final

## Overview

Dokumentasi tentang unique validation untuk field `name` (username) di User Management. Username harus unique untuk mencegah konflik login credentials.

## Why Username Must Be Unique

1. **Login Credential**: Username digunakan untuk login, harus unique
2. **User Identification**: Setiap user harus memiliki identifier yang unik
3. **Data Integrity**: Mencegah duplikasi data user
4. **Security**: Avoid username collision yang bisa menyebabkan security issues

## Validation Rules

### StoreUserRequest (Create)

```php
public function rules(): array
{
    return [
        'name' => 'required|string|max:255|unique:users',
        'email' => 'required|string|email|max:255|unique:users',
        'member_number' => 'required|string|max:255|unique:users',
        // ... other fields
    ];
}

public function messages(): array
{
    return [
        'name.required' => ':attribute wajib diisi.',
        'name.unique' => ':attribute sudah terdaftar.',
        // ... other messages
    ];
}
```

### UpdateUserRequest (Edit)

```php
use Illuminate\Validation\Rule;

public function rules(): array
{
    $userId = $this->route('user')->id;

    return [
        'name' => [
            'required',
            'string',
            'max:255',
            Rule::unique('users', 'name')->ignore($userId),
        ],
        'email' => [
            'required',
            'string',
            'email',
            'max:255',
            Rule::unique('users', 'email')->ignore($userId),
        ],
        'member_number' => [
            'required',
            'string',
            'max:255',
            Rule::unique('users', 'member_number')->ignore($userId),
        ],
        // ... other fields
    ];
}

public function messages(): array
{
    return [
        'name.required' => ':attribute wajib diisi.',
        'name.unique' => ':attribute sudah terdaftar.',
        // ... other messages
    ];
}
```

## Unique Fields Summary

| Field | Unique? | Reason | Validation Pattern |
|-------|---------|--------|-------------------|
| `name` | ✅ Yes | Login credential | `unique:users` / `Rule::unique()->ignore()` |
| `email` | ✅ Yes | Login credential, contact | `unique:users` / `Rule::unique()->ignore()` |
| `member_number` | ✅ Yes | Member identifier | `unique:users` / `Rule::unique()->ignore()` |
| `full_name` | ❌ No | Display name, can be same | `required\|string\|max:255` |
| `phone` | ❌ No | Contact info, family might share | `required\|string\|max:20` |
| `address` | ❌ No | Multiple users can live at same address | `required\|string\|max:500` |

## Testing

### Test: Create User with Duplicate Name

```php
test('user creation validates name uniqueness', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $existingUser = User::factory()->create(['name' => 'johndoe']);

    $userData = [
        'name' => 'johndoe', // Duplicate name
        'email' => 'newemail@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'user',
        'member_number' => 'MEM999',
        'full_name' => 'John Doe',
        'address' => '123 Test Street',
        'phone' => '+1234567890',
    ];

    $response = $this->actingAs($admin)->post('/admin/users', $userData);

    $response->assertSessionHasErrors('name');
});
```

### Test: Update User with Duplicate Name

```php
test('user update validates name uniqueness excluding current user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user1 = User::factory()->create([
        'name' => 'user1name',
        'role' => 'user',
        'member_number' => 'MEM001',
        'full_name' => 'User One',
        'address' => 'Address 1',
        'phone' => '081234567890',
        'join_date' => '2024-01-01',
    ]);
    $user2 = User::factory()->create(['name' => 'user2name']);

    // Try to update user1 with user2's name
    $updateData = [
        'name' => 'user2name', // Duplicate with user2
        'email' => $user1->email,
        'role' => $user1->role,
        'member_number' => $user1->member_number,
        'full_name' => $user1->full_name,
        'address' => $user1->address,
        'phone' => $user1->phone,
        'join_date' => $user1->join_date,
        'is_active' => true,
    ];

    $response = $this->actingAs($admin)->put("/admin/users/{$user1->id}", $updateData);

    $response->assertSessionHasErrors('name');
});
```

### Test: Update User with Same Name (Should Pass)

```php
test('user update allows same name for same user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create([
        'name' => 'username123',
        'role' => 'user',
        'member_number' => 'MEM001',
        'full_name' => 'Test User',
        'address' => 'Test Address',
        'phone' => '081234567890',
        'join_date' => '2024-01-01',
    ]);

    // Update user with their own name (should succeed)
    $updateData = [
        'name' => 'username123', // Same name
        'email' => 'newemail@example.com',
        'role' => $user->role,
        'member_number' => $user->member_number,
        'full_name' => $user->full_name,
        'address' => $user->address,
        'phone' => $user->phone,
        'join_date' => $user->join_date,
        'is_active' => true,
    ];

    $response = $this->actingAs($admin)->put("/admin/users/{$user->id}", $updateData);

    $response->assertRedirect('/admin/users');
    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'username123',
        'email' => 'newemail@example.com',
    ]);
});
```

## Database Schema

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,        -- ✅ Unique constraint
    email VARCHAR(255) NOT NULL UNIQUE,       -- ✅ Unique constraint
    member_number VARCHAR(255) NOT NULL UNIQUE, -- ✅ Unique constraint
    full_name VARCHAR(255) NOT NULL,          -- ❌ No unique constraint
    phone VARCHAR(20) NOT NULL,               -- ❌ No unique constraint
    address VARCHAR(500) NOT NULL,            -- ❌ No unique constraint
    -- ... other fields
);

-- Indexes for performance
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_member_number ON users(member_number);
```

## Error Messages

### Frontend Display (Indonesian)

```tsx
// Error from backend validation
{errors.name && (
    <p className="text-sm text-red-500">
        {errors.name} {/* "Nama sudah terdaftar." */}
    </p>
)}
```

### Backend Messages

```php
public function messages(): array
{
    return [
        'name.required' => ':attribute wajib diisi.',
        'name.unique' => ':attribute sudah terdaftar.', // ✅ Custom message
        'email.required' => ':attribute wajib diisi.',
        'email.unique' => ':attribute sudah terdaftar.',
        'member_number.unique' => ':attribute sudah terdaftar.',
    ];
}

public function attributes(): array
{
    return [
        'name' => 'Nama', // ✅ Indonesian label
        'email' => 'Email',
        'member_number' => 'Nomor Anggota',
    ];
}
```

**Output Example:**
- `name.unique` → **"Nama sudah terdaftar."**
- `email.unique` → **"Email sudah terdaftar."**
- `member_number.unique` → **"Nomor Anggota sudah terdaftar."**

## Migration Example

```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique();           // ✅ Unique username
    $table->string('email')->unique();          // ✅ Unique email
    $table->string('member_number')->unique();  // ✅ Unique member number
    $table->string('full_name');                // ❌ Not unique (can duplicate)
    $table->string('phone', 20);                // ❌ Not unique
    $table->string('address', 500);             // ❌ Not unique
    $table->text('note')->nullable();
    $table->string('image')->nullable();
    $table->string('password');
    $table->string('role')->default('user');
    $table->boolean('is_active')->default(true);
    $table->timestamp('join_date')->nullable();
    $table->rememberToken();
    $table->timestamps();
});
```

## Frontend Validation (Optional - UX Improvement)

### Real-time Username Check

```tsx
const [usernameExists, setUsernameExists] = useState(false);

const checkUsernameAvailability = async (username: string) => {
    if (!username || username === user?.name) return; // Skip if empty or same
    
    try {
        const response = await axios.get(`/api/check-username?name=${username}`);
        setUsernameExists(response.data.exists);
    } catch (error) {
        console.error('Error checking username:', error);
    }
};

// In input
<Input
    id="name"
    value={data.name}
    onChange={(e) => {
        setData('name', e.target.value);
        debounce(() => checkUsernameAvailability(e.target.value), 500);
    }}
/>
{usernameExists && (
    <p className="text-sm text-amber-600">
        ⚠️ Username sudah digunakan
    </p>
)}
```

### Backend API Route (Optional)

```php
// routes/api.php
Route::get('/check-username', function (Request $request) {
    $exists = User::where('name', $request->name)
        ->when($request->user_id, fn($q) => $q->where('id', '!=', $request->user_id))
        ->exists();
    
    return response()->json(['exists' => $exists]);
});
```

## Related Files

- `app/Http/Requests/Admin/Users/StoreUserRequest.php` - Create validation
- `app/Http/Requests/Admin/Users/UpdateUserRequest.php` - Update validation with ignore
- `app/Models/User.php` - User model
- `tests/Feature/Admin/UserControllerTest.php` - Test coverage (32 tests)
- `database/migrations/0001_01_01_000000_create_users_table.php` - Schema with unique constraints

## Summary

✅ **Unique Fields:**
- `name` - Username for login
- `email` - Login credential & contact
- `member_number` - Member identifier

❌ **Non-Unique Fields:**
- `full_name` - Display name (can be same)
- `phone` - Contact (families can share)
- `address` - Location (multiple users at same address)

✅ **Validation Pattern:**
- **Create**: `'name' => 'required|string|max:255|unique:users'`
- **Update**: `'name' => Rule::unique('users', 'name')->ignore($userId)`

✅ **Test Coverage:**
- ✅ Create with duplicate name fails
- ✅ Update with duplicate name fails
- ✅ Update with same name succeeds
- ✅ 32/32 tests passing

✅ **Error Messages:**
- Indonesian: "Nama sudah terdaftar."
- Clear, user-friendly feedback
