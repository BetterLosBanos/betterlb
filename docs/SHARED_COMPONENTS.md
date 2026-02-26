# Shared Components Integration

This document describes the integration of `@betterlb/ui` shared components and how to work with them.

## Overview

BetterLB uses shared UI components from `@betterlb/ui` package to maintain design consistency across BetterGov portals.

**Current Shared Components:**
- `Navbar` - Site navigation with responsive menu
- `Footer` - Site footer with navigation columns and cost statement
- Additional UI components (Card, Button, Dialog, etc.)

## Development Setup

### Project Structure

```
/mnt/games/github/
├── betterlb/          # Main BetterLB portal
│   ├── src/
│   │   └── index.css  # Tailwind v4 config with @source directive
│   └── package.json   # Uses "file:../betterlb-ui" dependency
└── betterlb-ui/       # Shared UI component library
    ├── src/           # Component source files
    └── dist/          # Built output
```

### Development Workflow

**Terminal 1 - Watch shared components:**
```bash
cd /mnt/games/github/betterlb-ui
npm run dev
```

**Terminal 2 - Run BetterLB:**
```bash
cd /mnt/games/github/betterlb
npm run dev
```

### Key Configuration

#### 1. Tailwind v4 Integration

**Problem:** Tailwind v4 doesn't automatically scan `file:` dependencies for utility classes.

**Solution:** Add `@source` directive in `src/index.css`:

```css
/* Local styles */
@import 'tailwindcss';

/* Scan shared package for Tailwind classes */
@source '../../betterlb-ui/src/**/*.{js,ts,jsx,tsx}';
```

The `@source` path is relative to the CSS file location (`src/index.css` → `../../betterlb-ui/src/`).

#### 2. Shared Styles Import

In `src/main.tsx`:
```typescript
import '@betterlb/ui/styles';
```

This imports design tokens (colors, spacing, etc.) from the shared package.

#### 3. Component Usage

```typescript
// src/components/layout/Navbar.tsx
import { Navbar as SharedNavbar } from '@betterlb/ui';

const Navbar = () => {
  return (
    <SharedNavbar
      config={config}
      mainNavigation={mainNavigation}
      languages={LANGUAGES}
    />
  );
};
```

## Common Issues

### Styles not updating

**Symptom:** Changes to shared components don't appear in the browser.

**Solution:**
1. Ensure betterlb-ui dev server is running (`npm run dev` in betterlb-ui)
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Restart BetterLB dev server
4. Hard refresh browser (Ctrl+Shift+R)

### Tailwind classes not working

**Symptom:** Utility classes like `lg:flex` or `text-green-500` don't apply.

**Solution:** Verify the `@source` directive path in `src/index.css` is correct and restart the dev server.

### Import errors

**Symptom:** `Failed to resolve import "@betterlb/ui/styles"`

**Solution:** Rebuild the shared package:
```bash
cd /mnt/games/github/betterlb-ui
npm run build
```

## Publishing to npm

When ready to deploy to other portals:

1. **Bump version:**
   ```bash
   cd /mnt/games/github/betterlb-ui
   npm version patch  # or minor, major
   ```

2. **Publish to npm:**
   ```bash
   npm login
   npm publish
   ```

3. **Update consuming apps** to use npm version:
   ```json
   "@betterlb/ui": "@betterlb/ui@latest"
   ```

## Component Props

### Navbar
```typescript
interface NavbarProps {
  config: LGUConfig;
  mainNavigation: NavigationItem[];
  languages: Record<string, { nativeName: string }>;
}
```

### Footer
```typescript
interface FooterProps {
  config: LGUConfig;
  navigation: FooterNavigation;
}
```

## Architecture Notes

- The shared package uses **Tailwind v4** CSS-based configuration
- Components are built with **tsup** for fast builds
- Uses **peer dependencies** for React, i18next, and other libraries
- Translations are handled by the consuming app via `useTranslation` hook
