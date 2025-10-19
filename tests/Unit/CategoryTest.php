<?php

use App\Models\Category;
use Spatie\Activitylog\Models\Activity;

test('category has fillable attributes', function () {
    $category = new Category;

    expect($category->getFillable())->toEqual([
        'name',
        'note',
    ]);
});

test('category uses soft deletes', function () {
    $category = Category::factory()->create();

    $category->delete();

    expect($category->trashed())->toBeTrue();
    expect(Category::withTrashed()->count())->toBe(1);
    expect(Category::count())->toBe(0);
});

test('category logs activity when created', function () {
    $category = Category::factory()->create([
        'name' => 'Test Category',
        'note' => 'Test note',
    ]);

    $activity = Activity::where('subject_id', $category->id)
        ->where('subject_type', Category::class)
        ->where('description', 'created')
        ->first();

    expect($activity)->not->toBeNull();
    expect($activity->properties['attributes'])->toHaveKey('name', 'Test Category');
});

test('category logs activity when updated', function () {
    $category = Category::factory()->create([
        'name' => 'Original Name',
    ]);

    $category->update(['name' => 'Updated Name']);

    $activity = Activity::where('subject_id', $category->id)
        ->where('subject_type', Category::class)
        ->where('description', 'updated')
        ->first();

    expect($activity)->not->toBeNull();
    expect($activity->properties['old'])->toHaveKey('name', 'Original Name');
    expect($activity->properties['attributes'])->toHaveKey('name', 'Updated Name');
});

test('category logs activity when deleted', function () {
    $category = Category::factory()->create();

    $category->delete();

    $activity = Activity::where('subject_id', $category->id)
        ->where('subject_type', Category::class)
        ->where('description', 'deleted')
        ->first();

    expect($activity)->not->toBeNull();
});

test('category activity logging configuration is correct', function () {
    $category = new Category;
    $options = $category->getActivitylogOptions();

    expect($options->logAttributes)->toEqual(['name', 'note']);
    expect($options->logOnlyDirty)->toBeTrue();
    expect($options->submitEmptyLogs)->toBeFalse();
});
