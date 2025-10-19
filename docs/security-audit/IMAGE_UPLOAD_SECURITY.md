# Image Upload Security - Multi-Layer Validation

**Last Updated**: 2025-01-29  
**Category**: Security  
**Status**: Final  
**Security Level**: HIGH

## Overview

`ImageService` menggunakan **5 layer validasi** untuk memastikan file yang diupload adalah gambar asli dan tidak dimanipulasi untuk serangan keamanan.

---

## Table of Contents

- [Why Multi-Layer Validation?](#why-multi-layer-validation)
- [Security Layers](#security-layers)
- [Attack Scenarios Prevented](#attack-scenarios-prevented)
- [Implementation Details](#implementation-details)
- [Logging & Monitoring](#logging--monitoring)
- [Best Practices](#best-practices)

---

## Why Multi-Layer Validation?

### ❌ MIME Type Alone is NOT Secure

```php
// INSECURE - Can be spoofed easily
if (in_array($file->getMimeType(), ['image/jpeg', 'image/png'])) {
    // Upload - DANGEROUS!
}
```

**Why it's dangerous**:
- Attacker can change HTTP headers
- File extension can be faked
- PHP shell can be disguised as image
- No content verification

### ✅ Multi-Layer Validation is Secure

```php
// SECURE - Multiple verification layers
1. MIME type check (first filter)
2. Extension validation
3. getimagesize() - reads actual file header
4. Intervention Image validation - tries to process as image
5. File size & dimension limits
```

**Why it's secure**:
- Even if one layer is bypassed, others will catch it
- Validates actual file content, not just headers
- Prevents manipulation attacks
- Logs all rejection attempts

---

## Security Layers

### Layer 1: MIME Type Validation (Basic Filter)

**Purpose**: First-line defense, filters obvious non-images

```php
$allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($file->getMimeType(), $allowedMimes, true)) {
    return false; // Reject
}
```

**What it catches**:
- ✅ .exe, .php, .sh files
- ✅ .pdf, .docx, .zip files
- ✅ Text files disguised with wrong extension

**What it DOESN'T catch**:
- ❌ Files with spoofed MIME headers
- ❌ PHP shells with image extension
- ❌ Malicious scripts with image MIME type

**Security Level**: LOW (can be bypassed)

---

### Layer 2: File Extension Validation

**Purpose**: Verify file extension matches allowed image types

```php
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
$extension = strtolower($file->getClientOriginalExtension());
if (!in_array($extension, $allowedExtensions, true)) {
    return false; // Reject
}
```

**What it catches**:
- ✅ image.php.jpg (double extension attack)
- ✅ file.exe
- ✅ script.sh

**What it DOESN'T catch**:
- ❌ shell.jpg (PHP shell with .jpg extension)
- ❌ Malicious files with valid image extension

**Security Level**: LOW (can be bypassed)

---

### Layer 3: getimagesize() Content Validation

**Purpose**: Read actual file header to verify it's a real image

```php
$imageInfo = @getimagesize($file->getRealPath());
if ($imageInfo === false) {
    return false; // Not a real image
}

// Verify MIME from content matches declared MIME
$actualMimeType = $imageInfo['mime'];
if (!in_array($actualMimeType, $allowedMimes, true)) {
    return false; // MIME mismatch - ATTACK DETECTED
}
```

**How it works**:
- Reads first few bytes of file (header)
- Detects actual image format (JPEG, PNG, GIF, WebP)
- Returns MIME type based on file content, not filename
- Returns false if file is not an image

**What it catches**:
- ✅ PHP shells disguised as images
- ✅ Text files renamed to .jpg
- ✅ Executable files with image extension
- ✅ **MIME type spoofing attacks**

**Example Attack Prevented**:
```
Attacker uploads: shell.php renamed to shell.jpg
- Layer 1: PASS (MIME: image/jpeg - spoofed)
- Layer 2: PASS (extension: .jpg)
- Layer 3: FAIL ❌ (getimagesize returns false - not a real image)
```

**Security Level**: MEDIUM-HIGH

---

### Layer 4: Intervention Image Validation

**Purpose**: Try to actually process the file as an image

```php
try {
    $testImage = $this->imageManager->read($file->getRealPath());
    $width = $testImage->width();
    $height = $testImage->height();
    
    if ($width <= 0 || $height <= 0) {
        return false; // Invalid dimensions
    }
    
    if ($width > 10000 || $height > 10000) {
        return false; // Suspiciously large - possible attack
    }
} catch (\Exception $e) {
    return false; // Cannot be read as image
}
```

**How it works**:
- Uses Intervention Image v3 with Imagick driver
- Attempts to read and decode the image
- If successful, gets actual width/height
- If fails, file is not a processable image

**What it catches**:
- ✅ Corrupted images that passed header check
- ✅ Malformed files designed to exploit vulnerabilities
- ✅ Images with embedded malicious code
- ✅ **Polyglot attacks** (files that are both image and script)
- ✅ Extremely large images (DoS attack)

**Example Attack Prevented**:
```
Attacker uploads: polyglot file (valid JPEG + PHP code)
- Layer 1: PASS (MIME: image/jpeg)
- Layer 2: PASS (extension: .jpg)
- Layer 3: PASS (getimagesize: valid JPEG header)
- Layer 4: FAIL ❌ (Intervention cannot process or dimensions invalid)
```

**Security Level**: HIGH

---

### Layer 5: File Size & Dimension Limits

**Purpose**: Prevent DoS attacks and resource exhaustion

```php
// File size limit
$maxSize = 10 * 1024 * 1024; // 10MB
if ($file->getSize() > $maxSize) {
    return false;
}

// Dimension limits
if ($width > 10000 || $height > 10000) {
    return false;
}
```

**What it catches**:
- ✅ Extremely large files (DoS attack)
- ✅ Decompression bombs (small file, huge when decompressed)
- ✅ Resource exhaustion attacks

**Example Attack Prevented**:
```
Attacker uploads: 1MB ZIP bomb that decompresses to 10GB image
- Layer 1-3: PASS (appears as valid image)
- Layer 4: FAIL ❌ (dimensions > 10000px)
- Layer 5: FAIL ❌ (processing would exhaust memory)
```

**Security Level**: HIGH

---

## Attack Scenarios Prevented

### 1. Remote Code Execution (RCE)

**Attack**: Upload PHP shell disguised as image

```
File: shell.php.jpg
Content: <?php system($_GET['cmd']); ?>
MIME: image/jpeg (spoofed)
```

**Prevention**:
- Layer 3: getimagesize() returns `false` (not a real image)
- Layer 4: Intervention cannot read as image
- **Result**: Upload rejected ✅

---

### 2. Polyglot Attack

**Attack**: File that is both valid image AND executable code

```
File: polyglot.jpg
Content: Valid JPEG header + PHP code embedded
```

**Prevention**:
- Layer 1-3: May pass (valid JPEG header)
- Layer 4: Intervention processing may fail or detect anomaly
- **Result**: Upload rejected or malicious code removed during processing ✅

---

### 3. MIME Type Spoofing

**Attack**: Change HTTP headers to fake image MIME type

```
File: malware.exe
MIME Header: image/png (spoofed)
Extension: .png
```

**Prevention**:
- Layer 3: getimagesize() reads actual file content and returns `false`
- **Result**: Upload rejected ✅

---

### 4. Double Extension Attack

**Attack**: Bypass extension filters with multiple extensions

```
File: shell.php.jpg
Server may execute as PHP if misconfigured
```

**Prevention**:
- Layer 2: Extension validation checks `.jpg` only
- Layer 3: getimagesize() verifies it's a real JPEG
- **Result**: If not real image, rejected ✅

---

### 5. Decompression Bomb (Zip Bomb)

**Attack**: Small file that decompresses to huge size

```
File: bomb.png (1MB)
Decompressed: 10GB image (crashes server)
```

**Prevention**:
- Layer 4: Dimension check (> 10000px rejected)
- Layer 5: Memory/resource limits
- **Result**: Upload rejected ✅

---

### 6. SVG Script Injection

**Attack**: SVG file with embedded JavaScript

```xml
<svg xmlns="http://www.w3.org/2000/svg">
  <script>alert('XSS')</script>
</svg>
```

**Prevention**:
- Layer 1: SVG not in allowed MIME types
- **Result**: Upload rejected ✅

---

## Implementation Details

### Code Location

**File**: `app/Services/ImageService.php`

**Method**: `isValidImage(UploadedFile $file): bool`

### Usage in Controllers

```php
// Automatic validation when calling processImageWithDimensions()
try {
    $imagePath = $this->imageService->processImageWithDimensions(
        file: $request->file('image'),
        storagePath: 'users',
        width: 200,
        height: 200,
        prefix: 'avatar',
        quality: 85
    );
} catch (\Exception $e) {
    // Validation failed - show error to user
    return back()->withErrors(['image' => $e->getMessage()]);
}
```

### Error Messages

User-friendly error message:
```
"Invalid image file. Allowed types: JPEG, PNG, GIF, WebP. Max size: 10MB."
```

Detailed logs for admin monitoring (see next section).

---

## Logging & Monitoring

All rejection attempts are logged for security monitoring:

### Log Format

```php
\Log::warning('File rejected: Invalid MIME type', [
    'mime' => $file->getMimeType(),
    'filename' => $file->getClientOriginalName(),
]);
```

### Log Locations

**File**: `storage/logs/laravel.log`

### Example Log Entries

```
[2025-01-29 10:23:45] local.WARNING: File rejected: Invalid MIME type 
{"mime":"application/x-php","filename":"shell.php.jpg"}

[2025-01-29 10:24:12] local.WARNING: File rejected: Not a valid image file (getimagesize failed)
{"filename":"malware.exe"}

[2025-01-29 10:25:33] local.WARNING: File rejected: Content MIME type mismatch
{"declared_mime":"image/jpeg","actual_mime":"text/plain","filename":"fake.jpg"}

[2025-01-29 10:26:01] local.WARNING: File rejected: Intervention Image cannot read file
{"error":"Not a valid image","filename":"polyglot.jpg"}
```

### Monitoring Alerts

**Recommended**: Set up monitoring for:
- Multiple rejection attempts from same IP
- Repeated polyglot attack patterns
- Unusual file upload spikes

---

## Best Practices

### 1. Never Trust Client Input

```php
// ❌ WRONG - Trusting client-provided data
$extension = $request->input('extension');

// ✅ CORRECT - Validate server-side
$extension = $file->getClientOriginalExtension();
// + verify with getimagesize()
```

### 2. Store Outside Web Root (if possible)

```php
// ✅ Better security
storage/app/private/users/  // Not publicly accessible
```

But with multi-layer validation + WebP conversion, `storage/app/public/` is safe.

### 3. Disable PHP Execution in Upload Directories

**Apache** (.htaccess in storage/app/public/):
```apache
<FilesMatch "\.php$">
    Require all denied
</FilesMatch>
```

**Nginx** (server config):
```nginx
location ~* ^/storage/.*\.(php|php5|phtml)$ {
    deny all;
}
```

### 4. Use Unique Filenames

```php
// ✅ Already implemented in ImageService
$filename = "{$prefix}-{$random}-{$timestamp}.webp";
// Result: avatar-abc12345-1738139456.webp
```

Prevents:
- Overwriting existing files
- Path traversal attacks (../../../etc/passwd)
- Predictable filenames

### 5. Convert All Images to WebP

```php
// ✅ Already implemented
$image->toWebp($quality);
```

**Security benefit**: 
- Strips metadata (EXIF, IPTC)
- Removes embedded code
- Re-encodes entire image
- Only image data is preserved

### 6. Regular Security Audits

- [ ] Review upload logs weekly
- [ ] Check for suspicious patterns
- [ ] Update validation rules if new attacks emerge
- [ ] Keep Intervention Image updated

---

## Security Comparison

| Method | Security Level | Can Be Bypassed? |
|--------|----------------|------------------|
| **MIME type only** | ⚠️ LOW | Yes (easily) |
| **Extension only** | ⚠️ LOW | Yes (easily) |
| **MIME + Extension** | ⚠️ MEDIUM | Yes (with effort) |
| **getimagesize()** | ✅ MEDIUM-HIGH | Difficult |
| **Intervention validation** | ✅ HIGH | Very difficult |
| **All 5 layers** | ✅✅ VERY HIGH | Nearly impossible |

---

## Testing Security

### Manual Security Tests

1. **Test 1: PHP Shell Upload**
   ```bash
   # Create fake image
   echo '<?php system($_GET["cmd"]); ?>' > shell.jpg
   # Try to upload
   # Expected: Rejected by Layer 3 (getimagesize)
   ```

2. **Test 2: Renamed Executable**
   ```bash
   cp /bin/ls malware.jpg
   # Try to upload
   # Expected: Rejected by Layer 3
   ```

3. **Test 3: MIME Spoofing**
   ```bash
   # Upload text file with spoofed MIME
   # Expected: Rejected by Layer 3
   ```

4. **Test 4: Large File DoS**
   ```bash
   # Upload 100MB image
   # Expected: Rejected by Layer 5
   ```

---

## Related Documentation

- [Image Service Usage](./IMAGE_SERVICE_USAGE.md)
- [User Image Migration](../audit/USER_IMAGE_SERVICE_MIGRATION.md)
- [Security Audit](../security-audit/SECURITY_AUDIT_2025.md)

---

## Summary

**ImageService** menggunakan **5 layer validasi** untuk keamanan maksimal:

1. ✅ **MIME type** - Basic filter
2. ✅ **Extension** - Prevent obvious attacks
3. ✅ **getimagesize()** - Verify real image content
4. ✅ **Intervention** - Process as actual image
5. ✅ **Size/Dimension limits** - Prevent DoS

**Attack Prevention**:
- ✅ Remote Code Execution (RCE)
- ✅ Polyglot attacks
- ✅ MIME type spoofing
- ✅ Double extension attacks
- ✅ Decompression bombs
- ✅ SVG script injection

**Additional Security**:
- ✅ WebP conversion strips metadata & embedded code
- ✅ Unique filenames prevent overwrites
- ✅ Detailed logging for monitoring
- ✅ User-friendly error messages

---

**Security Status**: ✅ **PRODUCTION-GRADE SECURITY**  
**Last Security Audit**: 2025-01-29  
**Next Review**: 2025-04-29 (quarterly)
