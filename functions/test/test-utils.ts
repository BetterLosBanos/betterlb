/* eslint-disable @typescript-eslint/no-explicit-any */
// Test code uses any for mock data which is acceptable in test context
/**
 * Test utilities for API integration testing
 * Provides mock implementations of Cloudflare Workers APIs
 */

import { Env } from '../types';

/**
 * Mock D1Database implementation for testing
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
   * Supports: SELECT with WHERE, LIMIT, OFFSET
   */
  private executeQuery(): any[] {
    // Parse table name from SQL
    const tableMatch = this.sql.match(/FROM\s+(\w+)/i);
    if (!tableMatch) {
      return [];
    }

    const tableName = tableMatch[1];
    let rows = [...(this.data.get(tableName) || [])];

    // Apply WHERE filters
    const whereMatch = this.sql.match(
      /WHERE\s+1=1(.+?)(?:ORDER BY|LIMIT|GROUP BY|$)/is
    );
    if (whereMatch && this.params.length > 0) {
      const whereClause = whereMatch[1];
      rows = this.applyFilters(rows, whereClause, this.params);
    }

    // Apply ORDER BY
    const orderMatch = this.sql.match(/ORDER BY\s+([\w\s,]+)/i);
    if (orderMatch) {
      const orderClause = orderMatch[1].trim();
      const sortDesc = orderClause.toLowerCase().includes('desc');
      const sortField = orderClause.replace(/\s+(DESC|ASC)$/i, '').trim();
      rows.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (sortDesc) {
          return aVal > bVal ? -1 : 1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    // Apply LIMIT
    const limitMatch = this.sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1]);
      rows = rows.slice(0, limit);
    }

    // Apply OFFSET
    const offsetMatch = this.sql.match(/OFFSET\s+(\d+)/i);
    if (offsetMatch) {
      const offset = parseInt(offsetMatch[1]);
      rows = rows.slice(offset);
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
        // Match pattern: column = ?N or column LIKE ?N
        const match = condition.match(/(\w+)\s*(=|LIKE)\s*\?\d*/i);
        if (!match) return true;

        const column = match[1];
        const operator = match[2].toUpperCase();
        const paramIndex = parseInt(condition.match(/\?(\d+)/)?.[1] || '1') - 1;
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
