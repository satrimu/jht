<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryRepositoryInterface $repo
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $perPage = (int) $request->get('per_page', 15);
        $categories = $this->repo->paginateWithRelations($perPage);

        $breadcrumbs = [
            ['title' => 'Dashboard', 'href' => route('admin.dashboard')],
            ['title' => 'Categories', 'href' => route('admin.categories.index')],
        ];

        return Inertia::render('admin/categories/Index', ['categories' => $categories, 'breadcrumbs' => $breadcrumbs]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        $data = $request->validated();

        $this->repo->create($data);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category berhasil dibuat!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category): Response
    {
        $breadcrumbs = [
            ['title' => 'Dashboard', 'href' => route('admin.dashboard')],
            ['title' => 'Categories', 'href' => route('admin.categories.index')],
            ['title' => $category->name, 'href' => route('admin.categories.show', $category)],
        ];

        return Inertia::render('admin/categories/Show', ['category' => $category, 'breadcrumbs' => $breadcrumbs]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $data = $request->validated();

        $this->repo->update($category, $data);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $this->repo->delete($category);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category berhasil dihapus!');
    }
}
