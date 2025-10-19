<?php

namespace App\Http\Controllers\Admin;

use Exception;
use Throwable;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Users\StoreUserRequest;
use App\Http\Requests\Admin\Users\UpdateUserRequest;
use App\Models\User;
use App\Services\CacheService;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct(private readonly ImageService $imageService, private readonly CacheService $cacheService) {}

    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 10);
        $page = (int) $request->get('page', 1);

        // Cache for 5 minutes (300 seconds) to reduce database load
        $users = $this->cacheService->rememberUsersList($page, $perPage, 300, fn() => User::select([
            'id',
            'name',
            'email',
            'role',
            'member_number',
            'full_name',
            'phone',
            'join_date',
            'is_active',
            'image', // Include image for avatar display
            'created_at',
            // Exclude: password, address, note, updated_at, etc.
        ])
            ->latest('created_at')
            ->paginate($perPage));

        return Inertia::render('admin/users/Index', [
            'users' => $users,
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/admin'],
                ['title' => 'Users', 'href' => '/admin/users'],
            ],
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = bcrypt($data['password']);
        $data['is_active'] ??= true; // Auto-approve by default

        // Handle image upload with WebP conversion
        // User avatars: 200x200px, stored in 'users' folder
        if ($request->hasFile('image')) {
            try {
                $data['image'] = $this->imageService->processImageWithDimensions(
                    file: $request->file('image'),
                    storagePath: 'users',
                    width: 200,
                    height: 200,
                    prefix: 'avatar',
                    quality: 85
                );
            } catch (Exception $e) {
                return back()->withErrors(['image' => $e->getMessage()]);
            }
        }

        User::create($data);

        // Clear users list cache to show fresh data
        $this->cacheService->clearUsersList();

        return redirect()->route('admin.users.index')->with('success', 'User created successfully.');
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        // Only hash password if it's provided
        if (! empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        // Handle image upload with WebP conversion
        // User avatars: 200x200px, stored in 'users' folder
        if ($request->hasFile('image')) {
            // Debug: log that an image was included in the request (metadata only)
            try {
                $fileMeta = $request->file('image');
                Log::info('User update: image upload detected', [
                    'user_id' => $user->id,
                    'original_name' => $fileMeta->getClientOriginalName(),
                    'mime' => $fileMeta->getMimeType(),
                    'size' => $fileMeta->getSize(),
                ]);
            } catch (Throwable $e) {
                // non-fatal: continue to processing but log warning
                Log::warning('User update: failed to read uploaded file metadata', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }
            try {
                // Delete old image if exists
                // Database stores filename only: avatar-123.webp
                // Need full path for delete: users/avatar-123.webp
                if ($user->image) {
                    $fullPath = 'users/'.$user->image;
                    $this->imageService->deleteImageFile($fullPath);
                }

                // Process new image (returns filename only)
                $data['image'] = $this->imageService->processImageWithDimensions(
                    file: $request->file('image'),
                    storagePath: 'users',
                    width: 200,
                    height: 200,
                    prefix: 'avatar',
                    quality: 85
                );
            } catch (Exception $e) {
                // Log detailed error for debugging and return a user-friendly message
                Log::error('Image processing failed during user update', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);

                return back()->withErrors(['image' => 'Failed to process uploaded image.']);
            }
        } else {
            // If no new image uploaded, don't change the image field
            // This prevents accidentally setting image to null
            unset($data['image']);
        }

        $user->update($data);

        // Clear users list cache keys (tags or explicit keys depending on driver)
        $this->cacheService->clearUsersList();

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        // Prevent admin from deleting themselves
        if ($user->id === auth()->id()) {
            abort(403, 'You cannot delete your own account.');
        }

        // Delete avatar image with full path
        if ($user->image) {
            $fullPath = 'users/'.$user->image;
            $this->imageService->deleteImageFile($fullPath);
        }

        $user->delete();

        // Clear users list cache keys
        $this->cacheService->clearUsersList();

        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully.');
    }

    /**
     * Clear all users list cache keys
     * Cache pattern: users_list_page_{page}_per_{perPage}
     */
    // The users cache clearing is now handled by App\Services\CacheService
    // keeping this controller focused on request handling and persistence.
}
