# Database Migration Automation

**Date:** 2026-02-28
**Task:** T-026 - Implement database migration automation
**Status:** ✅ Complete

## Overview

BetterLB uses **Cloudflare D1** (SQLite) as its database. Migration automation has been implemented to track and apply database schema changes safely and consistently across local, preview, and production environments.

## Architecture

### Migration Tracking Table

The `schema_migrations` table tracks which migration files have been applied:

```sql
CREATE TABLE schema_migrations (
  migration TEXT PRIMARY KEY,      -- Migration filename (e.g., "001_initial_schema.sql")
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Migration Files

Migrations are stored in `db/migrations/` with numeric prefixes for ordering:

```
db/migrations/
├── 000_init_schema_migrations.sql      # Tracking table (created 2026-02-28)
├── 001_initial_schema.sql              # Original database schema
├── 002_add_performance_indexes.sql     # Performance optimization
├── 002_baseline_data.sql               # Initial data seed (large file)
├── 003_admin_audit_log.sql             # Audit logging feature
└── 004_add_deleted_at.sql              # Soft delete support
```

### Automation Script

The `scripts/migrate.sh` bash script provides:
- ✅ Automatic migration discovery and execution
- ✅ Migration state tracking (applied vs pending)
- ✅ Safety checks (DROP TABLE, UPDATE/DELETE without WHERE)
- ✅ Production confirmation prompts
- ✅ Status reporting across environments

## Usage

### Local Development

**Run migrations on local database:**

```bash
# Using npm script (recommended)
npm run db:migrate

# Or directly
./scripts/migrate.sh local
```

This creates/updates the local SQLite database at `.wrangler/state/v3/d1/miniflare-D1DatabaseObject`.

**Check migration status:**

```bash
npm run db:migrate:status
```

Output:
```
=== Local Database ===
Applied migrations:
  ✓ 000_init_schema_migrations.sql
  ✓ 001_initial_schema.sql
  ✓ 002_add_performance_indexes.sql
  ✓ 003_admin_audit_log.sql
  ✓ 004_add_deleted_at.sql

=== Remote Database (Production) ===
Applied migrations:
  ✓ 000_init_schema_migrations.sql
  ✓ 001_initial_schema.sql
  (2 migrations pending)

=== Available Migration Files ===
  - 000_init_schema_migrations.sql
  - 001_initial_schema.sql
  - 002_add_performance_indexes.sql
  - 003_admin_audit_log.sql
  - 004_add_deleted_at.sql
```

**Verify migration safety:**

```bash
./scripts/migrate.sh verify
```

Checks for:
- DROP TABLE statements (warns if found)
- UPDATE/DELETE without WHERE clause (errors)
- CREATE TABLE without IF NOT EXISTS (warns)

### Creating New Migrations

**Create a new migration file:**

```bash
# Using npm script
npm run db:migrate:create add_user_preferences

# Or directly
./scripts/migrate.sh create add_user_preferences
```

This creates `db/migrations/20260228153045_add_user_preferences.sql`:

```sql
-- Migration: 20260228153045_add_user_preferences.sql
-- Created: 2026-02-28 15:30:45
-- Description: add_user_preferences

-- Add your migration SQL here
-- Example:
-- CREATE TABLE IF NOT EXISTS user_preferences (
--   user_id TEXT PRIMARY KEY,
--   preferences TEXT
-- );

-- Don't forget to create indexes for performance
-- CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
```

**Best practices for migration files:**

1. **Always use `IF NOT EXISTS`** for CREATE TABLE to prevent errors
2. **Add indexes** for columns used in WHERE, JOIN, ORDER BY clauses
3. **Use descriptive names** for the migration (what + why)
4. **Keep migrations reversible** when possible (document rollback steps)
5. **Avoid data migrations** in schema migrations (use separate scripts)
6. **Test locally first** before applying to production

### Production Deployments

**Option 1: Automatic (Recommended)**

Migrations run automatically when code merges to `main` branch:

```yaml
# .github/workflows/deploy.yml
- name: Run Database Migrations (Production only)
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  run: ./scripts/migrate.sh remote
```

**Process:**
1. PR is created with migration file
2. PR is tested in preview environment (uses production DB)
3. PR is merged to `main`
4. GitHub Actions workflow runs migrations automatically
5. Application is deployed

**Option 2: Manual**

For emergency migrations outside normal deployment:

```bash
./scripts/migrate.sh remote
```

You'll be prompted to confirm:

```
⚠️  You are about to run migrations on the PRODUCTION database

  - 005_add_feature_x.sql
  - 006_add_feature_y.sql

