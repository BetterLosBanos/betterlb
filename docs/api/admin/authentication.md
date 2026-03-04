# Authentication API

The Authentication API handles GitHub OAuth login, session management, logout, and CSRF token generation for admin access.

## Overview

- **Base Path:** `/api/admin/auth/`
- **Authentication:** GitHub OAuth 2.0
- **Session Duration:** 24 hours
- **CSRF Protection:** Required for state-changing operations

---

## GitHub OAuth Flow

### Complete Authentication Flow

```
1. User clicks "Login" button
   → Frontend redirects to /api/admin/auth/login

2. Backend generates state parameter and redirects to GitHub
   → GitHub authorization page

3. User authorizes the BetterLB GitHub App
   → GitHub redirects to /api/admin/auth/callback?code=xxx&state=yyy

4. Backend exchanges code for access token
   → Fetches user info from GitHub API

5. Backend validates user is in AUTHORIZED_USERS list
   → Creates session and sets admin_session cookie

6. Backend redirects to /admin dashboard
   → Frontend can now make authenticated requests
```

### Security Features

- **State Parameter:** CSRF protection during OAuth flow
- **State Expiration:** 5 minutes (prevents replay attacks)
- **Session Storage:** Cloudflare KV (distributed, scalable)
- **HttpOnly Cookies:** Prevents XSS attacks
- **Secure Flag:** HTTPS-only transmission
- **SameSite=Lax:** Prevents CSRF attacks
- **User Authorization:** Only listed GitHub usernames allowed
- **Audit Logging:** All login/logout events logged

---

## Endpoints

### Login

#### GET `/api/admin/auth/login`

Initiates the GitHub OAuth flow by redirecting to GitHub's authorization page.

**Authentication:** None required
**CSRF Required:** No

**Query Parameters:** None

**Response:**
- **Status Code:** 302 Found
- **Location Header:** GitHub OAuth URL
- **Redirects to:** `https://github.com/login/oauth/authorize`

**Implementation Details:**

1. Generates UUID `state` parameter for CSRF protection
2. Stores `state` in KV with 5-minute expiration
3. Constructs GitHub OAuth URL with:
   - `client_id`: GitHub OAuth App Client ID
   - `redirect_uri`: Callback URL (`/api/admin/auth/callback`)
   - `scope`: `read:user user:email` (read user profile and email)
   - `state`: CSRF protection token
4. Returns 302 redirect to GitHub

**Example:**

```bash
# Initiate login (redirects to GitHub)
curl -L https://betterlb.gov.ph/api/admin/auth/login
```

**Frontend Example:**

```typescript
// Redirect user to login
window.location.href = 'https://betterlb.gov.ph/api/admin/auth/login';
```

---

### Callback

#### GET `/api/admin/auth/callback`

Handles the GitHub OAuth callback after user authorization. Creates admin session and sets cookie.

**Authentication:** None required (OAuth flow)
**CSRF Required:** No

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | Yes | OAuth authorization code from GitHub |
| `state` | string | Yes | State parameter for CSRF validation |

**Response:**

**Success (302 Found):**
- **Status Code:** 302 Found
- **Location Header:** `/admin` (dashboard)
- **Set-Cookie Header:** `admin_session=<session-id>` with security flags

**Error Redirects:**

| Error | Redirect URL | Description |
|-------|--------------|-------------|
| Missing code/state | `/admin?error=oauth` | Invalid OAuth callback |
| Invalid state | `/admin?error=csrf` | State parameter validation failed |
| Invalid user data | `/admin?error=oauth` | GitHub API returned invalid data |
| Not authorized | `/admin?unauthorized` | User not in AUTHORIZED_USERS list |
| Config error | `/admin?error=config` | Server configuration error |

**Implementation Details:**

1. **Validate State:**
   - Retrieves state from KV
   - Deletes state after validation (one-time use)
   - Returns error if state missing or invalid

2. **Exchange Code for Token:**
   - POST to `https://github.com/login/oauth/access_token`
   - Receives `access_token`

3. **Fetch User Info:**
   - GET `https://api.github.com/user` with `Authorization: Bearer {token}`
   - Receives user data: `id`, `login`, `name`, `email`, `avatar_url`

4. **Authorize User:**
   - Parses `AUTHORIZED_USERS` environment variable (JSON array)
   - Checks if user's GitHub login is in authorized list
   - Logs unauthorized access attempt
   - Redirects with error if not authorized

5. **Create Session:**
   - Generates UUID session ID
   - Creates session object with user data and expiration
   - Stores in KV with 24-hour expiration
   - Logs successful login to audit log

6. **Set Cookie:**
   - Sets `admin_session` cookie with session ID
   - Security flags: `Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`

**Example:**

