# Cache Management

This project uses a centralized `CacheService` to avoid global cache flushes and to provide tag-aware invalidation when available.

Key APIs

- `cache_service()->rememberUsersList($page, $perPage, $ttl, $callback)` — remembers paginated users lists.
- `cache_service()->clearUsersList()` — clears users list cache using tags when available or explicit keys fallback.

Cache key pattern

- `users_list_page_{page}_per_{perPage}`

Notes
- Avoid `Cache::flush()` in production. Use targeted `Cache::forget()` or tags so other caches are not cleared.
- The `CacheService` falls back to iterating sensible pagination ranges if the store doesn't support tags.
