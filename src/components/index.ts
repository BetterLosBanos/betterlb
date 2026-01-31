/**
 * Better LB Components
 *
 * Central export point for all application components.
 * Import components from their respective subdirectories:
 *
 * @example
 * // UI Components
 * import { Button, Card } from '@/components/ui';
 *
 * // Layout Components
 * import { Navbar, Footer } from '@/components/layout';
 *
 * // Data Display
 * import { StatsUI } from '@/components/data-display';
 *
 * @module components
 */

// Re-export all component categories for convenience
export * from './ui';
export * from './data-display';
export * from './layout';
export * from './navigation';
// Note: map, search, home, and widgets exports are currently minimal or unused
// Re-enable as needed when those components are utilized
