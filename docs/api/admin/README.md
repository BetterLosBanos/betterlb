# Admin API Overview

The Admin API provides endpoints for managing the BetterLB municipal government portal. All admin endpoints require authentication and implement CSRF protection for state-changing operations.

## Overview

- **Base URL:** `https://betterlb.gov.ph/api/admin/`
- **Authentication:** GitHub OAuth (required for all endpoints)
- **CSRF Protection:** Required for all state-changing operations (POST/PUT/PATCH/DELETE)
- **Rate Limiting:** 100 requests per minute per session

---

## Authentication

### GitHub OAuth Flow

All admin endpoints use GitHub OAuth for authentication:

1. **Redirect to Login:** User visits `/api/admin/auth/login`
2. **GitHub Authorization:** User authorizes the BetterLB app
3. **Callback Handler:** GitHub redirects to `/api/admin/auth/callback`
4. **Session Creation:** Server creates session and sets `admin_session` cookie
5. **Authenticated Requests:** Include session cookie in subsequent requests

### Session Management

**Session Cookie:**
- **Name:** `admin_session`
- **Duration:** 24 hours
- **Storage:** Cloudflare KV
- **Format:** JSON with user data and expiration

**Session Data Structure:**
```json
{
  "user": {
    "id": 1234567,
    "login": "username",
    "name": "Display Name",
    "email": "user@example.com",
    "avatar_url": "https://github.com/username.png"
  },
  "login_at": "2026-02-28T12:00:00.000Z",
  "expires_at": "2026-02-29T12:00:00.000Z",
  "role": "admin"
}
```

### Authorization

**Authorized Users:**
- Users must be listed in `AUTHORIZED_USERS` environment variable
- Format: JSON array of GitHub usernames
- Example: `["user1", "user2", "user3"]`

**Roles and Permissions:**
- Role-based access control (RBAC) implemented
- See [RBAC Utilities](../../../functions/utils/rbac.ts) for details

---

## CSRF Protection

### What is CSRF?

Cross-Site Request Forgery (CSRF) is an attack that forces an end user to execute unwanted actions on a web application in which they're currently authenticated.

### CSRF Implementation

**Token-Based Protection:**
1. **Get Token:** Fetch CSRF token from `/api/admin/auth/csrf`
2. **Include Token:** Add token to `X-CSRF-Token` header
3. **Validation:** Server validates token before processing request

**Token Properties:**
- **Format:** UUID v4
- **Storage:** Cloudflare KV
- **Expiration:** 24 hours
- **Usage:** One-time use (consumed after validation)

**Required For:**
- All POST requests
- All PUT requests
- All PATCH requests
- All DELETE requests

**NOT Required For:**
- GET requests
- HEAD requests
- OPTIONS requests

---

## Common Patterns

### Making Authenticated Requests

**1. Login:**
```typescript
// Redirect to GitHub OAuth
window.location.href = 'https://betterlb.gov.ph/api/admin/auth/login';
```

**2. Check Session:**
```typescript
const response = await fetch('https://betterlb.gov.ph/api/admin/auth/session', {
  credentials: 'include', // Include session cookie
});

const data = await response.json();
if (data.authenticated) {
  console.log('Logged in as:', data.user.login);
}
```

**3. Make Authenticated Request (GET):**
```typescript
const response = await fetch('https://betterlb.gov.ph/api/admin/documents', {
  credentials: 'include',
});

const data = await response.json();
```

**4. Make Authenticated Request (POST with CSRF):**
```typescript
// Get CSRF token first
const csrfResponse = await fetch('https://betterlb.gov.ph/api/admin/auth/csrf', {
  credentials: 'include',
});
const { csrfToken } = await csrfResponse.json();

// Make CSRF-protected request
const response = await fetch('https://betterlb.gov.ph/api/admin/documents', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify({ title: 'New Document' }),
});

const data = await response.json();
```

---

## API Endpoints

### Authentication Endpoints

| Endpoint | Method | Description | Auth Required | CSRF Required |
|----------|--------|-------------|---------------|---------------|
| `/api/admin/auth/login` | GET | Initiate GitHub OAuth flow | No | No |
| `/api/admin/auth/callback` | GET | GitHub OAuth callback handler | No | No |
| `/api/admin/auth/logout` | POST | Logout and clear session | Yes | Yes |
| `/api/admin/auth/session` | GET | Get current session info | Yes | No |
| `/api/admin/auth/csrf` | GET | Get CSRF token | Yes | No |

