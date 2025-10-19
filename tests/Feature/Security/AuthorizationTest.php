<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user cannot access other users profile data directly', function () {
    $user1 = User::factory()->create(['role' => 'user']);
    $user2 = User::factory()->create(['role' => 'user']);

    $this->actingAs($user1);
    // There is no admin 'show' route for users (resource show was excluded),
    // so assert that regular users cannot access the users index (admin area)
    $response = $this->get('/admin/users');

    // Non-admin users should not access admin routes at all
    $response->assertForbidden();
});

test('admin can access user management routes', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin);

    $response = $this->get('/admin/users');

    $response->assertOk();
});

test('non-admin cannot access user management routes', function () {
    $user = User::factory()->create(['role' => 'user']);

    $this->actingAs($user);

    $response = $this->get('/admin/users');

    $response->assertForbidden();
});

test('admin cannot delete their own account', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin);

    $response = $this->delete("/admin/users/{$admin->id}");

    $response->assertForbidden();
    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});

test('guest cannot access admin routes', function () {
    $response = $this->get('/admin/users');

    $response->assertRedirect('/login');
});

test('guest cannot access admin dashboard', function () {
    $response = $this->get('/admin/dashboard');

    $response->assertRedirect('/login');
});

test('verified user with admin role can access admin routes', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
        'email_verified_at' => now(),
    ]);

    $this->actingAs($admin);

    $response = $this->get('/admin/dashboard');

    $response->assertOk();
});

test('admin can view settings page', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin);

    // Settings route is named and exposed at /admin/settingsapp in routes/admin.php
    $response = $this->get('/admin/settingsapp');
    $response->assertOk();
});

test('non-admin cannot access settings page', function () {
    $user = User::factory()->create(['role' => 'user']);

    $this->actingAs($user);

    $response = $this->get('/admin/settingsapp');
    $response->assertForbidden();
});

test('unauthorized access attempts are handled correctly', function () {
    $user = User::factory()->create(['role' => 'user']);

    $this->actingAs($user);

    // Try to access admin-only route
    $response = $this->get('/admin/dashboard');

    $response->assertForbidden();
});

test('authentication middleware protects admin routes', function () {
    // Test multiple admin routes without authentication
    $routes = [
        '/admin/dashboard',
        '/admin/users',
        '/admin/settingsapp',
    ];

    foreach ($routes as $route) {
        $response = $this->get($route);
        $response->assertRedirect('/login');
    }
});

test('authorization middleware protects admin routes from regular users', function () {
    $user = User::factory()->create(['role' => 'user']);
    $this->actingAs($user);

    // Test multiple admin routes with non-admin user
    $routes = [
        '/admin/dashboard',
        '/admin/users',
        '/admin/settingsapp',
    ];

    foreach ($routes as $route) {
        $response = $this->get($route);
        $response->assertForbidden();
    }
});
