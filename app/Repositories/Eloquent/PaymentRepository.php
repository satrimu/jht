<?php

namespace App\Repositories\Eloquent;

use App\Models\Payment;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class PaymentRepository implements PaymentRepositoryInterface
{
    /**
     * Get all payments with user relationships
     */
    public function all(): Collection
    {
        return Payment::with('user')
            ->orderBy('payment_date', 'desc')
            ->get();
    }

    /**
     * Get paginated payments with relationships
     */
    public function paginateWithRelations(int $perPage = 15): LengthAwarePaginator
    {
        return Payment::with('user')
            ->orderBy('payment_date', 'desc')
            ->paginate($perPage);
    }

    /**
     * Find payment by ID with relationships
     */
    public function find(int $id): ?Payment
    {
        return Payment::with('user')->find($id);
    }

    /**
     * Create new payment
     */
    public function create(array $data): Payment
    {
        return Payment::create($data);
    }

    /**
     * Update payment
     */
    public function update(Payment $payment, array $data): Payment
    {
        $payment->update($data);

        return $payment->fresh('user');
    }

    /**
     * Delete payment
     */
    public function delete(Payment $payment): bool
    {
        return $payment->delete();
    }

    /**
     * Get payments by user ID
     */
    public function getByUserId(int $userId): Collection
    {
        return Payment::with('user')
            ->where('user_id', $userId)
            ->orderBy('payment_date', 'desc')
            ->get();
    }

    /**
     * Get payments by status
     */
    public function getByStatus(string $status): Collection
    {
        return Payment::with('user')
            ->where('status', $status)
            ->orderBy('payment_date', 'desc')
            ->get();
    }
}
