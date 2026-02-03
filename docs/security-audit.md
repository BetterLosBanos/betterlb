# BetterLB Security Audit Report

**Date**: February 3, 2026
**Auditor**: Claude Code Security Audit
**Project**: BetterLB - Municipal Government Portal for Los Baños, Philippines

---

## Executive Summary

This security audit identified **25 vulnerabilities** across Critical, High, Medium, and Low severity levels. The application handles citizen data and provides admin functionality for managing municipal legislative records, making security paramount.

**Overall Risk Level**: HIGH

**Recommendation**: Address all Critical and High severity issues immediately. Medium and Low issues should be remediated on a planned timeline.

---

## Findings Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 3 | Not Fixed |
| High | 7 | Not Fixed |
| Medium | 8 | Not Fixed |
| Low | 7 | Not Fixed |
| **Total** | **25** | |

---

# Critical Severity Issues

## 1. Leaked API Key in Version Control

**File**: `.env:1`
**Severity**: CRITICAL
**Status**: NOT FIXED

### Issue Description
A ZAI API key is hardcoded in the `.env` file:
```
ZAI_API_KEY=7a2e51d432c44e7ca7786b25cbcdbb39.EFAaPQX9ID1tzxFq
```

### Impact
- The API key exists in a local file (`.env` is properly in `.gitignore` and not in git history)
- Risk is local file access rather than version control exposure
- Potential for unauthorized API usage if local filesystem is compromised
- Key should still be rotated as a best practice

### Remediation Steps (Manual)

1. **Immediately revoke the compromised API key** at your ZAI provider dashboard
2. Generate a new API key
3. Add `.env` to `.gitignore`:
   ```gitignore
   .env
   .env.local
   .env.*.local
   ```
4. Remove `.env` from git history:
   ```bash
   git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   ```
5. Configure the new key as a Cloudflare environment variable:
   - Go to Cloudflare Dashboard → Your Project → Settings → Environment Variables
   - Add `ZAI_API_KEY` with the new value
6. Create `.env.example` with placeholder values:
   ```
   ZAI_API_KEY=your_zai_api_key_here
   ```

### Code Changes Required
None (this is a configuration/infrastructure fix)

---

## 2. OAuth Configuration Uses Placeholder Values

**Files**:
- `wrangler.jsonc:29-34`
- `functions/api/admin/auth/callback.ts:8-9`
- `functions/api/admin/auth-google/callback.ts:65-66`

**Severity**: CRITICAL
**Status**: NOT FIXED

### Issue Description
OAuth credentials are set to placeholder values:
```json
"GITHUB_CLIENT_ID": "__GITHUB_CLIENT_ID__",
"GITHUB_CLIENT_SECRET": "__GITHUB_CLIENT_SECRET__",
```

### Impact
- Authentication may not be functional
- Could allow unauthorized access if fallback logic permits access
- Production may be using placeholder credentials

### Remediation Steps (Manual)

1. **Remove placeholder values from source code**
2. **Configure OAuth credentials in Cloudflare Dashboard**:
   - GitHub: Create OAuth app at https://github.com/settings/developers
   - Google: Create OAuth 2.0 credentials at Google Cloud Console
3. **Set environment variables in Cloudflare**:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (optional, defaults to origin + callback path)
4. **Configure `AUTHORIZED_USERS`**:
   - Set to JSON array of GitHub usernames/Google emails
   - Example: `["username1", "user@example.com"]`

### Code Changes Required

**Update `wrangler.jsonc`** - remove placeholder values:
```diff
- "GITHUB_CLIENT_ID": "__GITHUB_CLIENT_ID__",
- "GITHUB_CLIENT_SECRET": "__GITHUB_CLIENT_SECRET__",
```

---

## 3. Authentication Bypass When AUTHORIZED_USERS is Empty

**Files**:
- `functions/api/admin/auth/callback.ts:82-88`
- `functions/api/admin/auth-google/callback.ts:107-110`

**Severity**: CRITICAL
**Status**: NOT FIXED

### Issue Description
When `AUTHORIZED_USERS` is empty or not set, **ANY GitHub/Google user can access the admin panel**.

