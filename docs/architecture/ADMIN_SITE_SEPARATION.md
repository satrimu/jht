# Admin vs Site Separation Pattern

**Last Updated**: October 16, 2025  
**Pattern**: Strict separation of admin and public contexts  
**Purpose**: Security, maintainability, and clear boundaries  

---

## Overview

This application enforces a **strict separation** between:
- **Admin Panel** - Authenticated, privileged users (role: admin)
- **Public Site** - Anonymous and authenticated regular users

This pattern provides:
✅ **Security** - Clear authorization boundaries  
✅ **Maintainability** - Organized codebase  
✅ **User Experience** - Distinct UI/UX for different user types  
✅ **Scalability** - Easy to extend each context independently  

---

## Architectural Boundaries

### URL Structure

```
Public Site (Site Context)
├── /                    # Homepage
├── /login               # Login page
├── /register            # Registration
├── /forgot-password     # Password reset
└── /dashboard           # User dashboard (authenticated, non-admin)

Admin Panel (Admin Context)
├── /admin/dashboard     # Admin dashboard
├── /admin/users         # User management
├── /admin/settingsapp   # Application settings
├── /admin/audit-logs    # Activity logs
└── /admin/security-logs # Security logs

Settings (Shared, User Context)
├── /settings/profile    # User profile
├── /settings/password   # Change password
├── /settings/appearance # Theme preferences
└── /settings/two-factor-authentication  # 2FA management
```

### Middleware Stack

#### Admin Routes
```php
// routes/admin.php
Route::middleware(['auth', 'verified', 'can:admin'])->group(function () {
    // Admin routes here
});
```

**Middleware Breakdown**:
1. `auth` - Must be authenticated
2. `verified` - Email must be verified
3. `can:admin` - Must have admin role (via Gate)

#### Public Site Routes
```php
// routes/web.php
Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Authenticated user routes
});
```

**Middleware Breakdown**:
1. No middleware - Public access
2. `auth` - Authenticated users (includes admin)
3. `verified` - Email verified

---

## Backend Separation

### Route Files

```
routes/
├── web.php        # Public site routes
├── admin.php      # Admin panel routes (auth + can:admin)
├── auth.php       # Authentication routes (public)
└── settings.php   # User settings routes (auth)
```

**Loading Order** (bootstrap/app.php):
```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',  // First
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // Load additional route files
            Route::middleware('web')
                ->group(base_path('routes/admin.php'));
        },
    )
```

### Controller Organization

```
app/Http/Controllers/
├── Admin/                          # Admin controllers
│   ├── DashboardController.php    # Admin dashboard
│   ├── UserController.php         # User CRUD
│   ├── SettingAppController.php   # App settings
│   └── LogController.php          # Logs viewer
├── Site/                           # Public site controllers
│   └── HomeController.php         # Homepage
├── Auth/                           # Authentication (Fortify)
│   ├── AuthenticatedSessionController.php
│   ├── RegisteredUserController.php
│   └── ...
└── Settings/                       # User settings
    ├── ProfileController.php
    ├── PasswordController.php
    └── TwoFactorAuthenticationController.php
```

### Request Validation

```
app/Http/Requests/
├── Admin/                     # Admin-specific validation
│   ├── StoreUserRequest.php  # Create user (admin only)
│   └── UpdateUserRequest.php # Update user (admin only)
└── Settings/                  # User settings validation
    ├── UpdateProfileRequest.php
    └── UpdatePasswordRequest.php
```

**Example**: Admin authorization in FormRequest

```php
// app/Http/Requests/Admin/StoreUserRequest.php
public function authorize(): bool
{
    return auth()->user()->can('admin');
}

public function rules(): array
{
    return [
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'role' => 'required|string|in:admin,user',  // Admin can set role
        // ...
    ];
}
```

---

## Frontend Separation

### Page Components

