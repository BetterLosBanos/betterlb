/**
 * Utility Library
 *
 * Collection of utility functions and helpers used throughout the application.
 * Organized by function for easy importing.
 *
 * @module lib
 */

// API & Data fetching
export * from './api';
export * from './meilisearch';

// Data formatting & manipulation
export * from './format';
export * from './stringUtils';
export * from './budgetUtils';
export * from './exportData';

// Domain-specific utilities
export * from './legislation';
export * from './lgu';
export * from './weather';
export * from './forex';

// UI & Display utilities
export * from './officeIcons';
export * from './regionMapping';
export * from './scrollUtils';

// SEO & Meta
export * from './seo-data';
export * from './seoTemplates';

// General utilities
export * from './utils';