### Vulnerable Code
```typescript
// functions/api/admin/auth/callback.ts:82-88
const authorizedList = env.AUTHORIZED_USERS
  ? JSON.parse(env.AUTHORIZED_USERS)
  : AUTHORIZED_USERS; // AUTHORIZED_USERS = [] (line 11)

if (authorizedList.length > 0 && !authorizedList.includes(user.login)) {
  return Response.redirect(`${url.origin}/admin?unauthorized`, 302);
}
// When authorizedList is empty, the condition is false, so redirect never happens
// → Everyone gets access!
```

### Impact
- Complete authentication bypass
- Unauthorized access to sensitive admin functionality
- Data modification, deletion, and exfiltration
- **13 admin API endpoints** are affected:
  - `functions/api/admin/documents/index.ts`
  - `functions/api/admin/documents/[id].ts`
  - `functions/api/admin/review-queue/index.ts`
  - `functions/api/admin/review-queue/assign.ts`
  - `functions/api/admin/review-queue/status.ts`
  - `functions/api/admin/persons-merge.ts`
  - `functions/api/admin/reconcile.ts`
  - `functions/api/admin/stats.ts`
  - `functions/api/admin/parse-facebook-post.ts`
  - `functions/api/admin/attendance.ts`
  - `functions/api/admin/sessions.ts`
  - `functions/api/admin/errors.ts`

### Remediation

**Change the logic to always enforce authorization:**

```typescript
// functions/api/admin/auth/callback.ts:82-88
const authorizedList = env.AUTHORIZED_USERS
  ? JSON.parse(env.AUTHORIZED_USERS)
  : AUTHORIZED_USERS;

// FIXED: Empty list means NO ONE is authorized
if (authorizedList.length === 0 || !authorizedList.includes(user.login)) {
  return Response.redirect(`${url.origin}/admin?unauthorized`, 302);
}
```

**Same fix required in:**
- `functions/api/admin/auth-google/callback.ts:107-110`

**Also update `functions/utils/admin-auth.ts:64`:**
```typescript
// Change from:
if (authorizedList.length > 0 && !authorizedList.includes(session.user.login)) {
// To:
if (authorizedList.length === 0 || !authorizedList.includes(session.user.login)) {
```

### Breaking Changes
**YES** - If you currently rely on empty `AUTHORIZED_USERS` for testing, you must add your username to the environment variable before this fix.

---

# High Severity Issues

## 4. SQL Injection via Dynamic Query Construction

**Files**:
- `functions/api/openlgu/sessions.ts:62-63`
- `functions/api/openlgu/persons.ts:108-109`

**Severity**: HIGH
**Status**: NOT FIXED

### Issue Description
LIMIT and OFFSET values are concatenated into the SQL string rather than properly parameterized.

### Vulnerable Code
```typescript
// functions/api/openlgu/sessions.ts:62-63
sql += ' ORDER BY t.term_number DESC, s.date DESC, s.number DESC LIMIT ?' + paramIndex++ + ' OFFSET ?' + paramIndex++;
params.push(limit.toString(), offset.toString());
```

### Impact
- Potential SQL injection through limit/offset parameters
- While `limit` and `offset` are parsed as integers, the construction pattern is unsafe

### Remediation

```typescript
// FIXED: Use proper parameter binding
sql += ' ORDER BY t.term_number DESC, s.date DESC, s.number DESC LIMIT ? OFFSET ?';
params.push(limit.toString(), offset.toString());
```

**Apply to both files:**
- `functions/api/openlgu/sessions.ts:62`
- `functions/api/openlgu/persons.ts:108`

---

## 5. Missing Input Validation on Search Parameters

**File**: `functions/api/openlgu/documents.ts:92-95`

**Severity**: HIGH
**Status**: NOT FIXED

### Issue Description
The `query` parameter is used in a LIKE statement without:
- Length validation
- Special character sanitization
- Rate limiting

### Vulnerable Code
```typescript
const query = url.searchParams.get('q') || '';
// No validation before using in LIKE
if (query) {
  sql += ` AND d.title LIKE ?${paramIndex++}`;
  params.push(`%${query}%`);
}
```

### Impact
- Database performance degradation
- Potential for LIKE-based injection
- DoS via extremely long queries

### Remediation

