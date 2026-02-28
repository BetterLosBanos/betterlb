/**
 * API Integration Tests: Documents Endpoint
 * Tests for /api/openlgu/documents (list and detail)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// Test code uses 'any' for mock data which is acceptable in test context

import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestGet } from '../documents';
import {
  createMockEnv,
  createMockRequest,
  MockD1Database,
} from '../../test/test-utils';
import { createSampleDatabase } from '../../test/fixtures/sample-data';

describe('Documents API - GET /api/openlgu/documents', () => {
  let mockEnv: ReturnType<typeof createMockEnv>;
  let mockDb: MockD1Database;

  beforeEach(() => {
    const sampleData = createSampleDatabase();
    mockEnv = createMockEnv();
    mockDb = mockEnv.BETTERLB_DB as MockD1Database;

    // Populate database with sample data
    Object.entries(sampleData).forEach(([table, rows]) => {
      mockDb.setTable(table, rows);
    });
  });

  describe('GET /api/openlgu/documents (list)', () => {
    it('should return a list of documents', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('documents');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.documents)).toBe(true);
      expect(data.documents.length).toBeGreaterThan(0);
    });

    it('should include pagination metadata', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data.pagination).toHaveProperty('total');
      expect(data.pagination).toHaveProperty('limit');
      expect(data.pagination).toHaveProperty('offset');
      expect(data.pagination).toHaveProperty('has_more');
      expect(data.pagination.limit).toBe(100); // default limit
      expect(data.pagination.offset).toBe(0); // default offset
    });

    it('should filter documents by type', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents?type=ordinance'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data.documents.every((doc: any) => doc.type === 'ordinance')).toBe(
        true
      );
    });

    it('should filter documents by term', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents?term=sb_12'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data.documents.every((doc: any) => doc.term_id === 'sb_12')).toBe(
        true
      );
    });

    it('should filter documents by session_id', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents?session_id=session_1'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(
        data.documents.every((doc: any) => doc.session_id === 'session_1')
      ).toBe(true);
    });

    it('should search documents by title', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents?q=Environmental'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data.documents.length).toBeGreaterThan(0);
      expect(
        data.documents.some((doc: any) =>
          doc.title.toLowerCase().includes('environmental')
        )
      ).toBe(true);
    });

    it('should return 400 for query exceeding max length', async () => {
      const longQuery = 'a'.repeat(101);
      const request = createMockRequest(
        `https://example.com/api/openlgu/documents?q=${longQuery}`
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('too long');
    });

    it('should filter documents by needs_review flag', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents?needs_review=1'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data.documents.every((doc: any) => doc.needs_review === 1)).toBe(
        true
      );
    });

    it('should support pagination with limit and offset', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents?limit=1&offset=0'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data.documents.length).toBeLessThanOrEqual(1);
      expect(data.pagination.limit).toBe(1);
      expect(data.pagination.offset).toBe(0);
    });

    it('should include author_ids for each document', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      data.documents.forEach((doc: any) => {
        expect(doc).toHaveProperty('author_ids');
        expect(Array.isArray(doc.author_ids)).toBe(true);
      });
    });

    it('should include session information for documents', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      data.documents.forEach((doc: any) => {
        if (doc.session_id) {
          expect(doc).toHaveProperty('session');
          expect(doc.session).toHaveProperty('id');
          expect(doc.session).toHaveProperty('number');
          expect(doc.session).toHaveProperty('date');
        }
      });
    });

    it('should sanitize SQL injection attempts in search query', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents?q=%25OR%201=1'
      );
      const response = await onRequestGet({ request, env: mockEnv });

      // Should not throw an error, should sanitize properly
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('GET /api/openlgu/documents/:id (detail)', () => {
    it('should return a single document with full details', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents/doc_1'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('id', 'doc_1');
      expect(data).toHaveProperty('title');
      expect(data).toHaveProperty('type');
      expect(data).toHaveProperty('number');
      expect(data).toHaveProperty('authors');
      expect(data).toHaveProperty('session');
    });

    it('should include authors array', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents/doc_1'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data).toHaveProperty('authors');
      expect(Array.isArray(data.authors)).toBe(true);

      if (data.authors.length > 0) {
        expect(data.authors[0]).toHaveProperty('id');
        expect(data.authors[0]).toHaveProperty('first_name');
        expect(data.authors[0]).toHaveProperty('last_name');
      }
    });

    it('should include subjects array (even if empty)', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents/doc_1'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data).toHaveProperty('subjects');
      expect(Array.isArray(data.subjects)).toBe(true);
    });

    it('should return 404 for non-existent document', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents/nonexistent'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('not found');
    });

    it('should include session details with term information', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents/doc_1'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      if (data.session) {
        expect(data.session).toHaveProperty('term_id');
        expect(data.session).toHaveProperty('ordinal_number');
      }
    });

    it('should include document metadata', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents/doc_1'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data).toHaveProperty('created_at');
      expect(data).toHaveProperty('updated_at');
      expect(data).toHaveProperty('source_type');
      expect(data).toHaveProperty('needs_review');
      expect(data).toHaveProperty('processed');
    });
  });

  describe('Rate limiting', () => {
    it('should rate limit requests per client', async () => {
      // Make multiple requests rapidly
      const requests = Array(101)
        .fill(null)
        .map(() =>
          createMockRequest('https://example.com/api/openlgu/documents')
        );

      const responses = await Promise.all(
        requests.map(req => onRequestGet({ request: req, env: mockEnv }))
      );

      // At least one should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should include rate limit headers', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents'
      );
      const response = await onRequestGet({ request, env: mockEnv });

      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Create a mock environment with a broken database
      const brokenEnv = createMockEnv();
      (brokenEnv.BETTERLB_DB as any).prepare = () => {
        throw new Error('Database connection failed');
      };

      const request = createMockRequest(
        'https://example.com/api/openlgu/documents'
      );
      const response = await onRequestGet({ request, env: brokenEnv });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });

    it('should handle invalid limit parameter', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents?limit=invalid'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      // Should default to 100 on invalid input
      expect(data).toHaveProperty('documents');
      expect(data.pagination?.limit).toBeDefined();
    });

    it('should handle invalid offset parameter', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents?offset=invalid'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data).toHaveProperty('documents');
      expect(data.pagination?.offset).toBeDefined();
    });
  });

  describe('Cache headers', () => {
    it('should include cache headers', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/documents'
      );
      const response = await onRequestGet({ request, env: mockEnv });

      expect(response.headers).toHaveProperty('cache-control');
    });
  });
});
