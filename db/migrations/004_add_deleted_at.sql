-- Add deleted_at column to persons table for soft deletes
-- Migration: 004_add_deleted_at.sql
--
-- This migration adds soft delete capability to the persons table,
-- allowing records to be flagged for deletion without removing them immediately.
-- Useful for person merge operations where verification may be needed.

-- Add deleted_at column to persons table
ALTER TABLE persons ADD COLUMN deleted_at TEXT;

-- Create index for querying non-deleted persons efficiently
CREATE INDEX IF NOT EXISTS idx_persons_deleted_at ON persons(deleted_at);

-- Create index for querying flagged (soft-deleted) persons
CREATE INDEX IF NOT EXISTS idx_persons_flagged_deletion ON persons(deleted_at) WHERE deleted_at IS NOT NULL;
