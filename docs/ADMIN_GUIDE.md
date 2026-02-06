# BetterLB Admin Panel Guide

This guide covers all administrative functions for managing legislative data, detecting problems, and maintaining data quality.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Dashboard](#dashboard)
3. [Review Queue](#review-queue)
4. [Person Merge Tool](#person-merge-tool)
5. [Reconciliation Tool](#reconciliation-tool)
6. [Error Log & Retry](#error-log--retry)
7. [Flag for Review](#flag-for-review)
8. [Database Scanner](#database-scanner)

---

## Authentication

The admin panel supports both GitHub and Google OAuth for authentication.

### Setup

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `https://your-domain.com/api/admin/auth/callback`
4. Copy Client ID and Client Secret to `wrangler.jsonc`:

```json
{
  "GITHUB_CLIENT_ID": "your_github_client_id",
  "GITHUB_CLIENT_SECRET": "your_github_client_secret"
}
```

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `https://your-domain.com/api/admin/auth/google/callback`
6. Copy credentials to `wrangler.jsonc`:

```json
{
  "GOOGLE_CLIENT_ID": "your_google_client_id",
  "GOOGLE_CLIENT_SECRET": "your_google_client_secret"
}
```

#### Authorized Users

Configure authorized users in `wrangler.jsonc`:

```json
{
  "AUTHORIZED_USERS": '["github_username", "user@gmail.com"]'
}
```

Add GitHub usernames and/or Google emails that should have admin access.

---

## Dashboard

**Location:** `/admin`

The dashboard provides an overview of the system status and quick access to common tasks.

### Stats Cards

| Card | Description | Link |
|------|-------------|------|
| **Failed Parses** | Documents that failed OCR/parsing | `/admin/errors` |
| **Review Queue** | Items pending manual review | `/admin/review-queue` |
| **Reconcile** | Facebook vs gov.ph data conflicts | `/admin/reconcile` |
| **Documents** | Total documents processed | `/admin/documents` |

### Quick Actions

- **View Error Log** - See all failed parse attempts
- **Process Queue** - Review pending items
- **Merge Persons** - Fix duplicate person records
- **Reconcile Data** - Merge Facebook and gov.ph records

---

## Review Queue

**Location:** `/admin/review-queue`

The review queue is the central hub for handling data quality issues detected by the system or flagged by users.

### Issue Types

| Issue Type | Description | Resolution |
|------------|-------------|------------|
| `missing_author` | Document has no author assigned | Assign author from dropdown |
| `low_ocr_confidence` | OCR text confidence below threshold | Review and correct manually |
| `missing_data` | Required fields are empty | Fill in missing information |
| `duplicate_person` | Possible duplicate person records | Use Person Merge Tool |
| `conflicting_sources` | Data differs between sources | Reconcile manually |
| `incorrect_categorization` | Wrong document type or category | Edit and reclassify |
| `data_error` | General data quality issue | Review and fix |

### Workflow

1. **Select an item** - Click on any card to see details
2. **Assign to yourself** - Click "Claim" to take ownership
3. **Review the issue** - Examine the data and determine the fix
4. **Take action**:
   - **Approve/Resolve** - Mark as fixed (adds resolution note)
   - **Skip** - Dismiss with reason (returns to pending queue)
   - **Edit** - Open edit form for documents/sessions/attendance
5. **Verify** - Confirm the fix resolves the issue

### Bulk Operations

Select multiple items using checkboxes, then:
- **Approve All** - Mark all selected as resolved
- **Skip All** - Dismiss all with a reason

### Session & Attendance Actions

For session-related items:

1. **Edit Session Data** - Opens session form with:
   - Session type (Regular/Special/Inaugural)
   - Session number/ordinal
   - Date
   - Present/Absent members

2. **Paste Facebook Post** - Paste a Facebook session post to auto-extract:
   - Session type from patterns like "100th Regular Session"
   - Date from text
   - Attendee names (matched against person database)

3. **Edit Attendance** - Opens attendance form to:
   - View all council members for the term
   - Mark members as Present/Absent/Excused
   - Save to `session_absences` table

---

## Person Merge Tool

**Location:** `/admin/persons/merge`

Automated detection of duplicate person records with guided merge functionality.

### Duplicate Detection Patterns

The system detects duplicates using these patterns:

1. **Exact Duplicates** - Same first, middle, and last name
2. **Same First/Last, Different Middle** - Same first/last names but different middle name/initial
3. **Similar First Names** - Same last name with similar first names (e.g., "Maria" vs "Ma.")
4. **Name Format Issues** - Inconsistent spacing or formatting (e.g., "De Los Santos" vs "Delos Santos")

### Merge Workflow

1. **View Duplicates** - List shows all detected duplicate groups
2. **Select a Group** - Click to see the person records side-by-side
3. **Choose Record to Keep** - Click on the record you want to preserve
4. **Review Impact** - See related records that will be updated:
   - Memberships
   - Documents authored
   - Session absences
   - Committee memberships
5. **Confirm Merge** - Click "Merge Persons" to combine records

### Merge Strategy

Currently uses **"prefer_keep"** strategy:
- All data from the kept person record is preserved
- All foreign key references to merged records are updated to point to the kept record
- Merged person records are deleted

### What Gets Updated

When you merge persons, the system updates:
- `memberships` - Council memberships
- `document_authors` - Document authorship
- `session_absences` - Attendance records
- `committee_memberships` - Committee assignments
- `admin_audit_log` - Creates audit trail of merge action

---

## Reconciliation Tool

**Location:** `/admin/reconcile`

For resolving conflicts between data sources (Facebook posts vs. gov.ph website).

### Conflict Types

| Conflict | Description | Resolution |
|----------|-------------|------------|
| **Attendance Mismatch** | Different attendance lists | Choose correct source |
| **Session Details** | Different dates, numbers, or types | Verify and correct |
| **Vote Results** | Different vote counts | Cross-reference with minutes |

---

## Error Log & Retry

**Location:** `/admin/errors`

View and retry failed document parsing operations.

### Error Types

- **PDF Download Failed** - Could not fetch original PDF
- **OCR Failed** - Tesseract OCR processing error
- **Parse Failed** - Could not extract structured data
- **Database Error** - Failed to save to database

### Retry Workflow

1. **View Error** - Click error card to see details
2. **Review Context** - Check source URL, error message, and timestamp
3. **Retry** - Click "Retry" to re-run the failed step
4. **Verify** - Check that the retry succeeded

---

## Flag for Review

Users can flag problematic records from the public-facing site.

### Flag Button

Located on document detail pages (`/openlgu/ordinance/123`):

- **"Flag for Review"** button in sidebar
- Opens modal to select issue type and add description
- Automatically creates review queue item

### Issue Types for Public Flagging

- Data Error
- Missing Information
- Low OCR/Data Confidence
- Conflicting Sources
- Incorrect Categorization
- Other

---

## Database Scanner

**Location:** `pipeline/scripts/scan_for_problems.py`

Python script that scans the remote D1 database for data quality issues.

### Usage

```bash
# Basic scan (show results only)
python3 pipeline/scripts/scan_for_problems.py

# Auto-add all found issues to review queue
python3 pipeline/scripts/scan_for_problems.py --auto-add

# Scan specific issue types
python3 pipeline/scripts/scan_for_problems.py --documents-only
python3 pipeline/scripts/scan_for_problems.py --persons-only
```

### What It Scans

#### Document Issues

1. **Documents without authors** - Documents in `documents` table with no entries in `document_authors`
2. **Missing essential fields** - Documents with NULL/empty values for:
   - `title`
   - `number`
   - `date_enacted`
3. **Duplicate documents** - Same `type` and `number` combinations

#### Person Issues

1. **Exact duplicates** - Same first, middle, and last name
2. **Same first/last, different middle** - Likely same person
3. **Similar first names** - Same last name with similar first names
4. **Name format inconsistencies** - Spacing/formatting differences

#### Session Issues

1. **Sessions without attendance** - Sessions in `sessions` table with no `session_absences` records

### Output Format

```
   Found 50 sets of duplicates
   Found 0 sessions without attendance
   Found 1 potential duplicate person records
TOTAL ISSUES FOUND: 172
Done!
```

### Auto-Add to Review Queue

When using `--auto-add`, the script:

1. Runs all scans
2. Creates review queue items for each issue found
3. Skips items already in the review queue
4. Reports number of items added

### Configuration

Edit the script to adjust:
- SQL queries for different issue patterns
- Confidence thresholds for fuzzy matching
- Issue type mappings for the review queue

---

## API Endpoints Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/auth/login` | GET | Start GitHub OAuth flow |
| `/api/admin/auth/callback` | GET | GitHub OAuth callback |
| `/api/admin/auth-google/login` | GET | Start Google OAuth flow |
| `/api/admin/auth-google/callback` | GET | Google OAuth callback |
| `/api/admin/auth/session` | GET | Get current session info |
| `/api/admin/auth/logout` | POST | End session |

### Review Queue

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/review-queue` | GET | List review queue items |
| `/api/admin/review-queue` | POST | Create new review item |
| `/api/admin/review-queue/status` | POST | Update item status |
| `/api/admin/review-queue/assign` | POST | Assign item to user |

### Sessions & Attendance

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/sessions/:id` | GET | Get session with attendees |
| `/api/admin/sessions/:id` | POST | Update session data |
| `/api/admin/attendance/:sessionId` | POST | Update attendance records |
| `/api/admin/parse-facebook-post` | POST | Parse Facebook post content |

### Persons

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/persons/duplicates` | GET | Get duplicate person groups |
| `/api/admin/persons/merge` | POST | Merge person records |

### Documents

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/documents` | GET | List all documents |
| `/api/admin/documents/:id` | GET | Get single document |
| `/api/admin/documents/:id` | PUT | Update document |

### Stats

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/stats` | GET | Get dashboard statistics |

### Errors

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/errors` | GET | List error log entries |
| `/api/admin/errors/:id/retry` | POST | Retry failed operation |

---

## Best Practices

### Review Queue Management

1. **Process items in order** - Older items first (sorted by date)
2. **Claim before working** - Assign to yourself to avoid conflicts
3. **Add resolution notes** - Document what you fixed for future reference
4. **Verify after fix** - Check that the issue is actually resolved

### Person Merging

1. **Verify before merging** - Make sure records are actually the same person
2. **Keep the most complete record** - Choose the one with more data
3. **Check memberships** - Ensure all terms are preserved
4. **Review documents** - Verify document authorship is correct

### Data Quality

1. **Run scanner regularly** - Weekly or after major data imports
2. **Address issues promptly** - Don't let the queue grow
3. **Standardize names** - Use consistent formatting for person names
4. **Document exceptions** - Add notes for unusual cases

---

## Troubleshooting

### Authentication Issues

**Problem:** OAuth callback returns 404
- Check redirect URI matches exactly in OAuth app settings
- Verify `wrangler.jsonc` has correct environment variables

**Problem:** Not authorized after login
- Verify your username/email is in `AUTHORIZED_USERS`
- Check for typos in the authorized users list

### Scanner Issues

**Problem:** Wrangler command fails
- Ensure you're logged in: `npx wrangler login`
- Check database name is correct: `BETTERLB_DB`
- Verify remote database is accessible

**Problem:** Too many false positives in duplicate detection
- Review SQL patterns in scanner script
- Adjust fuzzy matching thresholds
- Consider some "duplicates" may be legitimate (e.g., father/son same name)

### Review Queue Issues

**Problem:** Item won't resolve
- Check that the underlying data was actually fixed
- Verify the issue type matches the problem
- Try refreshing and re-opening the item

---

## Security Notes

1. **Never commit OAuth secrets** - Use environment variables only
2. **Rotate credentials regularly** - Update OAuth secrets periodically
3. **Audit access logs** - Review `admin_audit_log` table for suspicious activity
4. **Limit authorized users** - Only add people who need admin access
5. **Use HTTPS** - Always access admin panel over HTTPS

---

## Related Files

### Frontend Components

- `src/pages/admin/index.tsx` - Dashboard
- `src/pages/admin/ReviewQueue.tsx` - Review queue UI
- `src/pages/admin/components/PersonMergeTool.tsx` - Person merge UI
- `src/pages/admin/components/SessionDataForm.tsx` - Session editing form
- `src/pages/admin/components/AttendanceForm.tsx` - Attendance editing form
- `src/components/admin/FlagForReviewButton.tsx` - Public flag button

### API Endpoints

- `functions/api/admin/auth/` - GitHub OAuth routes
- `functions/api/admin/auth-google/` - Google OAuth routes
- `functions/api/admin/review-queue.ts` - Review queue CRUD
- `functions/api/admin/sessions.ts` - Session CRUD
- `functions/api/admin/attendance.ts` - Attendance updates
- `functions/api/admin/persons-merge.ts` - Person merge
- `functions/api/admin/stats.ts` - Dashboard stats
- `functions/api/admin/errors.ts` - Error log and retry

### Scripts

- `pipeline/scripts/scan_for_problems.py` - Database scanner

### Database

- `db/migrations/001_initial_schema.sql` - Core schema
- `db/migrations/003_admin_audit_log.sql` - Audit logging

---

## Support

For issues or questions:
1. Check this guide first
2. Review error logs in the admin panel
3. Check GitHub issues for similar problems
4. Contact the development team
