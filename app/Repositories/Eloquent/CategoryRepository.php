<?php

namespace App\Repositories\Eloquent;

use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class CategoryRepository implements CategoryRepositoryInterface
{
    /**
     * Get all categories
     */
    public function all(): Collection
    {
        return Category::orderBy('name')->get();
    }

    /**
     * Get paginated categories with relationships
     */
    public function paginateWithRelations(int $perPage = 15): LengthAwarePaginator
    {
        return Category::orderBy('name')
            ->paginate($perPage);
    }

    /**
     * Find category by ID
     */
    public function find(int $id): ?Category
    {
        return Category::find($id);
    }

    /**
     * Create new category
     */
    public function create(array $data): Category
    {
        return Category::create($data);
    }

    /**
     * Update category
     */
    public function update(Category $category, array $data): Category
    {
        $category->update($data);

        return $category->fresh();
    }

    /**
     * Delete category
     */
    public function delete(Category $category): bool
    {
        return $category->delete();
    }

    /**
     * Find category by name
     */
    public function findByName(string $name): ?Category
    {
        return Category::where('name', $name)->first();
    }

    /**
     * Search categories by name
     */
    public function searchByName(string $name): Collection
    {
        return Category::where('name', 'like', '%'.$name.'%')
            ->orderBy('name')
            ->get();
    }
}
