<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class UserRepository implements UserRepositoryInterface
{
    /**
     * Fields to select for optimization
     */
    private array $selectFields = [
        'id',
        'name',
        'email',
        'role',
        'member_number',
        'full_name',
        'phone',
        'join_date',
        'is_active',
        'image',
        'created_at',
    ];

    /**
     * Get all users
     */
    public function all(): Collection
    {
        return User::select($this->selectFields)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get paginated users with relationships
     */
    public function paginateWithRelations(int $perPage = 15): LengthAwarePaginator
    {
        return User::select($this->selectFields)
            ->latest('created_at')
            ->paginate($perPage);
    }

    /**
     * Search users by name, email, member_number, or phone with pagination
     */
    public function search(
        string $search,
        int $perPage = 15,
        ?string $sortBy = null,
        string $sortOrder = 'asc'
    ): LengthAwarePaginator {
        $query = User::select($this->selectFields);

        // Apply search filter on multiple fields
        if (! empty(trim($search))) {
            $searchTerm = '%'.trim($search).'%';
            $query->where(function ($q) use ($searchTerm): void {
                $q->where('name', 'like', $searchTerm)
                    ->orWhere('email', 'like', $searchTerm)
                    ->orWhere('member_number', 'like', $searchTerm)
                    ->orWhere('phone', 'like', $searchTerm);
            });
        }

        // Apply sorting
        if ($sortBy && in_array($sortBy, ['role', 'is_active'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->latest('created_at');
        }

        return $query->paginate($perPage);
    }

    /**
     * Find user by ID
     */
    public function find(int $id): ?User
    {
        return User::find($id);
    }

    /**
     * Create new user
     */
    public function create(array $data): User
    {
        return User::create($data);
    }

    /**
     * Update user
     */
    public function update(User $user, array $data): User
    {
        $user->update($data);

        return $user->fresh();
    }

    /**
     * Delete user
     */
    public function delete(User $user): bool
    {
        return $user->delete();
    }

    /**
     * Find user by email
     */
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /**
     * Get users by role
     */
    public function getByRole(string $role): Collection
    {
        return User::select($this->selectFields)
            ->where('role', $role)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get active users
     */
    public function getActive(): Collection
    {
        return User::select($this->selectFields)
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