Continue? (yes/no):
```

## CI/CD Integration

### Workflow: `.github/workflows/deploy.yml`

```yaml
deploy:
  runs-on: ubuntu-latest
  name: Deploy to Cloudflare Pages
  environment: ${{ github.event_name == 'pull_request' && 'preview' || 'production' }}
  needs: quality-gate
  steps:
    # ... (checkout, install dependencies, build)

    - name: Run Database Migrations (Production only)
      if: github.event_name == 'push' && github.ref == 'refs/heads/main'
      run: ./scripts/migrate.sh remote
      env:
        CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

    - name: Deploy to Cloudflare Pages
      uses: cloudflare/wrangler-action@v3.9.0
      # ... (deployment steps)
```

### Environment Strategy

**Preview Environments (Pull Requests):**
- ✅ Deployed for every PR automatically by Cloudflare Pages
- ✅ Share production database (D1)
- ✅ Used for testing UI/API changes
- ❌ **Do NOT run migrations** (could break production)

**Production (main branch):**
- ✅ Migrations run automatically before deployment
- ✅ Applied migrations are tracked in `schema_migrations` table
- ✅ Only pending migrations are executed

## Migration Safety

### Built-in Safety Checks

The migration script includes automatic safety checks:

**1. Destructive Operation Detection:**
```bash
./scripts/migrate.sh verify
```

Detects:
- DROP TABLE statements
- UPDATE without WHERE clause
- DELETE without WHERE clause
- Missing IF NOT EXISTS on CREATE TABLE

**2. Production Confirmation:**
```bash
./scripts/migrate.sh remote
# Prompts for confirmation before running
```

**3. Migration Order:**
- Migrations are sorted alphabetically by filename
- Numeric prefixes ensure correct execution order
- Applied migrations are tracked and skipped

### Manual Safety Checklist

Before running migrations on production:

- [ ] Migrations tested locally
- [ ] Safety checks pass (`./scripts/migrate.sh verify`)
- [ ] Migration reviewed by another developer
- [ ] Rollback plan documented
- [ ] Database backup available (D1 auto-backups)
- [ ] Application compatible with new schema

## Troubleshooting

### Issue: Migration Fails Partway Through

**Symptom:** Some migrations applied, script crashed

**Solution:**
```bash
# Check which migrations were applied
npm run db:migrate:status

# Re-run script (it will skip applied migrations)
npm run db:migrate:remote
```

The script tracks applied migrations, so it will pick up where it left off.

### Issue: Need to Rollback a Migration

**Symptom:** Bad migration deployed to production

**Options:**

1. **Create reversal migration** (recommended):
```bash
./scripts/migrate.sh create rollback_feature_x
```
Add SQL to revert the changes manually.

2. **Manual rollback** (emergency only):
```bash
# Connect to D1 directly
npx wrangler d1 execute betterlb_openlgu --command="DROP TABLE IF EXISTS bad_table;"
npx wrangler d1 execute betterlb_openlgu --command="DELETE FROM schema_migrations WHERE migration='005_bad_migration.sql';"
```

### Issue: Schema Drift Between Local and Production

**Symptom:** Local has different migrations than production

**Solution:**
```bash
# Check status on both
npm run db:migrate:status

# Sync by running pending migrations
# Local:
npm run db:migrate

