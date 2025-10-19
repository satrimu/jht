<?php

use App\Models\Payment;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create([
        'full_name' => 'John Doe',
        'member_number' => 'JHT001',
    ]);
});

it('can create a payment', function () {
    $payment = Payment::factory()->create([
        'user_id' => $this->user->id,
        'amount' => 100000,
        'status' => 'pending',
    ]);

    expect($payment)->toBeInstanceOf(Payment::class)
        ->and($payment->user_id)->toBe($this->user->id)
        ->and($payment->amount)->toBe('100000.00')
        ->and($payment->status)->toBe('pending');
});

it('belongs to a user', function () {
    $payment = Payment::factory()->create([
        'user_id' => $this->user->id,
    ]);

    expect($payment->user)->toBeInstanceOf(User::class)
        ->and($payment->user->id)->toBe($this->user->id);
});

it('has fillable attributes', function () {
    $fillable = [
        'user_id',
        'amount',
        'payment_date',
        'status',
        'notes',
        'image',
    ];

    expect((new Payment)->getFillable())->toBe($fillable);
});

it('casts attributes correctly', function () {
    $payment = Payment::factory()->create();

    expect($payment->getCasts())->toMatchArray([
        'payment_date' => 'datetime',
        'amount' => 'decimal:2',
        'id' => 'int',
    ]);
});

it('has image url accessor when image exists', function () {
    $payment = Payment::factory()->withImage()->create([
        'image' => 'test-payment.webp',
    ]);

    expect($payment->image_url)->toContain('storage/payments/test-payment.webp');
});

it('has default image url accessor when image is null', function () {
    $payment = Payment::factory()->withoutImage()->create();

    expect($payment->image_url)->toContain('payment-default.svg');
});

it('appends image_url to array', function () {
    $payment = Payment::factory()->create();
    $array = $payment->toArray();

    expect($array)->toHaveKey('image_url');
});

it('logs activity on create', function () {
    $payment = Payment::factory()->create([
        'user_id' => $this->user->id,
        'amount' => 100000,
        'status' => 'pending',
    ]);

    expect($payment->activities()->count())->toBe(1);

    $activity = $payment->activities()->first();
    expect($activity->description)->toBe('created')
        ->and($activity->properties)->toHaveKey('attributes');
});

it('logs activity on update', function () {
    $payment = Payment::factory()->create([
        'status' => 'pending',
    ]);

    // Clear initial activities to focus on update
    $payment->activities()->delete();

    $payment->update(['status' => 'validated']);

    expect($payment->activities()->count())->toBe(1);

    $updateActivity = $payment->activities()->latest()->first();
    expect($updateActivity->description)->toBe('updated')
        ->and($updateActivity->properties)->toHaveKey('attributes')
        ->and($updateActivity->properties)->toHaveKey('old');
});

it('can filter by status', function () {
    Payment::factory()->pending()->count(3)->create();
    Payment::factory()->validated()->count(2)->create();
    Payment::factory()->rejected()->count(1)->create();

    expect(Payment::where('status', 'pending')->count())->toBe(3)
        ->and(Payment::where('status', 'validated')->count())->toBe(2)
        ->and(Payment::where('status', 'rejected')->count())->toBe(1);
});

it('can filter by user', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    Payment::factory()->forUser($user1)->count(3)->create();
    Payment::factory()->forUser($user2)->count(2)->create();

    expect(Payment::where('user_id', $user1->id)->count())->toBe(3)
        ->and(Payment::where('user_id', $user2->id)->count())->toBe(2);
});

it('formats amount as decimal', function () {
    $payment = Payment::factory()->create([
        'amount' => 150000,
    ]);

    expect($payment->amount)->toBe('150000.00');
});

it('handles payment date as datetime', function () {
    $date = now()->subDays(7);
    $payment = Payment::factory()->create([
        'payment_date' => $date,
    ]);

    expect($payment->payment_date)->toBeInstanceOf(\Illuminate\Support\Carbon::class)
        ->and($payment->payment_date->format('Y-m-d'))->toBe($date->format('Y-m-d'));
});
