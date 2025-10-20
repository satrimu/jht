<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface
{
    /**
     * Get all users
     */
    public function all(): Collection;

    /**
     * Get paginated users with relationships
     */
    public function paginateWithRelations(int $perPage = 15): LengthAwarePaginator;

    /**
     * Search users by name, email, member_number, or phone with pagination
     *
     * @param  string  $search  Search term
     * @param  int  $perPage  Items per page
     * @param  string|null  $sortBy  Sort field (role, is_active)
     * @param  string  $sortOrder  Sort direction (asc, desc)
     */
    public function search(
        string $search,
        int $perPage = 15,
        ?string $sortBy = null,
        string $sortOrder = 'asc'
    ): LengthAwarePaginator;

    /**
     * Find user by ID
     */
    public function find(int $id): ?User;

    /**
     * Create new user
     */
    public function create(array $data): User;

    /**
     * Update user
     */
    public function update(User $user, array $data): User;

    /**
     * Delete user
     */
    public function delete(User $user): bool;

    /**
     * Find user by email
     */
    public function findByEmail(string $email): ?User;

    /**
     * Get users by role
     */
    public function getByRole(string $role): Collection;

    /**
     * Get active users
     */
    public function getActive(): Collection;
}