**Documentation:** [Authentication API](./authentication.md)

### Document Management Endpoints

| Endpoint | Method | Description | Auth Required | CSRF Required |
|----------|--------|-------------|---------------|---------------|
| `/api/admin/documents` | GET | List documents with filtering | Yes | No |
| `/api/admin/documents` | POST | Bulk create documents | Yes | Yes |
| `/api/admin/documents/:id` | GET | Get document details | Yes | No |
| `/api/admin/documents/:id` | PATCH | Update document | Yes | Yes |
| `/api/admin/documents/resolve-duplicate` | POST | Resolve duplicate documents | Yes | Yes |
| `/api/admin/documents/bulk` | POST | Bulk operations on documents | Yes | Yes |

**Documentation:** [Documents API](./documents.md)

### Review Queue Endpoints

| Endpoint | Method | Description | Auth Required | CSRF Required |
|----------|--------|-------------|---------------|---------------|
| `/api/admin/review-queue` | GET | List review queue items | Yes | No |
| `/api/admin/review-queue` | POST | Add item to review queue | Yes | Yes |
| `/api/admin/review-queue/assign` | POST | Assign item to user | Yes | Yes |
| `/api/admin/review-queue/status` | POST | Update item status | Yes | Yes |

**Documentation:** [Review Queue API](./review-queue.md)

### Person Management Endpoints

| Endpoint | Method | Description | Auth Required | CSRF Required |
|----------|--------|-------------|---------------|---------------|
| `/api/admin/persons/merge` | POST | Merge duplicate persons | Yes | Yes |
| `/api/admin/persons-deletion-queue` | GET | List soft-deleted persons | Yes | No |
| `/api/admin/persons-deletion-queue` | POST | Restore or permanently delete | Yes | Yes |
| `/api/admin/persons-search` | GET | Search persons by name | Yes | No |

**Documentation:** [Persons API](./persons.md)

### Data Reconciliation Endpoints

| Endpoint | Method | Description | Auth Required | CSRF Required |
|----------|--------|-------------|---------------|---------------|
| `/api/admin/reconcile` | GET | List data conflicts | Yes | No |
| `/api/admin/reconcile` | POST | Resolve data conflict | Yes | Yes |

**Documentation:** [Data Reconciliation API](./data-reconciliation.md)

### Audit Logging Endpoints

| Endpoint | Method | Description | Auth Required | CSRF Required |
|----------|--------|-------------|---------------|---------------|
| `/api/admin/audit-logs` | GET | Query audit logs | Yes | No |

**Documentation:** [Audit Logging API](./audit-logging.md)

### Statistics Endpoints

| Endpoint | Method | Description | Auth Required | CSRF Required |
|----------|--------|-------------|---------------|---------------|
| `/api/admin/stats` | GET | Dashboard statistics | Yes | No |
| `/api/admin/recent-activity` | GET | Recent resolved items | Yes | No |
| `/api/admin/terms` | GET | List terms | Yes | No |
| `/api/admin/subjects-search` | GET | Search subjects | Yes | No |
| `/api/admin/sessions` | GET | List sessions | Yes | No |
| `/api/admin/sessions` | POST | Create session | Yes | Yes |

**Documentation:** [Statistics API](./statistics.md)

### Error Management Endpoints

| Endpoint | Method | Description | Auth Required | CSRF Required |
|----------|--------|-------------|---------------|---------------|
| `/api/admin/errors` | GET | List parse errors | Yes | No |
| `/api/admin/errors/:id/retry` | POST | Retry failed document parse | Yes | Yes |
| `/api/admin/errors/:id` | DELETE | Delete error log | Yes | Yes |

**Documentation:** [Error Management API](./errors.md)

### Data Import Endpoints

| Endpoint | Method | Description | Auth Required | CSRF Required |
|----------|--------|-------------|---------------|---------------|
| `/api/admin/parse-facebook-post` | POST | Parse Facebook session posts | Yes | Yes |
| `/api/admin/parse-legislative-post` | POST | Parse Facebook legislative posts | Yes | Yes |

**Documentation:** [Data Import API](./data-import.md)

---

