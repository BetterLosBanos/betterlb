/* eslint-disable @typescript-eslint/no-explicit-any */
// Test code uses any for mock data which is acceptable in test context
/**
 * Test utilities for API integration testing
 * Provides mock implementations of Cloudflare Workers APIs
 */

import { Env } from '../types';

/**
 * Mock D1Database implementation for testing
 *
 * CAPABILITIES:
 * - Basic SELECT queries with explicit columns or *
 * - WHERE filters with = and LIKE operators
 * - ORDER BY (ASC/DESC) with single or multiple columns
 * - LIMIT and OFFSET (supports both literal numbers and parameterized ?N or ? placeholders)
 * - Simple JOINs (INNER JOIN, LEFT JOIN) with ON conditions
 * - Multiple JOINs in sequence
 *
 * LIMITATIONS:
 * - Does not support subqueries, UNION, GROUP BY, HAVING, aggregate functions
 * - JOINs have simplified merge logic - columns from later tables may overwrite earlier columns
 * - No support for transactions, indexes, or constraints
 * - Parameterized queries (?N) must have sequential numbering starting from 1
 * - Unnumbered parameters (?) use the last values in the params array
 * - NOT suitable for testing complex queries with multiple JOINs and conflicting column names
 *
 * For testing APIs with complex SQL, use wrangler dev with real D1 database instead.
 */
export class MockD1Database implements D1Database {
  private data: Map<string, any[]> = new Map();

  constructor(initialData?: Record<string, any[]>) {
    if (initialData) {
      Object.entries(initialData).forEach(([table, rows]) => {
        this.data.set(table, rows);
      });
    }
  }

  /**
   * Set data for a table
   */
  setTable(table: string, rows: any[]) {
    this.data.set(table, rows);
  }

  /**
   * Get data from a table
   */
  getTable(table: string): any[] {
    return this.data.get(table) || [];
  }

  /**
   * Execute a prepared statement
   * Supports basic SELECT queries with filtering
   */
  prepare(sql: string): D1PreparedStatement {
    return new MockD1PreparedStatement(sql, this.data);
  }

  /**
   * Execute a batch of statements
   */
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]> {
    return Promise.all(statements.map(stmt => stmt.all()));
  }

  /**
   * Dump database (not implemented for mock)
   */
  dump(): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(0));
  }
}

/**
 * Mock D1PreparedStatement for testing
 *
 * SQL Parser Support:
 * - SELECT with explicit columns or * (including DISTINCT)
 * - Column aliases: "column AS alias" or "table.column AS alias"
 * - Table.column format: uses column name as output
 * - WHERE conditions with = and LIKE operators (AND-only)
 * - Parameterized placeholders: ?1, ?2, etc. (1-indexed) or ? (uses last params)
 * - ORDER BY with ASC/DESC, handles table.column format
 * - LIMIT/OFFSET with literal numbers or parameterized placeholders
 * - JOINs: detects LEFT JOIN and JOIN, handles multiple sequential JOINs
 *
 * JOIN Behavior:
 * - Performs INNER/LEFT JOINs sequentially
 * - Merges rows with spread operator - base row values take precedence
 * - This means columns with the same name are preserved from the base/left table
 */
class MockD1PreparedStatement implements D1PreparedStatement {
  private sql: string;
  private data: Map<string, any[]>;
  private params: any[] = [];

  constructor(sql: string, data: Map<string, any[]>) {
    this.sql = sql;
    this.data = data;
  }

  bind(...params: any[]): D1PreparedStatement {
    this.params = params;
    return this;
  }

  /**
   * Execute query and return all results
   */
  async all<T = any>(): Promise<D1Result<T>> {
    const results = this.executeQuery();
    return {
      results: results as T[],
      success: true,
      meta: {
        duration: 0,
        rows_read: results.length,
        rows_written: 0,
        last_row_id: null,
        changed_db: false,
        size_after: 0,
        serve_replicas: [],
      },
    };
  }

  /**
   * Execute query and return first result
   */
  async first<T = any>(): Promise<T | null> {
    const results = this.executeQuery();
    return results.length > 0 ? (results[0] as T) : null;
  }

