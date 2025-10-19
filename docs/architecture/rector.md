# Rector - Automated PHP Code Refactoring

## Overview

Rector adalah tool untuk automated refactoring PHP code yang dapat:
- Upgrade code ke versi PHP yang lebih baru
- Memperbaiki code quality issues
- Menambahkan type declarations
- Mengubah code patterns
- Privatization dan early returns

## Installation

Rector sudah terinstall sebagai development dependency:
```bash
composer require --dev rector/rector
```

## Configuration

File `rector.php` berisi konfigurasi Rector dengan:
- **Paths**: `app/`, `bootstrap/app.php`, `config/`, `database/`, `public/`, `routes/`
- **Prepared Sets**:
  - `deadCode`: Remove unused code
  - `codeQuality`: Improve code quality
  - `typeDeclarations`: Add type hints
  - `privatization`: Make properties/methods private when possible
  - `earlyReturn`: Convert else statements to early returns
  - `strictBooleans`: Improve boolean handling
- **PHP Sets**: PHP 8.3 compatibility
- **Import Names**: Clean up imports
- **Skip**: Exclude vendor, tests, and specific files

## Usage

### 1. Dry Run (Recommended First)
Jalankan dry-run untuk melihat perubahan yang akan dilakukan:
```bash
./vendor/bin/rector process --dry-run
```

### 2. Automated Script
Gunakan script bash untuk refactoring dengan konfirmasi:
```bash
./.script-rector.sh
```

### 3. Direct Command
Jalankan refactoring langsung:
```bash
./vendor/bin/rector process
```

## Integration with Dev Workflow

Rector sudah terintegrasi dalam `composer run dev-check` sebagai dry-run, sehingga:
- Otomatis dijalankan dalam CI/CD
- Tidak mengubah code, hanya mendeteksi issues
- Developer dapat melihat rekomendasi refactoring

## Workflow Recommendations

1. **Commit current changes** sebelum menjalankan Rector
2. **Run dry-run** untuk melihat perubahan
3. **Run actual refactoring** jika setuju
4. **Review changes** dengan `git diff`
5. **Test application** thoroughly
6. **Commit refactoring** sebagai separate commit

## Current Status

- ✅ Installed dan configured
- ✅ 51 files terdeteksi untuk improvement
- ✅ Integrated dalam dev-check (dry-run)
- ✅ Dedicated script untuk actual refactoring

## Rules Applied

Berdasarkan dry-run, Rector akan menerapkan rules seperti:
- `AddClosureVoidReturnTypeWhereNoReturnRector`: Menambah `void` return type pada closure
- `ClosureToArrowFunctionRector`: Convert closure ke arrow function
- Dan rules lainnya sesuai konfigurasi

## Safety Features

- **Dry-run mode** dalam dev-check
- **Manual confirmation** dalam script
- **Git status check** untuk uncommitted changes
- **Skip sensitive files** (vendor, tests, specific implementations)