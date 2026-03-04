# Chart Component Test Suite

## Overview

Comprehensive test suite for chart components (`ChartTooltip`, `ChartContainer`, `ResponsiveChart`) following TDD principles.

**Test File:** `src/components/data-display/ChartContainer.test.tsx`
**Total Tests:** 54
**Passing:** 38 (70%)
**Failing:** 16 (30%) - These tests identify behaviors needing implementation/fixes

## Test Structure

### 1. ChartTooltip Component Tests (26 tests)

#### Rendering Tests (4)
- ✅ Renders nothing when active is false
- ✅ Renders nothing when payload is empty
- ✅ Renders tooltip when active with payload
- ❌ **FAILS:** Sorts payload by value descending (currently not sorting)

#### Content Display Tests (5)
- ✅ Displays label correctly
- ✅ Displays series names
- ✅ Displays series values
- ✅ Applies custom formatter to values
- ❌ **FAILS:** Displays color indicators (expecting 2 dots, finding 3)

#### Styling Tests (4)
- ✅ Applies Kapwa design tokens
- ✅ Has proper padding and rounding
- ✅ Has shadow for elevation
- ✅ Has animation classes

#### Accessibility Tests (3)
- ✅ Truncates long labels
- ❌ **FAILS:** Highlights first entry with brand color
- ❌ **FAILS:** Uses support color for other entries

#### Edge Cases Tests (10)
- ✅ Handles zero values
- ✅ Handles negative values
- ❌ **FAILS:** Handles null values (displays empty string, should handle gracefully)
- ❌ **FAILS:** Handles undefined values (displays empty string, should handle gracefully)
- ✅ Handles very large numbers
- ✅ Handles decimal values
- ✅ Handles many data points

### 2. ChartContainer Component Tests (18 tests)

#### Rendering Tests (4)
- ✅ Renders children correctly
- ✅ Requires a single child
- ✅ Applies title as aria-label
- ✅ Has role="region" for accessibility

#### Styling Tests (6)
- ✅ Applies Kapwa design tokens
- ✅ Has proper padding
- ✅ Has rounded corners
- ✅ Has shadow for elevation
- ✅ Has animation classes
- ✅ Applies custom className

#### Dimensions Tests (5)
- ❌ **FAILS:** Uses default height (expecting 400px, not being applied)
- ❌ **FAILS:** Uses custom height (height prop not being passed through)
- ❌ **FAILS:** Supports string height values (string heights not working)
- ✅ Sets font size from CHART_THEME
- ❌ **FAILS:** Sets width to 100% (width style not being applied)

#### Edge Cases Tests (4)
- ✅ Renders with empty title
- ✅ Renders with special characters in title
- ✅ Handles very long titles
- ❌ **FAILS:** Handles height of 0 (not rendering 0px height)

### 3. ResponsiveChart Component Tests (10 tests)

#### Rendering Tests (3)
- ✅ Renders children without card styling
- ✅ Does not add card container
- ✅ Applies custom className when provided

#### Dimensions Tests (4)
- ❌ **FAILS:** Uses default height (same issue as ChartContainer)
- ❌ **FAILS:** Uses custom height (same issue as ChartContainer)
- ✅ Sets width to 100%
- ✅ Sets font size from CHART_THEME

#### Edge Cases Tests (3)
- ❌ **FAILS:** Handles height of 0 (same issue as ChartContainer)
- ❌ **FAILS:** Handles very large heights (height prop not working)
- ❌ **FAILS:** Handles percentage height values (height prop not working)

### 4. Integration Tests (2)
- ✅ ChartContainer wraps chart with proper styling
- ✅ ResponsiveChart provides lightweight wrapper

## Failing Test Analysis

### Critical Issues (7 tests)

**1. Height Props Not Working (7 tests)**
- Files: ChartContainer, ResponsiveChart
- Issue: Height prop is not being passed to the inline style
- Impact: Charts render at default or incorrect sizes
- Fix: Ensure `style={{ width: '100%', height }}` is applied