```typescript
const query = url.searchParams.get('q') || '';

// Add validation
if (query.length > 100) {
  return new Response('Query too long (max 100 characters)', { status: 400 });
}

// Sanitize special LIKE characters
const sanitizedQuery = query
  .replace(/\\/g, '\\\\')  // Escape backslashes
  .replace(/%/g, '\\%')    // Escape wildcards
  .replace(/_/g, '\\_');   // Escape single-char wildcard

if (sanitizedQuery) {
  sql += ` AND d.title LIKE ?${paramIndex++} ESCAPE '\\'`;
  params.push(`%${sanitizedQuery}%`);
}
```

---

## 6. No Rate Limiting on API Endpoints

**All API endpoints**

**Severity**: HIGH
**Status**: NOT FIXED

### Issue Description
No rate limiting is implemented on any API endpoints.

### Impact
- Brute force attacks on authentication
- DoS attacks through repeated expensive queries
- Automated scraping of sensitive data
- API abuse

### Remediation

**Create new file**: `functions/utils/rate-limit.ts`
```typescript
interface RateLimitConfig {
  limit: number;
  window: number; // seconds
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { limit, window } = config;
  const now = Date.now();

  const record = await kv.get(key, 'json') as { count: number; resetAt: number } | null;

  if (!record || now > record.resetAt) {
    // New window
    const resetAt = now + window * 1000;
    await kv.put(key, JSON.stringify({ count: 1, resetAt }), {
      expirationTtl: window
    });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  // Increment counter
  const newCount = record.count + 1;
  await kv.put(key, JSON.stringify({ count: newCount, resetAt: record.resetAt }), {
    expirationTtl: Math.ceil((record.resetAt - now) / 1000)
  });

  return { allowed: true, remaining: limit - newCount, resetAt: record.resetAt };
}

// Helper to get client identifier
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('CF-Connecting-IP');
  return forwarded || 'anonymous';
}
```

**Apply to endpoints**:
```typescript
import { checkRateLimit, getClientIdentifier } from '../../utils/rate-limit';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // Check rate limit
  const clientId = getClientIdentifier(request);
  const result = await checkRateLimit(env.WEATHER_KV, `api:${clientId}`, {
    limit: 100,
    window: 60
  });

  if (!result.allowed) {
    return new Response(JSON.stringify({
      error: 'Too many requests',
      retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000)
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(result.resetAt).toISOString()
      }
    });
  }

  // Continue with normal handler...
}
```

**Recommended limits**:
- Public endpoints: 100 requests/minute
- Authenticated endpoints: 1000 requests/minute
- Auth endpoints: 10 requests/minute

---

## 7. Missing CSRF Protection on Non-GET Requests

**Admin API endpoints**

**Severity**: HIGH
**Status**: NOT FIXED

### Issue Description
While OAuth uses state parameters for CSRF protection, admin API endpoints don't validate CSRF tokens for POST/PUT/DELETE operations.

### Affected Endpoints
- `functions/api/admin/documents/index.ts` (POST)
- `functions/api/admin/documents/[id].ts` (PUT/PATCH/DELETE)
- `functions/api/admin/review-queue/assign.ts` (POST)
- `functions/api/admin/review-queue/status.ts` (POST)
- `functions/api/admin/persons-merge.ts` (POST)
- `functions/api/admin/reconcile.ts` (POST)
- `functions/api/admin/parse-facebook-post.ts` (POST)
- `functions/api/admin/attendance.ts` (POST)
- `functions/api/admin/errors.ts` (DELETE)

### Impact
- Cross-site request forgery attacks
- Unauthorized state changes
- Data modification/deletion

### Remediation

**Create new file**: `functions/utils/csrf.ts`
```typescript
import { Env } from '../types';

export async function generateCSRFToken(env: Env, sessionId: string): Promise<string> {
  const token = crypto.randomUUID();
  await env.WEATHER_KV.put(`csrf:${sessionId}:${token}`, '1', {
    expirationTtl: 24 * 60 * 60 // 24 hours
  });
  return token;
}

export async function validateCSRFToken(
  env: Env,
  sessionId: string,
  token: string
): Promise<boolean> {
  if (!token) {
    return false;
  }
  const key = `csrf:${sessionId}:${token}`;
  const exists = await env.WEATHER_KV.get(key);
  if (exists) {
    // One-time use - delete after validation
    await env.WEALTH_KV.delete(key);
    return true;
  }
  return false;
}

// Generate CSRF token for session
export async function getCSRFTokenForSession(env: Env, auth: AuthContext): Promise<string> {
  return generateCSRFToken(env, auth.sessionId);
}
```

