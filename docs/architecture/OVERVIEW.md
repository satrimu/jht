# Architecture Overview

**Last Updated**: October 16, 2025  
**Application**: Fullstack Laravel React Starter  
**Version**: 1.0.0  

---

## System Architecture

### Technology Stack

#### Backend
- **Laravel 12** - PHP framework with elegant syntax and powerful features
- **PHP 8.3+** - Modern PHP with type safety and performance
- **SQLite** - Lightweight database for development (supports PostgreSQL, MySQL in production)
- **Laravel Fortify** - Authentication scaffolding with 2FA support

#### Frontend
- **React 19** - Modern component-based UI library
- **TypeScript** - Type-safe JavaScript for better developer experience
- **Inertia.js 2.1** - Modern monolith approach (no separate API needed)
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Accessible, customizable component library

#### Build Tools
- **Vite** - Fast build tool with HMR (Hot Module Replacement)
- **Laravel Vite Plugin** - Seamless Laravel-Vite integration
- **ESLint** - TypeScript/React linting
- **Prettier** - Code formatting
- **PHPStan (Level 5)** - PHP static analysis
- **Laravel Pint** - PHP code formatting (PSR-12)

---

## Architectural Patterns

### 1. Admin vs Site Separation

The application follows a **strict separation** between admin (authenticated, privileged) and site (public) contexts.

```
┌─────────────────────────────────────────────────────────────┐
│                        Application                           │
├─────────────────────────────┬───────────────────────────────┤
│         ADMIN PANEL         │         PUBLIC SITE           │
│    (/admin/*, /settings/*)  │        (/, /login, etc)       │
├─────────────────────────────┼───────────────────────────────┤
│ • Authenticated users only  │ • Public access               │
│ • Role: admin required      │ • Anonymous & authenticated   │
│ • Sidebar navigation        │ • Header navigation           │
│ • AppSidebar layout         │ • AppHeader layout            │
│ • admin.php routes          │ • web.php routes              │
│ • Admin controllers         │ • Site controllers            │
│ • resources/js/pages/admin/ │ • resources/js/pages/site/    │
└─────────────────────────────┴───────────────────────────────┘
```

**See detailed documentation**: [ADMIN_SITE_SEPARATION.md](ADMIN_SITE_SEPARATION.md)

---

### 2. Security Layers

Multi-layered security approach:

```
┌──────────────────────────────────────────────────────────┐
│  Layer 1: Infrastructure (HTTPS, HSTS, Firewall)         │
├──────────────────────────────────────────────────────────┤
│  Layer 2: Application (Laravel Security Middleware)      │
├──────────────────────────────────────────────────────────┤
│  Layer 3: Authentication (Fortify, 2FA)                  │
├──────────────────────────────────────────────────────────┤
│  Layer 4: Authorization (Gates, Policies, RBAC)          │
├──────────────────────────────────────────────────────────┤
│  Layer 5: Input Validation (FormRequest, Type Checking)  │
├──────────────────────────────────────────────────────────┤
│  Layer 6: Output Filtering (Inertia Props, React Escape) │
├──────────────────────────────────────────────────────────┤
│  Layer 7: Logging & Monitoring (Security, Activity Logs) │
└──────────────────────────────────────────────────────────┘
```

**See detailed documentation**: [SECURITY_LAYERS.md](SECURITY_LAYERS.md)

---

### 3. Monolithic Frontend Architecture (Inertia.js)

