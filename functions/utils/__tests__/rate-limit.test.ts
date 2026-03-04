/**
 * Rate Limiting Utility Tests
 * Tests for functions/utils/rate-limit.ts
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// Test code uses any for mock data which is acceptable in test context

import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  createRateLimitHeaders,
  createRateLimitResponse,
  addRateLimitHeaders,
  getClientIdentifier,
  RateLimitConfig,
} from '../rate-limit';

// Mock KVNamespace for testing
class MockKVNamespace {
  private store = new Map<string, { value: string; expiration?: number }>();

  async get(
    key: string,
    type: 'text' | 'arrayBuffer' | 'stream' | 'json' = 'json'
  ): Promise<any> {
    const entry = this.store.get(key);

    // Check expiration
    if (entry?.expiration && entry.expiration < Date.now()) {
      this.store.delete(key);
      return null;
    }

    if (type === 'json' && entry?.value) {
      return JSON.parse(entry.value);
    }

    return entry?.value || null;
  }

  async put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void> {
    const expiration = options?.expirationTtl
      ? Date.now() + options.expirationTtl * 1000
      : undefined;

    this.store.set(key, { value, expiration });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  // Helper to check current state (for testing)
  _getRaw(key: string): { value: string; expiration?: number } | undefined {
    return this.store.get(key);
  }
}

describe('Rate Limiting Utility', () => {
  let mockKV: MockKVNamespace;

  beforeEach(() => {
    mockKV = new MockKVNamespace();
  });

  describe('checkRateLimit', () => {
    it('should allow first request', async () => {
      const config: RateLimitConfig = { limit: 10, window: 60 };
      const result = await checkRateLimit(mockKV as any, 'test-key', config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it('should increment counter on subsequent requests', async () => {
      const config: RateLimitConfig = { limit: 10, window: 60 };

      const result1 = await checkRateLimit(mockKV as any, 'test-key', config);
      expect(result1.remaining).toBe(9);

      const result2 = await checkRateLimit(mockKV as any, 'test-key', config);
      expect(result2.remaining).toBe(8);

      const result3 = await checkRateLimit(mockKV as any, 'test-key', config);
      expect(result3.remaining).toBe(7);
    });

    it('should deny request when limit exceeded', async () => {
      const config: RateLimitConfig = { limit: 3, window: 60 };

      // First 3 requests should be allowed
      await checkRateLimit(mockKV as any, 'test-key', config); // remaining: 2
      await checkRateLimit(mockKV as any, 'test-key', config); // remaining: 1
      await checkRateLimit(mockKV as any, 'test-key', config); // remaining: 0

      // Fourth request should be denied
      const result = await checkRateLimit(mockKV as any, 'test-key', config);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset counter when window expires', async () => {
      // Use very short window for testing
      const config: RateLimitConfig = { limit: 2, window: 1 };

      // First request
      await checkRateLimit(mockKV as any, 'test-key', config);
      // Second request should have 0 remaining
      const result2 = await checkRateLimit(mockKV as any, 'test-key', config);
      expect(result2.remaining).toBe(0);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be allowed again
      const result = await checkRateLimit(mockKV as any, 'test-key', config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should handle multiple keys independently', async () => {
      const config: RateLimitConfig = { limit: 2, window: 60 };

      // User A makes 2 requests
      await checkRateLimit(mockKV as any, 'user-a', config);
      await checkRateLimit(mockKV as any, 'user-a', config);
      const resultA = await checkRateLimit(mockKV as any, 'user-a', config);
      expect(resultA.allowed).toBe(false);

      // User B should still be allowed
      const resultB = await checkRateLimit(mockKV as any, 'user-b', config);
      expect(resultB.allowed).toBe(true);
      expect(resultB.remaining).toBe(1);
    });

    it('should fail open when KV read fails', async () => {
      const config: RateLimitConfig = { limit: 10, window: 60 };

      // Mock KV that throws on read
      const brokenKV = {
        async get() {
          throw new Error('KV read failed');
        },
      } as any;

      const result = await checkRateLimit(brokenKV, 'test-key', config);

      // Should allow request despite KV failure
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should fail open when KV write fails', async () => {
      const config: RateLimitConfig = { limit: 10, window: 60 };

      // Mock KV that throws on write
      const brokenKV = {
        async get() {
          return null;
        },
        async put() {
          throw new Error('KV write failed');
        },
      } as any;

      const result = await checkRateLimit(brokenKV, 'test-key', config);

      // Should allow request despite KV write failure
      expect(result.allowed).toBe(true);
    });
  });

  describe('createRateLimitHeaders', () => {
    it('should create standard rate limit headers', () => {
      const result = {
        allowed: true,
        remaining: 7,
        resetAt: 1234567890000,
      };

      const headers = createRateLimitHeaders(result, 10);

      expect(headers['ratelimit-limit']).toBe('10');
      expect(headers['ratelimit-remaining']).toBe('7');
      // Date is converted to ISO string format
      expect(headers['ratelimit-reset']).toBe(
        new Date(1234567890000).toISOString()
      );
    });

    it('should handle zero remaining', () => {
      const result = {
        allowed: false,
        remaining: 0,
        resetAt: 1234567890000,
      };

      const headers = createRateLimitHeaders(result, 100);

      expect(headers['ratelimit-remaining']).toBe('0');
    });
  });

  describe('createRateLimitResponse', () => {
    it('should create 429 response with error and headers', async () => {
      const result = {
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 30000, // 30 seconds from now
      };

      const response = createRateLimitResponse(result, 50);

      expect(response.status).toBe(429);

      // Check body
      const body = await response.json();
      expect(body).toHaveProperty('error', 'Too many requests');
      expect(body).toHaveProperty('retryAfter');

      // Check headers
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.has('ratelimit-limit')).toBe(true);
      expect(response.headers.has('ratelimit-remaining')).toBe(true);
      expect(response.headers.has('ratelimit-reset')).toBe(true);
      expect(response.headers.has('Retry-After')).toBe(true);
    });

    it('should use default limit of 100 if not specified', () => {
      const result = {
        allowed: false,
        remaining: 0,
        resetAt: Date.now(),
      };

      const response = createRateLimitResponse(result);

      expect(response.status).toBe(429);
      expect(response.headers.get('ratelimit-limit')).toBe('100');
    });
  });

  describe('addRateLimitHeaders', () => {
    it('should add rate limit headers to existing response', async () => {
      const result = {
        allowed: true,
        remaining: 5,
        resetAt: 1234567890000,
      };

      const response = new Response('OK', { status: 200 });
      const modifiedResponse = addRateLimitHeaders(response, result, 10);

      expect(modifiedResponse.headers.get('ratelimit-limit')).toBe('10');
      expect(modifiedResponse.headers.get('ratelimit-remaining')).toBe('5');
      expect(modifiedResponse.status).toBe(200); // Original status preserved
    });

    it('should modify response headers in place', async () => {
      const result = {
        allowed: true,
        remaining: 5,
        resetAt: 1234567890000,
      };

      const originalResponse = new Response('OK');
      const modifiedResponse = addRateLimitHeaders(
        originalResponse,
        result,
        10
      );

      // Headers should be added to the response
      expect(modifiedResponse.headers.has('ratelimit-limit')).toBe(true);

      // Note: Response.headers is mutable, so originalResponse is also modified
      expect(originalResponse.headers.has('ratelimit-limit')).toBe(true);
      // Both references point to the same Response object
      expect(modifiedResponse).toBe(originalResponse);
    });
  });

  describe('getClientIdentifier', () => {
    it('should return CF-Connecting-IP header value when present', () => {
      const request = new Request('https://example.com', {
        headers: {
          'CF-Connecting-IP': '192.168.1.1',
        },
      });

      const identifier = getClientIdentifier(request);

      expect(identifier).toBe('192.168.1.1');
    });

    it('should return anonymous when CF-Connecting-IP header is missing', () => {
      const request = new Request('https://example.com');

      const identifier = getClientIdentifier(request);

      expect(identifier).toBe('anonymous');
    });

    it('should return anonymous when header is empty string', () => {
      const request = new Request('https://example.com', {
        headers: {
          'CF-Connecting-IP': '',
        },
      });

      const identifier = getClientIdentifier(request);

      expect(identifier).toBe('anonymous');
    });
  });
});
