# Services Detail Page Redesign

**Date:** 2026-02-18
**Status:** Approved
**Author:** Design Session

## Overview

Redesign the service detail page to prioritize citizen needs: requirements, fees, processing time, and where to go. Citizens Charter data is displayed in a clean, scannable format.

## Citizen Needs Analysis

Primary concerns for citizens using this portal:
1. **What documents do I need?** → Requirements
2. **Where do I go?** → Responsible office/department
3. **How much?** → Fees
4. **How long?** → Processing time

The step-by-step process is secondary—most users just need to show up with the right documents at the right place.

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Header: Service Name, Badges, Description              │
└─────────────────────────────────────────────────────────┘
┌──────────────────────────────┬──────────────────────────┐
│  Main Content Area           │  Sidebar                  │
│                              │  ┌──────────────────────┐ │
│  1. Quick Info Grid          │  │ Responsible Office   │ │
│     (Fees, Time, etc.)       │  │ (with link)          │ │
│                              │  └──────────────────────┘ │
│  2. Requirements Card Grid   │  ┌──────────────────────┐ │
│  3. Step-by-Step Timeline    │  │ Data Integrity Card  │ │
│                              │  └──────────────────────┘ │
│  4. Sources (if applicable)  │  ┌──────────────────────┐ │
│                              │  │ Suggest Edit         │ │
└──────────────────────────────┴──────────────────────────┘
```

## Section Specifications

### 1. Quick Info Grid
**Purpose:** Prominent display of key logistics (fees, time, who can apply)

**Layout:** 3-column responsive grid with icon + label + value

**Fields:**
- Processing Time (Clock icon)
- Fees (Banknote icon)
- Who Can Apply (Users icon)

**Component Style:**
```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ [icon]              │  │ [icon]              │  │ [icon]              │
│ PROCESSING TIME     │  │ FEE                 │  │ WHO CAN APPLY       │
│ 1 day               │  │ ₱50.00              │  │ Business Owners     │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

### 2. Requirements Card Grid
**Purpose:** Scannable list of required documents with source office, clickable if the requirement is itself a service

**Layout:** Responsive card grid (2-3 per row desktop, 1 per row mobile)

**Card Design:**
```
┌─────────────────────────────────┐
│ Veterinary Health Certificate   │
│ from: City/Municipal Vet Office │
│                                 │
│ [→ View Service] (if clickable) │
└─────────────────────────────────┘
```

**Interactions:**
- Static cards: No special styling
- Clickable cards: Hover effect, "→ View Service" link indicator
- Links to the service's detail page via its slug

### 3. Step-by-Step Timeline
**Purpose:** Show the client's process flow (citizen actions only, no agency actions)

**Style:** Vertical timeline with numbered steps

**Layout:**
```
   ●──────────────●──────────────●
 Step 1        Step 2        Step 3
   ↓             ↓             ↓
 Your Action  Your Action   Your Action
 Description   Description    Description
```

**Features:**
- Step number in a circle on the left
- Action description on the right
- Connected by vertical line
- Always visible (not collapsed)

### 4. Sidebar
**Purpose:** Responsible office, data verification status, community contribution

**Components:**
- Responsible Offices (link to department profile)
- Data Integrity badge (Official/Verified/Unverified)
- Suggest an Edit CTA

**Note:** Current sidebar layout is good, minimal changes needed.

## Data Structure Changes

### Requirement Linking
Requirements that are themselves services (obtainable from another or same department) should be clickable.

**Option A: Manual Tagging (Recommended)**
Add `serviceSlug` field to requirements in the Citizens Charter data:

```json
{
  "requirement": "Barangay Clearance",
  "serviceSlug": "barangay-clearance",
  "where_to_secure": "Barangay Hall"
}
```

**Option B: Automatic Detection**
Algorithm to match requirement text against service names (less reliable, fuzzy matching required)

### Type Updates

**CitizensCharter Requirement type:**
```typescript
export interface Requirement {
  requirement: string;
  where_to_secure: string;
  serviceSlug?: string; // NEW: Optional link to related service
}
```

## Components to Create/Modify

### New Components
- `RequirementCard` - Individual requirement card with optional link
- `RequirementGrid` - Grid container for requirement cards
- `ProcessTimeline` - Vertical timeline for steps

### Modify Components
- `[service].tsx` - Update page layout with new sections

## Priority
**P1 - High Priority**
- Requirements card grid with clickable links
- Quick info grid (cleanup existing)
- Vertical timeline (cleanup existing)

**P2 - Medium Priority**
- Manual data tagging for requirement links
- Fallback detection for requirement links

## Success Criteria
1. Requirements are scannable in a card format
2. Users can quickly see fees, processing time, and who can apply
3. Clickable requirements link to related services
4. Step-by-step process is clear but doesn't dominate
5. Responsible office is accessible in sidebar
6. Mobile-responsive layout
