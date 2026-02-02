# OpenLGU Page Documentation

## Overview

The OpenLGU (Open Local Government Unit) portal is a legislative transparency system that provides public access to municipal government documents, officials, and legislative proceedings for Los Baños, Philippines.

## Architecture

### Data Loading Pattern

The OpenLGU system uses **direct D1 API calls** for all data. The `useOpenLGU` hook (located at `src/hooks/useOpenLGU.ts`) fetches all data from the Cloudflare D1 database via the API:

```typescript
// API-based loaders used in production
loadTermFromAPI()       // Current/active term
loadTermsFromAPI()      // All legislative terms
loadCommitteesFromAPI() // All committees
loadPersonsFromAPI()    // All persons with memberships
loadSessionsFromAPI()   // All sessions with attendance
loadDocumentsFromAPI()  // All documents (ordinances, resolutions, EOs)
```

### Type Definitions

Core types are defined in `src/lib/openlgu.ts`:

```typescript
// Document types
export type DocumentType = 'ordinance' | 'resolution' | 'executive_order';

export interface DocumentItem {
  id: string;
  type: DocumentType;
  number: string;
  title: string;
  session_id: string;
  status: string;
  date_enacted: string;
  link: string;
  author_ids: string[];
  term_id?: string;
  mayor_id?: string;
  subjects: string[];
}

// Person with memberships
export interface Person {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  roles: string[];
  memberships: PersonMembership[];
}

// Term with executive info
export interface Term {
  id: string;
  term_number: number;
  ordinal: string;
  name: string;
  start_date: string;
  end_date: string;
  year_range: string;
  executive: {
    mayor_id?: string;
    mayor: string;
    vice_mayor_id?: string;
    vice_mayor: string;
  };
}

// Session with attendance
export interface Session {
  id: string;
  term_id: string;
  number: number;
  type: string;
  date: string;
  present: string[];
  absent: string[];
  ordinal_number: string;
}

// Committee
export interface Committee {
  id: string;
  name: string;
  type: string;
  terms: string[];
}
```

## Pages

### Layout (`src/pages/openlgu/layout.tsx`)

The OpenLGU layout provides:
- **Context Provider** - Shares data across all child routes via React Router Outlet context
- **Sidebar** - Navigation with term links and filters
- **Header** - Hero section on index, simplified header on detail pages
- **Search** - Global search functionality synced with URL params

**State Management via URL:**
```typescript
searchQuery      // Search in title, number, authors
filterType       // 'all' | 'ordinance' | 'resolution' | 'executive_order'
authorIds        // Array of author IDs (comma-separated in URL)
year             // Single year filter
```

**Context passed to child pages:**
```typescript
interface LegislationContext {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  authorIds: string[];
  setAuthorIds: (ids: string[]) => void;
  year: string;
  setYear: (year: string) => void;
  documents: DocumentItem[];
  persons: Person[];
  term: Term | null;
  terms: Term[];
  sessions: Session[];
  committees: Committee[];
  isLoading: boolean;
}
```

### Index (`/openlgu/`)

**Location:** `src/pages/openlgu/index.tsx`

Features:
- Document listing with pagination (12 items per page)
- Real-time search by title, number, or author
- Advanced filtering by document type, authors (multi-select), and year
- Teaser cards showing current term and officials
- Context-aware sidebar (collapses when viewing specific documents)

**Components used:**
- `DocumentFilters` - Filter controls for type, authors, year
- `CurrentTermCard` - Shows current term with document counts
- `OfficialsTeaser` - Quick preview of officials

### Document Detail (`/openlgu/:type/:document`)

**Location:** `src/pages/openlgu/[document].tsx`

**Route Parameters:**
- `type` - Document type (ordinance, resolution, executive-order)
- `document` - Document ID

**Displayed Information:**
- Document title, number, type, enactment date
- Authors with links to person profiles
- Downloadable PDF link
- Legislative context (term, session)
- Document status

**Special handling for Executive Orders:**
- Shows mayor as author if no authors listed
- Uses `mayor_id` field from document data

### Person Detail (`/openlgu/person/:personId`)

**Location:** `src/pages/openlgu/[person].tsx`

**Route Parameters:**
- `personId` - Person ID

**Features:**
- Profile header with avatar and attendance rate indicator
- Stats bar showing ordinances, resolutions, executive orders count
- Service history with term-by-term breakdown
- Committee assignments with role indicators (chair, vice-chair, member)
- Recent legislation (all types for legislative, EOs only for executive)
- Attendance log or EOs summary (depending on role type)

