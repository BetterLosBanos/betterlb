# Plan: Hot Springs Directory for Los Baños

## Overview
Create a new tourism section for BetterLB featuring a directory of hot spring facilities in Los Baños, Laguna. Following the existing patterns used for barangays and departments directories.

**User Choices:**
- Navigation: New "Tourism" section (top-level)
- Images: No images initially (text-only cards)
- Data: To be determined (see Data Sourcing section below)

## Implementation Approach

### Phase 1: Data Layer

**1.1 Create Hot Springs Data File**
- File: `src/data/directory/hot-springs.json`
- Static JSON with hot spring entries containing:
  - `slug`, `name`, `type` (commercial/natural/mixed)
  - `address`, `location` (lat/lng for map)
  - `contact` (phone, email, website)
  - `facilities`, `amenities` (arrays)
  - `entrance_fee`, `operating_hours`
  - `description`

**1.2 Create Schema File**
- File: `src/data/directory/schema/hot-springs.schema.json`
- JSON Schema validation for the hot springs data structure

### Phase 2: Page Structure

**2.1 Create Page Directory**
```
src/pages/tourism/hot-springs/
├── layout.tsx
├── index.tsx
└── [spring].tsx
```

**2.2 Create Layout (`layout.tsx`)**
- Use `SidebarLayout` component
- Add filter sidebar (by type, amenities)
- Add `ModuleHeader` with title and description
- Context for search/filter state sharing

**2.3 Create Listing Page (`index.tsx`)**
- Grid layout using `Card` components (3 columns on desktop)
- Search functionality with `SearchInput`
- Filter by type and amenities
- Show card with: name, type badge, address, entrance fee preview
- No images (text-only cards)
- Link to detail page

**2.4 Create Detail Page (`[spring].tsx`)**
- Breadcrumb navigation
- Hero section with name and description
- Contact info section (`CardContactInfo`)
- Facilities & amenities sections
- Operating hours and entrance fee
- Map integration using Leaflet (existing pattern from `ProjectMarker`)

### Phase 3: Navigation

**3.1 Update Navigation File**
- File: `src/data/navigation.ts`
- Add new "Tourism" section at top level
- Add hot springs link under tourism
- Use appropriate icon (e.g., `Thermometer` or `MapPin` from lucide-react)

**3.2 Update App Routing**
- File: `src/App.tsx`
- Add new route for `/tourism/hot-springs` with nested routes

### Phase 4: Translations (Optional)

**4.1 Add i18n Keys**
- Files: `public/locales/en/common.json`, `public/locales/fil/common.json`
- Add translations for hot springs related terms

## Critical Files to Create/Modify

### New Files
- `src/data/directory/hot-springs.json`
- `src/data/directory/schema/hot-springs.schema.json`
- `src/pages/tourism/hot-springs/layout.tsx`
- `src/pages/tourism/hot-springs/index.tsx`
- `src/pages/tourism/hot-springs/[spring].tsx`

### Files to Modify
- `src/App.tsx` - Add routes
- `src/data/navigation.ts` - Add navigation entry

## Reusable Components to Leverage

- `Card`, `CardGrid`, `CardContent` - Display cards
- `SearchInput` - Search functionality
- `SidebarLayout` - Page layout with sidebar
- `ModuleHeader`, `DetailSection` - Page headers
- `CardContactInfo` - Contact information display
- `EmptyState` - No results state
- `Badge` - Type badges (commercial/natural/mixed)

## Map Integration

Use existing Leaflet setup from `src/components/map/ProjectMarker.tsx`:
- Import map components
- Display hot spring location using lat/lng from data
- Show popup with basic info

## Verification Steps

1. **Data Validation**
   - Run JSON schema validation against new hot-springs.json
   - Verify all required fields are present

2. **Page Functionality**
   - Visit `/tourism/hot-springs` - listing page loads
   - Search works - filters by name
   - Filter by type works
   - Click card - navigates to detail page

3. **Detail Page**
   - All sections render correctly
   - Contact info displays with icons
   - Map shows location marker
   - Breadcrumb navigation works

4. **Navigation**
   - Link appears in main navigation
   - Mobile navigation works

5. **Responsive Design**
   - Test on mobile (cards stack)
   - Test on tablet (2 columns)
   - Test on desktop (3 columns)

## Example Data Structure

```json
[
  {
    "slug": "marihot-spring",
    "name": "Marihot Spring",
    "type": "commercial",
    "address": "Brgy. Bambang, Los Baños, Laguna",
    "location": {
      "latitude": 14.1886,
      "longitude": 121.2345
    },
    "contact": {
      "phone": ["(049) 123-4567"],
      "email": "info@marihotspring.com",
      "website": "https://marihotspring.com"
    },
    "facilities": ["swimming pools", "cottage rentals", "restrooms"],
    "amenities": ["parking", "restroom", "food stall"],
    "entrance_fee": "Adult: ₱50, Child: ₱30",
    "operating_hours": "6:00 AM - 8:00 PM daily",
    "description": "Popular natural hot spring with swimming pools and cottages"
  }
]
```

## Considerations

1. **Location in Navigation**: ✓ New top-level "Tourism" section selected
2. **Images**: ✓ No images initially (text-only cards)
3. **Map Provider**: Verify Leaflet tiles work without additional API keys
4. **Data Sourcing**: See Data Sourcing Strategy section below

## Data Sourcing Strategy

**Option 1: Community Crowdsourcing (Recommended)**
- Use the existing contribution system at `/contribute`
- Create a GitHub issue template for hot spring submissions
- Community submits: name, address, contact, facilities, fees, hours
- Admin review and merge into main data file
- Leverages existing "Contribute" workflow

**Option 2: Manual Research + Admin Entry**
- Research existing hot springs via:
  - Google Maps search for "hot spring Los Baños"
  - Local tourism websites
  - Facebook pages of resorts
  - LB Tourism office if available
- Admin enters data directly into JSON file
- Requires manual verification

**Option 3: Hybrid Approach (Best)**
1. Start with 3-5 well-known hot springs (manual entry)
   - Monte Vista Resort
   - Hidden Valley Springs
   - Sampaguita Hot Springs Resort
   - etc.
2. Launch with initial data
3. Enable community contributions for additions/updates
4. Regular admin review and data updates

**Key Data Points to Collect:**
- Name (official name)
- Type (commercial resort / natural spring / mixed)
- Complete address
- GPS coordinates (Google Maps)
- Phone number(s)
- Website / Facebook page
- Facilities (pools, cottages, rooms, etc.)
- Amenities (parking, food, etc.)
- Entrance fees (adult/child)
- Operating hours
- Brief description

**Recommended Workflow:**
1. Create placeholder data with 2-3 examples
2. Build and test the pages
3. Research and add real data
4. Launch and announce for community contributions

## Reference Files for Implementation

When implementing, reference these existing files for patterns:

- **Services Directory**: `src/pages/services/index.tsx` - Grid layout, search pattern
- **Barangays Directory**: `src/pages/government/barangays/index.tsx` - Card layout
- **Services Layout**: `src/pages/services/layout.tsx` - SidebarLayout pattern
- **Data Example**: `src/data/directory/barangays.json` - Data structure reference
- **Schema Example**: `src/data/directory/schema/barangays.schema.json` - Validation pattern