```
┌───────────────────────────────────────────────────────┐
│                    Laravel Backend                     │
│  ┌─────────────────────────────────────────────────┐  │
│  │              Controllers                         │  │
│  │  • Process requests                             │  │
│  │  • Query database                               │  │
│  │  • Return Inertia::render()                     │  │
│  └─────────────┬───────────────────────────────────┘  │
│                │ Inertia Props                         │
│                ▼                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │         Inertia Middleware                      │  │
│  │  • Filter sensitive data                        │  │
│  │  • Add shared props (auth, settings)            │  │
│  │  • Inject CSRF tokens                           │  │
│  └─────────────┬───────────────────────────────────┘  │
└────────────────┼──────────────────────────────────────┘
                 │ JSON Response
                 ▼
┌───────────────────────────────────────────────────────┐
│                   React Frontend                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │              Inertia Page                        │  │
│  │  • Receives props                               │  │
│  │  • Renders UI                                   │  │
│  │  • Handles user interactions                    │  │
│  └─────────────┬───────────────────────────────────┘  │
│                │ Form Submissions / Requests           │
│                ▼                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │         Inertia Router                          │  │
│  │  • useForm() for forms                          │  │
│  │  • router.visit() for navigation                │  │
│  │  • Auto CSRF handling                           │  │
│  └─────────────┬───────────────────────────────────┘  │
└────────────────┼──────────────────────────────────────┘
                 │ HTTP Request
                 ▼
        Back to Laravel Backend
```

**Benefits**:
- No separate API to maintain
- Server-side routing
- Type-safe props with TypeScript
- Automatic CSRF protection
- Fast page transitions (SPA-like)

---

## Directory Structure

### Backend Structure

```
app/
├── Console/                    # Artisan commands
├── Helpers/                    # Helper functions
├── Http/
│   ├── Controllers/
│   │   ├── Admin/             # Admin panel controllers
│   │   ├── Auth/              # Authentication controllers
│   │   ├── Settings/          # User settings controllers
│   │   └── Site/              # Public site controllers
│   ├── Middleware/            # Request/response middleware
│   │   ├── HandleInertiaRequests.php  # Inertia shared props
│   │   ├── SecurityHeaders.php        # Security headers
│   │   └── HandleAppearance.php       # Theme preference
│   └── Requests/              # FormRequest validation
│       └── Admin/             # Admin-specific validation
├── Models/                    # Eloquent models
├── Observers/                 # Model observers
├── Providers/                 # Service providers
│   └── AppServiceProvider.php # App configuration, Gates
└── Services/                  # Business logic services
    ├── ImageUploadService.php # Secure file uploads
    └── SecurityLogger.php     # Security event logging

config/                        # Configuration files
├── logging.php               # Security log channel
├── fortify.php               # 2FA & auth config
└── app.php                   # Application config

database/
├── migrations/               # Database schema
└── seeders/                  # Database seeders
    └── UserSeeder.php        # Secure user seeding

routes/
├── web.php                   # Public routes
├── admin.php                 # Admin routes (auth + can:admin)
├── auth.php                  # Authentication routes
└── settings.php              # Settings routes
```

### Frontend Structure

```
resources/js/
├── entries/                   # Vite entry points
│   ├── admin.tsx             # Admin panel entry
│   └── site.tsx              # Public site entry
├── pages/                     # Inertia page components
│   ├── admin/                # Admin pages
│   │   ├── dashboard.tsx
│   │   ├── users/
│   │   └── settings/
│   ├── auth/                 # Authentication pages
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── two-factor-challenge.tsx
│   ├── settings/             # User settings pages
│   │   ├── profile.tsx
│   │   ├── password.tsx
│   │   └── two-factor-authentication.tsx
│   ├── site/                 # Public site pages
│   │   └── home.tsx
│   └── dashboard.tsx         # User dashboard
├── layouts/                   # Layout components
│   ├── app-layout.tsx        # Admin layout (with sidebar)
│   ├── auth-layout.tsx       # Auth pages layout
│   ├── settings-layout.tsx   # Settings pages layout
│   └── site-layout.tsx       # Public site layout (with header)
├── components/                # Reusable components
│   ├── ui/                   # shadcn/ui components
│   ├── app-sidebar.tsx       # Admin sidebar
│   ├── app-header.tsx        # Site header
│   ├── breadcrumbs.tsx       # Navigation breadcrumbs
│   └── theme-toggle.tsx      # Dark/light mode toggle
├── hooks/                     # Custom React hooks
│   ├── use-theme.ts          # Theme management
│   └── use-toast.ts          # Toast notifications
├── lib/                       # Utility functions
│   └── utils.ts              # Tailwind class merging, etc.
└── types/                     # TypeScript type definitions
    ├── index.d.ts            # Global types
    └── inertia.d.ts          # Inertia types

resources/views/
├── admin/
│   └── app.blade.php         # Admin Vite entry loader
└── site/
    └── app.blade.php         # Site Vite entry loader
```

