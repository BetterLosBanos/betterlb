# Services Detail Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the service detail page to display Citizens Charter data in a citizen-centric format with clickable requirement cards, quick info grid, and vertical timeline.

**Architecture:**
- Create new React components (RequirementCard, RequirementGrid, ProcessTimeline)
- Update service detail page to use new components
- Add optional serviceSlug field to Requirement type for linking requirements to services
- Manual data tagging for requirement links (automatic detection as fallback)

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Kapwa Design System

---

## Task 1: Update TypeScript Types for Requirement Linking

**Files:**
- Modify: `src/types/citizens-charter.ts:11-16`

**Step 1: Add serviceSlug field to Requirement interface**

```typescript
export interface Requirement {
  /** Name of the requirement */
  requirement: string;
  /** Source office or agency where to secure the requirement */
  where_to_secure: string;
  /** Optional: Link to related service page if this requirement is itself a service */
  serviceSlug?: string;
}
```

**Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/types/citizens-charter.ts
git commit -m "feat(types): add optional serviceSlug field to Requirement"
```

---

## Task 2: Create RequirementCard Component

**Files:**
- Create: `src/pages/services/components/RequirementCard.tsx`

**Step 1: Write the RequirementCard component**

```tsx
import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { Requirement } from '@/types/citizens-charter';

interface RequirementCardProps {
  requirement: Requirement;
}

