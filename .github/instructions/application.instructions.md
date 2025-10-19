---
applyTo: '**'
---

# laravel.instructions.md — Petunjuk untuk GitHub Copilot
Tujuan: Panduan ringkas, preskriptif, dan mesin‑readable untuk GitHub Copilot saat menghasilkan atau memodifikasi kode dalam repository Laravel 12 + React + Inertia yang memakai shadcn/ui, dengan pemisahan jelas antara Admin (dashboard) dan Site (public).

Bahasa: Bahasa Indonesia (penjelasan). Kode tetap dalam bahasa Inggris.

--------------------------------------------------------------------------------
## Domain Aplikasi: Jaminan Hari Tua (JHT)

**Konteks Bisnis**: Ini adalah aplikasi Jaminan Hari Tua (JHT) yang mengelola iuran rutin bulanan dari anggota. Aplikasi memiliki pemisahan jelas antara anggota (members) dan admin dengan workflow pembayaran yang memerlukan validasi admin.

**Business Flow Utama**:
1. Anggota mendaftar dan mengelola profil
2. Anggota melakukan setoran iuran dengan upload bukti pembayaran
3. Admin memvalidasi pembayaran yang dikirim anggota
4. Admin dapat input iuran langsung untuk anggota
5. Sistem menghasilkan laporan individual dan general

### Fitur Anggota (Site/Member Area):
- **Registrasi & Profil**: Pendaftaran anggota baru dan edit profil personal
- **Setoran Iuran**: Input pembayaran dengan upload bukti transfer/pembayaran
- **Laporan Individual**: Riwayat iuran, saldo, dan status pembayaran personal
- **Dashboard Member**: Ringkasan status iuran dan informasi akun
- **Mobile-First Design**: Optimized untuk penggunaan mobile device

### Fitur Admin (Admin Dashboard):
- **Konfigurasi Aplikasi**: Settings global, tarif iuran, periode pembayaran
- **Management Anggota**: CRUD anggota, status keanggotaan, data personal
- **Input Iuran Manual**: Admin input pembayaran langsung untuk anggota
- **Validasi Pembayaran**: Approve/reject pembayaran yang disubmit anggota
- **Laporan Individual**: Detail iuran per anggota dengan filter dan export
- **Laporan General**: Laporan bulanan, tahunan, dan keseluruhan sistem
- **Dashboard Admin**: Ringkasan aktivitas, statistik pembayaran, alerts

**Model Data Utama**: User (anggota), Payment (iuran), PaymentValidation (validasi admin), Report (laporan), Setting (konfigurasi)

**Workflow Pembayaran**:
- Anggota submit payment + bukti → Status: "pending"
- Admin review → Approve (status: "validated") atau Reject (status: "rejected")
- Admin input manual → Langsung status: "validated"

**Role & Permission**:
- **Member**: Akses site area, manage profile, submit payments, view personal reports
- **Admin**: Full access admin area, validate payments, manage all data, generate reports  