---

## Data Flow

### 1. Request Flow (Admin Panel Example)

```
User clicks "Edit User"
    ↓
router.visit('/admin/users/123/edit')  [Inertia]
    ↓
Laravel routes to UserController@edit
    ↓
Controller checks authorization (can:admin)
    ↓
Controller fetches user from database
    ↓
Controller filters sensitive data
    ↓
Controller returns Inertia::render('admin/users/Edit', ['user' => $user])
    ↓
Inertia middleware adds shared props (auth, settings)
    ↓
JSON response sent to frontend
    ↓
React renders admin/users/Edit.tsx with props
    ↓
User sees edit form
```

### 2. Form Submission Flow

```
User submits form
    ↓
useForm() hook in React component
    ↓
form.post('/admin/users/123')  [Inertia, includes CSRF]
    ↓
Laravel routes to UserController@update
    ↓
FormRequest validates input (UpdateUserRequest)
    ↓
FormRequest checks authorization
    ↓
Controller updates user in database
    ↓
Activity logged (spatie/laravel-activitylog)
    ↓
Controller redirects or returns Inertia response
    ↓
React component receives success/error state
    ↓
Toast notification displayed
```

### 3. Authentication Flow

```
User submits login form
    ↓
form.post('/login')  [Inertia]
    ↓
Laravel Fortify's LoginRequest
    ↓
Rate limiting check (5 attempts)
    ↓
Authentication attempt
    ↓
If successful: SecurityLogger.logSuccessfulLogin()
    ↓
If 2FA enabled: redirect to 2FA challenge
    ↓
If no 2FA: redirect to intended page or dashboard
    ↓
User authenticated, session created
```

---

## Component Patterns

### 1. Page Components

**Location**: `resources/js/pages/`

**Pattern**:
```tsx
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface Props {
    users: User[];
    breadcrumbs: Breadcrumb[];
}

export default function Index({ users, breadcrumbs }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            {/* Page content */}
        </AppLayout>
    );
}
```

### 2. Layout Components

**Location**: `resources/js/layouts/`

**Pattern**:
```tsx
interface Props {
    children: React.ReactNode;
    breadcrumbs?: Breadcrumb[];
}

export default function AppLayout({ children, breadcrumbs }: Props) {
    return (
        <div className="flex h-screen">
            <AppSidebar />
            <main className="flex-1 overflow-y-auto">
                {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
                {children}
            </main>
        </div>
    );
}
```

### 3. Form Handling

**Pattern using Inertia's useForm**:
```tsx
import { useForm } from '@inertiajs/react';

const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
});

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/users', {
        onSuccess: () => toast.success('User created'),
        onError: () => toast.error('Failed to create user'),
    });
};
```

---

## Code Quality Standards

### Backend (PHP)

#### PHPStan Level 5
```php
// ✅ Good: Explicit types everywhere
public function store(StoreUserRequest $request): RedirectResponse
{
    $validated = $request->validated();
    $user = User::create($validated);
    
    return redirect()->route('admin.users.index');
}

// ❌ Bad: No type hints
public function store($request)
{
    $user = User::create($request->all());
    return back();
}
```

#### Laravel Pint (PSR-12)
- Automatic formatting
- Constructor property promotion
- Consistent spacing and indentation

### Frontend (TypeScript/React)

#### ESLint Rules
```tsx
// ✅ Good: Explicit interface
interface UserProps {
    user: User;
    onUpdate: (user: User) => void;
}

export function UserCard({ user, onUpdate }: UserProps) {
    // ...
}

// ❌ Bad: any types
export function UserCard(props: any) {
    // ...
}
```

#### Type Safety
- No `any` types
- Explicit prop interfaces
- Type-safe API calls with Inertia

---

## Performance Considerations

### Backend Optimization