```
resources/js/pages/
├── admin/                         # Admin panel pages
│   ├── dashboard.tsx             # Admin dashboard
│   ├── users/
│   │   └── Index.tsx             # User list (CRUD)
│   └── logs/
│       ├── ActivityLog.tsx       # Activity log viewer
│       └── SecurityLog.tsx       # Security log viewer
├── site/                          # Public site pages
│   └── home.tsx                  # Homepage
├── auth/                          # Authentication pages
│   ├── login.tsx                 # Login page
│   ├── register.tsx              # Registration
│   └── two-factor-challenge.tsx  # 2FA verification
├── settings/                      # User settings pages
│   ├── profile.tsx
│   ├── password.tsx
│   ├── appearance.tsx
│   └── two-factor-authentication.tsx
└── dashboard.tsx                  # User dashboard (non-admin)
```

### Layout Components

```
resources/js/layouts/
├── app-layout.tsx      # Admin panel layout (sidebar)
├── site-layout.tsx     # Public site layout (header)
├── auth-layout.tsx     # Authentication pages layout
└── settings-layout.tsx # Settings pages layout
```

**Admin Layout** (AppLayout):
```tsx
// resources/js/layouts/app-layout.tsx
import { AppSidebar } from '@/components/app-sidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';

interface Props {
    children: React.ReactNode;
    breadcrumbs?: Breadcrumb[];
}

export default function AppLayout({ children, breadcrumbs }: Props) {
    return (
        <div className="flex h-screen">
            <AppSidebar />  {/* Admin sidebar navigation */}
            <main className="flex-1 overflow-y-auto p-6">
                {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
                {children}
            </main>
        </div>
    );
}
```

**Site Layout**:
```tsx
// resources/js/layouts/site-layout.tsx
import { AppHeader } from '@/components/app-header';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen">
            <AppHeader />  {/* Public header navigation */}
            <main>{children}</main>
        </div>
    );
}
```

### Navigation Components

**Admin Sidebar** (AppSidebar):
```tsx
// resources/js/components/app-sidebar.tsx
const adminNavItems = [
    { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
    { title: 'Users', href: '/admin/users', icon: Users },
    { title: 'Settings', href: '/admin/settingsapp', icon: Settings },
    { title: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
];
```

**Site Header** (AppHeader):
```tsx
// resources/js/components/app-header.tsx
const siteNavItems = [
    { title: 'Home', href: '/' },
    { title: 'About', href: '/about' },
    { title: 'Contact', href: '/contact' },
];
```

### Vite Entry Points

**Separate entry files** for admin and site:

```
resources/js/entries/
├── admin.tsx  # Admin panel entry (loads admin pages)
└── site.tsx   # Public site entry (loads site pages)
```

**Admin Entry**:
```tsx
// resources/js/entries/admin.tsx
import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('../pages/**/*.tsx', { eager: true });
        return pages[`../pages/${name}.tsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
```

**Blade Template**:
```blade
<!-- resources/views/admin/app.blade.php -->
<!DOCTYPE html>
<html>
<head>
    @vite(['resources/js/entries/admin.tsx'])
    @inertiaHead
</head>
<body>
    @inertia
</body>
</html>
```

---

## Authorization System

### Gate Definition

**File**: `app/Providers/AppServiceProvider.php`

```php
use Illuminate\Support\Facades\Gate;

public function boot(): void
{
    Gate::define('admin', function ($user) {
        return $user->role === 'admin';
    });
}
```

### Usage in Controllers

```php
// Automatic via middleware
Route::middleware(['can:admin'])->group(function () {
    // These routes auto-check authorization
});

// Manual check
public function index()
{
    if (!auth()->user()->can('admin')) {
        abort(403);
    }
    // ...
}

// In FormRequest
public function authorize(): bool
{
    return auth()->user()->can('admin');
}
```

### Usage in Frontend

**Inertia Shared Props**:
```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return [
        'auth' => [
            'user' => $request->user() ? [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'role' => $request->user()->role,
                'is_admin' => $request->user()->role === 'admin',
            ] : null,
        ],
    ];
}
```

**React Component**:
```tsx
import { usePage } from '@inertiajs/react';

