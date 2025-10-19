<?php

use App\Models\Category;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->user = User::factory()->create(['role' => 'user']);
});

test('admin can view categories index', function () {
    Category::factory(3)->create();

    $response = $this
        ->actingAs($this->admin)
        ->get('/admin/categories');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('admin/categories/Index')
        ->has('categories.data', 3)
        ->has('breadcrumbs')
    );
});

test('non-admin cannot access categories index', function () {
    $response = $this
        ->actingAs($this->user)
        ->get('/admin/categories');

    $response->assertStatus(403);
});

test('admin can create category', function () {
    $categoryData = [
        'name' => 'Test Category',
        'note' => 'Test note for category',
    ];

    $response = $this
        ->actingAs($this->admin)
        ->post('/admin/categories', $categoryData);

    $response->assertRedirect('/admin/categories');
    $response->assertSessionHas('success', 'Category berhasil dibuat!');

    $this->assertDatabaseHas('categories', [
        'name' => 'Test Category',
        'note' => 'Test note for category',
    ]);
});

test('admin can update category', function () {
    $category = Category::factory()->create([
        'name' => 'Original Name',
        'note' => 'Original note',
    ]);

    $updateData = [
        'name' => 'Updated Name',
        'note' => 'Updated note',
    ];

    $response = $this
        ->actingAs($this->admin)
        ->put("/admin/categories/{$category->id}", $updateData);

    $response->assertRedirect('/admin/categories');
    $response->assertSessionHas('success', 'Category berhasil diperbarui!');

    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
        'name' => 'Updated Name',
        'note' => 'Updated note',
    ]);
});

test('admin can delete category', function () {
    $category = Category::factory()->create();

    $response = $this
        ->actingAs($this->admin)
        ->delete("/admin/categories/{$category->id}");

    $response->assertRedirect('/admin/categories');
    $response->assertSessionHas('success', 'Category berhasil dihapus!');

    $this->assertSoftDeleted('categories', ['id' => $category->id]);
});

test('admin can view single category', function () {
    $category = Category::factory()->create();

    $response = $this
        ->actingAs($this->admin)
        ->get("/admin/categories/{$category->id}");

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('admin/categories/Show')
        ->where('category.id', $category->id)
        ->has('breadcrumbs')
    );
});

test('category name must be unique', function () {
    Category::factory()->create(['name' => 'Existing Category']);

    $response = $this
        ->actingAs($this->admin)
        ->post('/admin/categories', [
            'name' => 'Existing Category',
            'note' => 'Some note',
        ]);

    $response->assertSessionHasErrors('name');
});

test('category name is required', function () {
    $response = $this
        ->actingAs($this->admin)
        ->post('/admin/categories', [
            'name' => '',
            'note' => 'Some note',
        ]);

    $response->assertSessionHasErrors('name');
});
