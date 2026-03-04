#!/bin/bash
# D1 Database Migration Automation Script
# BetterLB - Cloudflare D1 Migration Management
#
# Usage:
#   ./scripts/migrate.sh local              # Run migrations on local database
#   ./scripts/migrate.sh remote              # Run migrations on remote database (production)
#   ./scripts/migrate.sh status              # Show migration status
#   ./scripts/migrate.sh create <name>       # Create new migration file
#   ./scripts/migrate.sh verify              # Verify migration files

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MIGRATIONS_DIR="db/migrations"
DB_BINDING="BETTERLB_DB"
DB_NAME="betterlb_openlgu"
WRANGLER_CMD="npx wrangler d1 execute"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if wrangler is installed
check_wrangler() {
    if ! command -v npx &> /dev/null; then
        log_error "npx is not installed. Please install Node.js and npm."
        exit 1
    fi

    if ! npx wrangler --version &> /dev/null; then
        log_error "Wrangler is not installed. Installing..."
        npm install -g wrangler
    fi
}

# Get list of migration files
get_migrations() {
    ls -1 ${MIGRATIONS_DIR}/*.sql 2>/dev/null | sort
}

# Check if schema_migrations table exists
check_schema_table() {
    local local_flag=$1

    if [ "$local_flag" = "--local" ]; then
        result=$(npx wrangler d1 execute ${DB_BINDING} --local --command="SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations';" 2>/dev/null || echo "")
    else
        result=$(npx wrangler d1 execute ${DB_NAME} --command="SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations';" 2>/dev/null || echo "")
    fi

    if echo "$result" | grep -q "schema_migrations"; then
        return 0
    else
        return 1
    fi
}

# Create schema_migrations table if it doesn't exist
create_schema_table() {
    local local_flag=$1

    log_info "Creating schema_migrations table..."

    local sql="CREATE TABLE IF NOT EXISTS schema_migrations (
        migration TEXT PRIMARY KEY,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );"

    if [ "$local_flag" = "--local" ]; then
        npx wrangler d1 execute ${DB_BINDING} --local --command="$sql"
    else
        npx wrangler d1 execute ${DB_NAME} --command="$sql"
    fi

    log_success "Schema migrations table created"
}

# Get applied migrations
get_applied_migrations() {
    local local_flag=$1

    if check_schema_table "$local_flag"; then
        if [ "$local_flag" = "--local" ]; then
            npx wrangler d1 execute ${DB_BINDING} --local --command="SELECT migration FROM schema_migrations ORDER BY migration;" 2>/dev/null | grep -v "^─" | tail -n +3 | sed 's/^| //' | sed 's/ |$//' || echo ""
        else
            npx wrangler d1 execute ${DB_NAME} --command="SELECT migration FROM schema_migrations ORDER BY migration;" 2>/dev/null | grep -v "^─" | tail -n +3 | sed 's/^| //' | sed 's/ |$//' || echo ""
        fi
    else
        echo ""
    fi
}

# Run a single migration file
run_migration() {
    local migration_file=$1
    local local_flag=$2
    local migration_name=$(basename "$migration_file")

    log_info "Applying migration: $migration_name"

    # Read and execute migration
    if [ "$local_flag" = "--local" ]; then
        npx wrangler d1 execute ${DB_BINDING} --local --file="$migration_file"
    else
        npx wrangler d1 execute ${DB_NAME} --file="$migration_file"
    fi

    # Record migration
    local sql="INSERT INTO schema_migrations (migration) VALUES ('$migration_name');"

    if [ "$local_flag" = "--local" ]; then
        npx wrangler d1 execute ${DB_BINDING} --local --command="$sql" > /dev/null
    else
        npx wrangler d1 execute ${DB_NAME} --command="$sql" > /dev/null
    fi

    log_success "Migration applied: $migration_name"
}

# Run all pending migrations
run_migrations() {
    local local_flag=$1
    local target_env=$2
    local auto_confirm=${3:-false}

    log_info "Starting migrations for ${target_env}..."

    check_wrangler

    # Create schema table if it doesn't exist
    if ! check_schema_table "$local_flag"; then
        create_schema_table "$local_flag"
    fi

    # Get applied migrations
    local applied=$(get_applied_migrations "$local_flag")

    # Get all migration files
    local migrations=$(get_migrations)

    if [ -z "$migrations" ]; then
        log_warning "No migration files found in ${MIGRATIONS_DIR}"
        exit 0
    fi

    # Count pending migrations
    local pending_count=0
    local pending_migrations=""

    for migration in $migrations; do
        local migration_name=$(basename "$migration")
        if ! echo "$applied" | grep -q "^${migration_name}$"; then
            pending_count=$((pending_count + 1))
            pending_migrations="$pending_migrations $migration"
        fi
    done

    if [ $pending_count -eq 0 ]; then
        log_success "No pending migrations to apply"
        return
    fi

    log_info "Found $pending_count pending migration(s)"

    # Confirm for remote migrations
    if [ "$local_flag" != "--local" ]; then
        echo ""
        log_warning "⚠️  You are about to run migrations on the PRODUCTION database"
        echo ""
        for migration in $pending_migrations; do
            echo "  - $(basename $migration)"
        done
        echo ""

        # Skip confirmation if auto_confirm is true or CI is set
        if [ "$auto_confirm" = "true" ] || [ "$CI" = "true" ]; then
            log_info "Auto-confirming migrations (CI environment)"
        else
            read -p "Continue? (yes/no): " confirm
            if [ "$confirm" != "yes" ]; then
                log_info "Migration cancelled"
                exit 0
            fi
        fi
    fi

    # Run pending migrations
    for migration in $pending_migrations; do
        run_migration "$migration" "$local_flag"
    done

    log_success "All migrations applied successfully"
}

# Show migration status
show_status() {
    check_wrangler

    echo ""
    echo "=== Local Database ==="
    if check_schema_table "--local"; then
        local local_applied=$(get_applied_migrations "--local")
        echo "Applied migrations:"
        if [ -n "$local_applied" ]; then
            echo "$local_applied" | while read line; do
                echo "  ✓ $line"
            done
        else
            echo "  (none)"
        fi
    else
        echo "Schema migrations table not found"
    fi

    echo ""
    echo "=== Remote Database (Production) ==="
    if check_schema_table ""; then
        local remote_applied=$(get_applied_migrations "")
        echo "Applied migrations:"
        if [ -n "$remote_applied" ]; then
            echo "$remote_applied" | while read line; do
                echo "  ✓ $line"
            done
        else
            echo "  (none)"
        fi
    else
        echo "Schema migrations table not found"
    fi

    echo ""
    echo "=== Available Migration Files ==="
    local migrations=$(get_migrations)
    if [ -n "$migrations" ]; then
        echo "$migrations" | while read line; do
            echo "  - $(basename $line)"
        done
    else
        echo "  (none)"
    fi
    echo ""
}

# Create new migration file
create_migration() {
    local name=$1
    local timestamp=$(date +%Y%m%d%H%M%S)
    local filename="${timestamp}_${name}.sql"
    local filepath="${MIGRATIONS_DIR}/${filename}"

    if [ -z "$name" ]; then
        log_error "Migration name is required"
        echo "Usage: $0 create <migration_name>"
        exit 1
    fi

    if [ -f "$filepath" ]; then
        log_error "Migration file already exists: $filepath"
        exit 1
    fi

    cat > "$filepath" << EOF
-- Migration: ${filename}
-- Created: $(date +"%Y-%m-%d %H:%M:%S")
-- Description: ${name}

-- Add your migration SQL here
-- Example:
-- CREATE TABLE IF NOT EXISTS my_table (
--   id INTEGER PRIMARY KEY,
--   name TEXT NOT NULL
-- );

-- Don't forget to create indexes for performance
-- CREATE INDEX IF NOT EXISTS idx_my_table_name ON my_table(name);
EOF

    log_success "Migration file created: $filepath"
    log_info "Edit the file and run: ./scripts/migrate.sh local"
}

# Verify migration files
verify_migrations() {
    log_info "Verifying migration files..."

    local migrations=$(get_migrations)
    local has_errors=0

    if [ -z "$migrations" ]; then
        log_warning "No migration files found"
        return
    fi

    for migration in $migrations; do
        local migration_name=$(basename "$migration")

        # Check for DROP TABLE
        if grep -i "DROP TABLE" "$migration" > /dev/null; then
            log_warning "$migration_name contains DROP TABLE - ensure this is intentional"
            has_errors=1
        fi

        # Check for UPDATE/DELETE without WHERE
        if grep -E "UPDATE.*SET" "$migration" | grep -v "WHERE" > /dev/null; then
            log_error "$migration_name contains UPDATE without WHERE clause"
            has_errors=1
        fi

        if grep -E "DELETE FROM" "$migration" | grep -v "WHERE" | grep -v "DELETE FROM.*;" > /dev/null; then
            log_error "$migration_name contains DELETE without WHERE clause"
            has_errors=1
        fi

        # Check for CREATE TABLE IF NOT EXISTS
        if ! grep "CREATE TABLE IF NOT EXISTS" "$migration" > /dev/null; then
            if grep "CREATE TABLE" "$migration" > /dev/null; then
                log_warning "$migration_name uses CREATE TABLE without IF NOT EXISTS"
                has_errors=1
            fi
        fi
    done

    if [ $has_errors -eq 0 ]; then
        log_success "All migration files verified successfully"
    else
        log_error "Migration verification completed with errors"
        exit 1
    fi
}

# Main command dispatcher
case "${1:-}" in
    local)
        run_migrations "--local" "local"
        ;;
    remote|production|prod)
        run_migrations "" "production" "true"
        ;;
    status)
        show_status
        ;;
    create)
        create_migration "$2"
        ;;
    verify)
        verify_migrations
        ;;
    *)
        echo "D1 Database Migration Automation"
        echo ""
        echo "Usage: $0 <command> [args]"
        echo ""
        echo "Commands:"
        echo "  local              Run migrations on local database"
        echo "  remote             Run migrations on remote (production) database"
        echo "  remote --yes       Run migrations on production (auto-confirm, for CI)"
        echo "  status             Show migration status for local and remote"
        echo "  create <name>      Create a new migration file"
        echo "  verify             Verify migration file safety"
        echo ""
        echo "Examples:"
        echo "  $0 local                    # Run migrations locally"
        echo "  $0 remote                   # Run migrations on production (with confirmation)"
        echo "  $0 remote --yes              # Run migrations on production (auto-confirm, for CI)"
        echo "  $0 status                   # Check migration status"
        echo "  $0 create add_user_table    # Create new migration"
        echo "  $0 verify                   # Verify migration safety"
        echo ""
        exit 1
        ;;
esac
