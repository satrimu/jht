<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

it('rejects oversized images when updating user avatar', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create();

    $this->actingAs($admin);

    // Create a large fake image (12 MB) exceeding 10MB limit
    $large = UploadedFile::fake()->image('big.jpg', 4000, 4000)->size(12 * 1024);

    $response = $this->post(route('admin.users.update', $user->id), [
        '_method' => 'PUT',
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        'member_number' => $user->member_number ?? 'M0002',
        'full_name' => $user->full_name ?? 'Full Name',
        'address' => $user->address ?? 'Address',
        'phone' => $user->phone ?? '08123456789',
        'join_date' => $user->join_date ? $user->join_date->format('Y-m-d') : now()->format('Y-m-d'),
        'is_active' => (int) $user->is_active,
        'image' => $large,
    ]);

    // Expect validation failure (redirect back with errors)
    $response->assertSessionHasErrors(['image']);

    // Ensure DB image field unchanged
    $user->refresh();
    expect($user->image)->toBeNull();
});

it('rejects non-image MIME type uploads', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create();

    $this->actingAs($admin);

    // Create a fake text file with .txt name but force mime not allowed
    $file = UploadedFile::fake()->create('not-image.txt', 100, 'text/plain');

    $response = $this->post(route('admin.users.update', $user->id), [
        '_method' => 'PUT',
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        'member_number' => $user->member_number ?? 'M0003',
        'full_name' => $user->full_name ?? 'Full Name',
        'address' => $user->address ?? 'Address',
        'phone' => $user->phone ?? '08123456789',
        'join_date' => $user->join_date ? $user->join_date->format('Y-m-d') : now()->format('Y-m-d'),
        'is_active' => (int) $user->is_active,
        'image' => $file,
    ]);

    $response->assertSessionHasErrors(['image']);

    $user->refresh();
    expect($user->image)->toBeNull();
});

it('rejects JSON submissions for image (should be multipart)', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create();

    $this->actingAs($admin);

    // Send JSON with a stub key 'image' (not a file)
    $response = $this->putJson(route('admin.users.update', $user->id), [
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        'member_number' => $user->member_number ?? 'M0004',
        'full_name' => $user->full_name ?? 'Full Name',
        'address' => $user->address ?? 'Address',
        'phone' => $user->phone ?? '08123456789',
        'join_date' => $user->join_date ? $user->join_date->format('Y-m-d') : now()->format('Y-m-d'),
        'is_active' => (int) $user->is_active,
        'image' => 'not-a-file',
    ]);

    // Sending JSON with a non-file 'image' should trigger validation failure
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['image']);

    $user->refresh();
    expect($user->image)->toBeNull();
});
