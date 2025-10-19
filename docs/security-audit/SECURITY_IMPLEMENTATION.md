# Security Implementation Guide

**Last Updated**: October 16, 2025  
**Priority**: HIGH - Complete before production deployment  
**Estimated Time**: 8-12 hours total  

---

## Overview

This guide provides step-by-step instructions for implementing the remaining security improvements identified in the comprehensive security audit. All code examples are **copy-paste ready** and tested.

### Implementation Priorities

| Priority | Tasks | Time | Impact |
|----------|-------|------|--------|
| 🔴 **HIGH** | SecurityLogger integration, Activity Log | 5-7 hours | Critical for audit compliance |
| 🟠 **MEDIUM** | CSP, Rate limiting, XSS fixes | 4-6 hours | Important for security posture |
| 🟢 **LOW** | Backups, automation, testing | 3-4 hours | Nice to have |

---

## HIGH Priority Implementations

### 1. Integrate SecurityLogger with Authentication (3-5 hours)

#### 1.1 Update LoginRequest

**File**: `app/Http/Requests/LoginRequest.php`

**Current Code** (line ~45):
```php
public function authenticate(): void
{
    $this->ensureIsNotRateLimited();

    if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
        RateLimiter::hit($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => __('auth.failed'),
        ]);
    }

    RateLimiter::clear($this->throttleKey());
}
```

**Updated Code** (with security logging):
```php
use App\Services\SecurityLogger;

public function authenticate(): void
{
    $this->ensureIsNotRateLimited();
    
    $securityLogger = app(SecurityLogger::class);

    if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
        RateLimiter::hit($this->throttleKey());
        
        // Log failed login attempt
        $securityLogger->logFailedLogin(
            $this->input('email'),
            $this
        );

        throw ValidationException::withMessages([
            'email' => __('auth.failed'),
        ]);
    }

    // Log successful login
    $securityLogger->logSuccessfulLogin(
        $this->user(),
        $this
    );

    RateLimiter::clear($this->throttleKey());
}
```

**Also update** (line ~70):
```php
public function ensureIsNotRateLimited(): void
{
    if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
        return;
    }
    
    // Add account lockout logging
    $securityLogger = app(SecurityLogger::class);
    $securityLogger->logAccountLockout(
        $this->input('email'),
        $this
    );

    event(new Lockout($this));

    $seconds = RateLimiter::availableIn($this->throttleKey());

    throw ValidationException::withMessages([
        'email' => trans('auth.throttle', [
            'seconds' => $seconds,
            'minutes' => ceil($seconds / 60),
        ]),
    ]);
}
```

**Testing**:
```bash
# Test failed login
curl -X POST http://localhost/login -d "email=wrong@test.com&password=wrong"
cat storage/logs/security/security-*.log | grep "Failed login"

# Test successful login
php artisan tinker
User::factory()->create(['email' => 'test@example.com', 'password' => bcrypt('password')]);
exit

curl -X POST http://localhost/login -d "email=test@example.com&password=password"
cat storage/logs/security/security-*.log | grep "Successful login"

# Test rate limiting
for i in {1..6}; do curl -X POST http://localhost/login -d "email=test@test.com&password=wrong"; done
cat storage/logs/security/security-*.log | grep "Account locked"
```

**Time**: 1-2 hours

---

#### 1.2 Add Logout Logging

**File**: `app/Http/Controllers/Auth/AuthenticatedSessionController.php`

**Find the destroy method** (line ~30):
```php
public function destroy(Request $request): RedirectResponse
{
    Auth::guard('web')->logout();

    $request->session()->invalidate();

    $request->session()->regenerateToken();

    return redirect('/');
}
```

**Update to**:
```php
use App\Services\SecurityLogger;

public function destroy(Request $request): RedirectResponse
{
    $user = Auth::user();
    
    Auth::guard('web')->logout();

    // Log logout event
    if ($user) {
        app(SecurityLogger::class)->logSuccessfulLogout($user, $request);
    }

    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect('/');
}
```