export default function MyComponent() {
    const { auth } = usePage().props;
    
    if (auth.user?.is_admin) {
        return <AdminView />;
    }
    
    return <UserView />;
}
```

---

## Data Flow Examples

### Admin Action: Edit User

```
1. Admin clicks "Edit" on user row
   ↓
2. router.visit('/admin/users/123/edit')
   ↓
3. Laravel routing: admin.php → UserController@edit
   ↓
4. Middleware checks:
   - auth: ✅ User authenticated
   - verified: ✅ Email verified
   - can:admin: ✅ User has admin role
   ↓
5. Controller: UserController@edit
   - Fetch user from database
   - Filter sensitive data
   - Return Inertia::render('admin/users/Edit', ['user' => $user])
   ↓
6. Inertia middleware:
   - Add shared props (auth, settings)
   - Filter sensitive fields
   ↓
7. React component receives props
   - Renders admin/users/Edit.tsx
   - Uses AppLayout (admin sidebar)
   ↓
8. Admin sees edit form
```

### Site Action: View Homepage

```
1. Visitor navigates to /
   ↓
2. Laravel routing: web.php → HomeController@index
   ↓
3. No middleware (public access)
   ↓
4. Controller: HomeController@index
   - Fetch public data
   - Return Inertia::render('site/home', ['data' => $data])
   ↓
5. React component receives props
   - Renders site/home.tsx
   - Uses SiteLayout (public header)
   ↓
6. Visitor sees homepage
```

---

## Security Benefits

### 1. Clear Authorization Boundaries

**Problem**: Without separation, easy to accidentally expose admin functionality

**Solution**: 
- Admin routes require explicit `can:admin` middleware
- Admin controllers in separate namespace
- Admin pages in separate directory

### 2. Reduced Attack Surface

**Admin Panel**:
- Only accessible to authenticated admin users
- Separate entry point reduces attack vectors
- Middleware stack enforces authentication at multiple levels

**Public Site**:
- No admin functionality exposed
- Cannot accidentally leak admin routes
- Clear separation in codebase

### 3. Code Maintainability

**Benefits**:
- Easy to find admin vs site code
- Clear file organization
- New developers understand boundaries quickly
- Refactoring is safer (changes in admin don't affect site)

### 4. Testing Isolation

**Admin Tests**:
```php
test('admin can access users list', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);
    
    $response = $this->get('/admin/users');
    $response->assertOk();
});

