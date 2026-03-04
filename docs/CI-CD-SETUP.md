# CI/CD Pipeline Enhancements - Documentation

## Overview

This document describes the CI/CD pipeline enhancements added to the BetterLB project to improve code quality, test coverage, and deployment reliability.

## New Workflows Added

### 1. E2E Testing Workflow (`.github/workflows/e2e.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch (opened, synchronized, reopened)

**Jobs:**

#### a) E2E Tests
- Runs Playwright end-to-end tests across multiple browsers
- Uploads test reports and blob reports for 7 days
- Configured with retry logic for CI environment
- Runs on: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

#### b) E2E Visual Regression Tests
- Only runs on pull requests
- Uses `@visual` tag to identify visual regression tests
- Fetches full git history for comparison
- Continues on error (non-blocking for initial rollout)

#### c) E2E Accessibility Tests
- Runs accessibility tests using `@a11y` tag
- Integrates with @axe-core/playwright for WCAG compliance
- Continues on error (non-blocking for initial rollout)
- Uploads accessibility reports

**Key Features:**
- Parallel test execution with configurable workers
- Automatic browser installation via `--with-deps`
- Artifact retention for debugging
- CI-specific configuration (retries, reporter, workers)

### 2. Quality Check Workflow (`.github/workflows/quality-check.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**

#### a) Code Quality Checks
- **TypeScript type checking**: `npx tsc --noEmit`
- **ESLint**: `npm run lint` with zero warnings tolerance
- **Prettier format check**: Ensures code formatting consistency
- Merges service data before checks to ensure data files are valid

#### b) Unit Tests
- Runs Vitest unit tests in CI mode (`--run`)
- Generates coverage reports (text, JSON, HTML)
- **Codecov integration**: Uploads coverage with optional token
- **PR Comments**: Posts coverage reports as comments on pull requests
- Coverage artifacts retained for 7 days

#### c) Production Build Check
- Validates production build succeeds
- Generates bundle size report in GitHub summary
- Uploads build artifacts for analysis
- Ensures no build-time errors

#### d) Security Vulnerability Scan
- Runs `npm audit` at moderate level
- Continues on error (non-blocking for monitoring)
- Uploads audit reports as artifacts

#### e) Code Complexity Analysis
- Runs ESLint complexity reports
- Generates complexity metrics
- Uploads detailed reports for analysis

**Key Features:**
- All jobs run in parallel for faster feedback
- Coverage reports posted as PR comments
- Bundle size tracking in GitHub summaries
- Security scanning with artifact retention

### 3. Enhanced Deployment Workflow (`.github/workflows/deploy.yml`)

**Changes Made:**
- Added `quality-gate` job that must pass before deployment
- Quality gate includes: type check, lint, format check
- Deployment job now depends on quality gate via `needs: quality-gate`

**Quality Gate Prevents:**
- TypeScript compilation errors
- ESLint violations (zero tolerance)
- Code formatting inconsistencies
- Data merge failures

**Behavior:**
- Pull requests: Deploys to preview environment
- Main branch pushes: Deploys to production
- Quality gate failures block deployment entirely

## Test Reporting Integration

### Codecov Setup
The workflow includes Codecov integration for coverage tracking:

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v5.4.0
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/coverage-final.json
    flags: unittests
    name: codecov-umbrella
    fail_ci_if_error: false
```

**Required GitHub Secret:**
- `CODECOV_TOKEN` (optional but recommended for private repos)

### PR Coverage Comments
Coverage reports are automatically posted as PR comments using `romeovs/lcov-reporter-action`.

### Artifact Retention
All workflows use 7-day artifact retention for:
- Test reports (Playwright HTML reports)
- Coverage reports (HTML, JSON)
- Build artifacts (dist folder)
- Security audit reports
- Complexity analysis reports

## Workflow Triggers and Permissions

### Permissions Required
```yaml
permissions:
  contents: read
  pull-requests: write  # For PR comments
