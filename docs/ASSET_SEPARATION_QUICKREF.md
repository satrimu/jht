# Asset Separation - Quick Reference

## 🎯 TL;DR

- **Admin routes** (`/admin/*`) → Load `admin.tsx` bundle
- **Site routes** (everything else) → Load `site.tsx` bundle
- **Auto-detection** via `HandleInertiaRequests` middleware
- **Separate bundles** for better performance

## 📁 File Locations

| Component | Admin | Site |
|-----------|-------|------|
| **Entry Point** | `resources/js/entries/admin.tsx` | `resources/js/entries/site.tsx` |
| **Template** | `resources/views/admin/app.blade.php` | `resources/views/site/app.blade.php` |
| **Pages** | `resources/js/pages/admin/*` | `resources/js/pages/site/*` |
| **Controllers** | `app/Http/Controllers/Admin/*` | `app/Http/Controllers/Site/*` |
| **Routes** | `routes/admin.php` | `routes/web.php` |

## 🔀 Route Examples

```php
// Admin routes (uses admin.tsx)
/admin
/admin/dashboard
/admin/users
/admin/settings

// Site routes (uses site.tsx)
/
/dashboard        (user dashboard)
/login
/register
/settings/*       (user settings)
```

## 🛠️ Common Tasks

### Add New Admin Page

1. Create controller: `app/Http/Controllers/Admin/NewController.php`
2. Add route: `routes/admin.php`
3. Create page: `resources/js/pages/admin/new/Index.tsx`
4. ✅ Middleware auto-loads `admin/app` template

### Add New Site Page

1. Create controller: `app/Http/Controllers/Site/NewController.php`
2. Add route: `routes/web.php`
3. Create page: `resources/js/pages/site/new.tsx`
4. ✅ Middleware auto-loads `site/app` template

## 🧪 Quick Tests

```bash
# Verify setup
bash scripts/verify-asset-separation.sh

# Run tests
php artisan test --filter AssetSeparationTest

# Build assets
npm run build
```

## 🔍 Troubleshooting

### Wrong template loaded?

**Check**: Route must start with `/admin` for admin template

```php
// ✅ Good - loads admin template
Route::get('/admin/dashboard', ...);

// ❌ Bad - loads site template
Route::get('/dashboard/admin', ...);
```

### Asset not loading?

**Check**: Blade template has correct `@vite()` directive

```blade
<!-- Admin template -->
@vite(['resources/js/entries/admin.tsx', ...])

<!-- Site template -->
@vite(['resources/js/entries/site.tsx', ...])
```

### Code from admin appears in site?

**Check**: Don't import admin code in site pages

```typescript
// ❌ Bad - don't do this in site pages
import { AdminComponent } from '@/pages/admin/...';

// ✅ Good - use shared components
import { SharedComponent } from '@/pages/shared/...';
```

## 📚 Full Documentation

- **Detailed Guide**: [ASSET_SEPARATION.md](ASSET_SEPARATION.md)
- **Visual Diagrams**: [ASSET_SEPARATION_VISUAL.md](ASSET_SEPARATION_VISUAL.md)

## 🎨 Key Differences

| Feature | Admin | Site |
|---------|-------|------|
| Toaster | ✅ Yes | ❌ No |
| Title Format | `Page - Admin - App` | `Page - App` |
| Theme Custom | ✅ Yes | ✅ Basic |
| Bundle Size | ~200-300KB | ~150-200KB |

## ⚡ Performance Tips

1. **Don't import admin code in site** - keeps site bundle small
2. **Use shared components** - prevents duplication
3. **Lazy load heavy components** - improves initial load
4. **Check bundle sizes** - run `npm run build` and check output

## 📊 Verification Status

Run verification to ensure setup is correct:

```bash
bash scripts/verify-asset-separation.sh
```

Expected: All ✅ green checkmarks

---

**Need help?** See full documentation in `docs/ASSET_SEPARATION.md`