test('non-admin cannot access users list', function () {
    $user = User::factory()->create(['role' => 'user']);
    $this->actingAs($user);
    
    $response = $this->get('/admin/users');
    $response->assertForbidden();
});
```

---

## Best Practices

### DO ✅

1. **Always use middleware** for admin routes
   ```php
   Route::middleware(['auth', 'verified', 'can:admin'])->group(function () {
       // Admin routes
   });
   ```

2. **Validate authorization** in FormRequest
   ```php
   public function authorize(): bool
   {
       return auth()->user()->can('admin');
   }
   ```

3. **Use separate namespaces**
   ```php
   namespace App\Http\Controllers\Admin;
   ```

4. **Use appropriate layouts**
   ```tsx
   // Admin page
   import AppLayout from '@/layouts/app-layout';
   
   // Site page
   import SiteLayout from '@/layouts/site-layout';
   ```

5. **Filter sensitive data** in Inertia props
   ```php
   return Inertia::render('admin/users/Index', [
       'users' => UserResource::collection($users),  // Use resources
   ]);
   ```

### DON'T ❌

1. **Don't mix admin and site code**
   ```php
   // ❌ Bad
   if ($user->isAdmin()) {
       // Admin logic
   } else {
       // Site logic
   }
   
   // ✅ Good: Separate controllers
   ```

2. **Don't rely on client-side checks only**
   ```tsx
   // ❌ Bad: Only client-side check
   {auth.user.is_admin && <AdminButton />}
   
   // ✅ Good: Server-side middleware + client UI
   ```

3. **Don't expose admin routes without middleware**
   ```php
   // ❌ Bad
   Route::get('/admin/users', [UserController::class, 'index']);
   
   // ✅ Good
   Route::middleware(['can:admin'])->get('/admin/users', ...);
   ```

4. **Don't share layouts** between admin and site
   ```tsx
   // ❌ Bad: One layout for everything
   
   // ✅ Good: Separate layouts
   - AppLayout for admin
   - SiteLayout for public
   ```

---

## Adding New Features

### Adding Admin Feature

1. **Create controller**
   ```bash
   php artisan make:controller Admin/ProductController
   ```

2. **Add routes**
   ```php
   // routes/admin.php
   Route::middleware(['auth', 'verified', 'can:admin'])->group(function () {
       Route::resource('admin/products', ProductController::class);
   });
   ```

3. **Create page components**
   ```
   resources/js/pages/admin/products/
   ├── Index.tsx
   ├── Create.tsx
   └── Edit.tsx
   ```

4. **Use AppLayout**
   ```tsx
   import AppLayout from '@/layouts/app-layout';
   
   export default function Index({ products }) {
       return (
           <AppLayout breadcrumbs={[...]}>
               {/* Content */}
           </AppLayout>
       );
   }
   ```

### Adding Site Feature

1. **Create controller**
   ```bash
   php artisan make:controller Site/BlogController
   ```

2. **Add routes**
   ```php
   // routes/web.php
   Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
   ```

3. **Create page component**
   ```
   resources/js/pages/site/blog/
   └── Index.tsx
   ```

4. **Use SiteLayout**
   ```tsx
   import SiteLayout from '@/layouts/site-layout';
   
   export default function Index({ posts }) {
       return (
           <SiteLayout>
               {/* Content */}
           </SiteLayout>
       );
   }
   ```

---

## Common Pitfalls

### 1. Forgetting Middleware

**Problem**:
```php
Route::get('/admin/secret', [AdminController::class, 'secret']);
// No middleware! Anyone can access
```

**Solution**:
```php
Route::middleware(['can:admin'])->get('/admin/secret', ...);
```

### 2. Hardcoded Role Checks

**Problem**:
```php
if ($user->role === 'admin') {  // Hardcoded
    // ...
}
```

**Solution**:
```php
if ($user->can('admin')) {  // Use Gate
    // ...
}
```

### 3. Exposing Sensitive Data

**Problem**:
```php
return Inertia::render('admin/users/Index', [
    'users' => $users,  // Includes password, tokens, etc.
]);
```

**Solution**:
```php
return Inertia::render('admin/users/Index', [
    'users' => $users->map(fn($u) => [
        'id' => $u->id,
        'name' => $u->name,
        'email' => $u->email,
        'role' => $u->role,
        // Only safe fields
    ]),
]);
```

---

## Testing the Separation

### Authorization Tests

**File**: `tests/Feature/AuthorizationTest.php`

```php
test('admin can access admin dashboard', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);
    
    $response = $this->get('/admin/dashboard');
    $response->assertOk();
});

test('user cannot access admin dashboard', function () {
    $user = User::factory()->create(['role' => 'user']);
    $this->actingAs($user);
    
    $response = $this->get('/admin/dashboard');
    $response->assertForbidden();  // 403
});

test('guest is redirected to login for admin routes', function () {
    $response = $this->get('/admin/dashboard');
    $response->assertRedirect('/login');
});

test('user can access user dashboard', function () {
    $user = User::factory()->create(['role' => 'user']);
    $this->actingAs($user);
    
    $response = $this->get('/dashboard');
    $response->assertOk();
});

test('admin can also access user dashboard', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);
    
    $response = $this->get('/dashboard');
    $response->assertOk();  // Admin can access user routes
});
```

---

## Related Documentation

- **[OVERVIEW.md](OVERVIEW.md)** - System architecture overview
- **[SECURITY_LAYERS.md](SECURITY_LAYERS.md)** - Security architecture
- **[../security-audit/SECURITY_AUDIT_CURRENT.md](../security-audit/SECURITY_AUDIT_CURRENT.md)** - Security audit

---

**Document Version**: 1.0  
**Last Updated**: October 16, 2025  
**Pattern Status**: Active, enforced across codebase
