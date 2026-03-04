# Contribution API

The Contribution API allows community members to submit contributions to the BetterLB project by creating GitHub issues automatically.

## Overview

- **Base URL:** `https://betterlb.gov.ph/api/submit-contribution`
- **Method:** `POST`
- **Authentication:** None required
- **Rate Limiting:** None (delegates to GitHub API rate limits)
- **Purpose:** Community contribution submissions via GitHub issues

---

## Submit Contribution

### Endpoint

**POST** `/api/submit-contribution`

### Description

Creates a GitHub issue in the BetterLB repository with the submitted contribution details. Useful for community members to suggest improvements, report bugs, or offer contributions.

### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | Must be `application/json` |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Issue title (contribution subject) |
| `content` | string | Yes | Issue body (detailed description) |

**Example Request Body:**

```json
{
  "title": "Add weather widget to homepage",
  "content": "I would like to suggest adding a weather widget to the homepage showing current conditions in Los Baños. This would be helpful for residents and visitors."
}
```

### Response Format

**Success Response (201 Created):**

```json
{
  "success": true,
  "url": "https://github.com/bettergovph/betterlb/issues/123"
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "Validation error message"
}
```

**Error Response (500 Internal Server Error):**

```json
{
  "error": "Server configuration missing (Secrets/Vars)"
}
```

**Error Response (GitHub API Error):**

```json
{
  "success": false,
  "error": "GitHub Error: <GitHub error message>"
}
```

---

## Usage Examples

### cURL Example

```bash
curl -X POST https://betterlb.gov.ph/api/submit-contribution \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fix typo in About page",
    "content": "There is a typo in the second paragraph of the About page. \"municipality\" is misspelled as \"municpality\"."
  }'
```

### JavaScript/TypeScript Example

```typescript
async function submitContribution(title: string, content: string) {
  const response = await fetch('https://betterlb.gov.ph/api/submit-contribution', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, content }),
  });

  const data = await response.json();

  if (response.ok) {
    console.log('Issue created:', data.url);
    return data.url;
  } else {
    console.error('Error:', data.error);
    throw new Error(data.error);
  }
}

// Usage
submitContribution(
  'Add dark mode support',
  'I would love to see dark mode support added to the website for better accessibility at night.'
);
```

### React Example

```tsx
import { useState } from 'react';

export function ContributionForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('https://betterlb.gov.ph/api/submit-contribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success! Issue created: ${data.url}`);
        setTitle('');
        setContent('');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Contribution title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Describe your contribution..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Contribution'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
```

---

## GitHub Issue Details

### Automatic Labeling

All issues created through this API are automatically labeled with `contribution` for easy tracking.

**GitHub API Request:**

```json
{
  "title": "<user-provided title>",
  "body": "<user-provided content>",
  "labels": ["contribution"]
}
```

### Issue Metadata

- **Repository:** Configured via `GITHUB_REPO` environment variable
- **Labels:** Automatically tagged with `contribution`
- **Author:** The GitHub account associated with `GITHUB_TOKEN`

---

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GITHUB_TOKEN` | Yes | GitHub personal access token with `repo` scope | `ghp_xxxxxxxxxxxxxxxxxxxx` |
| `GITHUB_REPO` | Yes | GitHub repository in `owner/repo` format | `bettergovph/betterlb` |

### GitHub Token Setup

1. **Create Personal Access Token:**
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` scope
   - Copy token (you won't see it again)

2. **Add to Cloudflare Pages:**
   - Go to Cloudflare Pages → Project → Settings → Environment variables
   - Add `GITHUB_TOKEN` with the token value
   - Add `GITHUB_REPO` with `owner/repo` format

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Server configuration missing` | Missing `GITHUB_TOKEN` or `GITHUB_REPO` environment variables | Add environment variables to Cloudflare Pages |
| `GitHub Error: Resource not found` | Invalid repository name in `GITHUB_REPO` | Verify repository name format (`owner/repo`) |
| `GitHub Error: Bad credentials` | Invalid or expired `GITHUB_TOKEN` | Generate new GitHub personal access token |
| `GitHub Error: Issues are disabled` | Issues disabled for the repository | Enable issues in repository settings |

### Error Response Format

```json
{
  "success": false,
  "error": "GitHub Error: <error message>"
}
```

**HTTP Status Codes:**
- `201`: Issue created successfully
- `400`: Bad request (validation error)
- `500`: Server configuration error
- `GitHub API status codes`: Passed through from GitHub API

