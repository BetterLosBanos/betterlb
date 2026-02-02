# OpenLGU API Documentation

## Overview

The OpenLGU API is a RESTful API built with Cloudflare Pages Functions that provides access to legislative data stored in Cloudflare D1 (SQLite). All endpoints are prefixed with `/api/openlgu/`.

**Base URL:** `https://betterlb.org/api/openlgu/`

## Response Format

All responses return JSON. The API does not use a wrapper format - responses are returned directly with optional pagination metadata.

**Success Response:**
```json
// List endpoint with pagination
{
  "documents": [...],
  "pagination": {
    "total": 150,
    "limit": 100,
    "offset": 0,
    "has_more": true
  }
}

// Detail endpoint
{
  "id": "123",
  "type": "ordinance",
  ...
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## Caching

The API uses Cloudflare KV for caching with different TTLs:

| Endpoint Type | TTL | Cache Key Pattern |
|--------------|-----|-------------------|
| Static data (terms list) | 24 hours | `openlgu:terms` |
| List endpoints | 1 hour | `openlgu:{endpoint}:{params}` |
| Detail endpoints | 30 minutes | `openlgu:{endpoint}:{id}` |

## Endpoints

### Documents

#### List Documents

**GET** `/api/openlgu/documents`

Retrieves a paginated list of legislative documents.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | - | Filter by document type (ordinance, resolution, executive_order) |
| `term` | string | - | Filter by term ID |
| `session_id` | string | - | Filter by session ID |
| `q` | string | - | Search query (title search with LIKE) |
| `needs_review` | string | - | Filter documents needing review (0 or 1) |
| `limit` | number | 100 | Results per page (max: varies) |
| `offset` | number | 0 | Pagination offset |

**Example Request:**
```http
GET /api/openlgu/documents?type=ordinance&term=1&limit=12&offset=0
```

**Example Response:**
```json
{
  "documents": [
    {
      "id": "1",
      "type": "ordinance",
      "number": "2024-001",
      "title": "An Ordinance Establishing...",
      "session_id": "5",
      "status": "approved",
      "date_enacted": "2024-01-15",
      "pdf_url": "https://...",
      "link": "https://...",
      "moved_by": null,
      "seconded_by": null,
      "source_type": "pdf",
      "needs_review": 0,
      "processed": 1,
      "author_ids": ["1", "3", "5"],
      "term_id": "1",
      "mayor_id": "10",
      "session": {
        "id": "5",
        "number": 1,
        "type": "regular",
        "date": "2024-01-15",
        "ordinal_number": "1st",
        "term_id": "1"
      }
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 12,
    "offset": 0,
    "has_more": true
  }
}
```

**Implementation Notes:**
- Uses batch processing (BATCH_SIZE=100) to fetch author IDs and avoid SQLite variable limits
- Author IDs are fetched separately and merged into results

#### Get Document Details

**GET** `/api/openlgu/documents/:id`

Retrieves full details of a specific document including authors and subjects.

**Path Parameters:**
- `id` (string) - Document ID

**Example Response:**
```json
{
  "id": "1",
  "type": "ordinance",
  "number": "2024-001",
  "title": "An Ordinance Establishing...",
  "session_id": "5",
  "status": "approved",
  "date_enacted": "2024-01-15",
  "pdf_url": "https://...",
  "content_preview": null,
  "moved_by": null,
  "seconded_by": null,
  "source_type": "pdf",
  "needs_review": 0,
  "review_notes": null,
  "processed": 1,
  "created_at": "2024-01-15T10:00:00",
  "updated_at": "2024-01-15T10:00:00",
  "term_id": "1",
  "mayor_id": "10",
  "session": {
    "id": "5",
    "number": 1,
    "type": "regular",
    "date": "2024-01-15",
    "ordinal_number": "1st",
    "term_id": "1"
  },
  "authors": [
    {
      "id": "1",
      "first_name": "Juan",
      "middle_name": "Santos",
      "last_name": "Dela Cruz"
    }
  ],
  "subjects": ["Budget", "Finance"]
}
```

---

### Persons

#### List Persons

**GET** `/api/openlgu/persons`

Retrieves a list of government officials with their memberships.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `term` | string | - | Filter by term ID |
| `committee` | string | - | Filter by committee ID |
| `limit` | number | 100 | Results per page |
| `offset` | number | 0 | Pagination offset |

**Example Response:**
```json
{
  "persons": [
    {
      "id": "1",
      "first_name": "Juan",
      "middle_name": "Santos",
      "last_name": "Dela Cruz",
      "suffix": null,
      "aliases": null,
      "memberships": [
        {
          "term_id": "1",
          "chamber": "sangguniang-bayan",
          "role": "councilor",
          "rank": 1,
          "committees": [
            { "id": "5", "role": "chairperson" }
          ],
          "term": {
            "id": "1",
            "term_number": 12,
            "ordinal": "12th",
            "name": "12th Sangguniang Bayan",
            "year_range": "2022-2025",
            "start_date": "2022-07-01",
            "end_date": "2025-06-30"
          }
        }
      ],
      "roles": ["councilor"]
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 100,
    "offset": 0,
    "has_more": false
  }
}
```

#### Get Person Details

**GET** `/api/openlgu/persons/:id`

Retrieves full profile information for a specific person.

**Path Parameters:**
- `id` (string) - Person ID

**Example Response:**
```json
{
  "id": "1",
  "first_name": "Juan",
  "middle_name": "Santos",
  "last_name": "Dela Cruz",
  "suffix": null,
  "aliases": null,
  "memberships": [
    {
      "id": "mem-1",
      "term_id": "1",
      "chamber": "sangguniang-bayan",
      "role": "councilor",
      "rank": 1,
      "committees": [
        {
          "id": "5",
          "name": "Committee on Budget",
          "type": "standing",
          "role": "chairperson"
        }
      ]
    }
  ],
  "authored_documents": [
    {
      "id": "10",
      "type": "ordinance",
      "number": "2024-005",
      "title": "...",
      "date_enacted": "2024-02-01",
      "status": "approved",
      "session_id": "10",
      "session_number": 5,
      "session_date": "2024-02-01"
    }
  ],
  "attendance_stats": {
    "total_sessions": 50,
    "absences": 2,
    "present": 48,
    "attendance_rate": "96.0"
  }
}
```

**Implementation Notes:**
- Committee memberships are batch-fetched to avoid N+1 queries
- Attendance uses absence-only model (present = total - absences)

---

### Terms

#### List Terms

**GET** `/api/openlgu/terms`

Retrieves all legislative terms with summary information.

**Example Response:**
```json
{
  "terms": [
    {
      "id": "1",
      "term_number": 12,
      "ordinal": "12th",
      "name": "12th Sangguniang Bayan",
      "start_date": "2022-07-01",
      "end_date": "2025-06-30",
      "year_range": "2022-2025",
      "executive": {
        "mayor_id": "10",
        "mayor": "Juan Dela Cruz",
        "vice_mayor_id": "11",
        "vice_mayor": "Maria Santos"
      },
      "member_count": 12,
      "document_count": 150,
      "created_at": "2022-07-01T00:00:00"
    }
  ]
}
```

#### Get Term Details

**GET** `/api/openlgu/terms/:id`

Retrieves detailed information for a specific term.

**Path Parameters:**
- `id` (string) - Term ID

**Example Response:**
```json
{
  "id": "1",
  "term_number": 12,
  "ordinal": "12th",
  "name": "12th Sangguniang Bayan",
  "start_date": "2022-07-01",
  "end_date": "2025-06-30",
  "year_range": "2022-2025",
  "executive": {
    "mayor_id": "10",
    "mayor": "Juan Dela Cruz",
    "vice_mayor_id": "11",
    "vice_mayor": "Maria Santos"
  },
  "persons": [
    {
      "id": "1",
      "first_name": "Juan",
      "middle_name": null,
      "last_name": "Dela Cruz",
      "memberships": [
        {
          "term_id": "1",
          "chamber": "sangguniang-bayan",
          "role": "councilor",
          "rank": 1,
          "committees": [
            { "id": "5", "role": "chairperson" }
          ]
        }
      ]
    }
  ],
  "committees": [
    {
      "id": "5",
      "name": "Committee on Budget",
      "type": "standing",
      "members": ["Juan Dela Cruz (chairperson)", "Maria Santos (vice-chairperson)"]
    }
  ],
  "statistics": {
    "sessions": {
      "total": 46,
      "regular": 40,
      "special": 5,
      "inaugural": 1
    },
    "documents": {
      "ordinance": 45,
      "resolution": 120,
      "executive_order": 30
    }
  }
}
```

---

### Sessions

#### List Sessions

**GET** `/api/openlgu/sessions`

Retrieves legislative sessions with attendance data.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `term` | string | - | Filter by term ID |
| `type` | string | - | Filter by session type (Regular, Special, Inaugural) |
| `limit` | number | 1000 | Results per page |
| `offset` | number | 0 | Pagination offset |

**Example Response:**
```json
{
  "sessions": [
    {
      "id": "5",
      "term_id": "1",
      "number": 1,
      "type": "Regular",
      "date": "2024-01-15",
      "ordinal_number": "1st",
      "term_number": 12,
      "present": ["1", "2", "3", "4", "5"],
      "absent": ["6"]
    }
  ],
  "pagination": {
    "total": 46,
    "limit": 1000,
    "offset": 0,
    "has_more": false
  }
}
```

**Implementation Notes:**
- Uses absence-only attendance model
- Present members are calculated: all term members minus absent members
- Batch processing (BATCH_SIZE=100) for fetching absences
- Term memberships are fetched in a single batch query

---

### Committees

#### List Committees

**GET** `/api/openlgu/committees`

Retrieves committee information with members.

**Query Parameters:**
- `term` (string) - Filter by term ID

**Example Response:**
```json
{
  "committees": [
    {
      "id": "5",
      "name": "Committee on Budget",
      "type": "standing",
      "members": [
        {
          "id": "1",
          "first_name": "Juan",
          "middle_name": "Santos",
          "last_name": "Dela Cruz",
          "term_id": "1",
          "role": "chairperson"
        },
        {
          "id": "2",
          "first_name": "Maria",
          "middle_name": null,
          "last_name": "Santos",
          "term_id": "1",
          "role": "vice-chairperson"
        }
      ]
    }
  ]
}
```

**Implementation Notes:**
- All committee members are fetched in a single batch query to avoid N+1

---

## Database Schema

The API uses Cloudflare D1 (SQLite) with the following schema. See `db/migrations/001_initial_schema.sql` for the full schema.

### Core Tables

#### `terms`
```sql
CREATE TABLE terms (
  id TEXT PRIMARY KEY,
  term_number INTEGER NOT NULL,
  ordinal TEXT NOT NULL,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  year_range TEXT NOT NULL,
  mayor_id TEXT REFERENCES persons(id),
  vice_mayor_id TEXT REFERENCES persons(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### `persons`
```sql
CREATE TABLE persons (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  suffix TEXT,
  aliases TEXT
);
```

#### `memberships`
```sql
CREATE TABLE memberships (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES persons(id),
  term_id TEXT NOT NULL REFERENCES terms(id),
  chamber TEXT NOT NULL,
  role TEXT NOT NULL,
  rank INTEGER
);
```

#### `committees`
```sql
CREATE TABLE committees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL
);
```

#### `committee_memberships`
```sql
CREATE TABLE committee_memberships (
  person_id TEXT NOT NULL REFERENCES persons(id),
  committee_id TEXT NOT NULL REFERENCES committees(id),
  term_id TEXT NOT NULL REFERENCES terms(id),
  role TEXT NOT NULL,
  PRIMARY KEY (person_id, committee_id, term_id)
);
```

#### `sessions`
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  term_id TEXT NOT NULL REFERENCES terms(id),
  number INTEGER NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  ordinal_number TEXT
);
```

#### `session_absences`
```sql
CREATE TABLE session_absences (
  session_id TEXT NOT NULL REFERENCES sessions(id),
  person_id TEXT NOT NULL REFERENCES persons(id),
  reason TEXT,
  excuse_type TEXT,
  PRIMARY KEY (session_id, person_id)
);
```

#### `documents`
```sql
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  session_id TEXT REFERENCES sessions(id),
  status TEXT NOT NULL,
  date_enacted TEXT NOT NULL,
  pdf_url TEXT,
  content_preview TEXT,
  moved_by TEXT,
  seconded_by TEXT,
  source_type TEXT,
  needs_review INTEGER DEFAULT 0,
  review_notes TEXT,
  processed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### `document_authors`
```sql
CREATE TABLE document_authors (
  document_id TEXT NOT NULL REFERENCES documents(id),
  person_id TEXT NOT NULL REFERENCES persons(id),
  PRIMARY KEY (document_id, person_id)
);
```

#### `subjects`
```sql
CREATE TABLE subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id TEXT REFERENCES subjects(id)
);
```

#### `document_subjects`
```sql
CREATE TABLE document_subjects (
  document_id TEXT NOT NULL REFERENCES documents(id),
  subject_id TEXT NOT NULL REFERENCES subjects(id),
  relevance_score REAL,
  PRIMARY KEY (document_id, subject_id)
);
```

## Performance Optimizations

1. **Batch Processing** - SQLite has a 999 variable limit per query. The API uses:
   - `BATCH_SIZE = 100` for safe conservative batching
   - Processes document author IDs in batches
   - Processes session absences in batches

2. **N+1 Query Prevention** - Uses batch fetching for:
   - Committee memberships
   - Term member counts
   - Document counts per term

3. **KV Caching** - Different TTLs for different data types

4. **Pagination** - Limits result sets with `has_more` indicator

## Error Handling

| HTTP Code | Description |
|-----------|-------------|
| 200 | Success |
| 404 | Resource not found |
| 500 | Internal server error (database or processing error) |