```bash
# GitHub redirects to this after authorization
curl "https://betterlb.gov.ph/api/admin/auth/callback?code=xxx&state=yyy"
```

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
  "expires_at": "2026-02-29T12:00:00.000Z"
}
```

---

### Get Session

#### GET `/api/admin/auth/session`

Retrieves the current authenticated session information.

**Authentication:** Required (valid session cookie)
**CSRF Required:** No

**Request Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Cookie` | Yes | Must include `admin_session` cookie |

**Response Format:**

**Authenticated (200 OK):**

```json
{
  "authenticated": true,
  "user": {
    "id": 1234567,
    "login": "username",
    "name": "Display Name",
    "email": "user@example.com",
    "avatar_url": "https://github.com/username.png"
  }
}
```

**Not Authenticated (401 Unauthorized):**

```json
{
  "authenticated": false
}
```

**Session Expired (401 Unauthorized):**

```json
{
  "authenticated": false,
  "expired": true
}
```

**Implementation Details:**

1. Extracts `admin_session` from Cookie header
2. Retrieves session data from KV
3. Validates session exists and is not expired
4. Returns user data if valid
5. Invalidates corrupted or expired sessions

**Example:**

```bash
curl https://betterlb.gov.ph/api/admin/auth/session \
  -H "Cookie: admin_session=<your-session-cookie>"
```

**Frontend Example:**

```typescript
// Check authentication status
const response = await fetch('https://betterlb.gov.ph/api/admin/auth/session', {
  credentials: 'include', // Include session cookie
});

const data = await response.json();

if (data.authenticated) {
  console.log('Logged in as:', data.user.login);
  console.log('Avatar:', data.user.avatar_url);
} else {
  console.log('Not authenticated');
  if (data.expired) {
    console.log('Session expired');
  }
}
```

---

### Logout

#### POST `/api/admin/auth/logout`

Logs out the current user by deleting their session and clearing the cookie.

**Authentication:** Required (valid session cookie)
**CSRF Required:** Yes

**Request Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Cookie` | Yes | Must include `admin_session` cookie |
| `X-CSRF-Token` | Yes | Valid CSRF token for session |

**Response:**

- **Status Code:** 302 Found
- **Location Header:** `/admin` (dashboard)
- **Set-Cookie Header:** `admin_session=` with `Max-Age=0` (clears cookie)

**Implementation Details:**

1. Extracts `admin_session` from Cookie header
2. Retrieves session data for audit logging
3. Deletes session from KV
4. Logs logout action to audit log
5. Clears cookie by setting `Max-Age=0`
6. Redirects to `/admin`

**Example:**

```bash
# First get CSRF token
curl https://betterlb.gov.ph/api/admin/auth/csrf \
  -H "Cookie: admin_session=<your-session-cookie>"

# Then logout
curl -X POST https://betterlb.gov.ph/api/admin/auth/logout \
  -H "Cookie: admin_session=<your-session-cookie>" \
  -H "X-CSRF-Token: <csrf-token>"
```

**Frontend Example:**

```typescript
async function logout() {
  // Get CSRF token first
  const csrfResponse = await fetch('https://betterlb.gov.ph/api/admin/auth/csrf', {
    credentials: 'include',
  });
  const { csrf_token } = await csrfResponse.json();

  // Logout
  await fetch('https://betterlb.gov.ph/api/admin/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-CSRF-Token': csrf_token,
    },
  });

  // Redirect to login page
  window.location.href = '/admin';
}
```

---

### Get CSRF Token

#### GET `/api/admin/auth/csrf`

Returns a CSRF token for the authenticated session. Required for all state-changing operations (POST/PUT/PATCH/DELETE).

**Authentication:** Required (valid session cookie)
**CSRF Required:** No

**Request Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Cookie` | Yes | Must include `admin_session` cookie |

**Response Format:**

**Success (200 OK):**

```json
{
  "csrf_token": "uuid-v4-token"
}
```

**Not Authenticated (401 Unauthorized):**

```json
{
  "error": "Authentication required"
}
```

**Implementation Details:**

1. Validates session via `withAuth()` wrapper
2. Generates or retrieves existing CSRF token for session
3. Returns token in JSON response

**CSRF Token Properties:**

- **Format:** UUID v4
- **Storage:** Cloudflare KV (`csrf:{session_id}`)
- **Expiration:** 24 hours
- **Usage:** One-time use (consumed after validation)
- **Scope:** Per-session (each session has unique tokens)

**Example:**

```bash
curl https://betterlb.gov.ph/api/admin/auth/csrf \
  -H "Cookie: admin_session=<your-session-cookie>"
```

**Frontend Example:**

```typescript
// Get CSRF token for state-changing operations
async function getCSRFToken() {
  const response = await fetch('https://betterlb.gov.ph/api/admin/auth/csrf', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Not authenticated');
  }

  const { csrf_token } = await response.json();
  return csrf_token;
}

// Use CSRF token in POST request
async function createDocument(title: string) {
  const csrfToken = await getCSRFToken();

  const response = await fetch('https://betterlb.gov.ph/api/admin/documents', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify({ title }),
  });

  return response.json();
}
```

