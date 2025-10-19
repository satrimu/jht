# Security Policy

## 🔒 Reporting a Vulnerability

Jika Anda menemukan kerentanan keamanan dalam aplikasi ini, mohon **JANGAN** membuat public issue. Ikuti prosedur berikut:

### Cara Melaporkan

1. **Email**: Kirim laporan ke [indatechnologi@gmail.com](mailto:indatechnologi@gmail.com)
2. **GitHub Security Advisory**: Gunakan [GitHub Security Advisory](https://github.com/sdldev/fullstack-laravel-react-starter/security/advisories/new)
3. **Private Message**: Contact maintainer via direct message

### Informasi yang Diperlukan

Sertakan detail berikut dalam laporan:
- Deskripsi kerentanan
- Langkah-langkah untuk mereproduksi
- Dampak potensial
- Saran perbaikan (jika ada)
- Versi aplikasi yang terpengaruh

### Response Time

- **Acknowledgment**: Dalam 48 jam
- **Initial Assessment**: Dalam 1 minggu
- **Fix Timeline**: Bergantung pada severity (1-4 minggu)
- **Public Disclosure**: Setelah fix tersedia

---

## 📚 Security Documentation

Dokumentasi keamanan lengkap tersedia di:

| Dokumen | Deskripsi | Link |
|---------|-----------|------|
| 📊 **Security Summary** | Executive summary & quick reference | [SECURITY_SUMMARY.md](../SECURITY_SUMMARY.md) |
| 🔍 **Security Analysis** | Analisis komprehensif kerentanan | [SECURITY_ANALYSIS.md](../SECURITY_ANALYSIS.md) |
| 🛠️ **Security Improvements** | Panduan implementasi perbaikan | [SECURITY_IMPROVEMENTS.md](../SECURITY_IMPROVEMENTS.md) |
| ✅ **Security Checklist** | Checklist deployment & testing | [SECURITY_CHECKLIST.md](../SECURITY_CHECKLIST.md) |

---

## 🛡️ Supported Versions

| Version | Supported          | Status |
| ------- | ------------------ | ------ |
| 1.0.x   | :white_check_mark: | Active |
| < 1.0   | :x:                | Unsupported |

---

## 🔐 Security Features

### Built-in Protection

- ✅ **Two-Factor Authentication** - Laravel Fortify
- ✅ **Rate Limiting** - Login throttling (5 attempts)
- ✅ **CSRF Protection** - Laravel & Inertia.js
- ✅ **SQL Injection Protection** - Eloquent ORM
- ✅ **XSS Protection** - React auto-escaping
- ✅ **Password Hashing** - Bcrypt (12 rounds)
- ✅ **Session Security** - Secure cookies
- ✅ **Input Validation** - FormRequest validation

### Known Issues

Sebelum production deployment, pastikan untuk:

1. **Change default passwords** di database seeder
2. **Filter sensitive data** di Inertia props
3. **Implement file validation** untuk upload
4. **Enable HTTPS** enforcement
5. **Add security headers** (HSTS, CSP, etc)
6. **Configure security logging**

Detail: [SECURITY_ANALYSIS.md](../SECURITY_ANALYSIS.md)

---

## 🔧 Security Configuration

### Environment Variables (Production)

```env
# Application
APP_ENV=production
APP_DEBUG=false

# Security
SESSION_ENCRYPT=true
SESSION_LIFETIME=30
SESSION_SECURE_COOKIE=true
AUTH_PASSWORD_TIMEOUT=900

# HTTPS
APP_URL=https://yourdomain.com
```

### Pre-Deployment Checklist

Sebelum deploy ke production:

- [ ] Review [SECURITY_CHECKLIST.md](../SECURITY_CHECKLIST.md)
- [ ] Run security audit: `composer audit && npm audit`
- [ ] Update dependencies
- [ ] Configure HTTPS & security headers
- [ ] Test authentication flows
- [ ] Verify authorization controls
- [ ] Enable security logging
- [ ] Test file upload security
- [ ] Review environment configuration

---

## 🧪 Security Testing

### Automated Tests

```bash
# Run security tests
php artisan test --filter=SecurityTest

# Dependency audit
composer audit
npm audit --audit-level=high

# Static analysis
./vendor/bin/phpstan analyse
```

### Manual Testing

1. **Authentication**
   - Try brute force login (should rate limit)
   - Test 2FA flow
   - Verify session expiration

2. **Authorization**
   - Try accessing admin pages as regular user
   - Test privilege escalation
   - Verify permission checks

3. **Input Validation**
   - XSS injection attempts
   - SQL injection attempts
   - File upload validation

4. **Data Protection**
   - Verify no sensitive data in responses
   - Check HTTPS enforcement
   - Test session security

---

## 📞 Security Contacts

### Maintainers

- **Security Lead**: [Your Name](mailto:indatechnologi@gmail.com)
- **Project Lead**: [Project Lead](mailto:lead@yourdomain.com)

### Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Laravel Security**: https://laravel.com/docs/security
- **Web Security**: https://developer.mozilla.org/en-US/docs/Web/Security

---

## 🏆 Security Hall of Fame

Terima kasih kepada individu berikut yang telah membantu meningkatkan keamanan aplikasi:

<!-- Add names here -->
- [Your Name] - Initial security analysis (Oct 2025)

---

## 📝 Version History

### v1.0.0 - October 2025
- Initial security analysis completed
- Comprehensive documentation created
- Known issues documented
- Implementation guides provided

---

## ⚖️ Responsible Disclosure

Kami berkomitmen untuk:
- Merespons laporan keamanan dengan cepat
- Menjaga kerahasiaan pelapor
- Memberikan credit untuk penemuan (jika diinginkan)
- Memperbaiki kerentanan dengan prioritas tinggi
- Memberikan update tentang progress perbaikan

Kami mengharapkan pelapor untuk:
- Memberikan waktu untuk memperbaiki sebelum public disclosure
- Tidak mengeksploitasi kerentanan
- Tidak mengakses data pengguna lain
- Melaporkan dengan itikad baik

---

**Last Updated**: October 14, 2025  
**Policy Version**: 1.0

For questions about this security policy, contact: [indatechnologi@gmail.com](mailto:indatechnologi@gmail.com)
