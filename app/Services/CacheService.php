<?php

namespace App\Services;

use Closure;
use DateInterval;
use DateTimeInterface;
use Illuminate\Cache\TaggableStore;
use Illuminate\Support\Facades\Cache;

/**
 * Centralized cache helper for application-specific cache keys and invalidation.
 *
 * Provides a safe abstraction that uses cache tags when supported by the current
 * cache store (Redis/Memcached) and falls back to explicit keys when tags are
 * not available (database/file stores).
 */
class CacheService
{
    /**
     * Check whether the current cache store supports tags.
     */
    public function supportsTags(): bool
    {
        return Cache::getStore() instanceof TaggableStore;
    }

    /**
     * Return users list cache key for given page/perPage.
     */
    public function usersListKey(int $page, int $perPage): string
    {
        return "users_list_page_{$page}_per_{$perPage}";
    }

    /**
     * Remember users list using tags when available, otherwise plain remember.
     *
     * @param  int|DateTimeInterface|DateInterval  $ttl
     * @return mixed
     */
    public function rememberUsersList(int $page, int $perPage, $ttl, Closure $callback)
    {
        $key = $this->usersListKey($page, $perPage);

        if ($this->supportsTags()) {
            return Cache::tags(['users'])->remember($key, $ttl, $callback);
        }

        return Cache::remember($key, $ttl, $callback);
    }

    /**
     * Clear all users list caches. If tags are supported this uses tags->flush(),
     * otherwise it iterates a sensible set of pagination combinations and calls
     * Cache::forget on the explicit keys.
     */
    public function clearUsersList(): void
    {
        if ($this->supportsTags()) {
            Cache::tags(['users'])->flush();

            return;
        }

        $perPageOptions = [10, 15, 25, 50, 100];

        foreach ($perPageOptions as $perPage) {
            // Limit pages to a reasonable upper bound to avoid excessive loops
            for ($page = 1; $page <= 100; $page++) {
                Cache::forget($this->usersListKey($page, $perPage));
            }
        }
    }
}