export function RequirementCard({ requirement }: RequirementCardProps) {
  const { requirement: title, where_to_secure, serviceSlug } = requirement;
  const isClickable = !!serviceSlug;

  const CardContent = () => (
    <div
      className={`border-kapwa-border-weak bg-kapwa-bg-surface rounded-xl border p-4 transition-all ${
        isClickable
          ? 'hover:border-kapwa-border-brand hover:bg-kapwa-bg-surface-raised cursor-pointer group'
          : ''
      }`}
    >
      <div className='flex items-start gap-3'>
        <div className='text-kapwa-text-brand bg-kapwa-bg-surface-raised rounded-lg p-2'>
          <FileText className='h-4 w-4' />
        </div>
        <div className='flex-1'>
          <h4 className='text-kapwa-text-strong text-sm font-semibold'>
            {title}
          </h4>
          <p className='text-kapwa-text-support mt-1 text-xs'>
            from: {where_to_secure}
          </p>
          {isClickable && (
            <span className='text-kapwa-text-brand mt-2 inline-flex items-center gap-1 text-xs font-bold group-hover:underline'>
              View Service <ArrowRight className='h-3 w-3' />
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (isClickable) {
    return (
      <Link to={`/services/${serviceSlug}`}>
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
}
```

**Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/pages/services/components/RequirementCard.tsx
git commit -m "feat: add RequirementCard component with optional link"
```

---

## Task 3: Create RequirementGrid Component

**Files:**
- Create: `src/pages/services/components/RequirementGrid.tsx`

**Step 1: Write the RequirementGrid component**

```tsx
import { FileText } from 'lucide-react';
import { DetailSection } from '@/components/layout/PageLayouts';
import { RequirementCard } from './RequirementCard';
import { Requirement } from '@/types/citizens-charter';

interface RequirementGridProps {
  requirements: Requirement[];
}

export function RequirementGrid({ requirements }: RequirementGridProps) {
  if (!requirements || requirements.length === 0) {
    return null;
  }

  return (
    <DetailSection title='Requirements' icon={FileText}>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
        {requirements.map((req, idx) => (
          <RequirementCard key={idx} requirement={req} />
        ))}
      </div>
    </DetailSection>
  );
}
```

**Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/pages/services/components/RequirementGrid.tsx
git commit -m "feat: add RequirementGrid component"
```

---

## Task 4: Create ProcessTimeline Component

**Files:**
- Create: `src/pages/services/components/ProcessTimeline.tsx`

**Step 1: Write the ProcessTimeline component**

```tsx
import { ClipboardList } from 'lucide-react';
import { DetailSection } from '@/components/layout/PageLayouts';
import { ClientStep } from '@/types/citizens-charter';

interface ProcessTimelineProps {
  steps: ClientStep[];
}

export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <DetailSection title='How to Apply' icon={ClipboardList}>
      <div className='space-y-4'>
        {steps.map((step, idx) => (
          <div key={idx} className='flex gap-4'>
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-kapwa-border-brand bg-kapwa-bg-surface text-sm font-bold text-kapwa-text-brand'>
              {step.step}
            </div>
            <div className='flex-1 pb-4'>
              <p className='text-kapwa-text-support text-sm leading-relaxed'>
                {step.action}
              </p>
            </div>
          </div>
        ))}
      </div>
    </DetailSection>
  );
}
```

**Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/pages/services/components/ProcessTimeline.tsx
git commit -m "feat: add ProcessTimeline component for client steps"
```

---

## Task 5: Update Service Detail Page - Import New Components

**Files:**
- Modify: `src/pages/services/[service].tsx:1-50`

**Step 1: Add imports for new components**

Replace imports section with:

```tsx
import { Link, useParams } from 'react-router-dom';

import { format, isValid } from 'date-fns';
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  BookOpen,
  Building2,
  Calendar,
  CalendarCheck,
  CheckCircle2Icon,
  ClipboardList,
  Clock,
  Edit3,
  ExternalLink,
  FileText,
  HeartHandshake,
  Info,
  LinkIcon,
  LucideIcon,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { DetailSection } from '@/components/layout/PageLayouts';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { RequirementGrid } from './components/RequirementGrid';
import { ProcessTimeline } from './components/ProcessTimeline';

import { getServiceBySlug } from '@/lib/services';
import { toTitleCase } from '@/lib/stringUtils';

import departmentsData from '@/data/directory/departments.json';

import type { QuickInfo, Source } from '@/types/servicesTypes';
```

**Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/pages/services/[service].tsx
git commit -m "refactor: import new service detail components"
```

---

## Task 6: Update Service Detail Page - Replace Requirements Section

**Files:**
- Modify: `src/pages/services/[service].tsx:255-290`

**Step 1: Replace detailed requirements table with RequirementGrid**

Find and replace the "Detailed Requirements (Citizens Charter)" section (lines ~255-290):

```tsx
          {/* Requirements (Citizens Charter) */}
          {isOfficialSource &&
            service.detailedRequirements &&
            service.detailedRequirements.length > 0 && (
              <RequirementGrid requirements={service.detailedRequirements} />
            )}
```

**Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/pages/services/[service].tsx
git commit -m "refactor: replace requirements table with RequirementGrid"
```

---

## Task 7: Update Service Detail Page - Replace Client Steps Section

**Files:**
- Modify: `src/pages/services/[service].tsx:292-326`

**Step 1: Replace client steps section with ProcessTimeline**

Find and replace the "Client Steps (Citizens Charter)" section (lines ~292-326):

```tsx
          {/* Process Timeline (Citizens Charter) */}
          {isOfficialSource &&
            service.clientSteps &&
            service.clientSteps.length > 0 && (
              <ProcessTimeline steps={service.clientSteps} />
            )}
```

**Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/pages/services/[service].tsx
git commit -m "refactor: replace client steps with ProcessTimeline"
```

---

## Task 8: Update Service Detail Page - Clean Up Quick Info Grid

**Files:**
- Modify: `src/pages/services/[service].tsx:94-123, 213-235`

**Step 1: Simplify ccInfoItems building logic**

Replace the ccInfoItems section (lines ~94-123) with a cleaner version:

```tsx
  // Build Citizens Charter specific info items
  const ccInfoItems: { label: string; value: string; icon: LucideIcon }[] = [];

  if (service.processingTime) {
    ccInfoItems.push({
      label: 'Processing Time',
      value: service.processingTime,
      icon: Clock,
    });
  }
  if (service.fees?.amount) {
    ccInfoItems.push({
      label: 'Fee',
      value: service.fees.amount,
      icon: Banknote,
    });
  }
  if (service.whoMayAvail) {
    ccInfoItems.push({
      label: 'Who Can Apply',
      value: service.whoMayAvail,
      icon: Users,
    });
  }
  if (service.classification) {
    ccInfoItems.push({
      label: 'Classification',
      value: service.classification,
      icon: FileText,
    });
  }
```

**Step 2: Update info grid rendering to use icons**

Find and update the ccInfoItems grid rendering (lines ~213-235) to use icons:

```tsx
          {/* Citizens Charter Info Grid */}
          {isOfficialSource && ccInfoItems.length > 0 && (
            <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
              {ccInfoItems.map((info, idx) => (
                <div
                  key={idx}
                  className='border-kapwa-border-weak bg-kapwa-bg-surface flex items-start gap-3 rounded-2xl border p-4 shadow-xs'
                >
                  <div className='text-kapwa-text-brand bg-kapwa-bg-surface-raised shrink-0 rounded-lg p-2'>
                    <info.icon className='h-4 w-4' />
                  </div>
                  <div>
                    <p className='text-kapwa-text-disabled mb-1 text-[10px] font-bold tracking-widest uppercase'>
                      {info.label}
                    </p>
                    <p className='text-kapwa-text-strong text-xs font-bold'>
                      {info.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
```

**Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/pages/services/[service].tsx
git commit -m "refactor: add icons to quick info grid"
```

---

## Task 9: Remove Unused ClientSteps Component Code

**Files:**
- Modify: `src/pages/services/[service].tsx:292-326`

**Step 1: Remove old client steps rendering code**

The old client steps section has been replaced by ProcessTimeline. Ensure no duplicate rendering code exists.

Search for any remaining `service.clientSteps` rendering and remove if duplicate.

**Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/pages/services/[service].tsx
git commit -m "refactor: remove duplicate client steps rendering"
```

---

## Task 10: Add Sample Requirement Links to Citizens Charter Data

**Files:**
- Modify: `src/data/citizens-charter/citizens-charter.json`

**Step 1: Add serviceSlug to sample requirements**

Find requirements that are themselves services and add serviceSlug. Example edits:

```json
{
  "requirement": "Barangay Clearance",
  "serviceSlug": "barangay-clearance",
  "where_to_secure": "Barangay Hall"
}
```

Note: This is manual data work. Start with 3-5 examples to test functionality:
- Barangay Clearance → `barangay-clearance`
- Police Clearance → `police-clearance` (if exists)
- Mayor's Permit → Link to business permit service
- Tax Declaration → Link to assessor services

**Step 2: Run merge script to update merged-services**

Run: `python3 scripts/merge_citizens_charter.py`
Expected: Merges updated data with serviceSlug fields

**Step 3: Commit**

```bash
git add src/data/citizens-charter/citizens-charter.json src/data/citizens-charter/merged-services.json
git commit -m "data: add serviceSlug links to sample requirements"
```

---

## Task 11: Run Dev Server and Test

**Files:**
- None (testing)

**Step 1: Start dev server**

Run: `npm run dev`
Expected: Server starts at http://localhost:5173

**Step 2: Manual testing checklist**

Navigate to a Citizens Charter service (e.g., /services/business-permit-renewal)
- [ ] Quick info grid displays with icons
- [ ] Requirements show as cards in grid layout
- [ ] Clickable requirements have "View Service" link
- [ ] Clicking a linked requirement navigates to that service
- [ ] Process timeline shows numbered steps
- [ ] Agency actions are NOT displayed
- [ ] Sidebar shows responsible office
- [ ] Mobile responsive check (narrow browser)

**Step 3: Run linter**

Run: `npm run lint`
Expected: No warnings

**Step 4: Commit**

```bash
git add .
git commit -m "test: verify service detail page redesign"
```

---

## Task 12: Update Documentation

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Document new components in CLAUDE.md**

Add to "Component Organization" section:

```markdown
### Service Page Components
- `src/pages/services/components/` - Service-specific components
  - `RequirementCard` - Individual requirement card with optional service link
  - `RequirementGrid` - Grid of requirement cards
  - `ProcessTimeline` - Vertical timeline for client steps
  - `ServiceCard` - Service listing card
  - `ServiceFilters` - Service filtering options
```

**Step 2: Document data structure**

Add to "Citizens Charter Data" section:

```markdown
**Requirement Linking:**
- Requirements can optionally have a `serviceSlug` field
- If present, the requirement card becomes clickable and links to that service
- Example: "Barangay Clearance" requirement with `serviceSlug: "barangay-clearance"`
```

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document new service detail components"
```

---

## Summary

This implementation plan:
1. Updates TypeScript types to support requirement linking
2. Creates three new reusable components (RequirementCard, RequirementGrid, ProcessTimeline)
3. Refactors the service detail page to use new components
4. Adds sample requirement links to test the feature
5. Includes testing and documentation

**Total commits:** ~12
**Estimated time:** 2-3 hours
**Dependencies:** None (uses existing design tokens and components)
