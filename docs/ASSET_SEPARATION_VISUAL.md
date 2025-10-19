# Asset Separation Architecture - Visual Summary

## 🎯 Quick Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP Request                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   HandleInertiaRequests Middleware    │
        │   → rootView(Request $request)        │
        └───────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
    ┌─────────────────────┐  ┌─────────────────────┐
    │  /admin OR /admin/* │  │  Other Routes       │
    │  (Admin Routes)     │  │  (Site Routes)      │
    └─────────────────────┘  └─────────────────────┘
                │                       │
                ▼                       ▼
    ┌─────────────────────┐  ┌─────────────────────┐
    │ admin/app.blade.php │  │ site/app.blade.php  │
    └─────────────────────┘  └─────────────────────┘
                │                       │
                ▼                       ▼
    ┌─────────────────────┐  ┌─────────────────────┐
    │ @vite([             │  │ @vite([             │
    │   'admin.tsx',      │  │   'site.tsx',       │
    │   'page.tsx'        │  │   'page.tsx'        │
    │ ])                  │  │ ])                  │
    └─────────────────────┘  └─────────────────────┘
                │                       │
                ▼                       ▼
    ┌─────────────────────┐  ┌─────────────────────┐
    │ Admin Entry Point   │  │ Site Entry Point    │
    │ ✅ Toaster          │  │ ❌ No Toaster       │
    │ ✅ Admin Title      │  │ ✅ Simple Title     │
    │ ✅ Theme Custom     │  │ ✅ Theme Only       │
    └─────────────────────┘  └─────────────────────┘
                │                       │
                ▼                       ▼
    ┌─────────────────────┐  ┌─────────────────────┐
    │ Admin Pages         │  │ Site Pages          │
    │ - admin/dashboard   │  │ - site/home         │
    │ - admin/users       │  │ - dashboard         │
    │ - admin/settings    │  │ - auth/*            │
    │ - admin/logs        │  │ - settings/*        │
    └─────────────────────┘  └─────────────────────┘
                │                       │
                ▼                       ▼
    ┌─────────────────────┐  ┌─────────────────────┐
    │ admin-[hash].js     │  │ site-[hash].js      │
    │ (~200-300KB)        │  │ (~150-200KB)        │
    └─────────────────────┘  └─────────────────────┘
                │                       │
                └───────────┬───────────┘
                            ▼
                  ┌───────────────────┐
                  │ Shared Bundles    │
                  │ - vendor.js       │
                  │ - ui.js           │
                  │ - inertia.js      │
                  └───────────────────┘
```

## 📊 Route → Template Mapping

| Request Path | Detected As | Template Used | Entry Point | Page Location |
|-------------|-------------|---------------|-------------|---------------|
| `/admin` | Admin | `admin/app` | `admin.tsx` | `admin/dashboard.tsx` |
| `/admin/users` | Admin | `admin/app` | `admin.tsx` | `admin/users/Index.tsx` |
| `/admin/settings` | Admin | `admin/app` | `admin.tsx` | `admin/settingapp/Form.tsx` |
| `/` | Site | `site/app` | `site.tsx` | `site/home.tsx` |
| `/dashboard` | Site | `site/app` | `site.tsx` | `dashboard.tsx` |
| `/login` | Site | `site/app` | `site.tsx` | `auth/login.tsx` |
| `/settings/profile` | Site | `site/app` | `site.tsx` | `settings/profile.tsx` |

## 🔍 Key Differences: Admin vs Site

### Admin Entry (`resources/js/entries/admin.tsx`)

```typescript
// Features:
✅ Toaster component (for notifications)
✅ Title: "${title} - Admin - ${appName}"
✅ Theme customization
✅ Admin-specific initialization

// Bundle includes:
- Admin dashboard
- User management
- Admin settings
- Audit logs
- Security logs
- API tokens
```

### Site Entry (`resources/js/entries/site.tsx`)

```typescript
// Features:
❌ No Toaster (simpler)
✅ Title: "${title} - ${appName}"
✅ Basic theme only
✅ Public-facing initialization

// Bundle includes:
- Home page
- User dashboard
- User settings
- Auth pages
- Profile management
```

## 📦 Build Output Structure

```
public/build/
├── assets/
│   ├── admin-abc123.js         ← Admin bundle
│   │   └── Contains:
│   │       - Admin pages
│   │       - Toaster component
│   │       - Admin-specific logic
│   │
│   ├── site-xyz789.js          ← Site bundle
│   │   └── Contains:
│   │       - Site pages
│   │       - Auth pages
│   │       - User pages
│   │
│   ├── vendor-def456.js        ← Shared vendors
│   │   └── Contains:
│   │       - React
│   │       - React DOM
│   │
│   ├── inertia-ghi789.js       ← Shared Inertia
│   │   └── Contains:
│   │       - @inertiajs/react
│   │
│   └── ui-jkl012.js            ← Shared UI
│       └── Contains:
│           - Radix UI components
│           - shadcn/ui
│
└── manifest.json
```

## 🎨 Benefits of This Architecture

### 1. Performance
- **Smaller bundles**: Users only download what they need
- **Faster initial load**: Site users don't download admin code
- **Better caching**: Admin updates don't bust site cache

### 2. Security
- **Code isolation**: Admin logic not exposed to public
- **Separate bundles**: Harder to reverse-engineer admin features
- **Route protection**: Middleware ensures correct template

### 3. Maintainability
- **Clear boundaries**: Easy to identify admin vs site code
- **Independent updates**: Change admin without affecting site
- **Better organization**: Namespace-based file structure

### 4. Developer Experience
- **Faster builds**: Only rebuild changed entry point
- **Better HMR**: Hot reload only affected bundle
- **Easier debugging**: Clear separation of concerns

## 🧪 Testing Matrix

| Test Case | Expected Result |
|-----------|----------------|
| `GET /admin/dashboard` as admin | ✅ Loads `admin/app` template |
| `GET /admin/users` as admin | ✅ Loads `admin/app` template |
| `GET /` as guest | ✅ Loads `site/app` template |
| `GET /dashboard` as user | ✅ Loads `site/app` template |
| `GET /login` as guest | ✅ Loads `site/app` template |
| `GET /settings/profile` as user | ✅ Loads `site/app` template |
| Middleware: `/admin/test` | ✅ Returns `admin/app` |
| Middleware: `/dashboard` | ✅ Returns `site/app` |

## 📝 Configuration Files

### Vite Config (`vite.config.ts`)
```typescript
laravel({
    input: [
        'resources/js/entries/admin.tsx',    // Admin entry
        'resources/js/entries/site.tsx',     // Site entry
    ],
    ssr: [
        'resources/js/entries/admin-ssr.tsx', // Admin SSR
        'resources/js/entries/site-ssr.tsx',  // Site SSR
    ],
})
```

### Middleware (`HandleInertiaRequests.php`)
```php
public function rootView(Request $request): string
{
    if ($request->is('admin') || $request->is('admin/*')) {
        return 'admin/app';
    }
    return 'site/app';
}
```

### Admin Template (`resources/views/admin/app.blade.php`)
```blade
@vite(['resources/js/entries/admin.tsx', "resources/js/pages/{$page['component']}.tsx"])
```

### Site Template (`resources/views/site/app.blade.php`)
```blade
@vite(['resources/js/entries/site.tsx', "resources/js/pages/{$page['component']}.tsx"])
```

## ✅ Verification Checklist

Run: `bash scripts/verify-asset-separation.sh`

Expected output:
```
✅ rootView() method exists
✅ Admin template exists
✅ Admin template loads admin.tsx entry
✅ Site template exists
✅ Site template loads site.tsx entry
✅ Admin entry point exists
✅ Site entry point exists
✅ Vite config includes both entry points
✅ Asset separation tests exist
✅ Documentation exists
```

## 🚀 Quick Commands

```bash
# Verify setup
bash scripts/verify-asset-separation.sh

# Run tests
php artisan test --filter AssetSeparationTest

# Build for production
npm run build

# Development mode
npm run dev

# Check bundle sizes (after build)
ls -lh public/build/assets/*.js
```

---

**Status**: ✅ Fully implemented and verified  
**Last Updated**: 2025-10-18  
**Tested**: Yes (See `tests/Feature/AssetSeparationTest.php`)