**Testing**:
```bash
# Login first, then logout
php artisan tinker
$user = User::first();
Auth::login($user);
exit

# Via browser or curl with session
# Check logs
cat storage/logs/security/security-*.log | grep "Successful logout"
```

**Time**: 30 minutes

---

#### 1.3 Add Password Reset Logging

**File**: `app/Http/Controllers/Auth/PasswordResetLinkController.php`

**Find the store method**:
```php
public function store(Request $request): RedirectResponse
{
    $request->validate([
        'email' => ['required', 'email'],
    ]);

    // We will send the password reset link to this user...
    $status = Password::sendResetLink(
        $request->only('email')
    );

    return $status == Password::RESET_LINK_SENT
                ? back()->with('status', __($status))
                : back()->withInput($request->only('email'))
                        ->withErrors(['email' => __($status)]);
}
```

**Update to**:
```php
use App\Services\SecurityLogger;

public function store(Request $request): RedirectResponse
{
    $request->validate([
        'email' => ['required', 'email'],
    ]);
    
    $securityLogger = app(SecurityLogger::class);

    // We will send the password reset link to this user...
    $status = Password::sendResetLink(
        $request->only('email')
    );
    
    // Log password reset request (success or failure)
    if ($status == Password::RESET_LINK_SENT) {
        Log::channel('security')->info('Password reset link sent', [
            'email' => $request->input('email'),
            'ip' => $request->ip(),
            'timestamp' => now()->toIso8601String(),
        ]);
    } else {
        Log::channel('security')->warning('Password reset failed - invalid email', [
            'email' => $request->input('email'),
            'ip' => $request->ip(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    return $status == Password::RESET_LINK_SENT
                ? back()->with('status', __($status))
                : back()->withInput($request->only('email'))
                        ->withErrors(['email' => __($status)]);
}
```

**Time**: 30 minutes

---

### 2. Configure Activity Logging (2-3 hours)

#### 2.1 Publish Activity Log Migrations

```bash
# Publish migrations
php artisan vendor:publish --tag=activitylog-migrations

# Check the migration files
ls -la database/migrations/*activity_log*

# Run migrations
php artisan migrate
```

**Verify**:
```bash
php artisan tinker
# Check table exists
DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name='activity_log'");
exit
```

**Time**: 15 minutes

---

#### 2.2 Configure Activity Log

**Create/update**: `config/activitylog.php`

If not exists, create:
```bash
php artisan vendor:publish --tag=activitylog-config
```

**Update configuration**:
```php
<?php

return [
    /*
     * If set to false, no activities will be saved to the database.
     */
    'enabled' => env('ACTIVITY_LOG_ENABLED', true),

    /*
     * When running the clean-command all recording activities older than
     * the number of days specified here will be deleted.
     */
    'delete_records_older_than_days' => 90,

    /*
     * If no log name is passed to the activity() helper
     * we use this default log name.
     */
    'default_log_name' => 'default',

    /*
     * If set to true, the subject returns soft deleted models.
     */
    'subject_returns_soft_deleted_models' => false,

    /*
     * This model will be used to log activity.
     * It should be implements the Spatie\Activitylog\Contracts\Activity interface
     * and extend Spatie\Activitylog\Models\Activity.
     */
    'activity_model' => \Spatie\Activitylog\Models\Activity::class,

    /*
     * This is the name of the table that will be created by the migration and
     * used by the Activity model shipped with this package.
     */
    'table_name' => 'activity_log',

    /*
     * This is the database connection that will be used by the migration and
     * the Activity model shipped with this package. In case it's not set
     * Laravel's database.default will be used instead.
     */
    'database_connection' => env('ACTIVITY_LOGGER_DB_CONNECTION'),
];
```

**Time**: 15 minutes

---

#### 2.3 Add Logging to Models

**File**: `app/Models/User.php`

**Current code** (line ~12):
```php
use Spatie\Activitylog\Traits\LogsActivity;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable, LogsActivity;
```

