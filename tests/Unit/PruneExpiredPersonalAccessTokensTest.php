<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;

uses(RefreshDatabase::class);

it('prunes expired tokens', function () {
    // create user and expired token
    $user = User::factory()->create();

    PersonalAccessToken::forceCreate([
        'tokenable_type' => get_class($user),
        'tokenable_id' => $user->getKey(),
        'name' => 'expired-token',
        'abilities' => ['read'],
        'token' => 'plain-token',
        'expires_at' => now()->subDay(),
    ]);

    // create non-expired token
    PersonalAccessToken::forceCreate([
        'tokenable_type' => get_class($user),
        'tokenable_id' => $user->getKey(),
        'name' => 'valid-token',
        'abilities' => ['read'],
        'token' => 'plain-token-2',
        'expires_at' => now()->addDay(),
    ]);

    $this->artisan('tokens:prune-expired')->assertExitCode(0);

    $this->assertDatabaseMissing('personal_access_tokens', ['name' => 'expired-token']);
    $this->assertDatabaseHas('personal_access_tokens', ['name' => 'valid-token']);
});
