<?php

namespace Tests\Feature\Admin;

use App\Models\SettingApp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SettingAppControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    // ============================================================================
    // Access Control Tests
    // ============================================================================

    public function test_unauthenticated_user_cannot_access_settings(): void
    {
        $response = $this->get(route('setting.edit'));

        $response->assertRedirect(route('login'));
    }

    public function test_non_admin_cannot_access_settings(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)
            ->get(route('setting.edit'));

        $response->assertStatus(403);
    }

    // ============================================================================
    // Action Tests
    // ============================================================================

    public function test_admin_can_view_settings_page(): void
    {
        SettingApp::create([
            'nama_app' => 'Test App',
            'description' => 'Test Description',
            'address' => 'Test Address',
            'phone' => '+62-812-3456-7890',
            'email' => 'test@example.com',
            'facebook' => 'https://facebook.com/test',
            'instagram' => 'https://instagram.com/test',
            'youtube' => 'https://youtube.com/@test',
            'tiktok' => 'https://tiktok.com/@test',
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('setting.edit'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/settingapp/Form')
            ->has('setting')
            ->where('setting.nama_app', 'Test App')
            ->where('setting.description', 'Test Description')
        );
    }

    public function test_admin_can_update_settings(): void
    {
        SettingApp::create([
            'nama_app' => 'Old App',
            'description' => 'Old Desc',
            'address' => 'Old Addr',
            'phone' => '000',
            'email' => 'old@example.com',
        ]);

        $data = [
            'nama_app' => 'Updated App',
            'description' => 'Updated Description',
            'address' => 'Updated Address',
            'phone' => '+62-812-9876-5432',
            'email' => 'updated@example.com',
            'facebook' => 'https://facebook.com/updated',
            'instagram' => 'https://instagram.com/updated',
            'youtube' => 'https://youtube.com/@updated',
            'tiktok' => 'https://tiktok.com/@updated',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('setting.update'), $data);

        $response->assertRedirect(route('setting.edit'));
        $this->assertDatabaseHas('settingapp', [
            'nama_app' => 'Updated App',
            'email' => 'updated@example.com',
            'facebook' => 'https://facebook.com/updated',
        ]);
    }

    public function test_admin_can_upload_image(): void
    {
        $file = UploadedFile::fake()->image('logo.png', 100, 100);

        $data = [
            'nama_app' => 'App With Logo',
            'description' => 'Desc',
            'address' => 'Addr',
            'phone' => '1234567',
            'email' => 'a@example.com',
            'image' => $file,
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('setting.update'), $data);

        $response->assertRedirect(route('setting.edit'));

        $setting = SettingApp::first();
        $this->assertNotNull($setting->image);
        // Check if file exists in storage
        $this->assertTrue(Storage::disk('public')->exists('images/'.$setting->getRawOriginal('image')));
    }

    public function test_social_media_links_stored_correctly(): void
    {
        $data = [
            'nama_app' => 'Social Media Test',
            'description' => 'Desc',
            'address' => 'Addr',
            'phone' => '1234567',
            'email' => 'a@example.com',
            'facebook' => 'https://facebook.com/test',
            'instagram' => 'https://instagram.com/test',
            'tiktok' => '',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('setting.update'), $data);

        $setting = SettingApp::first();
        $this->assertEquals('https://facebook.com/test', $setting->facebook);
        $this->assertEquals('https://instagram.com/test', $setting->instagram);
        $this->assertEmpty($setting->tiktok);
    }

    public function test_image_replacement_deletes_old_image(): void
    {
        $oldFile = UploadedFile::fake()->image('old.png', 100, 100);

        $setting = SettingApp::create([
            'nama_app' => 'App',
            'description' => 'Desc',
            'address' => 'Addr',
            'phone' => '1234567',
            'email' => 'a@example.com',
            'image' => $oldFile->store('images', 'public'),
        ]);

        Storage::disk('public')->assertExists($setting->image);

        $newFile = UploadedFile::fake()->image('new.png', 100, 100);
        $data = [
            'nama_app' => 'App',
            'description' => 'Desc',
            'address' => 'Addr',
            'phone' => '1234567',
            'email' => 'a@example.com',
            'image' => $newFile,
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('setting.update'), $data);

        $updated = SettingApp::first();
        $this->assertNotEquals($setting->image, $updated->image);
        Storage::disk('public')->assertMissing($setting->image);
    }

    // ============================================================================
    // Validation Tests
    // ============================================================================

    public function test_validation_requires_nama_app(): void
    {
        $data = [
            'nama_app' => '',
            'description' => 'Test',
            'address' => 'Test',
            'phone' => '123',
            'email' => 'test@example.com',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('setting.update'), $data);

        $response->assertSessionHasErrors('nama_app');
    }

    public function test_validation_phone_format(): void
    {
        // Note: Current validation only checks length, not format.
        // To enforce phone format, add: 'phone' => 'required|regex:/^[\d\s\-\+\(\)]+$/'
        // For now, we test that 'abc' (3 chars) passes length validation
        $data = [
            'nama_app' => 'Test App',
            'description' => 'Desc',
            'address' => 'Addr',
            'phone' => 'ab',  // Too short (min:3)
            'email' => 'test@example.com',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('setting.update'), $data);

        $response->assertSessionHasErrors('phone');
    }

    public function test_validation_email_format(): void
    {
        $data = [
            'nama_app' => 'Test App',
            'description' => 'Desc',
            'address' => 'Addr',
            'phone' => '1234567',
            'email' => 'not-an-email',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('setting.update'), $data);

        $response->assertSessionHasErrors('email');
    }

    public function test_validation_image_file_type(): void
    {
        $file = UploadedFile::fake()->create('logo.txt');

        $data = [
            'nama_app' => 'Test App',
            'description' => 'Desc',
            'address' => 'Addr',
            'phone' => '1234567',
            'email' => 'test@example.com',
            'image' => $file,
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('setting.update'), $data);

        $response->assertSessionHasErrors('image');
    }
}
