-- Migration: 000_init_schema_migrations.sql
-- Created: 2026-02-28
-- Description: Initialize schema migrations tracking table
--
-- This migration creates the schema_migrations table to track
-- which migrations have been applied to the database.
-- This table is used by the migration automation script.

CREATE TABLE IF NOT EXISTS schema_migrations (
  migration TEXT PRIMARY KEY,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for ordering migrations by application time
CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at ON schema_migrations(applied_at DESC);
