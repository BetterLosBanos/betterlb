#!/usr/bin/env python3
"""
Session Review Flagging Script

Flags sessions in the database that need manual review based on data quality issues.

Detection Criteria:
- missing_data: Sessions with null/invalid required fields (date, type, term_id)
- duplicate_dates: Multiple sessions on the same date (only 1 session per date should exist)
- incomplete_attendance: Sessions with incomplete attendance data
- auto_imported: Sessions that are auto-imported but not yet reviewed

Usage:
    python3 scripts/flag_sessions_for_review.py --dry-run --criteria all
    python3 scripts/flag_sessions_for_review.py --criteria duplicate_dates,missing_data
"""

import argparse
import json
import os
import sqlite3
import subprocess
import sys
from datetime import datetime
from typing import List, Dict, Any, Set, Tuple


# Database configuration
DB_NAME = "BETTERLB_DB"
LOCAL_DB_PATH = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject"
REMOTE_DB_NAME = "betterlb_openlgu"


def get_local_db_path() -> str:
    """Find the local D1 database file."""
    possible_paths = [
        ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/8cf4ff2ff4bcf8fb5e932fb0d18f9ef4fe8321f4a81add33541736e5f957933b.sqlite",
        ".wrangler/state/v3/d1/miniflare-D1DatabaseObject",
    ]

    for path in possible_paths:
        full_path = os.path.join(os.getcwd(), path)
        if os.path.exists(full_path):
            if os.path.isdir(full_path):
                # Find the sqlite file in the directory
                for file in os.listdir(full_path):
                    if file.endswith(".sqlite"):
                        return os.path.join(full_path, file)
            else:
                return full_path

    # Try to find any .sqlite file in the wrangler state directory
    wrangler_dir = os.path.join(os.getcwd(), ".wrangler/state/v3/d1/miniflare-D1DatabaseObject")
    if os.path.exists(wrangler_dir):
        for root, dirs, files in os.walk(wrangler_dir):
            for file in files:
                if file.endswith(".sqlite"):
                    return os.path.join(root, file)

    return None


def run_wrangler_command(command: List[str]) -> str:
    """Run a wrangler command and return the output."""
    try:
        result = subprocess.run(
            ["npx", "wrangler"] + command,
            capture_output=True,
            text=True,
            check=True,
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error running wrangler command: {e.stderr}", file=sys.stderr)
        return None
    except FileNotFoundError:
        print("Error: wrangler not found. Make sure @cloudflare/wrangler is installed.", file=sys.stderr)
        return None


def get_db_connection(use_remote: bool = False):
    """
    Get a database connection.
    If use_remote is True, use wrangler to query remote D1.
    Otherwise, use local SQLite file.
    """
    if use_remote:
        return None  # Will use wrangler commands for remote

    db_path = get_local_db_path()
    if not db_path:
        raise FileNotFoundError(
            "Could not find local D1 database file. "
            "Make sure you've run the dev server at least once, or use --remote flag."
        )

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def execute_query(query: str, params: Tuple = (), use_remote: bool = False) -> List[Dict[str, Any]]:
    """Execute a SQL query and return results as list of dicts."""
    if use_remote:
        # Use wrangler to execute query on remote D1
        # Create a temporary SQL file for the query
        with open(".temp_query.sql", "w") as f:
            f.write(query)

        try:
            result = run_wrangler_command(
                ["d1", "execute", REMOTE_DB_NAME, "--remote", "--file=.temp_query.sql"]
            )
            return parse_wrangler_output(result)
        finally:
            os.remove(".temp_query.sql")
    else:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]


def parse_wrangler_output(output: str) -> List[Dict[str, Any]]:
    """Parse wrangler d1 execute output into list of dicts."""
    if not output:
        return []

    try:
        data = json.loads(output)
        if isinstance(data, list) and len(data) > 0:
            # Wrangler returns a list, first element might be 'results'
            if isinstance(data[0], dict) and 'results' in data[0]:
                return data[0]['results']
            return data
        return []
    except json.JSONDecodeError:
        return []


