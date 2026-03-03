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
export { Button } from '@bettergov/kapwa/button';
export { Card } from './Card';

// Form and input components
export { default as SearchInput } from './SearchInput';
export { default as SelectPicker } from './SelectPicker';

// Data display components
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './Dialog';
export { EmptyState } from './EmptyState';
export { PaginationControls } from './Pagination';
export { ScrollArea } from './ScrollArea';
export { Timeline } from './Timeline';
export { default as Ticker } from './Ticker';
export {
  CardSkeleton,
  DirectoryGridSkeleton,
  PageLoadingState,
} from './Skeletons';