  /**
   * Execute query and return results
   */
  async run(): Promise<D1Result> {
    const results = this.executeQuery();
    return {
      results,
      success: true,
      meta: {
        duration: 0,
        rows_read: results.length,
        rows_written: 0,
        last_row_id: null,
        changed_db: false,
        size_after: 0,
        serve_replicas: [],
      },
    };
  }

  /**
   * Simple SQL parser for testing
   * Supports: SELECT with explicit columns, WHERE, ORDER BY, LIMIT, OFFSET
   * Supports basic JOINs for table aliases (e.g., "p.id" maps to "id" in result)
   */
  private executeQuery(): any[] {
    // Parse SELECT columns to understand column mapping
    // Use [\s\S]+? instead of .+? to match across newlines
    const selectMatch = this.sql.match(/SELECT\s+([\s\S]+?)\s+FROM/i);
    const selectedColumns: string[] = [];
    // Maps source column (e.g., "m.role") to target alias (e.g., "m_role")
    // If no alias, maps to itself
    const columnMap: Record<string, string> = {};

    if (selectMatch) {
      const selectClause = selectMatch[1];
      // Handle "SELECT DISTINCT"
      const actualSelect = selectClause.replace(/DISTINCT\s+/i, '');
      // Split by comma and extract column names
      actualSelect.split(',').forEach(col => {
        const trimmed = col.trim();
        // Handle "table.column AS alias" or "column AS alias"
        const asMatch = trimmed.match(/^([\w.]+)\s+AS\s+(\w+)$/i);
        if (asMatch) {
          const sourceCol = asMatch[1];
          const targetAlias = asMatch[2];
          columnMap[sourceCol] = targetAlias;
          selectedColumns.push(targetAlias);
        } else if (trimmed.includes('.')) {
          // table.column format - use the column name as output
          const parts = trimmed.split('.');
          const colName = parts[parts.length - 1];
          columnMap[trimmed] = colName;
          selectedColumns.push(colName);
        } else {
          selectedColumns.push(trimmed);
        }
      });
    }

    // Check for JOINs - support multiple JOINs (LEFT JOIN and regular JOIN)
    // First, find the FROM clause to get the base table
    const fromMatch = this.sql.match(/FROM\s+(\w+)\s+(\w+)/i);
    let rows: any[] = [];

    if (fromMatch) {
      const baseTable = fromMatch[1];
      const baseAlias = fromMatch[2];

      // Find all JOINs using a regex that matches individual JOINs
      // This regex captures each JOIN separately
      const individualJoinRegex =
        /(LEFT\s+JOIN|JOIN)\s+(\w+)\s+(\w+)\s+ON\s+(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/gi;
      const joinMatches = [...this.sql.matchAll(individualJoinRegex)];

      if (joinMatches.length > 0) {
        // This is a JOIN query - process all JOINs
        // Start with rows from the base table
        const baseTableRows = this.data.get(baseTable) || [];

        // Build a list of all joins
        const joins: Array<{
          table: string;
          alias: string;
          leftTable: string;
          leftCol: string;
          rightTable: string;
          rightCol: string;
          isLeft: boolean;
        }> = [];

        for (const match of joinMatches) {
          const joinType = match[1]; // "LEFT JOIN" or "JOIN"
          const table = match[2]!;
          const alias = match[3]!;
          const leftTable = match[4]!;
          const leftCol = match[5]!;
          const rightTable = match[6]!;
          const rightCol = match[7]!;

          joins.push({
            table,
            alias,
            leftTable,
            leftCol,
            rightTable,
            rightCol,
            isLeft: joinType.toUpperCase() === 'LEFT JOIN',
          });
        }

        // Perform joins sequentially
        rows = baseTableRows.map(row => ({ ...row }));

        for (const join of joins) {
          const joinedTableRows = this.data.get(join.table) || [];
          const newRows: any[] = [];

          for (const baseRow of rows) {
            // Determine which side of the join condition is in the base row
            // and which side is in the joined table
            let baseKeyValue: any;
            let joinedTableCol: string;

            // The leftTable/leftCol is on the left side of the equals sign
            // The rightTable/rightCol is on the right side of the equals sign
            // We need to figure out which one is in the baseRow (already joined tables)
            // and which one is in the joined table (the table we're currently joining)

            if (join.leftTable === baseAlias || join.leftTable === baseTable) {
              // Left side is from the base row
              baseKeyValue = baseRow[join.leftCol];
              joinedTableCol = join.rightCol;
            } else {
              // Right side is from the base row
              baseKeyValue = baseRow[join.rightCol];
              joinedTableCol = join.leftCol;
            }

            if (join.isLeft) {
              // LEFT JOIN: always include base row, with nulls if no match
              const matchedRows = joinedTableRows.filter(joinedRow => {
                const joinedKeyValue = joinedRow[joinedTableCol];
                return joinedKeyValue === baseKeyValue;
              });

              if (matchedRows.length > 0) {
                // Merge with matched rows
                for (const matchedRow of matchedRows) {
                  // Create merged row - spread baseRow first so it takes precedence
                  const mergedRow: any = { ...matchedRow, ...baseRow };
                  newRows.push(mergedRow);
                }
              } else {
                // No match - include base row with nulls for joined table columns
                const nullRow: any = { ...baseRow };
                for (const col of Object.keys(joinedTableRows[0] || {})) {
                  if (!(col in nullRow)) {
                    nullRow[col] = null;
                  }
                }
                newRows.push(nullRow);
              }
            } else {
              // INNER JOIN: only include matching rows
              for (const joinedRow of joinedTableRows) {
                const joinedKeyValue = joinedRow[joinedTableCol];
                if (joinedKeyValue === baseKeyValue) {
                  // Create merged row - spread baseRow last so it takes precedence
                  const mergedRow: any = { ...matchedRow, ...baseRow };
                  newRows.push(mergedRow);
                }
              }
            }
          }

          rows = newRows;
        }
      } else {
        // No JOINs - simple query with just FROM clause
        rows = [...(this.data.get(baseTable) || [])];
      }
    } else {
      // No FROM clause found (shouldn't happen in valid SQL)
      return [];
    }

    // Apply WHERE filters
    // Handle both "WHERE 1=1 AND conditions" and "WHERE conditions" patterns
    const whereMatch = this.sql.match(
      /WHERE\s+(?:1=1\s+AND\s+)?(.+?)(?:ORDER BY|LIMIT|GROUP BY|GROUP\s+BY|$)/is
    );
    if (whereMatch && this.params.length > 0) {
      const whereClause = whereMatch[1];
      rows = this.applyFilters(rows, whereClause, this.params);
    }

    // Apply ORDER BY
    const orderMatch = this.sql.match(/ORDER BY\s+([\w\s,]+)/i);
    if (orderMatch) {
      const orderClause = orderMatch[1].trim();
      const sortDesc = orderClause.toUpperCase().endsWith('DESC');
      // Handle table.column format (e.g., "c.name" -> "name")
      const sortField = orderClause.replace(/\s+(DESC|ASC)$/i, '').trim();
      const actualField = sortField.includes('.')
        ? sortField.split('.')[1]
        : sortField;
      rows.sort((a, b) => {
        const aVal = a[actualField];
        const bVal = b[actualField];
        // Handle numeric sorting for numbers
        const aNum = typeof aVal === 'number' ? aVal : parseFloat(aVal);
        const bNum = typeof bVal === 'number' ? bVal : parseFloat(bVal);

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDesc ? bNum - aNum : aNum - bNum;
        }

        // String comparison
        if (sortDesc) {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }

    // Apply OFFSET and LIMIT together (SQL standard: OFFSET first, then LIMIT)
    // Support both literal numbers and parameterized ?N or ? placeholders
    const offsetMatch = this.sql.match(/OFFSET\s+(\?\d*|\d+)/i);
    const limitMatch = this.sql.match(/LIMIT\s+(\?\d*|\d+)/i);

    if (offsetMatch && limitMatch) {
      // Both OFFSET and LIMIT: return rows[offset:offset+limit]
      let offset: number | string;
      let limitVal: number | string;

      // Parse OFFSET value
      if (offsetMatch[1] === '?') {
        // Unnumbered placeholder - use last parameter
        offset = this.params[this.params.length - 1];
      } else if (offsetMatch[1].startsWith('?')) {
        // Numbered placeholder like ?7
        offset = this.params[parseInt(offsetMatch[1].substring(1)) - 1];
      } else {
        // Literal number
        offset = parseInt(offsetMatch[1]);
      }

      // Parse LIMIT value
      if (limitMatch[1] === '?') {
        // Unnumbered placeholder - use second-to-last parameter
        limitVal = this.params[this.params.length - 2];
      } else if (limitMatch[1].startsWith('?')) {
        // Numbered placeholder like ?7
        limitVal = this.params[parseInt(limitMatch[1].substring(1)) - 1];
      } else {
        // Literal number
        limitVal = parseInt(limitMatch[1]);
      }

      rows = rows.slice(
        parseInt(offset as string),
        parseInt(offset as string) + parseInt(limitVal as string)
      );
    } else if (limitMatch) {
      // Only LIMIT
      let limitVal: number | string;
      if (limitMatch[1] === '?') {
        limitVal = this.params[this.params.length - 1];
      } else if (limitMatch[1].startsWith('?')) {
        limitVal = this.params[parseInt(limitMatch[1].substring(1)) - 1];
      } else {
        limitVal = parseInt(limitMatch[1]);
      }
      rows = rows.slice(0, parseInt(limitVal as string));
    } else if (offsetMatch) {
      // Only OFFSET
      let offset: number | string;
      if (offsetMatch[1] === '?') {
        offset = this.params[this.params.length - 1];
      } else if (offsetMatch[1].startsWith('?')) {
        offset = this.params[parseInt(offsetMatch[1].substring(1)) - 1];
      } else {
        offset = parseInt(offsetMatch[1]);
      }
      rows = rows.slice(parseInt(offset as string));
    }

    // Map columns if explicit SELECT columns were used
    if (selectedColumns.length > 0 && !selectedColumns.includes('*')) {
      rows = rows.map(row => {
        const mappedRow: any = {};
        // Iterate through the column map to find source->target mappings
        Object.entries(columnMap).forEach(([sourceCol, targetCol]) => {
          // sourceCol might be "m.role" or just "role"
          let value: any;
          if (sourceCol.includes('.')) {
            // Extract the actual column name from "table.column"
            const colName = sourceCol.split('.')[1];
            value = row[colName];
          } else {
            value = row[sourceCol];
          }
          if (value !== undefined) {
            mappedRow[targetCol] = value;
          }
        });
        // Also include any columns that were specified without a table prefix
        selectedColumns.forEach(col => {
          if (!mappedRow[col] && row[col] !== undefined) {
            mappedRow[col] = row[col];
          }
        });
        return mappedRow;
      });
    }

    return rows;
  }

  /**
   * Apply WHERE filters to results
   */
  private applyFilters(rows: any[], whereClause: string, params: any[]): any[] {
    return rows.filter(row => {
      // Simple AND filter parsing
      const conditions = whereClause.split(/\s+AND\s+/i).filter(c => c.trim());

      return conditions.every(condition => {
        // Skip "1=1" conditions
        if (condition === '1=1' || condition.trim() === '1=1') {
          return true;
        }

        // Match pattern: column = ?N or column LIKE ?N (with optional number suffix)
        const match = condition.match(/(\w+)\s*(=|LIKE)\s*\?\d*/i);
        if (!match) return true;

        const column = match[1];
        const operator = match[2].toUpperCase();

        // Extract parameter index from ?N format, defaulting to ? (which becomes 0)
        const paramMatch = condition.match(/\?(\d+)/);
        const paramIndex = paramMatch ? parseInt(paramMatch[1]) - 1 : 0;
        const value = params[paramIndex];

        if (operator === '=') {
          return row[column] == value;
        } else if (operator === 'LIKE') {
          const pattern = value.replace(/%/g, '.*').replace(/_/g, '.');
          const regex = new RegExp(`^${pattern}$`, 'i');
          return regex.test(row[column]);
        }

        return true;
      });
    });
  }
}

/**
 * Mock KVNamespace for testing
 *
 * LIMITATIONS:
 * - Operations are synchronous (not actually async)
 * - No support for true concurrent operations - read-your-writes behavior
 * - Rate limiting tests that use Promise.all() will not work correctly
 *   because all reads happen before any writes
 * - Expiration is checked on read but doesn't auto-clean
 */
export class MockKVNamespace implements KVNamespace {
  private store: Map<
    string,
    { value: string; metadata?: any; expiration?: number }
  > = new Map();

  /**
   * Get a value from KV
   */
  async get(
    key: string,
    type: 'text' | 'arrayBuffer' | 'stream' | 'json'
  ): Promise<any> {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    // Check expiration
    if (entry.expiration && entry.expiration < Date.now()) {
      this.store.delete(key);
      return null;
    }

    switch (type) {
      case 'text':
        return entry.value;
      case 'json':
        return JSON.parse(entry.value);
      case 'arrayBuffer':
        return new TextEncoder().encode(entry.value).buffer;
      case 'stream':
        return new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(entry.value));
            controller.close();
          },
        });
      default:
        return entry.value;
    }
  }

  /**
   * Put a value into KV
   */
  async put(
    key: string,
    value: string | ReadableStream | ArrayBuffer,
    options?: KVNamespacePutOptions
  ): Promise<void> {
    let stringValue: string;

    if (typeof value === 'string') {
      stringValue = value;
    } else if (value instanceof ReadableStream) {
      const reader = value.getReader();
      const chunks: Uint8Array[] = [];
      let done = false;

      while (!done) {
        const { value: chunk, done: readerDone } = await reader.read();
        done = readerDone;
        if (chunk) chunks.push(chunk);
      }

      const combined = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      );
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      stringValue = new TextDecoder().decode(combined);
    } else {
      stringValue = new TextDecoder().decode(new Uint8Array(value));
    }

    const expiration = options?.expirationTtl
      ? Date.now() + options.expirationTtl * 1000
      : undefined;

    this.store.set(key, {
      value: stringValue,
      metadata: options?.metadata,
      expiration,
    });
  }

  /**
   * Delete a value from KV
   */
  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  /**
   * List keys with prefix
   */
  async list(options?: {
    limit?: number;
    cursor?: string;
    prefix?: string;
  }): Promise<{
    keys: Array<{ name: string }>;
    list_complete: boolean;
    cursor?: string;
  }> {
    let keys = Array.from(this.store.keys());

    if (options?.prefix) {
      keys = keys.filter(key => key.startsWith(options.prefix!));
    }

    const limit = options?.limit || keys.length;
    const paginatedKeys = keys.slice(0, limit);

    return {
      keys: paginatedKeys.map(name => ({ name })),
      list_complete: paginatedKeys.length >= keys.length,
    };
  }

  /**
   * Get with metadata
   */
  async getWithMetadata<CF = unknown>(
    key: string,
    type: 'text' | 'arrayBuffer' | 'stream' | 'json'
  ): Promise<{ value: any; metadata: CF | null } | null> {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiration && entry.expiration < Date.now()) {
      this.store.delete(key);
      return null;
    }

    let value: any;
    switch (type) {
      case 'text':
        value = entry.value;
        break;
      case 'json':
        value = JSON.parse(entry.value);
        break;
      case 'arrayBuffer':
        value = new TextEncoder().encode(entry.value).buffer;
        break;
      case 'stream':
        value = new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(entry.value));
            controller.close();
          },
        });
        break;
    }

    return {
      value,
      metadata: (entry.metadata as CF) || null,
    };
  }
}

/**
 * Create a mock Env object for testing
 */
export function createMockEnv(overrides?: Partial<Env>): Env {
  const kv = new MockKVNamespace();
  const db = new MockD1Database();

  return {
    WEATHER_KV: kv,
    FOREX_KV: kv,
    BROWSER_KV: kv,
    BETTERLB_DB: db,
    DB: db,
    ...overrides,
  } as Env;
}

/**
 * Create a mock Request object
 */
export function createMockRequest(
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  }
): Request {
  const init: RequestInit = {
    method: options?.method || 'GET',
    headers: options?.headers,
  };

  if (options?.body) {
    init.body = JSON.stringify(options.body);
  }

  return new Request(url, init);
}

/**
 * Wait for async operations
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