--------------------------------------------------------------------------------
Aturan Utama (MUST)
- Jangan generate secrets, API keys, atau file .env. Jika butuh, gunakan placeholder environment variable.
- Gunakan FormRequest untuk validasi (app/Http/Requests/*).
- Gunakan Policies/Gates untuk otorisasi dan register di AuthServiceProvider.
- Depend on abstractions: inject interfaces (app/Repositories/Contracts/*) di constructor, bind implementasi di ServiceProvider.
- Untuk operasi create/update/delete, gunakan Inertia useForm atau router.* di frontend agar CSRF dan error handling otomatis.
- Eager-load relasi pada controller/repository untuk menghindari N+1 (->with(...)).
- Jangan expose sensitive fields di props Inertia (passwords, tokens, internal paths).
- Semua icon-only buttons harus memiliki aria-label. Modal harus trap focus.

--------------------------------------------------------------------------------
Struktur & Penempatan File (Copilot harus patuhi)
Backend
- Controllers:
  - Admin: app/Http/Controllers/Admin/*
  - Site:  app/Http/Controllers/Site/*
- Requests: app/Http/Requests/*
- Models: app/Models/*
- Policies: app/Policies/*
- Repositories: app/Repositories/Contracts/* and app/Repositories/Eloquent/*
- Services: app/Services/*
- Routes:
  - Admin routes in routes/admin.php (included via RouteServiceProvider)
  - Site/public routes in routes/web.php

Frontend (Inertia + React + shadcn/ui)
- Vite entries:
  - resources/js/entries/admin.tsx
  - resources/js/entries/site.tsx
- Pages (Inertia components):
  - resources/js/pages/admin/...
  - resources/js/pages/site/...
- Shared UI/hooks/types:
  - resources/js/pages/shared/ui/*
  - resources/js/pages/shared/hooks/*
  - resources/js/pages/shared/types/*
- Blade wrappers:
  - resources/views/admin/app.blade.php  (mounts admin entry)
  - resources/views/site/app.blade.php   (mounts site entry)

Vite alias: configure '@' to point to resources/js/pages so imports use '@/shared/ui/...' etc.

--------------------------------------------------------------------------------
Code Generation Rules (detailed, MUST)
When Copilot creates a new admin resource page (example: Payments), perform all of the following in same change set:

1. Controller
   - File: app/Http/Controllers/Admin/PaymentController.php
   - Inject PaymentRepositoryInterface (or PaymentService) via constructor.
   - index(Request $request): use repo to paginateWithRelations($perPage) and return:
     Inertia::render('admin/payments/Index', ['payments' => $payments, 'users' => $users])
   - Do not include sensitive attributes in returned props.

2. Route
   - Add to routes/admin.php only. Use group with middleware auth + admin guard/middleware.
   - Example: Route::get('/payments', [PaymentController::class,'index'])->name('admin.payments.index');

3. Repository & Service (if missing)
   - Interface: app/Repositories/Contracts/PaymentRepositoryInterface.php
   - Implementation: app/Repositories/Eloquent/PaymentRepository.php
   - Service: app/Services/PaymentService.php for orchestration if needed.

4. FormRequest & Policy (if mutating or authorization needed)
   - app/Http/Requests/Admin/StorePaymentRequest.php with authorize() calling policy.
   - app/Policies/PaymentPolicy.php with view/create/update/delete methods registered in AuthServiceProvider.

5. Inertia Page (frontend)
   - File: resources/js/pages/admin/payments/Index.tsx (TSX)
   - Typed props (import types from resources/js/pages/shared/types).
   - Use shared/ui components (shadcn primitives wrappers).
   - Implement:
     - Search input with debounce (use shared hook useDebounce).
     - SSR-safe mobile detection (useIsMobile).
     - Responsive layout: card list for mobile, table for desktop.
     - Pagination rendering from paginator links (avoid dangerouslySetInnerHTML when possible; if paginator returns HTML, strip tags or sanitize).
     - Edit/Delete patterns: parent holds editingPayment & deletingPayment state; ActionDropdown triggers onEdit(id) and onRequestDelete(id) callbacks.

6. Tests
   - Create Feature test scaffold: tests/Feature/Admin/PaymentControllerTest.php verifying auth, route, and basic props shape.
   - Add Unit test skeleton for new Service/Repository if created.

7. Blade wrapper
   - Ensure resources/views/admin/app.blade.php exists to mount correct Vite entry and @inertia.

If any step cannot be completed (missing context), Copilot must ask clarifying question before making changes.

--------------------------------------------------------------------------------
Frontend patterns & UI behavior (MUST / SHOULD)
- ActionDropdown pattern:
  - If parent passes onRequestDelete(id): dropdown DELETE item must call onRequestDelete(id) (parent will open DeleteModal with detailed info).
  - If parent passes onEdit(id): dropdown EDIT must call onEdit(id) so parent can open EditModal. If onEdit not provided, fallback to href `/admin/payments/{id}/edit`.
  - If onRequestDelete not provided, dropdown should fallback to internal AlertDialog confirmation and then call onDelete(id).
- DeleteModal:
  - Parent DeleteModal shows detailed info (user name, category, formatted amount) and has confirm button which triggers Inertia delete (or calls parent-provided onConfirm).
- Accessibility:
  - Use aria-label on icon-only buttons; modal buttons have clear labels; use role attributes where relevant.
- Images:
  - Use optimized thumbnails, loading="lazy", and alt attributes.

--------------------------------------------------------------------------------
Performance & Security reminders (Copilot must surface warnings)
- Eager-load relations for lists (->with('user','paymentCategory')).
- Add DB indexes for frequently queried columns (hint in migration comments).
- Cache expensive queries using Cache::remember when business allows, or use cache_service() helper for centralized cache management.
- When returning paginator labels that include HTML, warn about XSS and prefer numeric pagination or server-side sanitization.
- For destructive actions ensure policy check before delete in controller/service.

--------------------------------------------------------------------------------
Code Style, Tests & CI (MUST follow)
- PHP: PSR-12 / use laravel pint or php-cs-fixer.
- TS/TSX: ESLint + Prettier; use strict typing.
- PHPStan: Level 5 static analysis - WAJIB lolos sebelum commit.
- Commit message convention: type(scope): short-description (feat|fix|chore|docs|refactor|test).
- PR description must include summary, files changed, migrations (Y/N), tests (Y/N), and local run steps.
- Add tests for important behaviors and include test command snippets in PR body.

--------------------------------------------------------------------------------
PHPStan & Type Safety Standards (CRITICAL - Level 5)

**WAJIB: Semua kode PHP harus lolos PHPStan level 5 sebelum commit!**

### 1. Type Declarations (MANDATORY)

**Return Types:**
```php
// ✅ CORRECT - Explicit return type
public function getUserReport(int $userId, int $year): array
{
    return ['user' => $user, 'payments' => $payments];
}

// ❌ WRONG - Missing return type
public function getUserReport($userId, $year)
{
    return ['user' => $user, 'payments' => $payments];
}
```

**Parameter Types:**
```php
// ✅ CORRECT - Typed parameters
public function processPayment(Payment $payment, float $amount): bool
{
    // ...
}

// ❌ WRONG - Untyped parameters
public function processPayment($payment, $amount)
{
    // ...
}
```

**Nullable Types:**
```php
// ✅ CORRECT - Explicit nullable
public function findUser(int $id): ?User
{
    return User::find($id);
}

// ❌ WRONG - No nullable indication
public function findUser(int $id): User
{
    return User::find($id); // Can return null!
}
```

### 2. Type Casting (MANDATORY)

**String Casting:**
```php
// ✅ CORRECT - Cast to string
$monthStr = str_pad((string) $month, 2, '0', STR_PAD_LEFT);

// ❌ WRONG - No casting
$monthStr = str_pad($month, 2, '0', STR_PAD_LEFT); // PHPStan error!
```

**Integer Casting:**
```php
// ✅ CORRECT - Cast request input
$perPage = (int) $request->get('per_page', 15);
$year = (int) $request->input('year');

// ❌ WRONG - Direct use without casting
$perPage = $request->get('per_page', 15);
```

**Array Access:**
```php
// ✅ CORRECT - Null coalescing with default
$total = (int) ($stats->total_payments ?? 0);
$amount = (float) ($stats->total_amount ?? 0);

// ❌ WRONG - Direct property access
$total = (int) $stats->total_payments; // Can be undefined!
```

### 3. Database Query Results (CRITICAL)

**SelectRaw Results:**
```php
// ✅ CORRECT - Type annotation for query results
$stats = Payment::selectRaw('
    COUNT(*) as total_payments,
    SUM(amount) as total_amount
')->first();

/** @var \stdClass $stats */
$stats = $stats;

// Now safe to access
$total = (int) ($stats->total_payments ?? 0);
```

**Collection Mapping:**
```php
// ✅ CORRECT - Type hint in closure
$payments->map(function (Payment $payment) {
    return [
        'id' => $payment->id,
        'amount' => $payment->amount,
    ];
})

// ❌ WRONG - No type hint
$payments->map(function ($payment) { // PHPStan can't infer type
    return ['id' => $payment->id];
})
```

**Eloquent Relationships:**
```php
// ✅ CORRECT - Type assertion for related models
$payments->map(function (Payment $payment) {
    /** @var User $user */
    $user = $payment->user;
    return [
        'user_name' => $user->full_name,
        'user_email' => $user->email,
    ];
})

// ❌ WRONG - Direct access without assertion
$payments->map(function (Payment $payment) {
    return [
        'user_name' => $payment->user->full_name, // Property not found error!
    ];
})
```

### 4. Array Type Hints

**Method Return Arrays:**
```php
// ✅ CORRECT - PHPDoc for complex arrays
/**
 * @return array{
 *     total_members: int,
 *     total_payments: int,
 *     total_amount: float,
 *     monthly_breakdown: array<int, array{month: int, amount: float}>
 * }
 */
public function getGeneralStats(int $year, ?int $month = null): array
{
    return [
        'total_members' => 100,
        'total_payments' => 500,
        'total_amount' => 50000.00,
        'monthly_breakdown' => []
    ];
}
```

**Collection Type Hints:**
```php
// ✅ CORRECT - Generic type annotation
/** @var Collection<int, Payment> $payments */
$payments = Payment::where('status', 'validated')->get();
```

### 5. Common PHPStan Error Patterns & Fixes

**Pattern 1: String function expects string, int given**
- Error: `Parameter expects string, int given` 
- Cause: Integer passed to string function
- Fix: Cast to string → `str_pad((string) $value, ...)`

**Pattern 2: Access to undefined property stdClass**
- Error: `Access to undefined property stdClass::$property`
- Cause: Raw query result access without type annotation
- Fix: Add `/** @var \stdClass $var */` and use null coalescing `?? 0`

**Pattern 3: Access to undefined property Model**
- Error: `Access to undefined property Model::$property`
- Cause: Dynamic property access on related model
- Fix: Type assertion → `/** @var User $user */` then access property

**Pattern 4: Type|null given where Type expected**
- Error: `Parameter expects Type, Type|null given`
- Cause: Nullable not handled properly
- Fix: Use null coalescing → `$value ?? default`

**Pattern 5: Call method on Model|null**
- Error: `Cannot call method on Model|null`
- Cause: Relationship can be null
- Fix: Null-safe operator → `$model->relation?->property`

**Pattern 6: Property not found on Collection**
- Error: `Property not found on Collection`
- Cause: Wrong type inference on collection
- Fix: Add generic type → `@var Collection<int, Model>`

### 6. Repository Pattern Type Safety

```php
// ✅ CORRECT - Repository with proper types
interface ReportRepositoryInterface
{
    /**
     * @return array{
     *     total_members: int,
     *     active_members: int,
     *     monthly_breakdown: array<int, array{month: int, amount: float}>
     * }
     */
    public function getGeneralStats(int $year, ?int $month = null): array;
    
    public function getUserReport(int $userId, int $year): array;
}

class ReportRepository implements ReportRepositoryInterface
{
    public function getGeneralStats(int $year, ?int $month = null): array
    {
        $query = Payment::whereYear('payment_date', $year);
        
        if ($month !== null) {
            $query->whereMonth('payment_date', $month);
        }
        
        $stats = $query->selectRaw('...')->first();
        
        /** @var \stdClass $stats */
        $stats = $stats;
        
        return [
            'total_members' => (int) ($stats->total_members ?? 0),
            'active_members' => (int) ($stats->active_members ?? 0),
            'monthly_breakdown' => []
        ];
    }
}
```

### 7. Controller Type Safety

```php
// ✅ CORRECT - Controller with dependency injection
class ReportController extends Controller
{
    public function __construct(
        private readonly ReportRepositoryInterface $repo
    ) {}
    
    public function index(Request $request): Response
    {
        $year = (int) $request->input('year', now()->year);
        $month = $request->has('month') ? (int) $request->input('month') : null;
        
        $stats = $this->repo->getGeneralStats($year, $month);
        
        return Inertia::render('admin/reports/Index', [
            'generalStats' => $stats,
            'selectedYear' => $year,
            'selectedMonth' => $month,
        ]);
    }
}
```

### 8. Before Commit Checklist (MANDATORY)

**Always run these commands before committing:**

```bash
# 1. Format PHP code
./vendor/bin/pint

# 2. Type check with PHPStan (MUST PASS!)
./vendor/bin/phpstan analyze --memory-limit=2G

# 3. Format TypeScript/React
npx eslint . --fix

# 4. Run tests
./vendor/bin/pest --no-coverage
```

**Expected PHPStan Output:**
```
[OK] No errors
```

**If PHPStan shows errors:**
1. ✅ Read error message carefully
2. ✅ Fix type declarations first
3. ✅ Add proper type casts
4. ✅ Add PHPDoc annotations where needed
5. ✅ Re-run PHPStan until clean
6. ✅ DO NOT commit with PHPStan errors

### 9. PHPStan Error Examples from This Project

**Example 1: str_pad type error**
```php
// ❌ ERROR
$monthStr = str_pad($month, 2, '0', STR_PAD_LEFT);

// ✅ FIX
$monthStr = str_pad((string) $month, 2, '0', STR_PAD_LEFT);
```

**Example 2: Undefined property on query result**
```php
// ❌ ERROR
$stats = Payment::selectRaw('COUNT(*) as total')->first();
$total = $stats->total;

// ✅ FIX
$stats = Payment::selectRaw('COUNT(*) as total')->first();
/** @var \stdClass $stats */
$stats = $stats;
$total = (int) ($stats->total ?? 0);
```

**Example 3: Collection mapping without type**
```php
// ❌ ERROR
$data = $payments->map(function ($payment) {
    return ['id' => $payment->id];
});

// ✅ FIX
$data = $payments->map(function (Payment $payment) {
    return ['id' => $payment->id];
});
```

### 10. Quick Reference Card

**Type Casting Quick Reference:**
- String: `(string) $value`
- Integer: `(int) $value`
- Float: `(float) $value`
- Boolean: `(bool) $value`
- Null coalescing: `$value ?? default`

**Type Annotation Quick Reference:**
- stdClass: `/** @var \stdClass $var */`
- Model: `/** @var User $user */`
- Collection: `/** @var Collection<int, Payment> $payments */`
- Array: `/** @var array<string, mixed> $data */`

**Common Fixes:**
- `str_pad()`: Cast to string
- `selectRaw()`: Add `@var \stdClass` annotation
- Collection map: Add type hint in closure
- Relationships: Add type assertion for related model
- Dynamic properties: Use null coalescing `??`

--------------------------------------------------------------------------------
Templates Copilot should follow (short examples)

Controller skeleton (high level)
```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use App\Models\User;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentRepositoryInterface $repo) {}

    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $payments = $this->repo->paginateWithRelations($perPage);
        $users = User::select('id','full_name')->get();

        return Inertia::render('admin/payments/Index', compact('payments','users'));
    }
}
```

Inertia page skeleton (TSX)
```tsx
import React, { useMemo, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useDebounce } from '@/pages/shared/hooks/use-debounce';
import { useIsMobile } from '@/pages/shared/hooks/use-is-mobile';
import ActionDropdown from '@/pages/shared/ui/action-dropdown';

