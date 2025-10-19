# Testing

Unit and Feature tests are written with Pest.

Run tests:

```bash
# Run all tests
./vendor/bin/pest

# Run a single test file
./vendor/bin/pest tests/Feature/Admin/UserAvatarUpdateTest.php
```

New tests added:
- `tests/Feature/Admin/UserAvatarUpdateTest.php` — verifies avatar upload stores filename and file, and that old avatars are cleaned up.
- `tests/Feature/Admin/UserAvatarUploadNegativeTest.php` — verifies oversized, non-image, and JSON submission cases are rejected.

Tips
- Use `Storage::fake('public')` in tests that touch filesystem to avoid real disk writes.
- If WebP conversion fails in your environment, tests accept JPEG as a fallback MIME for robustness.
