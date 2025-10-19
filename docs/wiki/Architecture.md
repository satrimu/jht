# Architecture

This project follows an Admin / Site separation with Inertia and React for the frontend and Laravel for the backend.

Key boundaries
- Backend: controllers under `app/Http/Controllers/Admin/*` and `app/Http/Controllers/Site/*`.
- Routes: `routes/admin.php` (admin-only), `routes/web.php` (site/public), `routes/api.php` (API endpoints).
- Frontend pages: `resources/js/pages/admin/*`, `resources/js/pages/site/*`.
- Vite entries: `resources/js/entries/admin.tsx` and `resources/js/entries/site.tsx`.

Services & Patterns
- ImageService: centralized image processing and validation in `app/Services/ImageService.php`.
- CacheService: centralized cache key generation and invalidation in `app/Services/CacheService.php`.
- FormRequests: validation lives in `app/Http/Requests/*` (Admin and Site namespaces).
- Repositories & Services: preferred to inject interfaces where heavy business logic is needed.

Testing & Quality
- Pest for tests, Pint for PHP formatting, PHPStan for static analysis, ESLint for frontend linting.
