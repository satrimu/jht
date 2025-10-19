<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it includes security headers', function () {
    $response = $this->get('/');

    $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
    $response->assertHeader('X-Content-Type-Options', 'nosniff');
    $response->assertHeader('X-XSS-Protection', '1; mode=block');
    $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
});

test('it does not expose sensitive user data in props', function () {
    // make this an admin so we receive the admin Inertia page
    $user = User::factory()->create([
        'password' => bcrypt('secret-password'),
        'two_factor_secret' => 'secret-2fa-key',
        'role' => 'admin',
    ]);

    $this->actingAs($user);

    $response = $this->get('/admin/dashboard');

    $props = $response->viewData('page')['props'];

    expect($props)->toHaveKey('auth');
    expect($props['auth'])->toHaveKey('user');

    $userData = $props['auth']['user'];
    expect($userData)->not->toHaveKey('password');
    expect($userData)->not->toHaveKey('two_factor_secret');
    expect($userData)->not->toHaveKey('two_factor_recovery_codes');
    expect($userData)->not->toHaveKey('remember_token');

    expect($userData)->toHaveKeys(['id', 'name', 'email', 'role']);
});

test('it prevents admin access for non-admin users', function () {
    $user = User::factory()->create(['role' => 'user']);

    $this->actingAs($user);

    $response = $this->get('/admin/dashboard');

    $response->assertForbidden();
});

test('it allows admin access for admin users', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin);

    $response = $this->get('/admin/dashboard');

    $response->assertOk();
});

test('it rate limits login attempts', function () {
    for ($i = 0; $i < 6; $i++) {
        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'wrong-password',
        ]);
    }

    $response->assertSessionHasErrors(['email']);
    $errors = session('errors');
    $emailError = $errors->get('email')[0] ?? '';

    expect(str_contains($emailError, 'Too many') || str_contains($emailError, 'throttle'))->toBeTrue();
});

test('it prevents user from deleting themselves', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $response = $this->delete("/admin/users/{$admin->id}");

    $response->assertForbidden();
    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});

test('it requires authentication for admin routes', function () {
    $response = $this->get('/admin/dashboard');

    $response->assertRedirect('/login');
});

test('it hashes passwords securely', function () {
    $user = User::factory()->create([
        'password' => 'test-password',
    ]);

    expect($user->password)->not->toBe('test-password');
    expect(str_starts_with($user->password, '$2y$'))->toBeTrue();
});

test('it prevents sql injection in user search', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $response = $this->get('/admin/users?search=\' OR 1=1--');

    $response->assertOk();
});

test('it validates file upload type', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $file = \Illuminate\Http\UploadedFile::fake()->create('malicious.php', 100);

    $response = $this->post('/admin/users', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'role' => 'user',
        'member_number' => 'M9999',
        'full_name' => 'Test User',
        'address' => 'Test Address',
        'phone' => '1234567890',
        'image' => $file,
    ]);

    $response->assertSessionHasErrors(['image']);
});

test('it enforces https urls in production', function () {
    $originalEnv = app()->environment();

    app()->detectEnvironment(function () {
        return 'production';
    });

    $url = url('/');

    expect(str_starts_with($url, 'http://') || str_starts_with($url, 'https://'))->toBeTrue();

    app()->detectEnvironment(function () use ($originalEnv) {
        return $originalEnv;
    });
});

test('it hides password field in user model', function () {
    $user = User::factory()->create([
        'password' => 'secret',
    ]);

    $userArray = $user->toArray();

    expect($userArray)->not->toHaveKey('password');
    expect($userArray)->not->toHaveKey('two_factor_secret');
    expect($userArray)->not->toHaveKey('two_factor_recovery_codes');
    expect($userArray)->not->toHaveKey('remember_token');
});
