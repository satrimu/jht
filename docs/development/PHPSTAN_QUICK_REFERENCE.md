# PHPStan Quick Reference Guide

## Overview
PHPStan Level 5 adalah WAJIB untuk semua kode PHP di project ini. Dokumen ini adalah quick reference untuk menghindari error PHPStan yang umum terjadi.

---

## Quick Commands

```bash
# Run PHPStan analysis
./vendor/bin/phpstan analyze --memory-limit=2G

# Complete check before commit
./vendor/bin/pint                              # Format code
./vendor/bin/phpstan analyze --memory-limit=2G # Type check
npx eslint . --fix                            # Format TS/React
./vendor/bin/pest --no-coverage               # Run tests
```

**Expected Output:** `[OK] No errors`

---

## Type Casting Cheat Sheet

| Type | Cast Syntax | Example |
|------|-------------|---------|
| String | `(string) $value` | `(string) $month` |
| Integer | `(int) $value` | `(int) $request->get('year')` |
| Float | `(float) $value` | `(float) $stats->amount` |
| Boolean | `(bool) $value` | `(bool) $request->has('active')` |
| Null-safe | `$value ?? default` | `$stats->total ?? 0` |

---

## Common Patterns

### 1. String Functions (str_pad, substr, etc)

❌ **WRONG:**
```php
$monthStr = str_pad($month, 2, '0', STR_PAD_LEFT);
```

✅ **CORRECT:**
```php
$monthStr = str_pad((string) $month, 2, '0', STR_PAD_LEFT);
```

---

### 2. Request Input Casting

❌ **WRONG:**
```php
$year = $request->input('year');
$perPage = $request->get('per_page', 15);
```

✅ **CORRECT:**
```php
$year = (int) $request->input('year', now()->year);
$perPage = (int) $request->get('per_page', 15);
```

---

### 3. Raw Query Results (selectRaw, DB::select)

❌ **WRONG:**
```php
$stats = Payment::selectRaw('COUNT(*) as total')->first();
$count = $stats->total;
```

✅ **CORRECT:**
```php
$stats = Payment::selectRaw('COUNT(*) as total')->first();

/** @var \stdClass $stats */
$stats = $stats;

$count = (int) ($stats->total ?? 0);
```

---

### 4. Collection Mapping

❌ **WRONG:**
```php
$data = $payments->map(function ($payment) {
    return ['id' => $payment->id];
});
```

✅ **CORRECT:**
```php
$data = $payments->map(function (Payment $payment) {
    return ['id' => $payment->id];
});
```

---

### 5. Relationship Access

❌ **WRONG:**
```php
$payments->map(function (Payment $payment) {
    return [
        'user_name' => $payment->user->full_name, // Property not found!
    ];
})
```

✅ **CORRECT:**
```php
$payments->map(function (Payment $payment) {
    /** @var User $user */
    $user = $payment->user;
    return [
        'user_name' => $user->full_name,
        'user_email' => $user->email,
    ];
})
```

---

### 6. Nullable Properties

❌ **WRONG:**
```php
$total = (int) $stats->total_payments;
$amount = (float) $stats->total_amount;
```

✅ **CORRECT:**
```php
$total = (int) ($stats->total_payments ?? 0);
$amount = (float) ($stats->total_amount ?? 0);
```

---

### 7. Return Type Declarations

❌ **WRONG:**
```php
public function getStats($year)
{
    return ['total' => 100];
}
```

✅ **CORRECT:**
```php
public function getStats(int $year): array
{
    return ['total' => 100];
}
```

---

### 8. Nullable Return Types

❌ **WRONG:**
```php
public function findUser(int $id): User
{
    return User::find($id); // Can return null!
}
```

✅ **CORRECT:**
```php
public function findUser(int $id): ?User
{
    return User::find($id);
}
```

---

## Complex Array Type Hints

### Repository Method with Array Return

```php
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

---

## Type Annotations

### stdClass Annotation
```php
$stats = Payment::selectRaw('COUNT(*) as total')->first();
/** @var \stdClass $stats */
$stats = $stats;
```

### Model Annotation
```php
/** @var User $user */
$user = $payment->user;
```

### Collection Annotation
```php
/** @var Collection<int, Payment> $payments */
$payments = Payment::where('status', 'validated')->get();
```

### Array Annotation
```php
/** @var array<string, mixed> $data */
$data = $request->all();
```

---

## Error Messages Decoder

| Error Message | What It Means | Quick Fix |
|---------------|---------------|-----------|
| "Parameter expects string, int given" | Need to cast to string | `(string) $value` |
| "Access to undefined property stdClass" | Query result needs annotation | `/** @var \stdClass $var */` |
| "Access to undefined property Model" | Relationship needs type hint | `/** @var User $user */` |
| "Parameter expects Type, Type\|null" | Need null handling | `$value ?? default` |
| "Cannot call method on Model\|null" | Relationship might be null | `$model->relation?->property` |
| "Property not found on Collection" | Collection needs generic type | `@var Collection<int, Model>` |

---

## Repository Pattern Example

```php
<?php

