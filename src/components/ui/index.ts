/**
 * UI Components
 *
 * A comprehensive collection of reusable UI components that serve as the building blocks for the application.
 * These components follow consistent design patterns and are fully typed with TypeScript.
 *
 * @module components/ui
 */

// Basic interactive components
export { Badge } from './Badge';
export { default as Button } from './Button';
export { Card } from './Card';

// Form and input components
export { default as SearchInput } from './SearchInput';
export { default as SelectPicker } from './SelectPicker';

// Data display components
export { EmptyState } from './EmptyState';
export { PaginationControls } from './Pagination';
export { Timeline } from './Timeline';
export { default as Ticker } from './Ticker';
export {
  CardSkeleton,
  DirectoryGridSkeleton,
  PageLoadingState,
} from './Skeletons';

// NOTE: The following components exist but are currently unused and commented out:
// - Dialog: Modal dialog component
// - ScrollArea: Scrollable area wrapper
// These can be reinstated if needed in the future
