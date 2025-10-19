<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     * Dynamically select the root view based on the request path.
     */
    public function rootView(Request $request): string
    {
        // Use admin template for admin routes
        if ($request->is('admin') || $request->is('admin/*')) {
            return 'admin/app';
        }

        // Use site template for all other routes
        return 'site/app';
    }

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $flashMessages = [
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
            'info' => $request->session()->get('info'),
            'warning' => $request->session()->get('warning'),
        ];

        $hasFlash = collect($flashMessages)
            ->filter(fn ($value): bool => filled($value))
            ->isNotEmpty();

        if ($hasFlash) {
            $flashMessages['uuid'] = (string) Str::uuid();
        }

        // Share only safe user attributes to the client to avoid leaking sensitive data
        $safeUser = null;
        if ($request->user()) {
            $u = $request->user();
            $safeUser = [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'full_name' => $u->full_name,
                'image' => $u->image,
                'is_active' => $u->is_active,
                'has_two_factor' => ! is_null($u->two_factor_secret),
            ];
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim((string) $message), 'author' => trim((string) $author)],
            'auth' => [
                'user' => $safeUser,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => $hasFlash ? $flashMessages : null,
        ];
    }
}