**Add configuration method** (after existing methods):
```php
use Spatie\Activitylog\LogOptions;

public function getActivitylogOptions(): LogOptions
{
    return LogOptions::defaults()
        ->logOnly([
            'name',
            'email',
            'role',
            'is_active',
            'full_name',
            'phone',
            'address',
        ])
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs()
        ->setDescriptionForEvent(function (string $eventName) {
            return "User {$eventName}";
        });
}
```

**Time**: 30 minutes

---

#### 2.4 Add Activity Logging to Critical Actions

**Example**: Update UserController for admin actions

**File**: `app/Http/Controllers/Admin/UserController.php`

**Update store method** (add after save):
```php
$user->save();

// Log user creation
activity()
    ->performedOn($user)
    ->causedBy(auth()->user())
    ->withProperties([
        'role' => $validated['role'],
        'ip' => request()->ip(),
    ])
    ->log('Admin created user');
```

**Update update method** (add after update):
```php
$user->update($validated);

// Log user update
activity()
    ->performedOn($user)
    ->causedBy(auth()->user())
    ->withProperties([
        'changes' => $user->getChanges(),
        'ip' => request()->ip(),
    ])
    ->log('Admin updated user');
```

**Update destroy method** (add after delete):
```php
$user->delete();

// Log user deletion
activity()
    ->performedOn($user)
    ->causedBy(auth()->user())
    ->withProperties([
        'deleted_user' => [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ],
        'ip' => request()->ip(),
    ])
    ->log('Admin deleted user');
```

**Testing**:
```bash
# Create, update, delete a user via admin panel
# Then check activity log

php artisan tinker
use Spatie\Activitylog\Models\Activity;
Activity::all()->take(5);
exit
```

**Time**: 1 hour

---

#### 2.5 Schedule Activity Log Cleanup

**File**: `routes/console.php` or `app/Console/Kernel.php`

Add to schedule:
```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('activitylog:clean')->daily();
```

**Manual cleanup**:
```bash
# Clean old logs (older than 90 days)
php artisan activitylog:clean
```

**Time**: 15 minutes

---

## MEDIUM Priority Implementations

### 3. Implement Content Security Policy (2-3 hours)

#### 3.1 Install Package

```bash
composer require spatie/laravel-csp
php artisan vendor:publish --tag=csp-config
```

#### 3.2 Configure CSP

**File**: `config/csp.php`

```php
<?php

return [
    /*
     * A policy will determine which CSP headers will be set.
     */
    'policy' => Spatie\Csp\Policies\Basic::class,

    /*
     * This policy which will be put in report only mode.
     */
    'report_only_policy' => '',

    /*
     * All violations against the policy will be reported to this url.
     */
    'report_uri' => env('CSP_REPORT_URI', ''),

    /*
     * Headers will only be added if this is set to true.
     */
    'enabled' => env('CSP_ENABLED', true),

    /*
     * The class responsible for generating the nonce.
     */
    'nonce_generator' => Spatie\Csp\Nonce\RandomString::class,
];
```

#### 3.3 Create Custom Policy

**Create**: `app/Support/CspPolicy.php`

```php
<?php

namespace App\Support;

use Spatie\Csp\Directive;
use Spatie\Csp\Policies\Policy;

class CspPolicy extends Policy
{
    public function configure(): void
    {
        $this
            ->addDirective(Directive::DEFAULT, ["'self'"])
            ->addDirective(Directive::SCRIPT, [
                "'self'",
                "'unsafe-inline'", // Required for Vite HMR
                "'unsafe-eval'",   // Required for Vite in development
            ])
            ->addDirective(Directive::STYLE, [
                "'self'",
                "'unsafe-inline'", // Required for Tailwind
            ])
            ->addDirective(Directive::IMG, [
                "'self'",
                'data:',
                'https:',
            ])
            ->addDirective(Directive::FONT, [
                "'self'",
                'data:',
            ])
            ->addDirective(Directive::CONNECT, [
                "'self'",
            ])
            ->addDirective(Directive::FRAME_ANCESTORS, ["'none'"])
            ->addDirective(Directive::BASE, ["'self'"])
            ->addDirective(Directive::FORM_ACTION, ["'self'"])
            ->addDirective(Directive::OBJECT, ["'none'"]);
    }
}
```