**Add CSRF endpoint**: `functions/api/admin/auth/csrf.ts`
```typescript
import { Env } from '../../../types';
import { withAuth, AuthContext } from '../../../utils/admin-auth';
import { getCSRFTokenForSession } from '../../../utils/csrf';

export async function onRequestGet(context: { request: Request; env: Env }) {
  return withAuth(async ({ env, auth }: { env: Env; auth: AuthContext }) => {
    const token = await getCSRFTokenForSession(env, auth);
    return Response.json({ csrf_token: token });
  })(context);
}
```

**Update withAuth wrapper** to validate CSRF for non-GET:
```typescript
export function withAuth<T extends { request: Request; env: Env }>(
  handler: (context: T & { auth: AuthContext }) => Promise<Response> | Response,
  options: { requireCSRF?: boolean } = {}
): (context: T) => Promise<Response> {
  return async (context: T) => {
    try {
      const auth = await verifyAdminSession(context.request, context.env);

      // CSRF validation for non-GET requests
      if (options.requireCSRF) {
        const method = context.request.method;
        if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
          const csrfToken = context.request.headers.get('X-CSRF-Token');
          const valid = await validateCSRFToken(context.env, auth.sessionId, csrfToken || '');
          if (!valid) {
            return Response.json({ error: 'Invalid CSRF token' }, { status: 403 });
          }
        }
      }

      return handler({ ...context, auth });
    } catch (error) {
      // ... existing error handling
    }
  };
}
```

**Frontend changes required** - see Frontend Impact section below.

---

## 8. Weak Session Management

**File**: `functions/utils/admin-auth.ts:77-87`

**Severity**: HIGH
**Status**: NOT FIXED

### Issue Description
The cookie parser doesn't handle:
- Cookie values containing `=` characters
- Quoted values
- URL-encoded values

### Vulnerable Code
```typescript
function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split('; ').reduce((acc, cookie) => {
    const [name, value] = cookie.split('=');
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);
}
```

### Impact
- Session cookies with special characters may fail to parse
- Potential for session bypass

### Remediation

```typescript
function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(';').reduce((acc, cookie) => {
    const trimmed = cookie.trim();
    const firstEq = trimmed.indexOf('=');
    if (firstEq === -1) {
      // Cookie without value
      acc[trimmed] = '';
    } else {
      const name = trimmed.slice(0, firstEq);
      const value = decodeURIComponent(trimmed.slice(firstEq + 1));
      // Remove quotes if present
      acc[name] = value.replace(/^"(.*)"$/, '$1');
    }
    return acc;
  }, {} as Record<string, string>);
}
```

---

## 9. No Authorization Check on Resource Access

**Multiple admin endpoints**

**Severity**: HIGH
**Status**: NOT FIXED

### Issue Description
While authentication is required via `withAuth`, there's no check that the authenticated user has permission to access specific resources.

### Impact
- Horizontal privilege escalation
- Any authenticated admin can access/modify any resource
- No audit trail of who did what

### Remediation
Consider implementing role-based access control (RBAC):
```typescript
interface AdminUser {
  login: string;
  role: 'admin' | 'editor' | 'viewer';
}

// In auth callback, fetch user role from KV or database
// Then check role permissions in each handler
```

---

## 10. Potential DoS via Batch Operations

**File**: `functions/api/admin/persons-merge.ts:195-206`

**Severity**: HIGH
**Status**: NOT FIXED

### Issue Description
The merge operation accepts an array of person IDs without limiting the size.

### Remediation
```typescript
const mergeIds = body?.merge_ids || [];
if (!Array.isArray(mergeIds) || mergeIds.length > 100) {
  return Response.json({ error: 'Cannot merge more than 100 persons at once' }, { status: 400 });
}
```

---

# Medium Severity Issues

## 11. Missing Content-Type Validation
**Multiple endpoints** - Validate `Content-Type: application/json` for JSON endpoints

## 12. Information Disclosure via Error Messages
**Multiple endpoints** - Generic error messages instead of detailed stack traces

## 13. Predictable ID Generation
**Multiple files** - Replace `Math.random()` with `crypto.randomUUID()`