**Role Detection:**
```typescript
// Helper functions from @/lib/roleHelpers
isExecutiveRole(chamber?)  // chamber === 'executive'
isLegislativeRole(chamber) // chamber === 'sangguniang-bayan'
```

### Term Detail (`/openlgu/term/:termId`)

**Location:** `src/pages/openlgu/[term].tsx`

**Route Parameters:**
- `termId` - Term ID

**Features:**
- Term header with ordinal and year range
- Executive officials section (mayor, vice-mayor)
- Legislative members with committee badges
- Document statistics (ordinances, resolutions, EOs)
- Legislative sessions list
- Legislative output with pagination (10 items, expandable)

**Committee Badge Styles:**
- Chairperson: Amber/gold with Crown icon
- Vice Chairperson: Blue with Shield icon
- Member: Gray with User icon (only shown if no chair/vice roles)

### Session Detail (`/openlgu/session/:sessionId`)

**Location:** `src/pages/openlgu/[session].tsx`

**Route Parameters:**
- `sessionId` - Session ID

**Features:**
- Session header with type badge and date
- Attendance section (present and absent members)
- Legislation enacted during session

### Officials Index (`/openlgu/officials`)

**Location:** `src/pages/openlgu/officials.tsx`

**Features:**
- A-Z grouped listing of all officials
- Role and term filtering
- Search by name or role
- Expandable cards showing service timeline

### Terms Index (`/openlgu/terms`)

**Location:** `src/pages/openlgu/terms.tsx`

**Features:**
- Chronological term listing
- Term statistics (member count, document count)
- Executive officials per term

## URL State Management

The application uses **nuqs** for URL state management. Query parameters control:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search query | `?search=budget` |
| `type` | enum | Document type filter | `?type=ordinance` |
| `authors` | string[] | Author filter (comma-separated) | `?authors=1,5,7` |
| `year` | string | Year filter | `?year=2024` |
| `page` | number | Page number | `?page=2` |

## Custom Hook: `useOpenLGU`

**Location:** `src/hooks/useOpenLGU.ts`

```typescript
export interface LegislationData {
  term: Awaited<ReturnType<typeof loadTermFromAPI>>;
  terms: Awaited<ReturnType<typeof loadTermsFromAPI>>;
  committees: Awaited<ReturnType<typeof loadCommitteesFromAPI>>;
  persons: Person[];
  sessions: Awaited<ReturnType<typeof loadSessionsFromAPI>>;
  documents: Awaited<ReturnType<typeof loadDocumentsFromAPI>>;
  isLoading: boolean;
  error: Error | null;
}

export default function useOpenLGU(): LegislationData
```

**Features:**
- Parallel API calls for efficient data loading
- Automatic retry logic
- Loading state management
- Error handling with fallback to empty arrays

## Component Architecture

```
src/pages/openlgu/
├── layout.tsx                    # Main layout with context provider
├── index.tsx                     # Document listing index
├── [document].tsx                # Document detail page
├── [person].tsx                  # Person profile page
├── [term].tsx                    # Term detail page
├── [session].tsx                 # Session detail page
├── officials.tsx                 # Officials listing index
├── terms.tsx                     # Terms listing index
└── components/
    ├── DocumentFilters.tsx       # Type, author, year filters
    ├── OpenLGUSidebar.tsx        # Navigation sidebar
    ├── CurrentTermCard.tsx       # Current term teaser
    ├── OfficialsTeaser.tsx       # Officials preview
    ├── OfficialCard.tsx          # Official listing card
    ├── OfficialsFilterBar.tsx    # Role and term filters
    └── ServiceTimeline.tsx       # Service history timeline
```

## Helper Functions

**Location:** `src/lib/openlgu.ts`

```typescript
// Get person by ID (case-insensitive)
getPersonById(persons: Person[], id: string): Person | undefined

// Format full person name
getPersonName(person: Person): string
```

**Location:** `src/lib/roleHelpers.ts`

```typescript
// Check if role is executive
isExecutiveRole(chamber?: string): boolean

// Check if role is legislative
isLegislativeRole(chamber?: string): boolean
```

**Location:** `src/lib/stringUtils.ts`

```typescript
// Convert to title case
toTitleCase(str: string): string
```

## Document Type Styling

| Type | Badge Variant | Color |
|------|---------------|-------|
| Ordinance | `primary` | Blue |
| Resolution | `secondary` | Gray |
| Executive Order | `warning` | Yellow/Orange |

## Accessibility Features

- ARIA labels on all interactive elements
- Semantic HTML structure
- Keyboard navigation support
- Screen reader compatible
- Breadcrumb navigation
- Proper heading hierarchy
- Min-height 44px on all interactive elements (touch targets)