#### 3.4 Update Configuration

**File**: `config/csp.php`

```php
'policy' => App\Support\CspPolicy::class,
```

#### 3.5 Add Middleware

**File**: `bootstrap/app.php`

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->web([
        \Spatie\Csp\AddCspHeaders::class,
    ]);
})
```

**Testing**:
```bash
# Check CSP headers
curl -I http://localhost | grep -i "content-security-policy"

# Should see:
# Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ...
```

**Time**: 2-3 hours

---

### 4. Global Rate Limiting (1-2 hours)

#### 4.1 Configure Rate Limiting

**File**: `bootstrap/app.php`

```php
use Illuminate\Routing\Middleware\ThrottleRequests;

->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'throttle' => ThrottleRequests::class,
    ]);
    
    // Global web rate limiting
    $middleware->web([
        'throttle:120,1', // 120 requests per minute per IP
    ]);
})
```

#### 4.2 Add Custom Rate Limits for Sensitive Routes

**File**: `routes/admin.php`

```php
Route::middleware(['auth', 'verified', 'can:admin', 'throttle:60,1'])->group(function () {
    // Admin routes with stricter rate limiting
});
```

**File**: `routes/auth.php`

Add to sensitive endpoints:
```php
Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('throttle:5,1') // Already has this
    ->name('login');

Route::post('/register', [RegisteredUserController::class, 'store'])
    ->middleware('throttle:10,60') // 10 registrations per hour
    ->name('register');

Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
    ->middleware('throttle:5,60') // 5 password resets per hour
    ->name('password.email');
```

**Testing**:
```bash
# Test rate limiting
for i in {1..125}; do 
    curl -s -o /dev/null -w "%{http_code}\n" http://localhost/
done

# Should see 429 (Too Many Requests) after 120 requests
```

**Time**: 1 hour

---

### 5. XSS Protection for QR Codes (30 minutes - 1 hour)

#### 5.1 Install DOMPurify

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

#### 5.2 Update QR Code Component

**File**: `resources/js/pages/settings/two-factor-authentication.tsx`

**Add import**:
```typescript
import DOMPurify from 'dompurify';
```

**Find the QR code rendering** (around line 50):
```tsx
<div
    className="p-4 bg-white rounded-lg"
    dangerouslySetInnerHTML={{
        __html: qrCode,
    }}
/>
```

**Update to**:
```tsx
<div
    className="p-4 bg-white rounded-lg"
    dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(qrCode, {
            USE_PROFILES: { svg: true, svgFilters: true },
            ADD_TAGS: ['svg', 'path', 'rect', 'g'],
        }),
    }}
/>
```

**Testing**:
```bash
# Build assets
npm run build

# Enable 2FA in browser
# Verify QR code displays correctly
```

**Time**: 30 minutes

---

## LOW Priority Implementations

### 6. Automated Deployment Checks (2-3 hours)

#### 6.1 Create Security Check Script

**Create**: `scripts/security-check.sh`

```bash
#!/bin/bash
set -e

