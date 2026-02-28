# Developer Security Checklist

**Purpose:** Quick reference for developers to ensure security best practices
**Last Updated:** 2026-02-28
**Version:** 1.0

---

## Quick Checklist for New Features

Use this checklist when implementing new features or reviewing code:

### Authentication & Authorization
- [ ] Admin endpoints use `withAuth()` wrapper
- [ ] State-changing endpoints require CSRF token (`requireCSRF: true`)
- [ ] Appropriate RBAC permissions checked (`requirePermission`)
- [ ] No hardcoded credentials or API keys
- [ ] Session validation performed before sensitive operations

### Data Handling
- [ ] All database queries use parameterized statements (`.bind()`)
- [ ] User input is validated (type, length, format)
- [ ] Error messages don't expose sensitive data
- [ ] PII is handled appropriately (logged, stored, transmitted)
- [ ] Audit logging added for state changes

### API Security
- [ ] Rate limiting applied to public APIs
- [ ] CORS headers properly configured
- [ ] Security headers included in responses
- [ ] Output encoding for XSS prevention
- [ ] SQL injection prevention (parameterized queries)

### Testing
- [ ] Unit tests cover security-critical code paths
- [ ] Integration tests validate auth/authz flows
- [ ] E2E tests verify user-facing security features
- [ ] No hardcoded test credentials in production code

### Dependencies
- [ ] `npm audit` shows no high/critical vulnerabilities
- [ ] Dependencies updated to latest stable versions
- [ ] New dependencies reviewed for security practices

---

## Common Security Vulnerabilities to Avoid

### 1. SQL Injection

**Vulnerable Pattern:**
```typescript
// String concatenation (vulnerable to SQL injection)
const query = `SELECT * FROM documents WHERE id = '${userInput}'`;
const result = await env.DB.prepare(query).all();
```

**Safe Pattern:**
```typescript
// Parameterized query (safe)
const result = await env.DB.prepare(
  'SELECT * FROM documents WHERE id = ?'
).bind(userInput).first();
```

### 2. XSS (Cross-Site Scripting)

**Vulnerable Pattern:**
```typescript
// Direct HTML insertion (vulnerable)
<div>{<span dangerouslySetInnerHTML={{ __html: userInput }} />}</div>
```

**Safe Pattern:**
```typescript
// React auto-escapes content (safe)
<div>{userInput}</div>
```

### 3. CSRF (Cross-Site Request Forgery)

**Vulnerable Pattern:**
```typescript
// Missing CSRF protection (vulnerable)
export const onRequestPost = withAuth(handleDelete, {});
```

**Safe Pattern:**
```typescript
// CSRF token required (safe)
export const onRequestPost = withAuth(handleDelete, {
  requireCSRF: true,
  requirePermission: Permission.DOCUMENTS_DELETE,
});
```

### 4. Authentication Bypass

**Vulnerable Pattern:**
```typescript
// No authentication check (vulnerable)
export const onRequestDelete = async (context) => {
  await deleteDocument(context);
};
```

**Safe Pattern:**
```typescript
// Protected with authentication and authorization (safe)
export const onRequestDelete = withAuth(handleDelete, {
  requireCSRF: true,
  requirePermission: Permission.DOCUMENTS_DELETE,
});
```

### 5. Sensitive Data Exposure

**Vulnerable Pattern:**
```typescript
// Exposes internal database details (vulnerable)
throw new Error(`Database error: ${err.message} in table users`);
```

**Safe Pattern:**
```typescript
// Generic error message, detailed logging server-side (safe)
console.error('Database error:', err);
throw new Error('An error occurred while processing your request');
```

### 6. Broken Access Control

**Vulnerable Pattern:**
```typescript
// No permission check (vulnerable)
export const onRequestGet = withAuth(handleGetAllUsers);
```

**Safe Pattern:**
```typescript
// Role-based access control enforced (safe)
export const onRequestGet = withAuth(handleGetAllUsers, {
  requirePermission: Permission.ADMIN_SETTINGS,
  requireRole: UserRole.ADMIN,
});
```

---

## Input Validation Patterns

### UUID Validation
```typescript
const isValidId = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};
```

### Email Validation
```typescript
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```

### Required Fields Validation
```typescript
if (!body.title || typeof body.title !== 'string') {
  throw new Error('Title is required and must be a string');
}
```