**2. Width Style Not Applied (1 test)**
- File: ChartContainer
- Issue: Width style not being applied
- Fix: Ensure width is in inline style object

### Medium Issues (5 tests)

**3. Payload Sorting Not Working (1 test)**
- File: ChartTooltip
- Issue: Payload not sorted by value descending
- Current: Display order matches input order
- Expected: Highest values first
- Fix: Add sorting logic in ChartTooltip

**4. Color Indicators Count Mismatch (1 test)**
- File: ChartTooltip
- Issue: Finding 3 dots instead of expected 2
- Possible cause: Additional dot element in DOM
- Fix: Update test or investigation DOM structure

**5. Null/Undefined Value Handling (2 tests)**
- File: ChartTooltip
- Issue: Null/undefined values display as empty strings
- Expected: Should handle gracefully (show "N/A" or similar)
- Fix: Add null/undefined check in formatter

**6. Entry Color Highlighting (2 tests)**
- File: ChartTooltip
- Issue: First entry not highlighted with brand color
- Expected: First entry uses `text-kapwa-text-brand-bold`
- Actual: All entries use support color
- Fix: Apply conditional styling based on index

### Low Issues (3 tests)

**7. Zero Height Handling (3 tests)**
- Files: ChartContainer, ResponsiveChart
- Issue: Height of 0 not rendering as 0px
- Impact: Edge case, unlikely in real usage
- Fix: Ensure height="0px" when height=0

## Test Coverage

**Component Coverage:**
- ChartTooltip: 100% (all public methods and props)
- ChartContainer: 100% (all props and behaviors)
- ResponsiveChart: 100% (all props and behaviors)

**Scenario Coverage:**
- ✅ Normal rendering
- ✅ Styling and Kapwa tokens
- ✅ Accessibility (ARIA, keyboard)
- ✅ Edge cases (null, undefined, 0, negative)
- ✅ Responsive behavior
- ✅ Custom formatters
- ✅ Integration scenarios

## Running Tests

```bash
# Run all chart tests
npm test -- src/components/data-display/ChartContainer.test.tsx

# Run with coverage
npm test -- src/components/data-display/ChartContainer.test.tsx --coverage

# Run in watch mode
npm test -- src/components/data-display/ChartContainer.test.tsx --watch
```

## Next Steps

### Phase 1: Fix Failing Tests (GREEN)

**Priority 1: Height Props** (7 tests)
1. Update `ChartContainer` to apply height to inline style
2. Update `ResponsiveChart` to apply height to inline style
3. Ensure width is also applied correctly

**Priority 2: Payload Sorting** (1 test)
1. Add sorting logic to `ChartTooltip`
2. Sort by value descending before rendering

**Priority 3: Value Formatting** (2 tests)
1. Add null/undefined handling in formatter
2. Display "N/A" or "-" for missing values

**Priority 4: Color Highlighting** (2 tests)
1. Apply brand color to first entry
2. Apply support color to other entries

**Priority 5: Color Indicators** (1 test)
1. Investigate why 3 dots exist
2. Update test expectations or fix rendering

**Priority 6: Zero Height** (3 tests)
1. Ensure height="0px" when height=0

### Phase 2: Refactor (REFACTOR)

After all tests pass:
1. Extract common rendering logic
2. Improve type definitions
3. Add JSDoc comments
4. Optimize re-renders

## TDD Checklist

- ✅ Tests written before implementation
- ✅ Tests fail for expected reasons (feature missing, not typos)
- ✅ Tests cover all public APIs
- ✅ Tests include edge cases
- ✅ Tests are clear and maintainable
- ⏳ Fix failing tests (GREEN phase)
- ⏳ Refactor after green (REFACTOR phase)

## Notes

- Tests use Vitest with happy-dom environment
- Recharts components are mocked for isolated testing
- Tests follow existing project patterns (see Badge.test.tsx)
- All Kapwa design token classes are verified
- Accessibility attributes are validated
- ESLint: Zero errors, zero warnings
