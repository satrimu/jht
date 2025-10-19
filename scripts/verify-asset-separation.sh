#!/bin/bash

# Asset Separation Verification Script
# This script helps verify that admin and site assets are properly separated

echo "=============================================="
echo "Asset Separation Verification"
echo "=============================================="
echo ""

# Check if middleware has rootView method
echo "✓ Checking HandleInertiaRequests middleware..."
if grep -q "public function rootView" app/Http/Middleware/HandleInertiaRequests.php; then
    echo "  ✅ rootView() method exists"
else
    echo "  ❌ rootView() method missing"
fi

# Check if admin template exists
echo ""
echo "✓ Checking admin template..."
if [ -f "resources/views/admin/app.blade.php" ]; then
    echo "  ✅ Admin template exists"
    if grep -q "admin.tsx" resources/views/admin/app.blade.php; then
        echo "  ✅ Admin template loads admin.tsx entry"
    else
        echo "  ❌ Admin template doesn't load admin.tsx"
    fi
else
    echo "  ❌ Admin template missing"
fi

# Check if site template exists
echo ""
echo "✓ Checking site template..."
if [ -f "resources/views/site/app.blade.php" ]; then
    echo "  ✅ Site template exists"
    if grep -q "site.tsx" resources/views/site/app.blade.php; then
        echo "  ✅ Site template loads site.tsx entry"
    else
        echo "  ❌ Site template doesn't load site.tsx"
    fi
else
    echo "  ❌ Site template missing"
fi

# Check if entry points exist
echo ""
echo "✓ Checking entry points..."
if [ -f "resources/js/entries/admin.tsx" ]; then
    echo "  ✅ Admin entry point exists"
else
    echo "  ❌ Admin entry point missing"
fi

if [ -f "resources/js/entries/site.tsx" ]; then
    echo "  ✅ Site entry point exists"
else
    echo "  ❌ Site entry point missing"
fi

# Check vite config
echo ""
echo "✓ Checking Vite configuration..."
if grep -q "admin.tsx" vite.config.ts && grep -q "site.tsx" vite.config.ts; then
    echo "  ✅ Vite config includes both entry points"
else
    echo "  ❌ Vite config missing entry points"
fi

# Check if tests exist
echo ""
echo "✓ Checking tests..."
if [ -f "tests/Feature/AssetSeparationTest.php" ]; then
    echo "  ✅ Asset separation tests exist"
else
    echo "  ❌ Asset separation tests missing"
fi

# Check if documentation exists
echo ""
echo "✓ Checking documentation..."
if [ -f "docs/ASSET_SEPARATION.md" ]; then
    echo "  ✅ Documentation exists"
else
    echo "  ❌ Documentation missing"
fi

echo ""
echo "=============================================="
echo "Verification Complete!"
echo "=============================================="
echo ""
echo "To run tests:"
echo "  php artisan test --filter AssetSeparationTest"
echo ""
echo "To build assets:"
echo "  npm run build"
echo ""
echo "For more information, see docs/ASSET_SEPARATION.md"
echo ""
