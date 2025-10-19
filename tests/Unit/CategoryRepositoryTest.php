<?php

use App\Models\Category;
use App\Repositories\Eloquent\CategoryRepository;

beforeEach(function () {
    $this->repository = new CategoryRepository(new Category);
});

describe('CategoryRepository', function () {
    it('can paginate categories with relations', function () {
        Category::factory()->count(20)->create();

        $result = $this->repository->paginateWithRelations(10);

        expect($result->count())->toBe(10);
        expect($result->total())->toBe(20);
        expect($result->perPage())->toBe(10);
    });

    it('can get all categories ordered by name', function () {
        $category1 = Category::factory()->create(['name' => 'Z Category']);
        $category2 = Category::factory()->create(['name' => 'A Category']);
        $category3 = Category::factory()->create(['name' => 'M Category']);

        $result = $this->repository->all();

        expect($result->count())->toBe(3);
        expect($result->first()->name)->toBe('A Category');
        expect($result->last()->name)->toBe('Z Category');
    });

    it('can find category by id', function () {
        $category = Category::factory()->create();

        $result = $this->repository->find($category->id);

        expect($result)->not->toBeNull();
        expect($result->id)->toBe($category->id);
        expect($result->name)->toBe($category->name);
    });

    it('returns null when category not found', function () {
        $result = $this->repository->find(999);

        expect($result)->toBeNull();
    });

    it('can create new category', function () {
        $data = [
            'name' => 'Test Category',
            'note' => 'Test note',
        ];

        $result = $this->repository->create($data);

        expect($result)->toBeInstanceOf(Category::class);
        expect($result->name)->toBe('Test Category');
        expect($result->note)->toBe('Test note');

        $this->assertDatabaseHas('categories', $data);
    });

    it('can update existing category', function () {
        $category = Category::factory()->create([
            'name' => 'Original Name',
            'note' => 'Original note',
        ]);

        $updateData = [
            'name' => 'Updated Name',
            'note' => 'Updated note',
        ];

        $result = $this->repository->update($category, $updateData);

        expect($result->name)->toBe('Updated Name');
        expect($result->note)->toBe('Updated note');

        $this->assertDatabaseHas('categories', array_merge(['id' => $category->id], $updateData));
    });

    it('can delete category', function () {
        $category = Category::factory()->create();

        $result = $this->repository->delete($category);

        expect($result)->toBeTrue();
        $this->assertSoftDeleted('categories', ['id' => $category->id]);
    });

    it('can search categories by name', function () {
        $category1 = Category::factory()->create(['name' => 'PHP Development']);
        $category2 = Category::factory()->create(['name' => 'JavaScript Framework']);
        $category3 = Category::factory()->create(['name' => 'Python Scripts']);

        $result = $this->repository->searchByName('PHP');

        expect($result->count())->toBe(1);
        expect($result->first()->name)->toBe('PHP Development');

        $result = $this->repository->searchByName('script');

        expect($result->count())->toBe(2); // JavaScript and Python Scripts
    });

    it('returns empty collection when search has no matches', function () {
        Category::factory()->count(3)->create();

        $result = $this->repository->searchByName('nonexistent');

        expect($result->count())->toBe(0);
    });

    it('search is case insensitive', function () {
        $category = Category::factory()->create(['name' => 'Laravel Framework']);

        $result = $this->repository->searchByName('LARAVEL');

        expect($result->count())->toBe(1);
        expect($result->first()->name)->toBe('Laravel Framework');
    });
});
