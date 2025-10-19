<?php

namespace App\Repositories\Contracts;

use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface CategoryRepositoryInterface
{
    /**
     * Get all categories
     */
    public function all(): Collection;

    /**
     * Get paginated categories with relationships
     */
    public function paginateWithRelations(int $perPage = 15): LengthAwarePaginator;

    /**
     * Find category by ID
     */
    public function find(int $id): ?Category;

    /**
     * Create new category
     */
    public function create(array $data): Category;

    /**
     * Update category
     */
    public function update(Category $category, array $data): Category;

    /**
     * Delete category
     */
    public function delete(Category $category): bool;

    /**
     * Find category by name
     */
    public function findByName(string $name): ?Category;

    /**
     * Search categories by name
     */
    public function searchByName(string $name): Collection;
}
