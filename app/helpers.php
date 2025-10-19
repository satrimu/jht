<?php

use App\Services\CacheService;

if (! function_exists('cache_service')) {
    /**
     * Get the CacheService instance for convenient cache operations.
     *
     * This helper provides global access to the centralized CacheService
     * which handles tag-aware caching with fallback support for non-taggable stores.
     *
     * Usage examples:
     *
     * // Remember users list with automatic tagging
     * $users = cache_service()->rememberUsersList($page, $perPage, 300, function() {
     *     return User::paginate($perPage);
     * });
     *
     * // Clear users list cache
     * cache_service()->clearUsersList();
     *
     * // Check if current cache store supports tags
     * if (cache_service()->supportsTags()) {
     *     // Use tag-based operations
     * }
     */
    function cache_service(): CacheService
    {
        return app(CacheService::class);
    }
}
