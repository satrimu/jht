<?php

use App\Models\User;
use Illuminate\Support\Str;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    // Ensure we have an admin user
    $this->admin = User::factory()->create(['role' => 'admin']);
});

it('allows admin to create an api token and flashes token', function () {
    actingAs($this->admin);

    $name = 'test-token-'.Str::random(6);

    $response = $this->post('/admin/api-tokens', [
        'name' => $name,
        'abilities' => ['read'],
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('token');
    $response->assertSessionHas('token_id');

    $tokenId = session('token_id');
    $this->assertDatabaseHas('personal_access_tokens', [
        'id' => $tokenId,
        'name' => $name,
        'tokenable_id' => $this->admin->getKey(),
    ]);
});

it('validates unique name per user', function () {
    actingAs($this->admin);

    $name = 'unique-token-name';

    $this->post('/admin/api-tokens', [
        'name' => $name,
        'abilities' => ['read'],
    ])->assertRedirect();

    // Second attempt with same name should redirect back with errors
    $this->post('/admin/api-tokens', [
        'name' => $name,
        'abilities' => ['read'],
    ])->assertSessionHasErrors('name');
});