1. **Eager Loading** - Prevent N+1 queries
   ```php
   $users = User::with('roles', 'permissions')->paginate(15);
   ```

2. **Caching** - Cache expensive queries
   ```php
   $settings = Cache::remember('app_settings', 3600, function () {
       return Setting::all();
   });
   ```

3. **Database Indexes** - Add indexes for frequently queried columns
   ```php
   $table->index('email');
   $table->index(['role', 'is_active']);
   ```

### Frontend Optimization

1. **Code Splitting** - Vite automatically splits code by route

2. **Lazy Loading** - Lazy load heavy components
   ```tsx
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   ```

3. **Memoization** - Use React.memo for expensive components
   ```tsx
   export default memo(ExpensiveComponent);
   ```

---

## Testing Strategy

### Backend Tests (Pest PHP)

```php
test('admin can create user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);
    
    $response = $this->post('/admin/users', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        // ...
    ]);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
});
```

### Security Tests

Location: `tests/Feature/Security/SecurityTest.php`

- Security headers validation
- Sensitive data exposure prevention
- Authorization checks
- Rate limiting
- SQL injection prevention
- File upload validation

**Command**: `php artisan test --filter=SecurityTest`

---

## Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────────────────┐
│              Load Balancer / CDN                 │
│                   (CloudFlare)                   │
└─────────────┬───────────────────────────────────┘
              │ HTTPS
              ▼
┌─────────────────────────────────────────────────┐
│              Web Server (Nginx)                  │
│  • SSL termination                              │
│  • Static file serving                          │
│  • Reverse proxy to PHP-FPM                     │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│           Application Server (PHP-FPM)           │
│  • Laravel application                          │
│  • Opcache enabled                              │
│  • Queue workers                                │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│              Database (PostgreSQL)               │
│  • Primary + Read replicas                      │
│  • Automated backups                            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                Cache (Redis)                     │
│  • Session storage                              │
│  • Application cache                            │
│  • Queue driver                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│            File Storage (S3/Minio)               │
│  • User uploads                                 │
│  • Backups                                      │
└─────────────────────────────────────────────────┘
```

### Environment Requirements

**Production**:
- PHP 8.3+
- Node.js 20+ (for build)
- PostgreSQL 15+ or MySQL 8+
- Redis 7+
- SSL certificate
- 2GB+ RAM
- 2+ CPU cores

**Development**:
- PHP 8.3+
- Node.js 20+
- SQLite (default)
- 1GB RAM

---

## Security Architecture

See detailed documentation:
- **[SECURITY_LAYERS.md](SECURITY_LAYERS.md)** - Comprehensive security layers explanation
- **[../security-audit/SECURITY_AUDIT_CURRENT.md](../security-audit/SECURITY_AUDIT_CURRENT.md)** - Security audit report
- **[../security-audit/SECURITY_IMPLEMENTATION.md](../security-audit/SECURITY_IMPLEMENTATION.md)** - Implementation guide

---

## Extension Points

### Adding New Features

1. **New Admin Resource**:
   - Create controller in `app/Http/Controllers/Admin/`
   - Add routes in `routes/admin.php` with `can:admin` middleware
   - Create page components in `resources/js/pages/admin/`
   - Create FormRequest validation
   - Add tests

2. **New Public Page**:
   - Create controller in `app/Http/Controllers/Site/`
   - Add routes in `routes/web.php`
   - Create page components in `resources/js/pages/site/`
   - Use `site-layout.tsx`

3. **New Service**:
   - Create in `app/Services/`
   - Inject in controllers via dependency injection
   - Add tests

---

## Related Documentation

- **[ADMIN_SITE_SEPARATION.md](ADMIN_SITE_SEPARATION.md)** - Detailed admin vs site pattern
- **[SECURITY_LAYERS.md](SECURITY_LAYERS.md)** - Security architecture
- **[../../README.md](../../README.md)** - Project overview and setup
- **[../../SECURITY_README.md](../../SECURITY_README.md)** - Security documentation hub

---

**Document Version**: 1.0  
**Last Updated**: October 16, 2025  
**Maintained By**: Development Team
