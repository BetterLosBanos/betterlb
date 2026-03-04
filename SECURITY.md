# Security Policy

**Version:** 1.1
**Last Updated:** 2026-02-28
**Security Posture:** MEDIUM Risk (improved from HIGH)

---

## Security Features

BetterLB implements comprehensive security controls to protect user data and ensure system integrity:

### Implemented Security Measures

| Feature | Status | Description |
|---------|--------|-------------|
| **Authentication** | ✅ Implemented | OAuth 2.0 (GitHub + Google) |
| **CSRF Protection** | ✅ Implemented | One-time use tokens (24-hour TTL) |
| **Audit Logging** | ✅ Implemented | All state-changing operations logged |
| **Security Headers** | ✅ Implemented | CSP, X-Frame-Options, HSTS, etc. |
| **CORS Protection** | ✅ Implemented | Restrictive origin whitelist |
| **RBAC** | ✅ Implemented | 3-tier role system (ADMIN/EDITOR/VIEWER) |
| **Rate Limiting** | ✅ Implemented | 100 req/min for public APIs |
| **SQL Injection Protection** | ✅ Implemented | Parameterized queries |
| **XSS Protection** | ✅ Implemented | Content Security Policy |
| **Encryption** | ✅ Implemented | TLS 1.3, encryption at rest |

### Security Documentation

- **[Security Guide](docs/SECURITY-GUIDE.md)** - Comprehensive security documentation for developers
- **[Privacy Documentation](docs/PRIVACY.md)** - Data protection and user rights
- **[RBAC Implementation Guide](docs/RBAC-IMPLEMENTATION-GUIDE.md)** - Role-based access control usage

---

## Reporting Vulnerabilities

If you discover a security vulnerability in BetterLB, please report it responsibly by emailing [security@betterlb.gov.ph](mailto:security@betterlb.gov.ph).

When reporting, please include:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact and severity
- Any relevant screenshots or proof-of-concept code (if applicable)

We will acknowledge your report within 48 hours and provide a more detailed response within 7 days, outlining our next steps.

## Scope

This security policy applies to the BetterLB website (betterlb.gov.ph, betterlb.pages.dev), its associated services, and any related infrastructure.


### Out of Scope
The following issues are considered out of scope for security reports:
- Scam & phishing attempts involving BetterLB services
- Physical security vulnerabilities
- Social engineering attacks
- Functional, UI, and UX bugs including:
  - Spelling mistakes
  - Formatting issues
  - Visual design inconsistencies
- Descriptive error messages
- HTTP error codes/pages
- Missing security headers without practical security impact
- Best practice recommendations without security impact
- Version disclosure without vulnerabilities
- Theoretical vulnerabilities without proof of exploitation

## Disclosure Policy

### Reporting Process
1. **Initial Report**:
   - Submit your vulnerability report via email
   - Include all necessary details and proof of concept
   - Our team will confirm receipt of your report

2. **Review and Validation**:
   - Our security team reviews the reported issue
   - We may ask for additional information or clarification
   - Valid reports will be confirmed and prioritized

3. **Fix Development**:
   - For confirmed vulnerabilities, we will:
     - Work on a fix via pull request
     - Invite you to collaborate if you're interested
     - Test the fix thoroughly
     - Coordinate the release timeline

### Recognition Program
- Credit in our security hall of fame
- Public acknowledgment (if desired)
- Detailed in our security advisories

### Disclosure Guidelines
- Do not disclose to others while under investigation
- Do not exploit the vulnerability for any purpose
- Do not access, modify, or delete data
- Provide reasonable time for resolution
- Follow responsible disclosure practices

### Legal Safe Harbor
We will not take legal action against you if you:
- Follow our disclosure guidelines
- Do not compromise user data
- Do not exploit vulnerabilities for malicious purposes
- Report vulnerabilities promptly and responsibly

## Contact

For any security-related inquiries, contact us at [security@betterlb.gov.ph](mailto:security@betterlb.gov.ph).

---

## Incident Response

### Severity Classifications

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **P0 - Critical** | System compromise, data breach | 1 hour |
| **P1 - High** | Security control failure (CSRF bypass, auth bypass) | 4 hours |
| **P2 - Medium** | Potential security issue | 24 hours |
| **P3 - Low** | Minor security issue | 7 days |

### Reporting Security Incidents

For active security incidents (not vulnerability reports), contact:
- **Email:** security@betterlb.gov.ph
- **Response:** We will acknowledge within 4 hours for P0/P1 incidents

### Security Posture Timeline

- **2026-02-03:** Initial Security Audit - HIGH risk (25 vulnerabilities)
- **2026-02-27:** Security Improvements Complete - MEDIUM risk (8/10 critical+high fixed)
- **2026-02-28:** Documentation Complete - MEDIUM risk (comprehensive security and privacy docs)

**Current Status:** MEDIUM risk with comprehensive security controls in place

For detailed security documentation, see [Security Guide](docs/SECURITY-GUIDE.md).
