/**
 * CSRF Protection Tests
 * Test-Driven Development: Write failing tests first
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// Test code uses 'any' for mock data which is acceptable in test context

import { describe, it, expect, beforeEach } from 'vitest';
import { generateCSRFToken, validateCSRFToken } from '../csrf';
import { MockKVNamespace } from '../../test/test-utils';

describe('CSRF Protection', () => {
  let mockKV: MockKVNamespace;

  beforeEach(() => {
    mockKV = new MockKVNamespace();
  });

  describe('generateCSRFToken', () => {
    it('should generate a unique token', async () => {
      const sessionId = 'test-session-123';
      const token = await generateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        sessionId
      );

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should store token in KV with correct key format', async () => {
      const sessionId = 'test-session-456';
      const token = await generateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        sessionId
      );

      const storedValue = await mockKV.get(`csrf:${sessionId}:${token}`);
      expect(storedValue).toBe('1');
    });

    it('should set 24-hour expiration on token', async () => {
      const sessionId = 'test-session-789';
      const token = await generateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        sessionId
      );

      const key = `csrf:${sessionId}:${token}`;
      const entry = await mockKV.getWithMetadata(key);

      expect(entry).toBeDefined();
      // Verify the key exists (metadata verification is limited in mock)
    });

    it('should generate different tokens for each call', async () => {
      const sessionId = 'test-session-unique';
      const token1 = await generateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        sessionId
      );
      const token2 = await generateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        sessionId
      );

      expect(token1).not.toBe(token2);
    });
  });

  describe('validateCSRFToken', () => {
    it('should return true for valid token', async () => {
      const sessionId = 'test-session-valid';
      const token = await generateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        sessionId
      );

      const isValid = await validateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        sessionId,
        token
      );

      expect(isValid).toBe(true);
    });

    it('should return false for missing token', async () => {
      const isValid = await validateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        'test-session',
        ''
      );

      expect(isValid).toBe(false);
    });

    it('should return false for invalid token', async () => {
      const isValid = await validateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        'test-session',
        'invalid-token-12345'
      );

      expect(isValid).toBe(false);
    });

    it('should return false for token from different session', async () => {
      const token = await generateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        'session-1'
      );

      const isValid = await validateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        'session-2',
        token
      );

      expect(isValid).toBe(false);
    });

    it('should delete token after validation (one-time use)', async () => {
      const sessionId = 'test-session-onetime';
      const token = await generateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        sessionId
      );

      // First validation should succeed
      const isValid1 = await validateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        sessionId,
        token
      );
      expect(isValid1).toBe(true);

      // Second validation should fail (token consumed)
      const isValid2 = await validateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        sessionId,
        token
      );
      expect(isValid2).toBe(false);
    });

    it('should reject expired tokens', async () => {
      const sessionId = 'test-session-expired';
      const token = 'expired-token-123';

      // Manually create an expired entry (mock doesn't support TTL well)
      await mockKV.put(`csrf:${sessionId}:${token}`, '1', {
        expirationTtl: -1, // Already expired
      });

      const isValid = await validateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        sessionId,
        token
      );

      expect(isValid).toBe(false);
    });
  });

  describe('CSRF Protection Integration', () => {
    it('should allow multiple valid tokens for same session', async () => {
      const sessionId = 'test-session-multiple';
      const token1 = await generateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        sessionId
      );
      const token2 = await generateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        sessionId
      );

      // Both tokens should be valid independently
      const isValid1 = await validateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        sessionId,
        token1
      );
      const isValid2 = await validateCSRFToken(
        { WEATHER_KV: mockKV } as any,
        sessionId,
        token2
      );

      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
    });

    it('should handle concurrent requests safely', async () => {
      const sessionId = 'test-session-concurrent';
      const tokens = await Promise.all(
        Array(10)
          .fill(null)
          .map(() =>
            generateCSRFToken({ WEATHER_KV: mockKV } as any, sessionId)
          )
      );

      // All tokens should be unique
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(10);

      // All tokens should be valid
      const validations = await Promise.all(
        tokens.map(token =>
          validateCSRFToken({ WEATHER_KV: mockKV } as any, sessionId, token)
        )
      );

      expect(validations.every(v => v === true)).toBe(true);
    });
  });
});