## Response Patterns

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "error": "Error message describing what went wrong"
}
```

### Pagination Response

```json
{
  "items": [...],
  "pagination": {
    "total": 150,
    "limit": 100,
    "offset": 0,
    "has_more": true
  }
}
```

---

## Error Handling

| HTTP Code | Meaning | Common Causes |
|-----------|---------|---------------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully |
| 204 | No Content | Delete operation successful |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Not logged in, session expired, or not authorized |
| 403 | Forbidden | User lacks required permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource, constraint violation |
| 415 | Unsupported Media Type | Wrong Content-Type header |
| 422 | Unprocessable Entity | CSRF token validation failed |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Required service unavailable (e.g., GitHub API) |

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `BETTERLB_DB` | D1 database binding | Cloudflare D1 binding |
| `WEATHER_KV` | KV namespace for sessions and CSRF tokens | Cloudflare KV binding |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | `github_client_id` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | `github_client_secret` |
| `AUTHORIZED_USERS` | JSON array of authorized GitHub usernames | `["user1", "user2"]` |

### Optional

| Variable | Description | Example |
|----------|-------------|---------|
| `ADMIN_REDIRECT_URI` | Custom OAuth redirect URI | `https://custom.domain/admin/auth/callback` |

---

## Security Features

### Authentication

- **GitHub OAuth:** Industry-standard OAuth 2.0 flow
- **Session Validation:** Every request validates session
- **User Authorization:** Only authorized users can access admin APIs
- **Session Expiration:** 24-hour session lifetime
- **Automatic Logout:** Expired sessions automatically invalidated

### CSRF Protection

- **Token-Based:** One-time use tokens prevent CSRF
- **Required for State Changes:** All POST/PUT/PATCH/DELETE requests
- **Token Expiration:** 24-hour token lifetime
- **Secure Storage:** Tokens stored in Cloudflare KV

### Audit Logging

- **All State Changes Logged:** Create, update, delete operations
- **Action Tracking:** Who did what and when
- **Compliance:** Supports security audits and compliance requirements
- **Queryable:** Full audit log query API

### Rate Limiting

- **Per-Session Limits:** 100 requests per minute
- **Automatic:** Enforced at the session level
- **Headers Included:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Testing

### Manual Testing

```bash
# 1. Login (opens browser)
# Navigate to: https://betterlb.gov.ph/api/admin/auth/login

# 2. Get session cookie from browser dev tools
# Application > Cookies > admin_session

# 3. Test authenticated endpoint
curl https://betterlb.gov.ph/api/admin/auth/session \
  -H "Cookie: admin_session=<your-session-cookie>"

# 4. Get CSRF token
curl https://betterlb.gov.ph/api/admin/auth/csrf \
  -H "Cookie: admin_session=<your-session-cookie>"

# 5. Make CSRF-protected request
curl -X POST https://betterlb.gov.ph/api/admin/documents \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <csrf-token>" \
  -H "Cookie: admin_session=<your-session-cookie>" \
  -d '{"title":"Test Document","type":"ordinance"}'
```

---

## SDK Examples

### TypeScript/JavaScript

**Authenticated Request:**
```typescript
const response = await fetch('https://betterlb.gov.ph/api/admin/documents', {
  credentials: 'include', // Include session cookie
});
const data = await response.json();
```

**CSRF-Protected Request:**
```typescript
// Get CSRF token
const csrfResponse = await fetch('https://betterlb.gov.ph/api/admin/auth/csrf', {
  credentials: 'include',
});
const { csrfToken } = await csrfResponse.json();

// Make request
const response = await fetch('https://betterlb.gov.ph/api/admin/documents', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify({ title: 'New Document' }),
});
```

**Logout:**
```typescript
const response = await fetch('https://betterlb.gov.ph/api/admin/auth/logout', {
  method: 'POST',
  credentials: 'include',
});
```

---

## References

- **Main API Documentation:** [../README.md](../README.md)
- **Authentication Utilities:** `../../../functions/utils/admin-auth.ts`
- **CSRF Utilities:** `../../../functions/utils/csrf.ts`
- **Audit Logging:** `../../../functions/utils/audit-log.ts`
- **RBAC Utilities:** `../../../functions/utils/rbac.ts`

---

**Last Updated:** 2026-02-28
**API Version:** 1.0.0
**Maintained By:** BetterLB Development Team
