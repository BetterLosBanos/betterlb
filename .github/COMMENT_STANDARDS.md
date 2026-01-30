# Comment Standards for Better LB

This document outlines the standardized comment format used throughout the Better LB codebase.

## Table of Contents
- [General Principles](#general-principles)
- [JSDoc/TSDoc Format](#jsdoctsdoc-format)
- [Component Documentation](#component-documentation)
- [Function Documentation](#function-documentation)
- [Inline Comments](#inline-comments)
- [TODO/FIXME Comments](#todofixme-comments)

## General Principles

1. **Be Clear and Concise**: Comments should explain *why*, not *what* (the code should show *what*)
2. **Keep Comments Current**: Update comments when code changes
3. **Use Active Voice**: Prefer "Loads user data" over "User data is loaded"
4. **Document Complex Logic**: Always explain non-obvious logic
5. **No Commented-Out Code**: Remove unused code instead of commenting it out

## JSDoc/TSDoc Format

### Standard Function Documentation

```typescript
/**
 * Brief description of what the function does.
 *
 * @param paramName - Description of the parameter
 * @param anotherParam - Description of another parameter
 * @returns Description of the return value
 *
 * @example
 * ```tsx
 * const result = myFunction('input', 123);
 * ```
 */
```

### Async Function Documentation

```typescript
/**
 * Fetches weather data from the API.
 *
 * @param location - The location to fetch weather for
 * @returns Promise resolving to weather data
 *
 * @throws {Error} When the API request fails
 *
 * @example
 * ```tsx
 * const weather = await fetchWeather('Los Baños');
 * ```
 */
```

## Component Documentation

### React Component Template

```tsx
/**
 * Component brief description.
 *
 * Longer description if needed. Explain the component's purpose,
 * when to use it, and any important behavior or considerations.
 *
 * @remarks
 * Additional notes about implementation details or edge cases.
 *
 * @example
 * ```tsx
 * <MyComponent prop="value" />
 * ```
 */
interface ComponentProps {
  /** Prop description */
  propName: string;
  /** Optional prop description */
  optionalProp?: number;
}

export const MyComponent = ({ propName, optionalProp }: ComponentProps) => {
  return <div>{propName}</div>;
};
```

### Component with Complex Props

```tsx
/**
 * Service card component for displaying government services.
 *
 * Displays service information in a card format with hover effects.
 * Used in service listings and search results.
 *
 * @remarks
 * - Expects service data from the services schema
 * - Automatically generates slug-based links
 * - Supports featured highlighting
 */
interface ServiceCardProps {
  /** The service object containing all service information */
  service: Service;
  /** Whether to display in compact mode */
  compact?: boolean;
  /** Click handler for the card */
  onClick?: (slug: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  compact = false,
  onClick
}) => {
  // Component implementation
};
```

## Function Documentation

### Utility Functions

```typescript
/**
 * Formats a date into a readable string.
 *
 * Uses Intl.DateTimeFormat for localization support.
 *
 * @param date - The date to format (Date object or ISO string)
 * @param format - The format style to use
 * @returns Formatted date string
 *
 * @example
 * ```tsx
 * formatDate(new Date(), 'long') // "January 30, 2026"
 * ```
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'long' = 'short'
): string {
  // Implementation
}
```

### Data Processing Functions

```typescript
/**
 * Merges service category files into a single services array.
 *
 * Reads all JSON files from the services categories directory,
 * combines them, and sorts alphabetically by service name.
 * This is required before running the development server.
 *
 * @remarks
 * - Expects category files in `src/data/services/categories/`
 * - Outputs to `src/data/services/services.json`
 * - Automatically sorts for consistency
 *
 * @returns The number of services merged
 *
 * @example
 * ```bash
 * python3 scripts/merge_services.py
 * # Output: Successfully merged 42 services into one file.
 * ```
 */
function merge_services(): number {
  // Implementation
}
```

## Inline Comments

### Complex Logic

```typescript
// Use try-catch with fallback to prevent search failures from breaking the app
// This allows the app to function even when Meilisearch is unavailable
try {
  const results = await search(query);
} catch (error) {
  // Fallback to client-side filtering if search fails
  const filtered = filterByQuery(data, query);
}
```

### Algorithm Explanations

```typescript
// Calculate quarterly totals by aggregating monthly data
// Each quarter = 3 months, so we group months 0-2, 3-5, 6-8, 9-11
for (let quarter = 0; quarter < 4; quarter++) {
  const startMonth = quarter * 3;
  const endMonth = startMonth + 3;
  const quarterlyTotal = monthlyData.slice(startMonth, endMonth)
    .reduce((sum, month) => sum + month.amount, 0);
  quarters.push(quarterlyTotal);
}
```

### Regular Expressions

```typescript
// Match slugs: lowercase letters, numbers, and hyphens only
// Examples: "barangay-hall", "business-permit", "health-services-2024"
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
```

## TODO/FIXME Comments

### Format

```typescript
// TODO: [Optional Context] Description of what needs to be done
// FIXME: Description of what needs to be fixed
// NOTE: Important information for other developers
// HACK: Temporary workaround that should be refactored
```

### Examples

```typescript
// TODO: Implement caching for weather API responses
// Currently fetching on every render, causing unnecessary API calls

// FIXME: This workaround breaks when slug contains special characters
// Need to implement proper slug validation before this logic

// NOTE: This function assumes services are sorted alphabetically
// If sort order changes, pagination may break

// HACK: Using timeout to wait for animation completion
// Should use event listeners or animation promises instead
```

## File-Level Documentation

### Module Documentation

```typescript
/**
 * Weather API Utilities
 *
 * Collection of functions for fetching and processing weather data
 * from external APIs with KV caching support.
 *
 * @module lib/weather
 */

/**
 * Service Directory Data Layer
 *
 * Contains all service-related data structures and utility functions.
 * Services are organized by category and merged at build time.
 *
 * @module data/services
 */
```

## Comment Placement

### Where to Comment

**DO comment:**
- Function/module headers (JSDoc)
- Complex algorithms or business logic
- Non-obvious code behavior
- Workarounds and temporary solutions
- Performance considerations
- Security-related code

**DON'T comment:**
- Obvious code (e.g., `// Increment counter` for `i++`)
- Code that would be better named
- Outdated information
- Large blocks of commented-out code

## Review Checklist

Before committing code, ensure:
- [ ] All exported functions have JSDoc comments
- [ ] Component props are documented
- [ ] Complex logic has explanatory comments
- [ ] TODO/FIXME comments have context
- [ ] No commented-out code remains
- [ ] Comments match the current code
