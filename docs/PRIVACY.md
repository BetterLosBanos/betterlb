# BetterLB Privacy Documentation

**Version:** 1.0
**Last Updated:** 2026-02-28
**Effective Date:** 2026-02-28

---

## 1. Overview

### Privacy Commitment

BetterLB is a municipal government portal for Los Baños, Philippines. We are committed to protecting the privacy of our users and being transparent about our data practices. This document explains what data we collect, how we use it, and your rights as a user.

### Legal Framework

BetterLB operates under the **Data Privacy Act of 2012 (Republic Act No. 10173)** of the Philippines. We also align with the principles of the **General Data Protection Regulation (GDPR)** where applicable to provide strong privacy protections for all users.

### Scope

This privacy documentation applies to:
- The BetterLB website (https://betterlb.gov.ph and https://betterlb.pages.dev)
- All BetterLB services and features
- Admin dashboard functionality
- API endpoints (public and authenticated)

---

## 2. Data Collection

### What Data We Collect

BetterLB collects two categories of data:

#### 2.1 Public Municipal Data (Primary Purpose)

**Types of Data:**
- **Legislative Records:** Ordinances, resolutions, executive orders
- **Session Information:** Legislative session dates, attendance, agendas
- **Government Officials:** Names, positions, contact information (publicly available)
- **Services Directory:** Municipal services, requirements, procedures
- **Statistical Data:** Government performance metrics, budgets

**Data Source:** Public records from Los Baños municipal government
**Legal Basis:** Public interest, transparency, government accountability
**User Impact:** No user interaction required - data is publicly accessible

#### 2.2 Admin User Data (Secondary Purpose)

**Types of Data:**
- **OAuth Profile Information:**
  - GitHub/Google username
  - Display name
  - Profile avatar URL
- **Session Data:**
  - Session identifier (UUID)
  - Login timestamp
  - Session expiration timestamp
  - User role (ADMIN/EDITOR/VIEWER)

**Data Source:** OAuth 2.0 authentication (GitHub, Google)
**Legal Basis:** Explicit consent via OAuth authorization
**User Impact:** Only collected when user explicitly chooses to log in as admin

### Data We Do NOT Collect

BetterLB does **NOT** collect:
- ❌ Citizen personal information (no citizen authentication)
- ❌ Residential addresses or phone numbers
- ❌ Financial information
- ❌ Health information
- ❌ Biometric data
- ❌ Location data (IP addresses logged only for security monitoring)
- ❌ Behavioral tracking or analytics
- ❌ Marketing preferences

### Collection Methods

**Public Data:**
- Automated import from municipal government sources
- Manual data entry by authorized admin users
- Public APIs (OpenLGU API)

**Admin User Data:**
- OAuth 2.0 authentication flow (GitHub/Google)
- Session creation upon successful authentication
- Audit logging automatically captures admin actions

---

## 3. Data Usage

### Primary Purposes

#### 3.1 Government Transparency (Public Data)

**Purpose:** Provide citizens with easy access to municipal government information

**Examples:**
- Displaying ordinances and resolutions
- Showing legislative session attendance
- Publishing government service directory
- Presenting budget and performance statistics

**Legal Basis:** Public interest, government transparency

#### 3.2 Administrative Operations (Admin Data)

**Purpose:** Enable secure management of municipal government data

**Examples:**
- Authentication and authorization for admin users
- Audit logging for accountability
- Session management for security
- Content moderation and data quality control

**Legal Basis:** Explicit consent, legitimate interests for government operations

### Secondary Usage

**No Secondary Usage:** BetterLB does not use data for:
- ❌ Marketing or advertising
- ❌ Selling or renting data to third parties
- ❌ Personalized recommendations
- ❌ User profiling or behavioral analysis
- ❌ Commercial purposes

**Data Analytics:**
- We may use **aggregated, anonymized statistics** for:
  - Performance monitoring (page load times, error rates)
  - Service improvement (identifying popular features)
  - Security monitoring (detecting unusual activity)

**No Personal Analytics:** We do not track individual user behavior beyond what is necessary for security and operations.

### Data Sharing

**We do NOT sell or rent your data to third parties.**

**Limited Data Sharing:**

| Scenario | Data Shared | Purpose | Legal Basis |
|----------|-------------|---------|-------------|
| **Cloudflare Infrastructure** | All data (in transit and at rest) | Hosting, database, CDN | Data processing agreement |
| **OAuth Providers** | Username, name, avatar | Authentication | OAuth 2.0 consent |
| **Public Access** | Municipal records only | Government transparency | Public interest |
| **Legal Requirements** | As required by law | Compliance with legal orders | Legal obligation |

**Third-Party Data Processors:**
- **Cloudflare:** Hosting, D1 database, KV storage, CDN
- **GitHub:** OAuth authentication provider
- **Google:** OAuth authentication provider
- **Meilisearch:** Search functionality (self-hosted, no data shared externally)

**Data Processing Agreements:**
- Cloudflare: [Cloudflare Data Processing Agreement](https://www.cloudflare.com/gdpr/introduction/)
- GitHub: [GitHub Data Processing Addendum](https://docs.github.com/en/github/site-policy/github-data-processing-addendum)
- Google: [Google Workspace Data Processing Amendment](https://cloud.google.com/terms/dpa)

---

## 4. Data Storage & Retention

### Storage Locations

**Primary Storage:**
- **Cloudflare D1:** SQLite database (legislative records, audit logs)
- **Cloudflare KV:** Key-value storage (sessions, CSRF tokens, cache)

**Infrastructure:**
- **Cloudflare Pages:** Static website hosting
- **Cloudflare Workers:** Serverless API endpoints

**Data Center Locations:**
- Cloudflare operates data centers globally
- Data is stored within Cloudflare's infrastructure
- For specific data location requests, contact privacy@betterlb.gov.ph

### Data Retention Periods

| Data Type | Retention Period | Rationale |
|-----------|------------------|-----------|
| **Public Municipal Data** | Indefinite | Public records, historical value |
| **Admin Sessions** | 24 hours | Security best practice |
| **CSRF Tokens** | 24 hours | Security best practice |
| **Audit Logs** | Indefinite | Compliance, forensic analysis |
| **Cache Data** | 1-24 hours | Data freshness only |
| **OAuth Profile Data** | Until account deletion | Operational necessity |

### Backup Policies

**Current Implementation:**
- **Database Backups:** Cloudflare D1 manages backups automatically
- **Point-in-Time Recovery:** Available via Cloudflare D1
- **Disaster Recovery:** Cloudflare's global infrastructure

**Backup Access:**
- Backups are encrypted at rest
- Access restricted to authorized administrators
- Backups used for disaster recovery only (not for analytics)

### Data Deletion

**User Data Deletion:**

**Admin Users:**
- **Right to Erasure:** You may request deletion of your admin account data
- **Process:** Contact privacy@betterlb.gov.ph with account details
- **Timeline:** Within 30 days of verified request
- **Exceptions:** Audit logs may be retained for compliance purposes

**Public Municipal Data:**
- **Not Subject to Erasure:** Public government records cannot be deleted
- **Correction Requests:** If you believe public information is inaccurate, contact the municipal government directly

**Automatic Deletion:**
- Sessions and CSRF tokens: Automatic expiration after 24 hours
- Cache data: Automatic expiration after TTL (1-24 hours)

---

## 5. User Rights

Under the Data Privacy Act of 2012 and GDPR principles, you have the following rights:

### 5.1 Right to Access

**What:** You have the right to know what personal data we have about you.

**How to Exercise:** Contact privacy@betterlb.gov.ph
**Response Time:** Within 30 days

**Data Provided:**
- Copy of your OAuth profile data (username, name, avatar)
- List of audit log entries associated with your account
- Session history (if available)

### 5.2 Right to Rectification

**What:** You have the right to correct inaccurate or incomplete personal data.

**How to Exercise:**
- Update your profile directly via GitHub or Google (OAuth provider)
- Contact privacy@betterlb.gov.ph for corrections

**Examples:**
- Update display name in GitHub profile (syncs to BetterLB)
- Change avatar via GitHub/Google profile settings
- Request correction of inaccurate log entries

### 5.3 Right to Erasure (Right to be Forgotten)

**What:** You have the right to request deletion of your personal data.

**How to Exercise:** Contact privacy@betterlb.gov.ph with:
- Your username (GitHub/Google)
- Proof of identity
- Specific data to be deleted

**Exceptions:**
- Audit logs may be retained for compliance/accountability
- Public records are not subject to erasure
- Data may be retained if required by law

**Timeline:** Within 30 days of verified request

### 5.4 Right to Data Portability

**What:** You have the right to receive your personal data in a structured, machine-readable format.

**How to Exercise:** Contact privacy@betterlb.gov.ph
**Format Provided:** JSON or CSV

**Data Included:**
- OAuth profile data
- Audit log entries
- Session history

### 5.5 Right to Object

**What:** You have the right to object to certain processing activities.

**Applicable To:**
- Processing based on legitimate interests (currently none)
- Direct marketing (we do not engage in marketing)

**How to Exercise:** Contact privacy@betterlb.gov.ph
**Review Process:** We will assess your request and respond within 30 days

### 5.6 Right to Withdraw Consent

**What:** You may withdraw your OAuth consent at any time.

**How to Exercise:**
- Revoke BetterLB's access in GitHub/Google OAuth settings
- Contact privacy@betterlb.gov.ph to request account deletion

**Effect:**
- Immediate revocation of access
- Deletion of session data
- Your OAuth profile data removed (subject to retention policies)

### 5.7 Right to Lodge a Complaint

**What:** You have the right to lodge a complaint with a supervisory authority.

**Philippines:**
- National Privacy Commission (NPC)
- Website: https://privacy.gov.ph/
- Email: info@privacy.gov.ph

**EU (GDPR):**
- Your local data protection authority
- European Data Protection Board: https://edpb.europa.eu/

**Before Contacting Authorities:**
- We encourage you to contact us first at privacy@betterlb.gov.ph
- We will address your concerns within 30 days

---

## 6. Third-Party Services

BetterLB integrates with the following third-party services:

### 6.1 Cloudflare (Data Processor)

**Services Used:**
- Cloudflare Pages (hosting)
- Cloudflare Workers (serverless API)
- Cloudflare D1 (database)
- Cloudflare KV (key-value storage)
- Cloudflare CDN (content delivery)

**Data Shared:** All data stored in Cloudflare infrastructure
**Data Location:** Global data centers
**Privacy Policy:** https://www.cloudflare.com/privacypolicy/
**Data Processing Agreement:** https://www.cloudflare.com/gdpr/introduction/

**Security Measures:**
- Encryption at rest and in transit
- SOC 2 Type II compliance
- ISO 27001 certification

### 6.2 GitHub (OAuth Provider)

**Services Used:**
- OAuth 2.0 authentication for admin users
- User profile data (username, name, avatar)

**Data Shared:** Username, display name, avatar URL
**Privacy Policy:** https://docs.github.com/en/github/site-policy/github-privacy-statement
**Data Processing Addendum:** https://docs.github.com/en/github/site-policy/github-data-processing-addendum

**User Control:**
- Revoke access in GitHub OAuth settings
- Manage profile data in GitHub account settings

### 6.3 Google (OAuth Provider)

**Services Used:**
- OAuth 2.0 authentication for admin users
- User profile data (username, name, avatar)

**Data Shared:** Email, display name, avatar URL
**Privacy Policy:** https://policies.google.com/privacy
**Data Processing Amendment:** https://cloud.google.com/terms/dpa

**User Control:**
- Revoke access in Google Account settings
- Manage profile data in Google Account

### 6.4 Meilisearch (Search Engine)

**Services Used:**
- Self-hosted search functionality
- Indexed search of public municipal data

**Data Shared:** None (self-hosted, no external data transfer)
**Privacy Policy:** N/A (open-source software)
**Website:** https://www.meilisearch.com/

**Note:** Meilisearch instance is managed by BetterLB, not a third-party service.

### 6.5 Weather API (Data Source)

**Services Used:**
- Weather data for Los Baños region
- Integrated via API calls

**Data Shared:** Location (Los Baños), request metadata
**Privacy Policy:** [Provider-specific policy]
**Data Usage:** Display weather information to users only

**Note:** Weather data is public information, not personal data.

---

## 7. Cookies & Tracking

### Cookies Used

**Essential Cookies (Required):**

| Cookie Name | Purpose | Duration | Type |
|-------------|---------|----------|------|
| `session` | Admin authentication session | 24 hours | HttpOnly, Secure, SameSite |
| `__cf_bm` | Cloudflare bot management | 30 minutes | HttpOnly, Secure |

**No Analytics or Marketing Cookies:**
- BetterLB does **NOT** use Google Analytics or similar tracking
- No marketing cookies
- No third-party tracking pixels

### Local Storage

**Usage:**
- **Preferences:** None currently stored
- **Cache:** Weather data cached in Cloudflare KV (server-side)

**No User Tracking:**
- We do not track user behavior across sessions
- No device fingerprinting
- No behavioral profiling

### Cookie Consent

**Current Implementation:**
- No cookie consent banner required (only essential cookies)
- Essential cookies are required for security and functionality

**Future Enhancement:**
- If analytics or non-essential cookies are added, a cookie consent banner will be implemented
- Users will be able to opt-out of non-essential cookies

---

## 8. Privacy by Design

### Data Minimization

**Principle:** We collect only the data necessary for our stated purposes.

**Examples:**
- Admin users: Only OAuth profile data (no additional personal information)
- Public data: Only government records (no citizen personal data)
- Audit logs: Only actions taken (not behavioral data)

### Pseudonymization/Anonymization

**Current Implementation:**
- Sessions: Identified by UUID (not user IDs directly)
- IP addresses: Logged only for security monitoring (not linked to user profiles)
- Analytics: Aggregated statistics only (no individual tracking)

**Future Enhancements:**
- Consider pseudonymization for audit log exports
- Anonymization of IP addresses in logs after retention period

### Privacy Impact Assessments

**Conduct Assessments For:**
- New data collection activities
- Significant changes to data processing
- New third-party integrations
- Changes to user rights and controls

**Current Status:**
- Initial privacy assessment: Completed (2026-02-28)
- Periodic review: Recommended annually

### Default Privacy Settings

**Admin User Experience:**
- Default role: VIEWER (least privilege)
- Opt-in: Higher roles require explicit assignment
- No default data sharing

**Public User Experience:**
- No tracking or analytics
- No account required for access
- No data collection beyond public records

---

## 9. Children's Privacy

### Age Restrictions

**Minimum Age:** 13 years old

**Policy:**
- BetterLB does not target children under 13
- We do not knowingly collect personal data from children under 13
- Admin features are restricted to authorized government personnel (adults)

### Parental Consent

**Not Applicable:**
- BetterLB does not collect personal data from children
- Admin authentication is restricted to authorized adults (government personnel)
- Public data is accessible to all ages (no personal data involved)

### Special Protections

**For Users Under 18:**
- No special protections required (no personal data collection)
- Public municipal data is accessible to all ages
- Admin features restricted to authorized adults only

---

## 10. International Data Transfers

### Data Center Locations

**Cloudflare Infrastructure:**
- Global network of data centers
- Data may be stored in any Cloudflare data center
- Primary regions: Asia-Pacific, North America, Europe

### Cross-Border Data Flows

**Current Implementation:**
- Data stored in Cloudflare's global infrastructure
- Data may be transferred across borders for:
  - Content delivery (CDN)
  - Database replication
  - Disaster recovery

**Legal Framework:**
- **Philippines:** Data Privacy Act of 2012 permits cross-border transfers with adequate safeguards
- **Cloudflare:** Implements EU Standard Contractual Clauses (SCCs) for GDPR compliance
- **Data Processing Agreements:** In place with all third-party processors

### GDPR Compliance

**If Applicable:**
- BetterLB aligns with GDPR principles for EU data subjects
- Data transfers to non-EU countries protected by SCCs
- EU users have the same rights as Philippines users

**Current Status:**
- BetterLB primarily serves Philippines residents
- If EU user base grows, formal GDPR compliance assessment will be conducted

---

## 11. Contact Information

### Privacy Officer

**Primary Contact:**
- **Email:** privacy@betterlb.gov.ph
- **Website:** https://betterlb.gov.ph
- **Response Time:** Within 30 days

### Data Protection Inquiries

**For:**
- Questions about this privacy documentation
- Requests to access, rectify, or delete your data
- Complaints about data processing practices
- GDPR or DPA inquiries

**Contact:** privacy@betterlb.gov.ph

### Security-Related Issues

**For Vulnerability Disclosures:**
- **Email:** security@bettergov.ph (update to betterlb.gov.ph)
- **Policy:** See SECURITY.md for responsible disclosure guidelines

### Complaint Mechanisms

**Internal:**
1. Contact privacy@betterlb.gov.ph
2. We will acknowledge receipt within 7 days
3. We will respond within 30 days with resolution or timeline

**External (if internal resolution is unsatisfactory):**
- **Philippines:** National Privacy Commission - info@privacy.gov.ph
- **EU (GDPR):** Your local data protection authority

---

## 12. Changes to Privacy Policy

### Update Procedures

**We May Update This Policy When:**
- Laws or regulations change
- Our data practices change
- New features or services are added
- Feedback from users indicates a need for clarification

### Notification Methods

**For Significant Changes:**
- Banner notification on website
- Email notification to registered admin users
- Update date at the top of this document

**For Minor Changes:**
- Update date at the top of this document
- No separate notification required

### User Rights After Changes

- Continued use of BetterLB constitutes acceptance of changes
- Users may delete their accounts if they disagree with changes
- Material changes will be communicated 30 days in advance

---

## 13. Transparency Reporting

### Current Status

**Transparency Reports:**
- No formal transparency reports published yet
- Consider publishing annual transparency report in future

**Data to Include:**
- Number of admin users
- Number of data access requests
- Number of data deletion requests
- Number of law enforcement requests (if any)
- Security incidents (if any)

### Public Accountability

**Commitment:**
- Regular privacy audits (annually recommended)
- Security audits (conducted February 2026)
- Documentation reviews (quarterly recommended)

---

## Appendix A: Glossary

**Personal Data:** Information that identifies or relates to an individual (e.g., name, email)

**Processing:** Any operation performed on personal data (collection, storage, use, deletion)

**Data Controller:** The entity that determines the purposes and means of processing (BetterLB)

**Data Processor:** Third-party service that processes data on behalf of the controller (Cloudflare)

**Consent:** Freely given, specific, informed, and unambiguous indication of agreement to data processing

**OAuth:** Open standard for authorization (allows login via GitHub/Google)

**Session:** Temporary interaction between user and website (24-hour duration)

**Audit Log:** Record of actions taken by users (for accountability)

**PII:** Personally Identifiable Information

**DPA:** Data Privacy Act of 2012 (Philippines)

**GDPR:** General Data Protection Regulation (EU)

---

## Appendix B: Quick Reference

### Your Rights in 30 Seconds

1. **Access:** See what data we have about you
2. **Rectify:** Correct inaccurate data
3. **Erase:** Delete your data (with exceptions)
4. **Portability:** Get your data in a machine-readable format
5. **Object:** Object to certain processing
6. **Withdraw Consent:** Revoke OAuth access
7. **Complain:** Contact privacy@betterlb.gov.ph or NPC

### Data We Collect

- **Public:** Government records (ordinances, sessions, officials)
- **Admin:** OAuth profile (username, name, avatar) for authentication
- **No Citizen Data:** We do not collect citizen personal information

### Who We Share With

- **Cloudflare:** Infrastructure (hosting, database, CDN)
- **GitHub/Google:** OAuth authentication only
- **No Third-Party Sales:** We never sell or rent your data

### Contact Us

- **Privacy:** privacy@betterlb.gov.ph
- **Security:** security@betterlb.gov.ph
- **Website:** https://betterlb.gov.ph

---

**Document Version:** 1.0
**Last Reviewed:** 2026-02-28
**Next Review Date:** 2026-05-28 (or as needed)

---

**Maintained by:** BetterLB Development Team
**Questions?** Contact privacy@betterlb.gov.ph
