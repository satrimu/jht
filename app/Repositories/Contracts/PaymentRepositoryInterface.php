<?php

namespace App\Repositories\Contracts;

use App\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface PaymentRepositoryInterface
{
    /**
     * Get all payments with user relationships
     */
    public function all(): Collection;

    /**
     * Get paginated payments with relationships
     */
    public function paginateWithRelations(int $perPage = 15): LengthAwarePaginator;

    /**
     * Find payment by ID with relationships
     */
    public function find(int $id): ?Payment;

    /**
     * Create new payment
     */
    public function create(array $data): Payment;

    /**
     * Update payment
     */
    public function update(Payment $payment, array $data): Payment;

    /**
     * Delete payment
     */
    public function delete(Payment $payment): bool;

    /**
     * Get payments by user ID
     */
    public function getByUserId(int $userId): Collection;

    /**
     * Get payments by status
     */
    public function getByStatus(string $status): Collection;
}
