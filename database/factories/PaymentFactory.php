<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = Payment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'amount' => $this->faker->randomFloat(2, 50000, 2000000), // IDR 50K - 2M
            'payment_date' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'status' => $this->faker->randomElement(['pending', 'validated', 'rejected']),
            'notes' => $this->faker->optional(0.7)->sentence(),
            'image' => $this->faker->optional(0.8)->lexify('payment_?????.webp'), // 80% chance has image
        ];
    }

    /**
     * Payment with pending status.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'pending',
        ]);
    }

    /**
     * Payment with validated status.
     */
    public function validated(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'validated',
        ]);
    }

    /**
     * Payment with rejected status.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'rejected',
        ]);
    }

    /**
     * Payment with image.
     */
    public function withImage(): static
    {
        return $this->state(fn (array $attributes): array => [
            'image' => 'payment_'.$this->faker->uuid().'.webp',
        ]);
    }

    /**
     * Payment without image.
     */
    public function withoutImage(): static
    {
        return $this->state(fn (array $attributes): array => [
            'image' => null,
        ]);
    }

    /**
     * Payment with specific amount.
     */
    public function amount(float $amount): static
    {
        return $this->state(fn (array $attributes): array => [
            'amount' => $amount,
        ]);
    }

    /**
     * Payment for specific user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes): array => [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Recent payment (within last month).
     */
    public function recent(): static
    {
        return $this->state(fn (array $attributes): array => [
            'payment_date' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ]);
    }

    /**
     * Old payment (more than 6 months ago).
     */
    public function old(): static
    {
        return $this->state(fn (array $attributes): array => [
            'payment_date' => $this->faker->dateTimeBetween('-2 years', '-6 months'),
        ]);
    }
}