### Range Validation
```typescript
if (page < 1 || page > 1000) {
  throw new Error('Page number out of range');
}
```

---

## Error Handling Best Practices

### Wrong Approach (Exposes Internal Details)
```typescript
throw new Error(`Failed to connect to database ${dbName} at ${host}`);
```

### Correct Approach (Generic Error Message)
```typescript
console.error('Database connection failed:', { error: err.message, host, dbName });
throw new Error('Unable to process your request. Please try again later.');
```

### With Audit Logging (Recommended)
```typescript
await logAudit(env, {
  action: 'database_error',
  performedBy: context.auth.user.login,
  targetType: 'system',
  targetId: 'database_connection',
  details: { error: err.message },
});
throw new Error('Unable to process your request. Please try again later.');
```

---

## Secret Management

### Wrong Approach (Hardcoded Secrets)
```typescript
const API_KEY = 'hardcoded-api-key-here';
```

### Correct Approach (Environment Variables)
```typescript
const API_KEY = env.API_KEY;  // Cloudflare environment variable
```

### Local Development
```typescript
// .env file (gitignored)
API_KEY=your_api_key_here

// Code
const API_KEY = env.API_KEY;
```

---

## Audit Logging Pattern

Always log state-changing operations:

```typescript
import { logAudit, AuditActions, AuditTargetTypes } from '../../utils/audit-log';

await logAudit(env, {
  action: AuditActions.CREATE_DOCUMENT,
  performedBy: context.auth.user.login,
  targetType: AuditTargetTypes.DOCUMENT,
  targetId: documentId,
  details: {
    title: document.title,
    type: document.type,
    category: document.category,
  },
});
```

**When to Log:**
- ✅ POST (create)
- ✅ PUT/PATCH (update)
- ✅ DELETE (delete)
- ❌ GET (read-only - no state change)

---

## Security Testing Checklist

### Unit Tests
- [ ] CSRF token generation and validation
- [ ] RBAC permission checks
- [ ] Input validation functions
- [ ] Audit logging utilities

### Integration Tests
- [ ] OAuth flow (GitHub, Google)
- [ ] Session management
- [ ] Protected endpoint access
- [ ] CSRF protection on state changes

### E2E Tests
- [ ] Admin login flow
- [ ] Permission-based access control
- [ ] CSRF token handling
- [ ] Session timeout

---

## Pre-Commit Checklist

Before committing code, verify:

- [ ] `npm run lint` passes (zero errors, zero warnings)
- [ ] `npm run test` passes (all tests green)
- [ ] `npx tsc --noEmit` passes (no type errors)
- [ ] `npm audit` shows no high/critical vulnerabilities
- [ ] No hardcoded secrets in code
- [ ] All database queries use parameterized statements
- [ ] Admin endpoints use `withAuth()` wrapper
- [ ] State changes include audit logging

---

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All pre-commit checks pass
- [ ] Security review completed (for major features)
- [ ] Dependencies updated (no known vulnerabilities)
- [ ] Environment variables configured in Cloudflare
- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] Monitoring/alerting configured (if applicable)

---

## Security Resources

### Internal Documentation
- [Security Guide](docs/SECURITY-GUIDE.md) - Comprehensive security documentation
- [Privacy Documentation](docs/PRIVACY.md) - Data protection practices
- [RBAC Implementation Guide](docs/RBAC-IMPLEMENTATION-GUIDE.md) - Access control usage

### External Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Web application security risks
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) - Security best practices
- [Cloudflare Security](https://developers.cloudflare.com/) - Platform security features

### Security Tools
```bash
# Dependency vulnerability scanning
npm audit

# Run security-focused tests
npm run test

# Code quality (includes security patterns)
npm run lint

# Type safety (prevents many bugs)
npx tsc --noEmit
```

---

## Quick Reference Commands

```bash
# Security audit
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check for outdated packages
npm outdated

# Run all tests
npm run test

# Check code quality
npm run lint

# Type checking
npx tsc --noEmit
```

---

**Version:** 1.0
**Last Updated:** 2026-02-28
**Maintained by:** BetterLB Development Team

**Questions?** Refer to [Security Guide](docs/SECURITY-GUIDE.md) or open a GitHub issue.
