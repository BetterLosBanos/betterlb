# BetterLB API Documentation

Welcome to the BetterLB API documentation. This system provides comprehensive documentation for all API endpoints available in the BetterLB municipal government portal.

## Overview

BetterLB exposes multiple API categories for different purposes:

- **Public APIs** - No authentication required, publicly accessible
- **Admin APIs** - GitHub OAuth authentication required, for administrative operations
- **OpenLGU API** - Public legislative data API for government transparency

## Base URL

All API endpoints are prefixed with `/api/`:

```
https://betterlb.gov.ph/api/
```

## Quick Start

### Public APIs (No Authentication)

1. **Weather API** - Get current weather and forecasts
   ```bash
   curl https://betterlb.gov.ph/api/weather
   ```

2. **Contribution API** - Submit community contributions
   ```bash
   curl -X POST https://betterlb.gov.ph/api/submit-contribution \
     -H "Content-Type: application/json" \
     -d '{"title":"Bug fix","content":"Description"}'
   ```

### Admin APIs (Authentication Required)

All admin endpoints require GitHub OAuth authentication:

1. **Login** - Redirect to GitHub OAuth
   ```bash
   curl https://betterlb.gov.ph/api/admin/auth/login
   ```

2. **Get Session** - Check authentication status
   ```bash
   curl https://betterlb.gov.ph/api/admin/auth/session \
     -H "Cookie: session=<your-session-cookie>"
   ```

3. **Make Authenticated Request** - Include session cookie in requests
   ```bash
   curl https://betterlb.gov.ph/api/admin/documents \
     -H "Cookie: session=<your-session-cookie>"
   ```

### OpenLGU API (Public Legislative Data)

Comprehensive documentation available in [openlgu-api.md](./openlgu-api.md)

```bash
# Get documents
curl https://betterlb.gov.ph/api/openlgu/documents?limit=10

# Get persons
curl https://betterlb.gov.ph/api/openlgu/persons?term=1

# Get terms
curl https://betterlb.gov.ph/api/openlgu/terms
```

---

## API Categories

### Public APIs

| API | Description | Authentication |
|-----|-------------|----------------|
| [Weather API](./weather-api.md) | Current weather and 3-hour forecast for Los Baños | None |
| [Contribution API](./contribution-api.md) | Create GitHub issues for community contributions | None |
| [OpenLGU API](./openlgu-api.md) | Legislative documents, persons, terms, sessions, committees | None |

### Admin APIs

See [Admin API Overview](./admin/README.md) for authentication and common patterns.

| API | Description | Documentation |
|-----|-------------|----------------|
| Authentication | GitHub OAuth login, logout, session management | [Auth API](./admin/authentication.md) |
| Documents | CRUD operations for legislative documents | [Documents API](./admin/documents.md) |
| Review Queue | Manage data quality review workflow | [Review Queue API](./admin/review-queue.md) |
| Person Management | Merge duplicate persons, manage deletion queue | [Persons API](./admin/persons.md) |
| Data Reconciliation | Resolve conflicts between data sources | [Reconciliation API](./admin/data-reconciliation.md) |
| Audit Logging | Query audit logs for compliance and security | [Audit Logging API](./admin/audit-logging.md) |
| Statistics | Dashboard statistics and activity feeds | [Statistics API](./admin/statistics.md) |

---

## Common Patterns

### Authentication Pattern

All Admin APIs use the `withAuth()` wrapper from `functions/utils/admin-auth.ts`:

1. **GitHub OAuth Flow:**
   - User visits `/api/admin/auth/login` → Redirects to GitHub OAuth
   - GitHub redirects to `/api/admin/auth/callback` → Creates session
   - Session stored in Cloudflare KV with 24-hour expiry

2. **Session Cookie:**
   - After login, browser receives `session` cookie
   - Include this cookie in all subsequent admin requests
   - Session format: `{"login":"username","name":"Display Name","avatar":"url"}`

3. **Authentication Required:**
   ```typescript
   // Frontend example
   const response = await fetch('/api/admin/documents', {
     headers: {
       'Cookie': 'session=<your-session-cookie>'
     }
   });
   ```

### CSRF Protection Pattern

**All state-changing operations** (POST/PUT/PATCH/DELETE) require CSRF protection:

1. **Get CSRF Token:**
   ```bash
   curl https://betterlb.gov.ph/api/admin/auth/csrf \
     -H "Cookie: session=<your-session-cookie>"
   ```

   Response:
   ```json
   {
     "csrfToken": "uuid-v4-token"
   }
   ```

2. **Include CSRF Token in Request:**
   ```typescript
   const response = await fetch('/api/admin/documents', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'X-CSRF-Token': csrfToken,
       'Cookie': 'session=<your-session-cookie>'
     },
     body: JSON.stringify({ title: 'New Document' })
   });
   ```

3. **CSRF Token Properties:**
   - One-time use (consumed after validation)
   - 24-hour expiration
   - Stored in Cloudflare KV
   - Required for all non-GET requests to admin endpoints

### Audit Logging Pattern

All state-changing operations log to the `admin_audit_log` table for compliance and security:

```typescript
await logAudit(env, {
  action: AuditActions.CREATE_DOCUMENT,  // or custom string
  performedBy: context.auth.user.login,
  targetType: AuditTargetTypes.DOCUMENT,
  targetId: documentId,
  details: {
    title: 'Ordinance 001',
    type: 'ordinance',
    // Additional context about the action
  },
});
```

**Common Audit Actions:**
- `create_document`, `update_document`, `delete_document`
- `merge_persons`, `delete_person`, `update_attendance`
- `assign_review`, `update_review_status`
- `login`, `logout`, `login_failed`
- `reconcile_data`, `parse_facebook_post`