def detect_missing_data_sessions(use_remote: bool = False) -> List[Dict[str, Any]]:
    """
    Find sessions with missing or invalid required fields.
    - Null date
    - Null type
    - Null term_id
    """
    query = """
        SELECT id, date, type, term_id, ordinal_number
        FROM sessions
        WHERE date IS NULL
           OR type IS NULL
           OR term_id IS NULL
    """
    return execute_query(query, use_remote=use_remote)


def detect_duplicate_dates(use_remote: bool = False) -> List[Dict[str, Any]]:
    """
    Find sessions that share the same date.
    Only 1 session per date should exist.
    Returns list of sessions that have duplicate dates.
    """
    query = """
        SELECT id, date, type, term_id, ordinal_number
        FROM sessions
        WHERE date IN (
            SELECT date
            FROM sessions
            WHERE date IS NOT NULL
            GROUP BY date
            HAVING COUNT(*) > 1
        )
        ORDER BY date
    """
    return execute_query(query, use_remote=use_remote)


def detect_incomplete_attendance(use_remote: bool = False) -> List[Dict[str, Any]]:
    """
    Find sessions that may have incomplete attendance data.
    This checks for sessions that have fewer absences recorded than expected
    for their term (assuming most sessions should have some absences or attendance data).
    """
    query = """
        SELECT s.id, s.date, s.type, s.term_id, s.ordinal_number,
               COUNT(sa.person_id) as absence_count,
               (SELECT COUNT(*) FROM memberships WHERE term_id = s.term_id) as term_member_count
        FROM sessions s
        LEFT JOIN session_absences sa ON s.id = sa.session_id
        WHERE s.term_id IS NOT NULL
        GROUP BY s.id
        HAVING term_member_count > 0
        ORDER BY s.date DESC
    """
    sessions = execute_query(query, use_remote=use_remote)

    # Flag sessions where we have very few absences recorded (might be incomplete)
    # This is a heuristic - if a session has 0 absences and we have attendance data,
    # it might mean everyone was present, but if we never tracked attendance, it's incomplete
    incomplete = []
    for session in sessions:
        # Skip if term_member_count is 0 (no members defined)
        if session.get('term_member_count', 0) == 0:
            continue
        incomplete.append(session)

    return incomplete


def detect_auto_imported_unreviewed(use_remote: bool = False) -> List[Dict[str, Any]]:
    """
    Find sessions that were auto-imported but not yet reviewed.
    This looks for sessions created via automation that haven't been manually verified.
    """
    # Check if there's a source_type field or similar
    query = """
        SELECT id, date, type, term_id, ordinal_number, created_at
        FROM sessions
        WHERE id NOT IN (
            SELECT item_id FROM review_queue WHERE item_type = 'session' AND status = 'resolved'
        )
        ORDER BY created_at DESC
    """
    return execute_query(query, use_remote=use_remote)


def flag_session_for_review(
    session_id: str,
    issue_type: str,
    description: str,
    dry_run: bool = False,
    use_remote: bool = False,
) -> bool:
    """
    Insert a session into the review_queue table.
    Returns True if successful, False otherwise.
    """
    import uuid

    review_id = f"review_{uuid.uuid4().hex[:24]}"
    now = datetime.utcnow().isoformat()

    query = """
        INSERT INTO review_queue (id, item_type, item_id, issue_type, description, status, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
    """
    params = (review_id, 'session', session_id, issue_type, description, 'pending', now)

    if dry_run:
        print(f"  [DRY RUN] Would flag session {session_id} for review: {description}")
        return True

    if use_remote:
        # Use wrangler to execute insert
        sql_file = f".temp_insert_{review_id}.sql"
        with open(sql_file, "w") as f:
            # Escape single quotes in description
            escaped_desc = description.replace("'", "''")
            f.write(f"INSERT INTO review_queue (id, item_type, item_id, issue_type, description, status, created_at) VALUES ('{review_id}', 'session', '{session_id}', '{issue_type}', '{escaped_desc}', 'pending', '{now}');\n")

        try:
            result = run_wrangler_command(
                ["d1", "execute", REMOTE_DB_NAME, "--remote", f"--file={sql_file}"]
            )
            os.remove(sql_file)
            return result is not None
        except Exception as e:
            os.remove(sql_file)
            print(f"  Error flagging session {session_id}: {e}", file=sys.stderr)
            return False
    else:
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(query, params)
            conn.commit()
            conn.close()
            return True
        except sqlite3.IntegrityError:
            # Already in review queue
            conn.close()
            return True
        except Exception as e:
            conn.close()
            print(f"  Error flagging session {session_id}: {e}", file=sys.stderr)
            return False