---

## Error Handling

### Common Errors

| Error | HTTP Code | Cause | Solution |
|-------|-----------|-------|----------|
| `Missing code or state` | 400 | OAuth callback missing parameters | Ensure GitHub redirects with both `code` and `state` |
| `Invalid state` | 400 | State parameter validation failed | State expired (5 min) or already used |
| `Invalid OAuth response` | 500 | GitHub API error | Check GitHub OAuth app configuration |
| `Invalid user data from OAuth provider` | 500 | GitHub API returned invalid data | GitHub API may be unavailable |
| `Authentication required` | 401 | No valid session cookie | User must login first |
| `Session expired` | 401 | Session expiration passed | User must login again |
| `Not authorized` | 401 | User not in AUTHORIZED_USERS | Contact administrator to be added |

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | `github_client_id` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | `github_client_secret` |
| `AUTHORIZED_USERS` | JSON array of authorized GitHub usernames | `["user1", "user2", "user3"]` |
| `WEATHER_KV` | KV namespace for sessions and CSRF tokens | Cloudflare KV binding |

### Optional

| Variable | Description | Example |
|----------|-------------|---------|
| `ADMIN_REDIRECT_URI` | Custom OAuth redirect URI | `https://custom.domain/admin/auth/callback` |

---

## GitHub OAuth App Setup

### 1. Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps → New OAuth App
2. Configure:
   - **Application name:** BetterLB Admin
   - **Homepage URL:** `https://betterlb.gov.ph`
   - **Authorization callback URL:** `https://betterlb.gov.ph/api/admin/auth/callback`
   - **Application description:** BetterLB municipal government portal admin access
3. Copy **Client ID** and generate **Client Secret**

### 2. Configure Environment Variables

Add to Cloudflare Pages → Settings → Environment variables:

```bash
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
AUTHORIZED_USERS=["admin1", "admin2", "admin3"]
```

### 3. Authorize Users

1. Add GitHub usernames to `AUTHORIZED_USERS` JSON array
2. Users must have GitHub accounts
3. Case-sensitive matching (use exact GitHub username)

---

## Security Best Practices

### OAuth Security

- **State Parameter:** Prevents CSRF attacks during OAuth flow
- **State Expiration:** 5-minute window limits exposure
- **PKCE (Recommended for Future):** Add code verifier/challenge for enhanced security
- **HTTPS Only:** OAuth callbacks require HTTPS in production

### Session Security

- **HttpOnly Cookies:** Prevents JavaScript access (XSS protection)
- **Secure Flag:** HTTPS-only transmission
- **SameSite=Lax:** Prevents CSRF attacks
- **24-Hour Expiration:** Limits session hijacking risk
- **KV Storage:** Distributed, encrypted at rest

### Authorization Security

- **Explicit Allow List:** Only authorized users can access admin APIs
- **Audit Logging:** All login/logout attempts logged
- **Failed Login Alerts:** Unauthorized access attempts logged
- **Session Invalidation:** Corrupted/expired sessions automatically deleted

### CSRF Protection

- **One-Time Tokens:** Prevents replay attacks
- **Per-Session Tokens:** Isolated to each user session
- **24-Hour Expiration:** Limits token exposure window
- **Required for State Changes:** All POST/PUT/PATCH/DELETE protected

---

## Testing

### Manual Testing

```bash
# 1. Test login (opens browser)
curl -L https://betterlb.gov.ph/api/admin/auth/login

# 2. After OAuth callback, get session cookie from browser
# Application > Cookies > admin_session

# 3. Test session check
curl https://betterlb.gov.ph/api/admin/auth/session \
  -H "Cookie: admin_session=<your-session-cookie>"

# 4. Test CSRF token
curl https://betterlb.gov.ph/api/admin/auth/csrf \
  -H "Cookie: admin_session=<your-session-cookie>"

# 5. Test logout
curl -X POST https://betterlb.gov.ph/api/admin/auth/logout \
  -H "Cookie: admin_session=<your-session-cookie>" \
  -H "X-CSRF-Token: <csrf-token>"

# 6. Verify session is cleared
curl https://betterlb.gov.ph/api/admin/auth/session \
  -H "Cookie: admin_session=<your-session-cookie>"
# Should return 401 Unauthorized
```

---

## References

- **Admin API Overview:** [./README.md](./README.md)
- **Main API Documentation:** [../README.md](../README.md)
- **Authentication Utilities:** `../../../functions/utils/admin-auth.ts`
- **CSRF Utilities:** `../../../functions/utils/csrf.ts`
- **Audit Logging:** `../../../functions/utils/audit-log.ts`
- **GitHub OAuth Documentation:** https://docs.github.com/en/developers/apps/building-oauth-apps

---

**Last Updated:** 2026-02-28
**API Version:** 1.0.0
**Maintained By:** BetterLB Development Team