**View Audit Logs:**
```bash
curl "https://betterlb.gov.ph/api/admin/audit-logs?action=create_document&limit=10" \
  -H "Cookie: session=<your-session-cookie>"
```

### Response Patterns

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

**Pagination Response:**
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

### Error Handling

| HTTP Code | Meaning | Common Causes |
|-----------|---------|---------------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully |
| 204 | No Content | Delete operation successful |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Not logged in or session expired |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource, constraint violation |
| 415 | Unsupported Media Type | Wrong Content-Type header |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

---

## Environment Variables

### Required for All APIs

| Variable | Description | Example |
|----------|-------------|---------|
| `BETTERLB_DB` | D1 database binding | Cloudflare D1 binding |
| `WEATHER_KV` | KV namespace for weather caching | Cloudflare KV binding |

### Required for Admin APIs

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | `github_client_id` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | `github_client_secret` |
| `ADMIN_SESSION_KV` | KV namespace for admin sessions | Cloudflare KV binding |
| `CSRF_KV` | KV namespace for CSRF tokens | Cloudflare KV binding |

### Required for Public APIs

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENWEATHERMAP_API_KEY` | OpenWeatherMap API key | `your_api_key` |
| `GITHUB_TOKEN` | GitHub personal access token | `ghp_xxxxx` |
| `GITHUB_REPO` | GitHub repository format | `owner/repo` |

---

## Rate Limiting

### Public APIs

- **Weather API:** No rate limiting (cached in KV for 1 hour)
- **Contribution API:** No rate limiting (uses GitHub API rate limits)
- **OpenLGU API:** 100 requests per minute per IP address

### Admin APIs

- All admin endpoints are protected by GitHub OAuth authentication
- Rate limiting is enforced at the session level (100 req/min)
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

**Rate Limit Response:**
```json
{
  "error": "Too many requests",
  "retryAfter": 45
}
```

---

## Caching Strategy

### Weather API

- **Cache Duration:** 1 hour (3,600 seconds)
- **Cache Key:** `WEATHER_KV:philippines_weather`
- **Auto-Update:** Scheduled function runs every hour to refresh data
- **Force Update:** Add `?update=true` to bypass cache

### OpenLGU API

- **Static Data (terms list):** 1 hour (3,600 seconds)
- **List Endpoints:** 15 minutes (900 seconds)
- **Detail Endpoints:** 5 minutes (300 seconds)
- **Count Endpoints:** 2 minutes (120 seconds)

### Admin APIs

- Most admin endpoints do not cache (real-time data)
- Session data cached for 24 hours in KV
- CSRF tokens cached for 24 hours in KV

---

## CORS Configuration

### Public APIs

All public APIs support CORS for authorized origins:

- **Production:** `https://betterlb.pages.dev`, `https://betterlb.gov.ph`
- **Development:** `http://localhost:5173`, `http://localhost:8788`

**CORS Headers:**
```
Access-Control-Allow-Origin: <origin>
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-CSRF-Token
Access-Control-Max-Age: 86400
```

### Admin APIs

Admin APIs require same-origin requests (no CORS for security).
All admin requests must originate from `https://betterlb.gov.ph`.

---

## SDK Examples

### TypeScript/JavaScript

**Public API (Weather):**
```typescript
const response = await fetch('https://betterlb.gov.ph/api/weather');
const weather = await response.json();
console.log(weather.los_banos);
```

**Admin API (Authenticated):**
```typescript
// Login
window.location.href = 'https://betterlb.gov.ph/api/admin/auth/login';

// After callback, make authenticated request
const response = await fetch('https://betterlb.gov.ph/api/admin/documents', {
  credentials: 'include', // Include session cookie
});
const data = await response.json();
```

**Admin API (CSRF-Protected):**
```typescript
// Get CSRF token
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
```

### Python

```python
import requests

# Public API
response = requests.get('https://betterlb.gov.ph/api/weather')
weather = response.json()

# Admin API with session cookie
session = requests.Session()
session.cookies.set('session', '<your-session-cookie>')

response = session.get('https://betterlb.gov.ph/api/admin/documents')
documents = response.json()
```

---

## Testing

### Testing Public APIs

```bash
# Weather API
curl https://betterlb.gov.ph/api/weather

# Weather API (specific city)
curl "https://betterlb.gov.ph/api/weather?city=Los Baños"

# Weather API (force update)
curl "https://betterlb.gov.ph/api/weather?update=true"

# OpenLGU API
curl "https://betterlb.gov.ph/api/openlgu/documents?limit=5"
```

### Testing Admin APIs

```bash
# 1. Login (opens browser)
# Navigate to: https://betterlb.gov.ph/api/admin/auth/login

# 2. Get session cookie from browser dev tools
# Application > Cookies > session

# 3. Test authenticated endpoint
curl https://betterlb.gov.ph/api/admin/auth/session \
  -H "Cookie: session=<your-session-cookie>"

# 4. Get CSRF token
curl https://betterlb.gov.ph/api/admin/auth/csrf \
  -H "Cookie: session=<your-session-cookie>"

# 5. Make CSRF-protected request
curl -X POST https://betterlb.gov.ph/api/admin/documents \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <csrf-token>" \
  -H "Cookie: session=<your-session-cookie>" \
  -d '{"title":"Test Document","type":"ordinance"}'
```

---

## Support

- **Documentation:** See individual API documentation files
- **Issues:** [GitHub Issues](https://github.com/bettergovph/betterlb/issues)
- **Contributions:** Use the [Contribution API](./contribution-api.md)

---

**Last Updated:** 2026-02-28
**API Version:** 1.0.0
