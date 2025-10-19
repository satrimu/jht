# Content Security Policy (CSP) Configuration Guide

## Overview

Content Security Policy (CSP) is an additional security layer that helps detect and mitigate certain types of attacks, including Cross-Site Scripting (XSS) and data injection attacks.

## Status

❌ **Not Currently Implemented** - CSP is recommended but not yet configured in this application.

## Recommended Implementation

### Step 1: Install the Package

```bash
composer require spatie/laravel-csp
```

### Step 2: Publish the Configuration

```bash
php artisan vendor:publish --tag=csp-config
```

### Step 3: Configure the Policy

Edit `config/csp.php` to define your Content Security Policy. Here's a recommended starting configuration:

```php
<?php

return [
    'enabled' => env('CSP_ENABLED', true),
    
    'report_only' => env('CSP_REPORT_ONLY', false),
    
    'report_uri' => env('CSP_REPORT_URI', ''),
    
    'policies' => [
        \Spatie\Csp\Policies\Policy::class => [
            'default-src' => ["'self'"],
            'script-src' => [
                "'self'",
                "'unsafe-inline'", // Required for Inertia/React inline scripts
                "'unsafe-eval'",   // May be required for some React features
            ],
            'style-src' => [
                "'self'",
                "'unsafe-inline'", // Required for styled components/inline styles
                'https://fonts.googleapis.com',
            ],
            'img-src' => [
                "'self'",
                'data:', // For base64 images
                'https:', // Allow external images
            ],
            'font-src' => [
                "'self'",
                'data:',
                'https://fonts.gstatic.com',
            ],
            'connect-src' => ["'self'"],
            'frame-src' => ["'self'"],
            'object-src' => ["'none'"],
            'base-uri' => ["'self'"],
            'form-action' => ["'self'"],
            'frame-ancestors' => ["'none'"],
            'upgrade-insecure-requests' => true,
        ],
    ],
];
```

### Step 4: Add Middleware

Add the CSP middleware to your web middleware group in `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        HandleAppearance::class,
        HandleInertiaRequests::class,
        AddLinkHeadersForPreloadedAssets::class,
        SecurityHeaders::class,
        \Spatie\Csp\AddCspHeaders::class, // Add this line
    ]);
})
```

### Step 5: Testing

1. **Enable Report-Only Mode First**
   
   Set in `.env`:
   ```env
   CSP_REPORT_ONLY=true
   ```
   
   This will report violations without blocking them, allowing you to test without breaking functionality.

2. **Monitor CSP Violations**
   
   Check your browser's console for CSP violation reports. Adjust your policy as needed.

3. **Test Key Functionality**
   - Login/logout
   - Form submissions
   - Image uploads
   - Dynamic content loading
   - Third-party integrations

4. **Disable Report-Only Mode**
   
   Once you've verified everything works:
   ```env
   CSP_REPORT_ONLY=false
   ```

## Common Issues and Solutions

### Issue: Inline Scripts Blocked

**Symptom**: React/Inertia app doesn't work, console shows CSP violations for inline scripts.

**Solution**: 
- Use `'unsafe-inline'` in `script-src` (less secure but often necessary for React/Inertia)
- Or implement nonces for inline scripts (more secure but more complex)

### Issue: External Resources Blocked

**Symptom**: External fonts, images, or scripts don't load.

**Solution**: Add the external domains to the appropriate directive:
```php
'font-src' => [
    "'self'",
    'https://fonts.gstatic.com',
    'https://cdn.example.com',
],
```

### Issue: Form Submissions Blocked

**Symptom**: Forms don't submit, CSP violations for form-action.

**Solution**: Ensure `form-action` includes `'self'`:
```php
'form-action' => ["'self'"],
```

## Environment Variables

Add these to your `.env.example` and `.env`:

```env
# Content Security Policy
CSP_ENABLED=true
CSP_REPORT_ONLY=false
CSP_REPORT_URI=
```

For production:
```env
CSP_ENABLED=true
CSP_REPORT_ONLY=false
```

For development/testing:
```env
CSP_ENABLED=true
CSP_REPORT_ONLY=true  # Report violations without blocking
```

## Benefits of CSP

1. **XSS Protection**: Prevents execution of malicious scripts
2. **Data Injection Protection**: Restricts where content can be loaded from
3. **Clickjacking Protection**: Controls framing of your site
4. **Mixed Content Protection**: Helps ensure HTTPS-only content loading

## Trade-offs

### Pros
- Significant security improvement against XSS attacks
- Industry best practice
- Required by some compliance standards

### Cons
- Can break functionality if not configured correctly
- Requires testing and tuning
- May conflict with some third-party tools
- `'unsafe-inline'` and `'unsafe-eval'` reduce effectiveness

## Recommendations

1. **Start with Report-Only Mode**: Test thoroughly before enforcing
2. **Monitor Violations**: Set up violation reporting if possible
3. **Document External Dependencies**: Keep track of which external resources you allow
4. **Regular Review**: Review and tighten policy as your app evolves
5. **Consider Nonces**: For better security, use nonces instead of `'unsafe-inline'` when possible

## Further Reading

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Spatie Laravel CSP Documentation](https://github.com/spatie/laravel-csp)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

## Status Check

Before enabling CSP:

- [ ] Package installed (`spatie/laravel-csp`)
- [ ] Configuration published
- [ ] Policy defined in `config/csp.php`
- [ ] Middleware added to web group
- [ ] Environment variables set
- [ ] Tested in report-only mode
- [ ] All functionality verified
- [ ] Violations resolved or documented
- [ ] Enforcement enabled

---

**Last Updated**: October 18, 2025  
**Version**: 1.0  
**Status**: Recommended but not implemented