---

## Rate Limiting

### GitHub API Rate Limits

This API delegates rate limiting to GitHub API:

- **Authenticated requests:** 5,000 requests/hour
- **Unauthenticated requests:** 60 requests/hour (not applicable here since we use a token)

**Current Implementation:** Uses `GITHUB_TOKEN` (authenticated), so 5,000 requests/hour limit applies.

**Rate Limit Headers:** GitHub returns rate limit headers:
```http
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1740720000
```

### Best Practices

1. **User-Facing Forms:** Add CAPTCHA or rate limiting on the frontend
2. **Spam Prevention:** Implement submission throttling per user/IP
3. **Validation:** Validate user input before sending to GitHub
4. **Moderation:** Monitor created issues and moderate as needed

---

## CORS Configuration

This API supports CORS for authorized origins:

**Allowed Origins:**
- `https://betterlb.pages.dev` (production)
- `https://betterlb.gov.ph` (custom domain)
- `http://localhost:5173` (Vite dev server)

**Note:** This API does **not** include CORS headers in the implementation. If you need cross-origin requests, you'll need to add CORS support similar to the Weather API.

---

## Security Considerations

### Token Security

1. **Store Token Securely:**
   - Use Cloudflare Pages environment variables (not in code)
   - Never commit `GITHUB_TOKEN` to git
   - Use minimum required scopes (`repo` only)

2. **Token Permissions:**
   - Only requires `repo` scope (create issues)
   - Cannot modify code or settings
   - Scoped to a single repository

3. **Token Rotation:**
   - Rotate tokens periodically (recommended: every 90 days)
   - Use GitHub's fine-grained personal access tokens for better security

### Input Validation

1. **Title Length:** Recommend 1-255 characters (GitHub limit)
2. **Content Length:** Recommend 1-65,536 characters (GitHub limit)
3. **Sanitization:** Consider sanitizing HTML/Markdown to prevent XSS
4. **Spam Prevention:** Implement rate limiting on frontend

### Abuse Prevention

1. **Rate Limiting:** Add per-IP or per-user rate limiting
2. **CAPTCHA:** Use reCAPTCHA or hCaptcha for submissions
3. **Moderation:** Monitor issues created via this API
4. **Blocklisting:** Block abusive users/IPs if needed

---

## Testing

### Manual Testing

```bash
# Test successful submission
curl -X POST http://localhost:8788/api/submit-contribution \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test contribution",
    "content": "This is a test submission."
  }'

# Test missing fields
curl -X POST http://localhost:8788/api/submit-contribution \
  -H "Content-Type: application/json" \
  -d '{"title": "Missing content"}'

# Test invalid JSON
curl -X POST http://localhost:8788/api/submit-contribution \
  -H "Content-Type: application/json" \
  -d 'invalid json'
```

### Unit Testing

```typescript
describe('Contribution API', () => {
  it('should create GitHub issue', async () => {
    const response = await fetch('/api/submit-contribution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test issue',
        content: 'Test content',
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.url).toContain('github.com');
  });
});
```

---

## Implementation Notes

### API Flow

1. **Receive Request** → Parse JSON body
2. **Validate Configuration** → Check `GITHUB_TOKEN` and `GITHUB_REPO` exist
3. **Call GitHub API** → Create issue with `contribution` label
4. **Handle Response** → Return success with issue URL or error

### GitHub API Call

```typescript
const ghResponse = await fetch(
  `https://api.github.com/repos/${env.GITHUB_REPO}/issues`,
  {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'BetterLB-Portal',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: payload.title,
      body: payload.content,
      labels: ['contribution'],
    }),
  }
);
```

### Error Handling Strategy

1. **Configuration Errors:** Return 500 with error message
2. **GitHub API Errors:** Pass through status code and message
3. **Network Errors:** Catch and return 500 with error message
4. **JSON Parse Errors:** Catch and return 400 with error message

---

## References

- **GitHub REST API Documentation:** https://docs.github.com/en/rest
- **GitHub Issues API:** https://docs.github.com/en/rest/issues/issues
- **Cloudflare Pages Functions:** https://developers.cloudflare.com/pages/functions/
- **Personal Access Tokens:** https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

---

**Last Updated:** 2026-02-28
**API Version:** 1.0.0
**Maintained By:** BetterLB Development Team
