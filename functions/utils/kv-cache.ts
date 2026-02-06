/**
 * KV Cache layer for OpenLGU APIs
 *
 * Provides a cache-aside pattern with fallback to database queries.
 * Uses Cloudflare KV for fast, distributed caching of API responses.
 */
import { Env } from '../types';

/** Cache TTL configurations in seconds */
export const CACHE_TTL = {
  /** Static data that rarely changes (1 hour) */
  static: 3600,
  /** List endpoints that change periodically (15 minutes) */
  list: 900,
  /** Detail endpoints that may change more frequently (5 minutes) */
  detail: 300,
  /** Count/query results (2 minutes) */
  count: 120,
} as const;

/** Cache key prefixes for different data types */
const CACHE_PREFIXES = {
  terms: 'openlgu:terms:',
  term: 'openlgu:term:',
  committees: 'openlgu:committees:',
  committee: 'openlgu:committee:',
  persons: 'openlgu:persons:',
  person: 'openlgu:person:',
  sessions: 'openlgu:sessions:',
  session: 'openlgu:session:',
  documents: 'openlgu:documents:',
  document: 'openlgu:document:',
} as const;

/**
 * Generate a cache key for a given resource
 *
 * @param prefix - Cache key prefix
 * @param identifier - Unique identifier for the resource
 * @param params - Optional query parameters to include in key
 * @returns Formatted cache key
 */
function generateCacheKey(
  prefix: string,
  identifier: string,
  params?: Record<string, string | number | boolean | null | undefined>
): string {
  if (!params || Object.keys(params).length === 0) {
    return `${prefix}${identifier}`;
  }

  // Sort params for consistent key generation
  const sortedParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return `${prefix}${identifier}?${sortedParams}`;
}

/**
 * KV Cache class implementing cache-aside pattern
 */
export class KVCache {
  private kv: KVNamespace;

  constructor(env: Env) {
    // Use WEATHER_KV for now - in production, create a dedicated API_CACHE namespace
    this.kv = env.WEATHER_KV;
  }

  /**
   * Get value from cache or compute and store it
   *
   * @param key - Cache key
   * @param factory - Function to compute value if not in cache
   * @param ttl - Time to live in seconds
   * @returns Cached or computed value
   */
  async get<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = CACHE_TTL.list
  ): Promise<T> {
    try {
      // Try to get from cache
      const cached = await this.kv.get(key, 'json');
      if (cached !== null) {
        return cached as T;
      }

      // Cache miss - compute value
      const value = await factory();

      // Store in cache
      await this.kv.put(key, JSON.stringify(value), {
        expirationTtl: ttl,
      });

      return value;
    } catch (error) {
      // On KV error, fall back to computing value
      console.warn(`KV cache error for key ${key}:`, error);
      return factory();
    }
  }

  /**
   * Get multiple items from cache using a single key pattern
   *
   * @param keyPattern - Cache key pattern (without the prefix)
   * @param factory - Function to compute values if not in cache
   * @param ttl - Time to live in seconds
   * @returns Cached or computed values
   */
  async getMany<T>(
    keyPattern: string,
    factory: () => Promise<T[]>,
    ttl: number = CACHE_TTL.list
  ): Promise<T[]> {
    return this.get(keyPattern, factory, ttl);
  }

  /**
   * Invalidate a single cache entry
   *
   * @param key - Cache key to invalidate
   */
  async invalidate(key: string): Promise<void> {
    try {
      await this.kv.delete(key);
    } catch (error) {
      console.warn(`Failed to invalidate cache key ${key}:`, error);
    }
  }

  /**
   * Invalidate all cache entries matching a pattern prefix
   *
   * Note: KV doesn't support pattern deletion, so we need to list keys first.
   * This is expensive and should be used sparingly.
   *
   * @param prefix - Cache key prefix to invalidate
   */
  async invalidatePrefix(prefix: string): Promise<void> {
    try {
      const list = await this.kv.list({ prefix });
      for (const key of list.keys) {
        await this.kv.delete(key.name);
      }
    } catch (error) {
      console.warn(`Failed to invalidate cache prefix ${prefix}:`, error);
    }
  }

  /**
   * Invalidate all OpenLGU cache entries
   */
  async invalidateAll(): Promise<void> {
    for (const prefix of Object.values(CACHE_PREFIXES)) {
      await this.invalidatePrefix(prefix);
    }
  }

  /**
   * Generate cache key for terms list
   */
  termsKey(): string {
    return generateCacheKey(CACHE_PREFIXES.terms, 'list');
  }

  /**
   * Generate cache key for single term
   */
  termKey(termId: string): string {
    return generateCacheKey(CACHE_PREFIXES.term, termId);
  }

  /**
   * Generate cache key for committees list
   */
  committeesKey(params?: { term?: string }): string {
    return generateCacheKey(CACHE_PREFIXES.committees, 'list', params);
  }

  /**
   * Generate cache key for persons list
   */
  personsKey(params?: {
    term?: string;
    committee?: string;
    limit?: number;
    offset?: number;
  }): string {
    return generateCacheKey(CACHE_PREFIXES.persons, 'list', params);
  }

  /**
   * Generate cache key for single person
   */
  personKey(personId: string): string {
    return generateCacheKey(CACHE_PREFIXES.person, personId);
  }

  /**
   * Generate cache key for sessions list
   */
  sessionsKey(params?: {
    term?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): string {
    return generateCacheKey(CACHE_PREFIXES.sessions, 'list', params);
  }

  /**
   * Generate cache key for documents list
   */
  documentsKey(params?: {
    type?: string;
    term?: string;
    session_id?: string;
    q?: string;
    needs_review?: string;
    limit?: number;
    offset?: number;
  }): string {
    return generateCacheKey(CACHE_PREFIXES.documents, 'list', params);
  }

  /**
   * Generate cache key for single document
   */
  documentKey(documentId: string): string {
    return generateCacheKey(CACHE_PREFIXES.document, documentId);
  }
}

/**
 * Helper function to create a KVCache instance
 *
 * @param env - Cloudflare environment
 * @returns KVCache instance
 */
export function createKVCache(env: Env): KVCache {
  return new KVCache(env);
}
