<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin can view users index', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->get('/admin/users');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('admin/users/Index')
        ->has('users')
    );
});

test('non-admin cannot view users index', function () {
    $user = User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($user)->get('/admin/users');

    $response->assertStatus(403);
});

test('admin can create user', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $userData = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'user',
        'member_number' => 'MEM001',
        'full_name' => 'Test User Full',
        'address' => '123 Test Street',
        'phone' => '+1234567890',
        'join_date' => '2024-01-01',
        'note' => 'Test note',
        'is_active' => true,
    ];

    $response = $this->actingAs($admin)->post('/admin/users', $userData);

    $response->assertRedirect('/admin/users');
    $response->assertSessionHas('success', 'User created successfully.');
    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'role' => 'user',
        'member_number' => 'MEM001',
        'is_active' => true,
    ]);
});

test('user is auto-approved when created', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $userData = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'user',
        'member_number' => 'MEM001',
        'full_name' => 'Test User Full',
        'address' => '123 Test Street',
        'phone' => '+1234567890',
    ];

    $this->actingAs($admin)->post('/admin/users', $userData);

    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'is_active' => true,
    ]);
});

test('admin can update user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create([
        'role' => 'user',
        'member_number' => 'OLD001',
    ]);

    $updateData = [
        'name' => 'Updated User',
        'email' => 'updated@example.com',
        'role' => 'admin',
        'member_number' => 'NEW001',
        'full_name' => 'Updated Full Name',
        'address' => 'Updated Address',
        'phone' => '081234567890',
        'join_date' => '2024-01-01',
        'is_active' => false,
    ];

    $response = $this->actingAs($admin)->put("/admin/users/{$user->id}", $updateData);

    $response->assertRedirect('/admin/users');
    $response->assertSessionHas('success', 'User updated successfully.');
    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'email' => 'updated@example.com',
        'role' => 'admin',
        'member_number' => 'NEW001',
        'is_active' => 0,
    ]);
});

test('admin can delete user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create();

    $response = $this->actingAs($admin)->delete("/admin/users/{$user->id}");

    $response->assertRedirect('/admin/users');
    $response->assertSessionHas('success', 'User deleted successfully.');
    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

test('validation fails for duplicate email', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $existingUser = User::factory()->create(['email' => 'existing@example.com']);

    $userData = [
        'name' => 'Test User',
        'email' => 'existing@example.com', // Duplicate email
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'user',
        'member_number' => 'MEM001',
        'full_name' => 'Test User Full',
        'address' => '123 Test Street',
        'phone' => '+1234567890',
    ];

    $response = $this->actingAs($admin)->post('/admin/users', $userData);

    $response->assertSessionHasErrors('email');
});

test('validation fails for duplicate member number', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $existingUser = User::factory()->create(['member_number' => 'MEM001']);

    $userData = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'user',
        'member_number' => 'MEM001', // Duplicate member number
        'full_name' => 'Test User Full',
        'address' => '123 Test Street',
        'phone' => '+1234567890',
    ];

    $response = $this->actingAs($admin)->post('/admin/users', $userData);

    $response->assertSessionHasErrors('member_number');
});

test('flash messages are shared to inertia props', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)
        ->withSession(['success' => 'Test success message'])
        ->get('/admin/users');

    $response->assertInertia(fn ($page) => $page
        ->where('flash.success', 'Test success message')
    );
});

test('admin can update user with partial data', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create([
        'name' => 'Original Name',
        'email' => 'original@example.com',
        'role' => 'user',
        'member_number' => 'MEM001',
        'full_name' => 'Original Full Name',
        'address' => 'Original Address',
        'phone' => '081234567890',
        'join_date' => '2024-01-01',
    ]);

    $updateData = [
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
        'role' => 'user',
        'member_number' => 'MEM001',
        'full_name' => 'Original Full Name',
        'address' => 'Original Address',
        'phone' => '081234567890',
        'join_date' => '2024-01-01',
        'is_active' => true,
        // All fields are sent, but some values remain unchanged
    ];

    $response = $this->actingAs($admin)->put("/admin/users/{$user->id}", $updateData);

    $response->assertRedirect('/admin/users');
    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
        'role' => 'user', // Remains unchanged
    ]);
});