export default function Index() {
  const { payments, users } = usePage().props as any;
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 250);
  const isMobile = useIsMobile();

  const filtered = useMemo(() => {
    const s = debounced.trim().toLowerCase();
    if (!s) return payments.data;
    return payments.data.filter((p: any) => /* match fields */ true);
  }, [payments.data, debounced]);

  return <div>{/* responsive table/cards + modals */}</div>;
}
```

--------------------------------------------------------------------------------
Helper Functions (Global utilities)

The application provides global helper functions for common operations:

1. **cache_service()** - Access to centralized CacheService
   ```php
   // Usage in controllers/services
   $users = cache_service()->rememberUsersList($page, $perPage, 300, function() {
       return User::paginate($perPage);
   });
   
   // Clear cache after mutations
   cache_service()->clearUsersList();
   ```

2. **When to use helpers vs DI**
   - Use helpers: one-off operations, routes, closures, quick access
   - Use DI: multiple method calls, better testability, strict SOLID adherence
   
3. **Adding new helpers**
   - Add functions to app/helpers.php
   - Wrap in function_exists() check
   - Document in PHPDoc with usage examples
   - Add tests in tests/Unit/

--------------------------------------------------------------------------------
Behavioral rules for Copilot (how to behave)
- Prefer Admin placement if ambiguous for a CRUD/management resource.
- Do not change root-level config, CI, or unrelated files without explicit user request.
- When generating large multi-file changes, scaffold minimal working example + tests and describe next manual steps in the PR body.
- If uncertain about design decisions (e.g., repository method names, policy names), ask the user before committing broad changes.

--------------------------------------------------------------------------------
Failure cases & mandatory comments
- If props include sensitive fields: insert comment: `// WARNING: remove sensitive fields before sending to client`
- If using raw SQL: insert comment recommending parameterized queries or Eloquent
- If adding migration changing critical columns, add test note and rollback instructions in comment.

--------------------------------------------------------------------------------
Final note
- Use resources/js/pages (not resources/js/src). Use entries under resources/js/entries for Vite.
- This file is authoritative guidance for Copilot in this repo. If user request conflicts with these rules, ask for clarification.