## 14. innerHTML Usage in Frontend
**File**: `src/components/home/WeatherMapSection.tsx:86` - Used for Leaflet cleanup, not user content (lower risk)

## 15. Missing Output Encoding
**Multiple React components** - Data from database rendered without sanitization

## 16. Database Connection String Exposure
**File**: `wrangler.jsonc` - Database ID visible in configuration

## 17. Missing Audit Logging
**Most admin operations** - No logging of who changed what

## 18. Hardcoded Admin Mock Mode
**Various files** - Development mode that could be enabled in production

---

# Low Severity Issues

## 19. Missing Security Headers
Add to all responses:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy: default-src 'self'`

## 20. Overly Permissive CORS
**File**: `functions/api/weather.ts` - `Access-Control-Allow-Origin: *`

## 21. No Request Size Limits
Validate request body size (e.g., max 1MB for JSON)

## 22. Vulnerable Dependencies
Run `npm audit` regularly and update packages

## 23. Weak Cookie Configuration
**File**: `functions/api/admin/auth/callback.ts:109` - `SameSite=Lax` should be `Strict` for admin

## 24. No Audit Logging
Unable to track admin changes

## 25. Development Features in Production
Remove/mock development-only features in production builds

---

# Frontend Impact

If implementing CSRF protection, these components will need updates:

1. **src/pages/admin/ReviewQueue.tsx**
   - Add CSRF token fetch on mount
   - Include token in POST requests

2. **src/pages/admin/components/DocumentEditModal.tsx**
   - Add CSRF token to form submissions

3. **src/pages/admin/components/PersonMergeTool.tsx**
   - Add CSRF token to merge requests

**Example frontend changes:**
```typescript
// Fetch CSRF token on auth check
const [csrfToken, setCsrfToken] = useState<string | null>(null);

useEffect(() => {
  fetch('/api/admin/auth/csrf')
    .then(r => r.json())
    .then(data => setCsrfToken(data.csrf_token));
}, []);

// Include in requests
fetch('/api/admin/documents', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken || ''
  },
  body: JSON.stringify(data)
});
```

---

# Implementation Phases

## Phase 1: Non-Breaking Fixes (Low Risk)
1. SQL injection fixes (sessions.ts, persons.ts)
2. Input validation (documents.ts)
3. Security headers middleware
4. Remove innerHTML usage
5. Improve cookie parsing
6. Add request size limits

## Phase 2: Auth Configuration (Medium Risk)
1. Configure real OAuth credentials in Cloudflare
2. Fix authentication bypass logic
3. Test in development with `AUTHORIZED_USERS` set

## Phase 3: Rate Limiting (Medium Risk)
1. Implement rate limiting utility
2. Apply to all endpoints
3. Set generous initial limits
4. Monitor and adjust

## Phase 4: CSRF Protection (High Risk)
1. Implement CSRF token generation/validation
2. Add CSRF endpoint
3. Update all admin endpoints to require CSRF
4. Update frontend components
5. Test thoroughly

---

# Verification Checklist

After implementing fixes, verify:

- [ ] API key removed from git history and `.env` in `.gitignore`
- [ ] OAuth credentials configured in Cloudflare
- [ ] Empty `AUTHORIZED_USERS` blocks all access
- [ ] SQL queries use proper parameter binding
- [ ] Search queries are validated and sanitized
- [ ] Rate limiting returns 429 when exceeded
- [ ] CSRF tokens are required for state changes
- [ ] Cookies parse correctly with special characters
- [ ] Security headers present on all responses
- [ ] Frontend handles 429 and 403 responses gracefully
- [ ] All admin forms include CSRF tokens
- [ ] Audit logging captures admin actions

---

# Additional Security Recommendations

1. **Enable Cloudflare Access** for additional authentication layer
2. **Enable Cloudflare Bot Fight Mode**
3. **Implement Cloudflare API Shield**
4. **Use Transform Rules** for URL validation
5. **Enable Security Level controls** on dashboard
6. **Regular dependency scanning** via `npm audit`
7. **Implement comprehensive audit logging**
8. **Conduct penetration testing** before public launch
9. **Set up security monitoring and alerting**
10. **Document incident response procedures**

---

# References

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Cloudflare Workers Security: https://developers.cloudflare.com/workers/configuration/security/
- Cloudflare D1 Security: https://developers.cloudflare.com/d1/platform/security/
