<?php

use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->user = User::factory()->create([
        'full_name' => 'John Doe',
        'member_number' => 'JHT001',
    ]);

    Storage::fake('public');
});

it('displays payments index page', function () {
    $payment = Payment::factory()->forUser($this->user)->create();

    $response = $this->actingAs($this->admin)
        ->get('/admin/payments');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/payments/Index')
            ->has('payments')
            ->has('users')
            ->has('breadcrumbs')
        );
});

it('can create a payment', function () {
    $image = UploadedFile::fake()->image('payment.jpg');

    $paymentData = [
        'user_id' => $this->user->id,
        'amount' => '150000.00',
        'payment_date' => now()->format('Y-m-d'),
        'status' => 'pending',
        'notes' => 'Test payment',
        'image' => $image,
    ];

    $response = $this->actingAs($this->admin)
        ->post('/admin/payments', $paymentData);

    $response->assertRedirect('/admin/payments')
        ->assertSessionHas('success');

    expect(Payment::count())->toBe(1);

    $payment = Payment::first();
    expect($payment->user_id)->toBe($this->user->id)
        ->and($payment->amount)->toBe('150000.00')
        ->and($payment->status)->toBe('pending')
        ->and($payment->notes)->toBe('Test payment')
        ->and($payment->image)->not()->toBeNull();

    // Check if image was processed and stored
    Storage::disk('public')->assertExists('payments/'.$payment->image);
});

it('can update a payment', function () {
    $payment = Payment::factory()->forUser($this->user)->create([
        'amount' => '100000.00',
        'status' => 'pending',
    ]);

    $image = UploadedFile::fake()->image('new-payment.jpg');

    $updateData = [
        'user_id' => $this->user->id,
        'amount' => '200000.00',
        'payment_date' => now()->format('Y-m-d'),
        'status' => 'validated',
        'notes' => 'Updated payment',
        'image' => $image,
    ];

    $response = $this->actingAs($this->admin)
        ->patch("/admin/payments/{$payment->id}", $updateData);

    $response->assertRedirect('/admin/payments')
        ->assertSessionHas('success');

    $payment->refresh();
    expect($payment->amount)->toBe('200000.00')
        ->and($payment->status)->toBe('validated')
        ->and($payment->notes)->toBe('Updated payment');
});

it('can delete a payment', function () {
    $payment = Payment::factory()->forUser($this->user)->withImage()->create();

    $response = $this->actingAs($this->admin)
        ->delete("/admin/payments/{$payment->id}");

    $response->assertRedirect('/admin/payments')
        ->assertSessionHas('success');

    expect(Payment::count())->toBe(0);
});

it('validates required fields when creating payment', function () {
    $response = $this->actingAs($this->admin)
        ->post('/admin/payments', []);

    $response->assertSessionHasErrors(['user_id', 'amount', 'payment_date', 'status']);
});

it('validates amount is numeric and greater than zero', function () {
    $response = $this->actingAs($this->admin)
        ->post('/admin/payments', [
            'user_id' => $this->user->id,
            'amount' => 'invalid',
            'payment_date' => now()->format('Y-m-d'),
            'status' => 'pending',
        ]);

    $response->assertSessionHasErrors(['amount']);

    $response = $this->actingAs($this->admin)
        ->post('/admin/payments', [
            'user_id' => $this->user->id,
            'amount' => '-100',
            'payment_date' => now()->format('Y-m-d'),
            'status' => 'pending',
        ]);

    $response->assertSessionHasErrors(['amount']);
});

it('validates user exists', function () {
    $response = $this->actingAs($this->admin)
        ->post('/admin/payments', [
            'user_id' => 999999,
            'amount' => '100000',
            'payment_date' => now()->format('Y-m-d'),
            'status' => 'pending',
        ]);

    $response->assertSessionHasErrors(['user_id']);
});