test('admin can update user password', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create([
        'password' => bcrypt('oldpassword'),
        'role' => 'user',
        'member_number' => 'MEM001',
        'full_name' => 'Test User',
        'address' => 'Test Address',
        'phone' => '081234567890',
        'join_date' => '2024-01-01',
    ]);

    $updateData = [
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        'member_number' => $user->member_number,
        'full_name' => $user->full_name,
        'address' => $user->address,
        'phone' => $user->phone,
        'join_date' => $user->join_date,
        'is_active' => true,
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ];

    $response = $this->actingAs($admin)->put("/admin/users/{$user->id}", $updateData);

    $response->assertRedirect('/admin/users');

    // Verify password was updated by attempting login
    $this->assertTrue(auth()->attempt([
        'email' => $user->email,
        'password' => 'newpassword123',
    ]));
});

test('password confirmation validation fails', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create();

    $updateData = [
        'name' => $user->name,
        'email' => $user->email,
        'password' => 'newpassword123',
        'password_confirmation' => 'differentpassword', // Mismatch
    ];

    $response = $this->actingAs($admin)->put("/admin/users/{$user->id}", $updateData);

    $response->assertSessionHasErrors('password');
});

test('admin cannot update non-existent user', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $updateData = [
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
    ];

    $response = $this->actingAs($admin)->put('/admin/users/99999', $updateData);

    $response->assertStatus(404);
});

test('admin cannot delete themselves', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->delete("/admin/users/{$admin->id}");

    $response->assertStatus(403);
    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});

test('admin cannot delete non-existent user', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->delete('/admin/users/99999');

    $response->assertStatus(404);
});

test('user creation requires required fields', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $userData = [
        // Missing required fields: name, email, password, password_confirmation, role, member_number, full_name, address, phone
    ];

    $response = $this->actingAs($admin)->post('/admin/users', $userData);

    $response->assertSessionHasErrors(['name', 'email', 'password', 'role', 'member_number', 'full_name', 'address', 'phone']);
});

test('user creation validates email format', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $userData = [
        'name' => 'Test User',
        'email' => 'invalid-email-format',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'user',
        'member_number' => 'MEM001',
        'full_name' => 'Test User Full',
        'address' => '123 Test Street',
        'phone' => '+1234567890',
    ];

    $response = $this->actingAs($admin)->post('/admin/users', $userData);

    $response->assertSessionHasErrors('email');
});

test('user creation validates role values', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $userData = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'invalid-role', // Invalid role
        'member_number' => 'MEM001',
        'full_name' => 'Test User Full',
        'address' => '123 Test Street',
        'phone' => '+1234567890',
    ];

    $response = $this->actingAs($admin)->post('/admin/users', $userData);

    $response->assertSessionHasErrors('role');
});

test('user update validates email uniqueness excluding current user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user1 = User::factory()->create([
        'email' => 'user1@example.com',
        'role' => 'user',
        'member_number' => 'MEM001',
        'full_name' => 'User One',
        'address' => 'Address 1',
        'phone' => '081234567890',
        'join_date' => '2024-01-01',
    ]);
    $user2 = User::factory()->create(['email' => 'user2@example.com']);

    // Update user1 with user2's email should fail
    $updateData = [
        'name' => $user1->name,
        'email' => 'user2@example.com', // Duplicate with user2
        'role' => $user1->role,
        'member_number' => $user1->member_number,
        'full_name' => $user1->full_name,
        'address' => $user1->address,
        'phone' => $user1->phone,
        'join_date' => $user1->join_date,
        'is_active' => true,
    ];

    $response = $this->actingAs($admin)->put("/admin/users/{$user1->id}", $updateData);

    $response->assertSessionHasErrors('email');
});

test('user update allows same email for same user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create([
        'email' => 'user@example.com',
        'role' => 'user',
        'member_number' => 'MEM001',
        'full_name' => 'Test User',
        'address' => 'Test Address',
        'phone' => '081234567890',
        'join_date' => '2024-01-01',
    ]);

    // Update user with their own email should succeed
    $updateData = [
        'name' => 'Updated Name',
        'email' => 'user@example.com', // Same email
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
        'name' => 'Updated Name',
        'email' => 'user@example.com',
    ]);
});

