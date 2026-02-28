/**
 * API Integration Tests: Sessions Endpoint
 * Tests for /api/openlgu/sessions
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// Test code uses 'any' for mock data which is acceptable in test context

import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestGet } from '../sessions';
import {
  createMockEnv,
  createMockRequest,
  MockD1Database,
} from '../../test/test-utils';
import { createSampleDatabase } from '../../test/fixtures/sample-data';

describe('Sessions API - GET /api/openlgu/sessions', () => {
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

  describe('GET /api/openlgu/sessions (list)', () => {
    it('should return a list of sessions', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/sessions'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('sessions');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.sessions)).toBe(true);
      expect(data.sessions.length).toBeGreaterThan(0);
    });

    it('should include pagination metadata', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/sessions'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data.pagination).toHaveProperty('total');
      expect(data.pagination).toHaveProperty('limit');
      expect(data.pagination).toHaveProperty('offset');
      expect(data.pagination).toHaveProperty('has_more');
      expect(data.pagination.limit).toBe(1000); // default limit for sessions
      expect(data.pagination.offset).toBe(0); // default offset
    });

    it('should include basic session information', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/sessions'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      data.sessions.forEach((session: any) => {
        expect(session).toHaveProperty('id');
        expect(session).toHaveProperty('number');
        expect(session).toHaveProperty('type');
        expect(session).toHaveProperty('date');
        expect(session).toHaveProperty('present');
        expect(session).toHaveProperty('absent');
      });
    });

    it('should filter sessions by term', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/sessions?term=sb_12'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(
        data.sessions.every((session: any) => session.term_id === 'sb_12')
      ).toBe(true);
    });

    it('should filter sessions by type', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/sessions?type=Regular'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(
        data.sessions.every((session: any) => session.type === 'Regular')
      ).toBe(true);
    });

    it('should support pagination with limit and offset', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/sessions?limit=2&offset=0'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data.sessions.length).toBeLessThanOrEqual(2);
      expect(data.pagination.limit).toBe(2);
      expect(data.pagination.offset).toBe(0);
    });

    it('should include attendance data (present and absent arrays)', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/sessions'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      data.sessions.forEach((session: any) => {
        expect(Array.isArray(session.present)).toBe(true);
        expect(Array.isArray(session.absent)).toBe(true);
      });
    });

    it('should calculate present members correctly', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/sessions?term=sb_12'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      // session_1 has person_2 absent, so person_1 and person_3 should be present
      const session1 = data.sessions.find((s: any) => s.id === 'session_1');
      expect(session1).toBeDefined();
      expect(session1.absent).toContain('person_2');
      expect(session1.present).not.toContain('person_2');
    });

    it('should include term information', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/sessions'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      data.sessions.forEach((session: any) => {
        expect(session).toHaveProperty('term_id');
        expect(session).toHaveProperty('term_number');
      });
    });

    it('should handle sessions with no absences', async () => {
      // Add a session with no absences
      mockDb.setTable('sessions', [
        ...mockDb.getTable('sessions'),
        {
          id: 'session_no_absences',
          term_id: 'sb_12',
          number: 99,
          ordinal_number: '99th',
          type: 'Regular',
          date: '2024-12-01',
          description: 'Session with perfect attendance',
        },
      ]);

      const request = createMockRequest(
        'https://example.com/api/openlgu/sessions'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      const sessionWithNoAbsences = data.sessions.find(
        (s: any) => s.id === 'session_no_absences'
      );
      expect(sessionWithNoAbsences).toBeDefined();
      expect(sessionWithNoAbsences.absent).toEqual([]);
      expect(Array.isArray(sessionWithNoAbsences.present)).toBe(true);
    });

    it('should handle sessions with all members absent', async () => {
      // Add a session where everyone is absent
      mockDb.setTable('sessions', [
        ...mockDb.getTable('sessions'),
        {
          id: 'session_all_absent',
          term_id: 'sb_12',
          number: 100,
          ordinal_number: '100th',
          type: 'Regular',
          date: '2024-12-02',
          description: 'Session with no attendees',
        },
      ]);
      mockDb.setTable('session_absences', [
        ...mockDb.getTable('session_absences'),
        { session_id: 'session_all_absent', person_id: 'person_1' },
        { session_id: 'session_all_absent', person_id: 'person_2' },
        { session_id: 'session_all_absent', person_id: 'person_3' },
      ]);

      const request = createMockRequest(
        'https://example.com/api/openlgu/sessions'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      const sessionWithAllAbsent = data.sessions.find(
        (s: any) => s.id === 'session_all_absent'
      );
      expect(sessionWithAllAbsent).toBeDefined();
      expect(sessionWithAllAbsent.absent.length).toBeGreaterThan(0);
      expect(sessionWithAllAbsent.present).toEqual([]);
    });

    it('should handle batch processing for large datasets', async () => {
      // Add many sessions to test batch processing
      const manySessions = Array.from({ length: 150 }, (_, i) => ({
        id: `session_batch_${i}`,
        term_id: 'sb_12',
        number: i + 1,
        ordinal_number: `${i + 1}th`,
        type: 'Regular',
        date: `2024-${String((i % 12) + 1).padStart(2, '0')}-01`,
        description: `Batch test session ${i}`,
      }));

      mockDb.setTable('sessions', [
        ...mockDb.getTable('sessions'),
        ...manySessions,
      ]);

      const request = createMockRequest(
        'https://example.com/api/openlgu/sessions?limit=200'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessions.length).toBeGreaterThan(150);
    });

    it('should order sessions by term and date', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/sessions?term=sb_12'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      // Check that sessions are ordered by date descending
      for (let i = 1; i < data.sessions.length; i++) {
        const currentDate = new Date(data.sessions[i].date);
        const prevDate = new Date(data.sessions[i - 1].date);
        expect(currentDate <= prevDate).toBe(true);
      }
    });
  });

  describe('Rate limiting', () => {
    it('should rate limit requests per client', async () => {
      // Make multiple requests rapidly
      const requests = Array(101)
        .fill(null)
        .map(() =>
          createMockRequest('https://example.com/api/openlgu/sessions')
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
        'https://example.com/api/openlgu/sessions'
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
        'https://example.com/api/openlgu/sessions'
      );
      const response = await onRequestGet({ request, env: brokenEnv });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });

    it('should handle invalid limit parameter', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/sessions?limit=invalid'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      // Should default to 1000 on invalid input
      expect(data).toHaveProperty('sessions');
      expect(data.pagination?.limit).toBeDefined();
    });

    it('should handle invalid offset parameter', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/sessions?offset=invalid'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data).toHaveProperty('sessions');
      expect(data.pagination?.offset).toBeDefined();
    });
  });

  describe('Cache headers', () => {
    it('should include cache headers', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/sessions'
      );
      const response = await onRequestGet({ request, env: mockEnv });

      expect(response.headers).toHaveProperty('cache-control');
    });
  });
});