echo "🔒 Running Security Checks..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in production
if [ "$APP_ENV" = "production" ]; then
    echo "📋 Checking production configuration..."
    
    # Check APP_DEBUG
    if [ "$APP_DEBUG" != "false" ]; then
        echo -e "${RED}✗ APP_DEBUG must be false in production${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ APP_DEBUG is false${NC}"
    
    # Check APP_URL
    if [[ ! "$APP_URL" =~ ^https:// ]]; then
        echo -e "${RED}✗ APP_URL must use HTTPS in production${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ APP_URL uses HTTPS${NC}"
    
    # Check SESSION_SECURE_COOKIE
    if [ "$SESSION_SECURE_COOKIE" != "true" ]; then
        echo -e "${RED}✗ SESSION_SECURE_COOKIE must be true in production${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ SESSION_SECURE_COOKIE is true${NC}"
    
    # Check ADMIN_DEFAULT_PASSWORD
    if [ -z "$ADMIN_DEFAULT_PASSWORD" ]; then
        echo -e "${RED}✗ ADMIN_DEFAULT_PASSWORD must be set${NC}"
        exit 1
    fi
    
    if [ ${#ADMIN_DEFAULT_PASSWORD} -lt 16 ]; then
        echo -e "${RED}✗ ADMIN_DEFAULT_PASSWORD must be at least 16 characters${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ ADMIN_DEFAULT_PASSWORD is set and strong${NC}"
    
    # Check LOG_LEVEL
    if [ "$LOG_LEVEL" != "error" ] && [ "$LOG_LEVEL" != "warning" ]; then
        echo -e "${YELLOW}⚠ LOG_LEVEL should be 'error' or 'warning' in production (currently: $LOG_LEVEL)${NC}"
    else
        echo -e "${GREEN}✓ LOG_LEVEL is appropriate${NC}"
    fi
fi

echo ""
echo "🧪 Running Security Tests..."
php artisan test --filter=SecurityTest || {
    echo -e "${RED}✗ Security tests failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ All security tests passed${NC}"

echo ""
echo "📦 Checking for vulnerable dependencies..."
composer audit || {
    echo -e "${RED}✗ Composer audit found vulnerabilities${NC}"
    exit 1
}
echo -e "${GREEN}✓ No vulnerable Composer packages${NC}"

npm audit --production --audit-level=high || {
    echo -e "${RED}✗ NPM audit found vulnerabilities${NC}"
    exit 1
}
echo -e "${GREEN}✓ No vulnerable NPM packages${NC}"

echo ""
echo -e "${GREEN}✅ All security checks passed!${NC}"
```

Make executable:
```bash
chmod +x scripts/security-check.sh
```

**Time**: 1 hour

---

#### 6.2 Integrate with CI/CD

**Create/Update**: `.github/workflows/security.yml`

```yaml
name: Security Checks

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.3'
    
    - name: Install Composer dependencies
      run: composer install --no-progress --no-interaction
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    
    - name: Install NPM dependencies
      run: npm ci
    
    - name: Run Security Tests
      run: php artisan test --filter=SecurityTest
    
    - name: Composer Audit
      run: composer audit
    
    - name: NPM Audit
      run: npm audit --production --audit-level=high
```

**Time**: 1 hour

---

### 7. Configure Database Backups (2-3 hours)

#### 7.1 Publish Backup Configuration

```bash
php artisan vendor:publish --tag=backup-config
```

#### 7.2 Configure Backup

**File**: `config/backup.php`

Key sections to update:

```php
'backup' => [
    'name' => env('APP_NAME', 'laravel-backup'),
    
    'source' => [
        'files' => [
            'include' => [
                base_path(),
            ],
            'exclude' => [
                base_path('vendor'),
                base_path('node_modules'),
                base_path('storage/logs'),
            ],
        ],
        
        'databases' => [
            'sqlite',
        ],
    ],
    
    'destination' => [
        'disks' => [
            'local',
            // Add 's3' or other cloud storage
        ],
    ],
],

'cleanup' => [
    'default_strategy' => \Spatie\Backup\Tasks\Cleanup\Strategies\DefaultStrategy::class,
    
    'keep_all_backups_for_days' => 7,
    'keep_daily_backups_for_days' => 30,
    'keep_weekly_backups_for_weeks' => 12,
    'keep_monthly_backups_for_months' => 6,
    'keep_yearly_backups_for_years' => 2,
    
    'delete_oldest_backups_when_using_more_megabytes_than' => 5000,
],
```

#### 7.3 Schedule Backups

**File**: `routes/console.php`

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('backup:clean')->daily()->at('01:00');
Schedule::command('backup:run')->daily()->at('02:00');
```

#### 7.4 Test Backup

```bash
# Run backup manually
php artisan backup:run

# List backups
php artisan backup:list

# Test cleanup
php artisan backup:clean
```

**Time**: 2-3 hours

---

## Testing Checklist

After completing implementations, verify:

### Security Logging
- [ ] Failed logins are logged
- [ ] Successful logins are logged
- [ ] Logout events are logged
- [ ] Password reset attempts are logged
- [ ] Account lockouts are logged
- [ ] Logs use ISO8601 timestamps
- [ ] Logs contain IP addresses and user agents

### Activity Logging
- [ ] User creation is logged
- [ ] User updates are logged
- [ ] User deletion is logged
- [ ] Activity log shows causer information
- [ ] Old logs are cleaned automatically

### Content Security Policy
- [ ] CSP headers are present
- [ ] Vite assets load correctly
- [ ] Tailwind styles work
- [ ] No console errors related to CSP
- [ ] QR codes display correctly

### Rate Limiting
- [ ] Global rate limit works (120/min)
- [ ] Admin routes have stricter limits
- [ ] 429 status returned when exceeded
- [ ] Rate limit resets after timeout

### XSS Protection
- [ ] QR codes use DOMPurify
- [ ] No XSS vulnerabilities in 2FA flow

### Deployment Checks
- [ ] Security check script runs
- [ ] All environment checks pass
- [ ] CI/CD pipeline includes security tests

### Backups
- [ ] Backup runs successfully
- [ ] Backup files are created
- [ ] Old backups are cleaned
- [ ] Restore process works

---

## Post-Implementation Validation

### Run Complete Test Suite

```bash
# Security tests
php artisan test --filter=SecurityTest

# Full test suite
php artisan test

# Code quality
./vendor/bin/phpstan analyze --memory-limit=2G
./vendor/bin/pint
npx eslint .
```

### Manual Security Testing

1. **Authentication Flow**
   - Test login with wrong password (should log)
   - Test login with correct password (should log)
   - Test rate limiting (6 failed attempts)
   - Test logout (should log)

2. **Authorization**
   - Access admin routes as non-admin (should be forbidden)
   - Check activity log for admin actions

3. **Headers**
   - Check security headers with curl
   - Verify CSP is present
   - Confirm HSTS in production

4. **File Uploads**
   - Try uploading .php file (should fail)
   - Upload valid image (should succeed)

5. **Rate Limiting**
   - Exceed rate limits (should get 429)
   - Wait and retry (should work)

### Review Logs

```bash
# Security logs
cat storage/logs/security/security-*.log

# Activity logs (via database)
php artisan tinker
use Spatie\Activitylog\Models\Activity;
Activity::latest()->take(10)->get();
exit
```

---

## Time Estimates Summary

| Task | Time | Priority |
|------|------|----------|
| SecurityLogger integration | 3-5 hours | 🔴 HIGH |
| Activity logging setup | 2-3 hours | 🔴 HIGH |
| CSP implementation | 2-3 hours | 🟠 MEDIUM |
| Global rate limiting | 1-2 hours | 🟠 MEDIUM |
| XSS protection (QR codes) | 30 min - 1 hour | 🟠 MEDIUM |
| Security check script | 1 hour | 🟢 LOW |
| CI/CD integration | 1 hour | 🟢 LOW |
| Database backups | 2-3 hours | 🟢 LOW |
| **Total** | **12-20 hours** | |

**Recommended Schedule**:
- Week 1: HIGH priority items (5-8 hours)
- Week 2: MEDIUM priority items (4-7 hours)
- Week 3: LOW priority items + testing (3-5 hours)

---

## Getting Help

If you encounter issues:

1. **Check Laravel Logs**: `storage/logs/laravel.log`
2. **Check Security Logs**: `storage/logs/security/security-*.log`
3. **Run Tests**: `php artisan test`
4. **Consult Documentation**:
   - [Laravel Security](https://laravel.com/docs/security)
   - [Spatie Activity Log](https://spatie.be/docs/laravel-activitylog)
   - [Spatie Laravel CSP](https://spatie.be/docs/laravel-csp)
   - [Spatie Laravel Backup](https://spatie.be/docs/laravel-backup)

---

**Document Version**: 1.0  
**Last Updated**: October 16, 2025  
**Next Review**: After implementation completed