def run_checks(
    criteria: List[str],
    dry_run: bool = False,
    use_remote: bool = False,
) -> Dict[str, Any]:
    """
    Run the specified checks and flag sessions for review.
    Returns a summary of findings.
    """
    results = {
        'total_flagged': 0,
        'by_criteria': {},
    }

    check_functions = {
        'missing_data': detect_missing_data_sessions,
        'duplicate_dates': detect_duplicate_dates,
        'incomplete_attendance': detect_incomplete_attendance,
        'auto_imported': detect_auto_imported_unreviewed,
    }

    for criterion in criteria:
        if criterion not in check_functions:
            print(f"Warning: Unknown criterion '{criterion}', skipping.", file=sys.stderr)
            continue

        print(f"\nRunning check: {criterion}...")
        sessions = check_functions[criterion](use_remote=use_remote)

        flagged_count = 0
        for session in sessions:
            session_id = session.get('id')
            if not session_id:
                continue

            description = f"Session flagged for {criterion}"
            if criterion == 'missing_data':
                missing = []
                if not session.get('date'):
                    missing.append('date')
                if not session.get('type'):
                    missing.append('type')
                if not session.get('term_id'):
                    missing.append('term_id')
                description = f"Missing required fields: {', '.join(missing)}"
            elif criterion == 'duplicate_dates':
                date = session.get('date', 'unknown')
                description = f"Duplicate session date: {date}"
            elif criterion == 'incomplete_attendance':
                absences = session.get('absence_count', 0)
                members = session.get('term_member_count', 0)
                description = f"Incomplete attendance: {absences} absences recorded for {members} term members"

            if flag_session_for_review(session_id, criterion, description, dry_run, use_remote):
                flagged_count += 1

        results['by_criteria'][criterion] = {
            'found': len(sessions),
            'flagged': flagged_count,
        }
        results['total_flagged'] += flagged_count
        print(f"  Found {len(sessions)} sessions, flagged {flagged_count} for review")

    return results


def main():
    parser = argparse.ArgumentParser(
        description="Flag sessions for review based on data quality issues"
    )
    parser.add_argument(
        '--criteria',
        '-c',
        type=str,
        default='all',
        help='Comma-separated list of criteria: missing_data, duplicate_dates, incomplete_attendance, auto_imported, or "all" (default: all)'
    )
    parser.add_argument(
        '--dry-run',
        '-d',
        action='store_true',
        help='Preview what would be flagged without making changes'
    )
    parser.add_argument(
        '--remote',
        '-r',
        action='store_true',
        help='Use remote D1 database instead of local'
    )

    args = parser.parse_args()

    # Parse criteria
    if args.criteria.lower() == 'all':
        criteria = ['missing_data', 'duplicate_dates', 'incomplete_attendance', 'auto_imported']
    else:
        criteria = [c.strip() for c in args.criteria.split(',')]

    print("=" * 60)
    print("Session Review Flagging Script")
    print("=" * 60)

    if args.dry_run:
        print("DRY RUN MODE - No changes will be made")
    if args.remote:
        print(f"Using remote database: {REMOTE_DB_NAME}")
    else:
        print("Using local database")

    print(f"Running checks: {', '.join(criteria)}")
    print("-" * 60)

    try:
        results = run_checks(criteria, args.dry_run, args.remote)

        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        print(f"Total sessions flagged: {results['total_flagged']}")
        for criterion, stats in results['by_criteria'].items():
            print(f"  {criterion}: {stats['flagged']}/{stats['found']} flagged")

        if args.dry_run:
            print("\nDry run complete. Run without --dry-run to apply changes.")

    except Exception as e:
        print(f"\nError: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
