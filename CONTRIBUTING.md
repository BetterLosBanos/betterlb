# Contributing to BetterLB

Thank you for your interest in contributing! We welcome developers, designers, writers, and anyone passionate about better government transparency.

---

## Quick Start

1. **Fork and Clone**
   ```bash
   git clone https://github.com/<your-username>/betterlb
   cd betterlb
   npm install
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow the code patterns below
   - Test your changes
   - Commit with conventional commits

4. **Submit Pull Request**
   - Target the `main` branch
   - Describe your changes clearly
   - Link related issues

---

## Code Conventions

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <short description>

Types:
feat:     New feature
fix:      Bug fix
docs:     Documentation only
style:    Code style (no logic change)
refactor: Code refactoring
test:     Adding or updating tests
chore:    Maintenance tasks

Examples:
feat(services): add search filter by category
fix(navbar): correct mobile menu toggle
docs: update setup instructions
```

### Code Style

- **Prettier** auto-formats on commit (via Husky)
- **ESLint** enforces rules (max warnings = 0)
- **TypeScript** strict mode enabled

### Design System (Kapwa)

**Always use semantic tokens, never raw colors:**

```tsx
// ✅ Correct
<div className="bg-kapwa-surface text-kapwa-text-strong">

// ❌ Wrong
<div className="bg-blue-500 text-white">
```

### Component Guidelines

- **Keep components under 200 lines** - split if larger
- **Extract complex logic to hooks** - keeps components clean
- **Use barrel exports** - `index.ts` in component folders
- **Document exports** - JSDoc comments on public APIs

```tsx
// src/components/example/index.ts
export { Example } from './Example';
export type { ExampleProps };
```

---

## Development Workflow

### Setup

```bash
# Use correct Node version
nvm use  # or fnm use

# Install dependencies
npm install

# Prepare data files
python3 scripts/merge_services.py

# Start dev server
npm run dev
```

### Testing

```bash
# Run E2E tests
npm run test:e2e

# Run specific test file
npx playwright test services.spec.ts

# Check linting
npm run lint

# Format code
npm run format
```

### Pre-commit Hooks

Husky runs automatically:
- **Prettier** formats code
- **ESLint** checks quality
- **Kapwa token check** prevents raw colors

---

## Project Patterns

### Data Fetching

```tsx
// Static data - direct import
import services from '@/data/services.json';

// Dynamic data - API endpoint
const response = await fetch('/api/legislation/documents');
```

### Custom Hooks

```tsx
// Extract complex logic to hooks
function useServiceData(slug: string) {
  const [data, setData] = useState(null);
  // ... logic
  return { data, loading, error };
}
```

### Page Structure

```tsx
// Standard page pattern
export default function PageName() {
  // 1. Hooks first
  const { data } = useData();

  // 2. Early returns
  if (!data) return <Loading />;

  // 3. Render
  return (
    <PageLayout>
      <PageHeader>...</PageHeader>
      <Content>...</Content>
    </PageLayout>
  );
}
```

---

## Common Tasks

### Adding a New Service

1. Update service data in `src/data/citizens-charter/`
2. Run `python3 scripts/merge_services.py`
3. Test the service detail page

### Adding a New Page

1. Create file in `src/pages/your-page/`
2. Add route in `src/App.tsx`
3. Add navigation link if needed
4. Add E2E test in `e2e/`

### Updating LGU Config

Edit `config/lgu.config.json` - changes apply automatically.

---

## Pull Request Guidelines

### Before Submitting

- [ ] Tests pass locally (`npm run test:e2e`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Commits follow conventional format
- [ ] PR description explains changes

### PR Description Template

```markdown
## Summary
Brief description of changes

## Changes
- Change 1
- Change 2

## Testing
- Tested on: [browsers]
- E2E tests: [pass/fail/NA]

## Related Issues
Closes #123
```

---

## Getting Help

- **Issues:** [github.com/BetterLosBanos/betterlb/issues](https://github.com/BetterLosBanos/betterlb/issues)
- **Discussions:** [github.com/BetterLosBanos/betterlb/discussions](https://github.com/BetterLosBanos/betterlb/discussions)
- **Live Site:** [https://betterlb.org](https://betterlb.org)

---

## License

By contributing, you agree that your code will be released under the [Creative Commons CC0](https://creativecommons.org/publicdomain/zero/1.0/) license.

---

**Thank you for contributing to BetterLB!** 🇵🇭