test('users index paginates results', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    // Create more users than the default pagination limit
    User::factory()->count(20)->create();

    $response = $this->actingAs($admin)->get('/admin/users');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('admin/users/Index')
        ->has('users.data')
        ->has('users.current_page')
        ->has('users.last_page')
        ->has('users.per_page')
        ->has('users.total')
    );
});

test('users index shows correct pagination data', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    User::factory()->count(5)->create();

    $response = $this->actingAs($admin)->get('/admin/users?page=1&per_page=3');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('admin/users/Index')
        ->where('users.per_page', 3)
        ->where('users.current_page', 1)
        ->has('users.data', 3) // Should have 3 items on first page
    );
});

test('user creation validates member_number is required', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $userData = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'user',
        // Missing member_number
        'full_name' => 'Test User Full',
        'address' => '123 Test Street',
        'phone' => '+1234567890',
    ];

    $response = $this->actingAs($admin)->post('/admin/users', $userData);

    $response->assertSessionHasErrors('member_number');
});

test('user creation validates full_name is required', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $userData = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'user',
        'member_number' => 'MEM001',
        // Missing full_name
        'address' => '123 Test Street',
        'phone' => '+1234567890',
    ];

    $response = $this->actingAs($admin)->post('/admin/users', $userData);

    $response->assertSessionHasErrors('full_name');
});

test('user creation validates address is required', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $userData = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'user',
        'member_number' => 'MEM001',
        'full_name' => 'Test User Full',
        // Missing address
        'phone' => '+1234567890',
    ];

    $response = $this->actingAs($admin)->post('/admin/users', $userData);

    $response->assertSessionHasErrors('address');
});

test('user creation validates phone is required', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $userData = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'user',
        'member_number' => 'MEM001',
        'full_name' => 'Test User Full',
        'address' => '123 Test Street',
        // Missing phone
    ];

    $response = $this->actingAs($admin)->post('/admin/users', $userData);

    $response->assertSessionHasErrors('phone');
});

test('user update allows nullable fields', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create([
        'role' => 'user',
        'member_number' => 'MEM001',
        'full_name' => 'Test User',
        'address' => 'Test Address',
        'phone' => '081234567890',
        'join_date' => '2024-01-01',
    ]);

    // Update with all required fields, note is nullable
    $updateData = [
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
        'role' => 'user',
        'member_number' => 'MEM001',
        'full_name' => 'Test User',
        'address' => 'Test Address',
        'phone' => '081234567890',
        'join_date' => '2024-01-01',
        'is_active' => true,
        // Note is nullable - not sending it
    ];

    $response = $this->actingAs($admin)->put("/admin/users/{$user->id}", $updateData);

    $response->assertRedirect('/admin/users');
    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
    ]);
});

test('user update validates member_number uniqueness', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user1 = User::factory()->create([
        'member_number' => 'MEM001',
        'role' => 'user',
        'full_name' => 'User One',
        'address' => 'Address 1',
        'phone' => '081234567890',
        'join_date' => '2024-01-01',
    ]);
    $user2 = User::factory()->create(['member_number' => 'MEM002']);

    // Try to update user1 with user2's member_number
    $updateData = [
        'name' => $user1->name,
        'email' => $user1->email,
        'role' => $user1->role,
        'member_number' => 'MEM002', // Duplicate with user2
        'full_name' => $user1->full_name,
        'address' => $user1->address,
        'phone' => $user1->phone,
        'join_date' => $user1->join_date,
        'is_active' => true,
    ];

    $response = $this->actingAs($admin)->put("/admin/users/{$user1->id}", $updateData);

    $response->assertSessionHasErrors('member_number');
});

test('user update allows same member_number for same user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create([
        'member_number' => 'MEM001',
        'role' => 'user',
        'full_name' => 'Test User',
        'address' => 'Test Address',
        'phone' => '081234567890',
        'join_date' => '2024-01-01',
    ]);

    // Update user with their own member_number
    $updateData = [
        'name' => 'Updated Name',
        'email' => $user->email,
        'role' => $user->role,
        'member_number' => 'MEM001', // Same member_number
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
        'member_number' => 'MEM001',
    ]);
});

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
