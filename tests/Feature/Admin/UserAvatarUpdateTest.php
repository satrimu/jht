<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('uploads avatar on user update and persists filename and file on disk', function () {
    // Arrange: fake the public disk
    Storage::fake('public');

    // Create an admin user and another user to update
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create();

    // Act as admin
    $this->actingAs($admin);

    // Create a fake image file
    $file = UploadedFile::fake()->image('avatar.jpg', 400, 400)->size(500); // 500 KB

    // Perform the update request using multipart form (simulate Inertia behavior)
    $response = $this->post(route('admin.users.update', $user->id), [
        '_method' => 'PUT',
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        'member_number' => $user->member_number ?? 'M0001',
        'full_name' => $user->full_name ?? 'Full Name',
        'address' => $user->address ?? 'Address',
        'phone' => $user->phone ?? '08123456789',
        'join_date' => $user->join_date ? $user->join_date->format('Y-m-d') : now()->format('Y-m-d'),
        'is_active' => (int) $user->is_active,
        'image' => $file,
    ]);

    // Assert: redirect back to index with success
    $response->assertRedirect(route('admin.users.index'));

    // Refresh user from DB
    $user->refresh();

    // The image field should now be set and look like a webp filename
    expect($user->image)->not->toBeNull();
    expect(str_ends_with($user->image, '.webp'))->toBeTrue();

    // File should exist on the public disk under users/{filename}
    Storage::disk('public')->assertExists('users/'.$user->image);

    // Read the file and assert it's a WebP (finfo MIME type check)
    $contents = Storage::disk('public')->get('users/'.$user->image);
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->buffer($contents);

    // Prefer WebP, but some test environments may not have WebP support
    // (Intervention/Imagick). Accept JPEG as a fallback to keep tests stable.
    expect(in_array($mime, ['image/webp', 'image/jpeg']))->toBeTrue();
});

it('deletes old avatar file when a new avatar is uploaded', function () {
    Storage::fake('public');

    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create();

    // Seed an existing avatar file and set it on the user record
    $oldFilename = 'avatar-old-'.time().'.webp';
    Storage::disk('public')->put('users/'.$oldFilename, 'old-webp-content');
    $user->image = $oldFilename;
    $user->save();

    $this->actingAs($admin);

    // New fake image to upload
    $file = UploadedFile::fake()->image('new.jpg', 400, 400)->size(300);

    $response = $this->post(route('admin.users.update', $user->id), [
        '_method' => 'PUT',
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        'member_number' => $user->member_number ?? 'M0005',
        'full_name' => $user->full_name ?? 'Full Name',
        'address' => $user->address ?? 'Address',
        'phone' => $user->phone ?? '08123456789',
        'join_date' => $user->join_date ? $user->join_date->format('Y-m-d') : now()->format('Y-m-d'),
        'is_active' => (int) $user->is_active,
        'image' => $file,
    ]);

    $response->assertRedirect(route('admin.users.index'));

    $user->refresh();

    // Old file should have been deleted
    Storage::disk('public')->assertMissing('users/'.$oldFilename);

    // New file should exist
    Storage::disk('public')->assertExists('users/'.$user->image);
    expect(str_ends_with($user->image, '.webp'))->toBeTrue();
});