namespace App\Repositories\Eloquent;

use App\Models\Payment;
use App\Models\User;
use App\Repositories\Contracts\ReportRepositoryInterface;
use Illuminate\Support\Collection;

class ReportRepository implements ReportRepositoryInterface
{
    /**
     * Get general statistics for payments
     * 
     * @return array{
     *     total_members: int,
     *     active_members: int,
     *     total_payments: int,
     *     total_amount: float
     * }
     */
    public function getGeneralStats(int $year, ?int $month = null): array
    {
        $query = Payment::whereYear('payment_date', $year);
        
        if ($month !== null) {
            $query->whereMonth('payment_date', $month);
        }
        
        $stats = $query->selectRaw('
            COUNT(*) as total_payments,
            COUNT(DISTINCT user_id) as active_members,
            SUM(amount) as total_amount
        ')->first();
        
        /** @var \stdClass $stats */
        $stats = $stats;
        
        return [
            'total_members' => $this->getTotalMembers(),
            'active_members' => (int) ($stats->active_members ?? 0),
            'total_payments' => (int) ($stats->total_payments ?? 0),
            'total_amount' => (float) ($stats->total_amount ?? 0),
        ];
    }
    
    private function getTotalMembers(): int
    {
        return User::where('id', '!=', 1)->count();
    }
}
```

---

## Controller Pattern Example

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Repositories\Contracts\ReportRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportRepositoryInterface $repo
    ) {}
    
    public function index(Request $request): Response
    {
        $year = (int) $request->input('year', now()->year);
        $month = $request->has('month') 
            ? (int) $request->input('month') 
            : null;
        
        $stats = $this->repo->getGeneralStats($year, $month);
        
        return Inertia::render('admin/reports/Index', [
            'generalStats' => $stats,
            'selectedYear' => $year,
            'selectedMonth' => $month,
        ]);
    }
}
```

---

## Pre-Commit Workflow

```bash
# Step 1: Format PHP code
./vendor/bin/pint

# Step 2: Run PHPStan (MUST PASS!)
./vendor/bin/phpstan analyze --memory-limit=2G

# Step 3: If errors, fix them and repeat Step 2

# Step 4: Format TypeScript
npx eslint . --fix

# Step 5: Run tests
./vendor/bin/pest --no-coverage

# Step 6: Commit only if all checks pass
git add .
git commit -m "feat: implement feature"
```

---

## Troubleshooting

### "Memory exhausted" Error
```bash
# Increase memory limit
./vendor/bin/phpstan analyze --memory-limit=4G
```

### "Class not found" Error
```bash
# Clear caches
php artisan clear-compiled
composer dump-autoload
```

### Too Many Errors
```bash
# Analyze specific directory only
./vendor/bin/phpstan analyze app/Repositories
./vendor/bin/phpstan analyze app/Http/Controllers/Admin
```

---

## Best Practices

1. ✅ **Always declare return types** - no exceptions
2. ✅ **Cast all request inputs** - even if default is provided
3. ✅ **Annotate query results** - especially selectRaw()
4. ✅ **Type hint closures** - in map(), filter(), etc.
5. ✅ **Use null coalescing** - for potentially undefined properties
6. ✅ **Run PHPStan before commit** - make it a habit
7. ✅ **Fix errors immediately** - don't accumulate tech debt

---

## Resources

- **PHPStan Documentation**: https://phpstan.org/user-guide/getting-started
- **Laravel Static Analysis**: https://laravel.com/docs/11.x/packages#static-analysis
- **Project Instructions**: `.github/instructions/application.instructions.md`

---

## Quick Help

**Need help with a specific error?**
1. Copy the exact error message
2. Check this document for similar pattern
3. Apply the suggested fix
4. Re-run PHPStan
5. If still errors, ask in team chat

**Common Questions:**
- Q: Do I need type hints for every variable?
- A: No, only for function parameters, return types, and ambiguous cases

- Q: What if PHPStan says "too many errors"?
- A: Analyze smaller directories first, fix incrementally

- Q: Can I ignore PHPStan errors?
- A: NO! All errors must be fixed before commit

---

**Last Updated**: 2025-10-20  
**PHPStan Version**: Level 5  
**Project**: JHT - Jaminan Hari Tua
