# Getting Started

This section helps developers set up the project locally.

Prerequisites
- PHP 8.2+
- Composer
- Node.js & npm
- SQLite or configured DB

Quick local setup (copy/paste):

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan storage:link
npm install
npm run dev
```

Run migrations and seeders (if needed):

```bash
php artisan migrate
php artisan db:seed
```

Run tests:

```bash
# Run all tests
./vendor/bin/pest

# Run specific tests quickly
./vendor/bin/pest tests/Feature/Admin/UserAvatarUpdateTest.php
```

Notes
- The repository uses Laravel 12 + Inertia + React.
- Admin pages live under `routes/admin.php` and `app/Http/Controllers/Admin`.
- Frontend Inertia pages are in `resources/js/pages/admin` and `resources/js/pages/site`.