```

### Branch Protection Recommendations
To maximize effectiveness, configure branch protection rules for `main`:
1. Require status checks to pass before merging
2. Required checks:
   - `Quality / Code Quality Checks`
   - `Unit Tests`
   - `E2E Tests`
   - `Quality Gate`
3. Optionally require: `E2E Accessibility Tests`, `E2E Visual Regression Tests`

## Usage Examples

### Running Tests Locally Before Push

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format check
npx prettier --check .

# Unit tests
npm run test -- --run

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Debugging Failed CI Workflows

1. **Check workflow logs**: Click on the failed workflow run in GitHub Actions tab
2. **Download artifacts**: Failed test runs upload reports for debugging
3. **View bundle size**: Check GitHub summary for build size analysis
4. **Coverage reports**: Download coverage artifacts for detailed analysis

## Configuration Files

### Playwright Configuration
File: `playwright.config.ts`

Key settings for CI:
```typescript
forbidOnly: !!process.env.CI,
retries: process.env.CI ? 2 : 0,
workers: process.env.CI ? 2 : undefined,
reporter: process.env.CI
  ? [['blob', { outputFolder: 'blob-report' }]]
  : 'html',
```

### Vitest Configuration
File: `vitest.config.ts`

Coverage configuration excludes:
- `node_modules/`
- `e2e/`
- `dist/`
- Test files (`**/*.test.{ts,tsx}`, `**/*.spec.{ts,tsx}`)

## Troubleshooting

### Common Issues

#### 1. Playwright Tests Timeout
**Symptom**: E2E tests fail with timeout errors
**Solutions**:
- Increase `timeout-minutes` in workflow
- Check if dev server is starting properly
- Verify `baseURL` in playwright.config.ts

#### 2. Coverage Upload Fails
**Symptom**: Codecov upload fails
**Solutions**:
- Add `CODECOV_TOKEN` to GitHub secrets
- Set `fail_ci_if_error: false` to make it non-blocking
- Check network connectivity in CI runner

#### 3. Quality Gate Blocks Deployment
**Symptom**: Deployment blocked by quality gate
**Solutions**:
- Run `npm run lint` locally to see violations
- Fix formatting issues with `npm run format`
- Resolve TypeScript errors before pushing

#### 4. Bundle Size Unexpectedly Large
**Symptom**: Bundle size report shows large increases
**Solutions**:
- Check bundle size report in workflow summary
- Analyze with `npx vite-bundle-visualizer` locally
- Remove unused dependencies or implement code splitting

## Future Enhancements

### Potential Additions
1. **Performance Testing**: Add Lighthouse CI for performance regression testing
2. **Visual Regression**: Integrate with Percy or Chromatic for advanced visual testing
3. **Dependency Updates**: Add Dependabot or Renovate for automated dependency updates
4. **Slack Notifications**: Notify team on deployment success/failure

### Note: Staging Environment
As of 2026-02-28, the project uses Cloudflare Pages preview environments for pre-production testing. Preview deployments are automatically created for every pull request, providing isolated testing environments before code merges to production. This approach serves the same purpose as a traditional staging environment with less operational overhead. See `.github/workflows/deploy.yml` for the current deployment configuration.

### Monitoring Improvements
1. **Test Flakiness Detection**: Track flaky tests over time
2. **Build Performance Monitoring**: Track CI workflow duration
3. **Coverage Trends**: Monitor coverage changes across branches

## Maintenance

### Regular Tasks
1. **Update Action Versions**: Review and update GitHub Actions monthly
2. **Review Coverage Thresholds**: Adjust minimum coverage targets as needed
3. **Audit Workflow Permissions**: Ensure minimal required permissions
4. **Clean Up Old Artifacts**: Review artifact retention policies quarterly

### Resources
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright CI Configuration](https://playwright.dev/docs/ci)
- [Vitest CI Guide](https://vitest.dev/guide/cli.html#ci-options)
- [Codecov Documentation](https://docs.codecov.com/)

## Summary

These CI/CD enhancements provide:
- ✅ Comprehensive testing (unit, E2E, accessibility, visual)
- ✅ Code quality enforcement (type check, lint, format)
- ✅ Automated coverage reporting with PR comments
- ✅ Security vulnerability scanning
- ✅ Quality gates preventing broken deployments
- ✅ Artifact retention for debugging
- ✅ Bundle size tracking
- ✅ Parallel job execution for fast feedback

All workflows are designed to be:
- **Non-blocking for initial rollout**: Accessibility and visual regression tests use `continue-on-error: true`
- **Fast**: Parallel job execution, cached dependencies
- **Informative**: GitHub summaries, PR comments, artifact uploads
- **Maintainable**: Clear job separation, documented configurations