it('validates status is valid enum value', function () {
    $response = $this->actingAs($this->admin)
        ->post('/admin/payments', [
            'user_id' => $this->user->id,
            'amount' => '100000',
            'payment_date' => now()->format('Y-m-d'),
            'status' => 'invalid_status',
        ]);

    $response->assertSessionHasErrors(['status']);
});

it('validates image file type and size', function () {
    $invalidFile = UploadedFile::fake()->create('document.pdf', 1024);

    $response = $this->actingAs($this->admin)
        ->post('/admin/payments', [
            'user_id' => $this->user->id,
            'amount' => '100000',
            'payment_date' => now()->format('Y-m-d'),
            'status' => 'pending',
            'image' => $invalidFile,
        ]);

    $response->assertSessionHasErrors(['image']);

    // Test file size limit (>10MB)
    $largeFile = UploadedFile::fake()->image('large.jpg')->size(11 * 1024); // 11MB

    $response = $this->actingAs($this->admin)
        ->post('/admin/payments', [
            'user_id' => $this->user->id,
            'amount' => '100000',
            'payment_date' => now()->format('Y-m-d'),
            'status' => 'pending',
            'image' => $largeFile,
        ]);

    $response->assertSessionHasErrors(['image']);
});

it('requires admin authorization', function () {
    $regularUser = User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($regularUser)
        ->get('/admin/payments');

    $response->assertForbidden();
});

it('eagerly loads user relationship', function () {
    Payment::factory()->forUser($this->user)->count(5)->create();

    $response = $this->actingAs($this->admin)
        ->get('/admin/payments');

    // Check that the response includes user data
    $response->assertInertia(fn ($page) => $page
        ->has('payments.data.0.user')
        ->where('payments.data.0.user.full_name', $this->user->full_name)
    );
});

it('paginates payments correctly', function () {
    Payment::factory()->forUser($this->user)->count(25)->create();

    $response = $this->actingAs($this->admin)
        ->get('/admin/payments?per_page=10');

    $response->assertInertia(fn ($page) => $page
        ->has('payments.data', 10)
        ->where('payments.total', 25)
        ->where('payments.per_page', 10)
    );
});

it('can show a specific payment', function () {
    $payment = Payment::factory()->forUser($this->user)->withImage()->create();

    $response = $this->actingAs($this->admin)
        ->get("/admin/payments/{$payment->id}");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/payments/Show')
            ->has('payment')
            ->where('payment.id', $payment->id)
            ->has('payment.user')
        );
});

it('returns 404 for non-existent payment', function () {
    $response = $this->actingAs($this->admin)
        ->get('/admin/payments/999999');

    $response->assertNotFound();
});

it('logs activity when payment is created', function () {
    $paymentData = [
        'user_id' => $this->user->id,
        'amount' => '150000.00',
        'payment_date' => now()->format('Y-m-d'),
        'status' => 'pending',
        'notes' => 'Test payment',
    ];

    $this->actingAs($this->admin)
        ->post('/admin/payments', $paymentData);

    $payment = Payment::first();
    expect($payment->activities()->count())->toBe(1);

    $activity = $payment->activities()->first();
    expect($activity->description)->toBe('created');
});

it('deletes old image when updating with new image', function () {
    $payment = Payment::factory()->forUser($this->user)->withImage()->create([
        'image' => 'old-payment.webp',
    ]);

    // Create the old image file in the payments folder
    Storage::disk('public')->put('payments/old-payment.webp', 'old content');

    $newImage = UploadedFile::fake()->image('new-payment.jpg');

    $this->actingAs($this->admin)
        ->patch("/admin/payments/{$payment->id}", [
            'user_id' => $this->user->id,
            'amount' => '200000.00',
            'payment_date' => now()->format('Y-m-d'),
            'status' => 'validated',
            'image' => $newImage,
        ]);

    // Old image should be deleted
    Storage::disk('public')->assertMissing('payments/old-payment.webp');

    // New image should exist
    $payment->refresh();
    Storage::disk('public')->assertExists('payments/'.$payment->image);
});