# Production:
npm run db:migrate:remote
```

### Issue: Migration Script Permission Denied

**Symptom:** `bash: ./scripts/migrate.sh: Permission denied`

**Solution:**
```bash
chmod +x scripts/migrate.sh
```

## Best Practices

### 1. Schema Changes

**DO:**
- Use `IF NOT EXISTS` for CREATE TABLE
- Use `IF EXISTS` for DROP TABLE
- Add indexes for performance
- Document changes in migration comments

**DON'T:**
- Modify existing migration files (they're immutable)
- Run migrations on production without testing
- Put data migrations in schema migrations (use separate scripts)

### 2. Data Migrations

For data changes (seeding, updating, transforming):

**Create separate data migration scripts:**

```bash
# scripts/data-migrations/001_add_missing_slugs.sh
npx wrangler d1 execute betterlb_openlgu --command="
  UPDATE departments SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
"
```

**Why separate?**
- Data migrations can be re-run safely
- Schema migrations should only run once
- Easier to rollback data changes

### 3. Testing Migrations

**Local testing workflow:**

1. Create migration: `npm run db:migrate:create add_feature`
2. Edit migration file
3. Verify safety: `./scripts/migrate.sh verify`
4. Run locally: `npm run db:migrate`
5. Test application locally
6. Commit and create PR
7. Test in preview environment
8. Merge to main (auto-runs on production)

## Migration Script Reference

### Commands

```bash
./scripts/migrate.sh <command>
```

| Command | Description | Usage |
|---------|-------------|-------|
| `local` | Run migrations on local database | Development |
| `remote` | Run migrations on production | Deployment (auto or manual) |
| `status` | Show migration status | Check state |
| `create <name>` | Create new migration file | Add schema changes |
| `verify` | Verify migration safety | Pre-deployment check |

### Configuration

Located in `scripts/migrate.sh`:

```bash
MIGRATIONS_DIR="db/migrations"
DB_BINDING="BETTERLB_DB"
DB_NAME="betterlb_openlgu"
```

### Environment Variables

For CI/CD:

```yaml
env:
  CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
  CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

## Related Documentation

- **Cloudflare D1 Docs:** https://developers.cloudflare.com/d1/
- **Wrangler CLI:** https://developers.cloudflare.com/workers/wrangler/
- **Development Guide:** `docs/DEVELOPER_GUIDE.md` (Deployment section)
- **CI/CD Setup:** `docs/CI-CD-SETUP.md`
- **Architecture:** `ARCHITECTURE.md` (Database Schema section)

## FAQ

**Q: Why not use Wrangler's built-in migrations?**

A: Wrangler has migration support but it's designed for Workers, not Pages. Our custom script provides better tracking, safety checks, and integration with our CI/CD workflow.

**Q: Can I run migrations on preview environments?**

A: No. Preview environments share the production D1 database. Running migrations on PRs could break production. Migrations only run when merging to `main`.

**Q: What if I need to test schema changes in a PR?**

A: Two options:
1. Test locally with `npm run db:migrate`
2. Create a separate D1 database for testing (manual setup)

**Q: How do I handle large data migrations?**

A: Don't use schema migrations for data. Create a separate script in `scripts/data-migrations/` and run it manually. See "Data Migrations" section above.

**Q: Can I reorder migration files?**

A: No. Migration files are immutable. If you need to change order, create a new migration with the correct timestamp prefix.

**Q: What happens if a migration fails?**

A: The script stops, but applied migrations are tracked. Fix the issue, then re-run the script. It will skip already-applied migrations.

## Summary

Database migration automation provides:

- ✅ **Safe migration execution** with built-in safety checks
- ✅ **Automatic tracking** of applied migrations
- ✅ **Production confirmation** to prevent accidents
- ✅ **CI/CD integration** for automated deployments
- ✅ **Status reporting** across environments
- ✅ **Rollback support** via reversal migrations

**Next Steps:**
1. Test the migration script locally: `npm run db:migrate`
2. Check status: `npm run db:migrate:status`
3. Create a test migration: `npm run db:migrate:create test_migration`
4. Review the script: `scripts/migrate.sh`
5. Read CI/CD workflow: `.github/workflows/deploy.yml`

---

**Task T-026 Status:** ✅ Complete
**Implementation Date:** 2026-02-28
**Author:** developer-3
