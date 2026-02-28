/* eslint-disable @typescript-eslint/no-explicit-any */
// Test code uses any for mock data which is acceptable in test context
/**
 * API Integration Tests: Terms Endpoint
 * Tests for /api/openlgu/terms (list and detail)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestGet } from '../terms';
import {
  createMockEnv,
  createMockRequest,
  MockD1Database,
} from '../../test/test-utils';
import { createSampleDatabase } from '../../test/fixtures/sample-data';

describe('Terms API - GET /api/openlgu/terms', () => {
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

  describe('GET /api/openlgu/terms (list)', () => {
    it('should return a list of terms', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/terms'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('terms');
      expect(Array.isArray(data.terms)).toBe(true);
      expect(data.terms.length).toBeGreaterThan(0);
    });

    it('should include basic term information', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/terms'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      data.terms.forEach((term: any) => {
        expect(term).toHaveProperty('id');
        expect(term).toHaveProperty('term_number');
        expect(term).toHaveProperty('name');
        expect(term).toHaveProperty('year_range');
        expect(term).toHaveProperty('start_date');
        expect(term).toHaveProperty('end_date');
        expect(term).toHaveProperty('ordinal');
      });
    });

    it('should include executive information', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/terms'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      data.terms.forEach((term: any) => {
        expect(term).toHaveProperty('executive');
        expect(term.executive).toHaveProperty('mayor');
        expect(term.executive).toHaveProperty('vice_mayor');
      });
    });

    it('should include member and document counts', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/terms'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      data.terms.forEach((term: any) => {
        expect(term).toHaveProperty('member_count');
        expect(term).toHaveProperty('document_count');
        expect(typeof term.member_count).toBe('number');
        expect(typeof term.document_count).toBe('number');
      });
    });

    it('should order terms by term_number descending', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/terms'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      for (let i = 1; i < data.terms.length; i++) {
        const currentTermNumber = data.terms[i].term_number;
        const prevTermNumber = data.terms[i - 1].term_number;
        expect(currentTermNumber <= prevTermNumber).toBe(true);
      }
    });

    it('should handle missing mayor/vice mayor gracefully', async () => {
      // Add a term with missing executive info
      mockDb.setTable('terms', [
        ...mockDb.getTable('terms'),
        {
          id: 'sb_no_exec',
          term_number: 0,
          ordinal: '0th',
          name: 'Term Without Executive',
          year_range: '2000-2001',
          start_date: '2000-01-01',
          end_date: '2001-12-31',
          mayor_id: null,
          vice_mayor_id: null,
        },
      ]);

      const request = createMockRequest(
        'https://example.com/api/openlgu/terms'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      const termWithoutExec = data.terms.find(
        (t: any) => t.id === 'sb_no_exec'
      );
      expect(termWithoutExec).toBeDefined();
      expect(termWithoutExec.executive.mayor).toBe('TBD');
      expect(termWithoutExec.executive.vice_mayor).toBe('TBD');
    });

    it('should include created_at timestamp', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/terms'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      data.terms.forEach((term: any) => {
        expect(term).toHaveProperty('created_at');
      });
    });
  });

  describe('GET /api/openlgu/terms/:id (detail)', () => {
    it('should return a single term with full details', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/terms/sb_12'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('id', 'sb_12');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('term_number');
      expect(data).toHaveProperty('year_range');
    });

    it('should include executive with full details', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/terms/sb_12'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data).toHaveProperty('executive');
      expect(data.executive).toHaveProperty('mayor');
      expect(data.executive).toHaveProperty('vice_mayor');
      expect(data.executive).toHaveProperty('mayor_id');
      expect(data.executive).toHaveProperty('vice_mayor_id');
    });

    it('should include persons array with memberships', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/terms/sb_12'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data).toHaveProperty('persons');
      expect(Array.isArray(data.persons)).toBe(true);

      if (data.persons.length > 0) {
        expect(data.persons[0]).toHaveProperty('id');
        expect(data.persons[0]).toHaveProperty('first_name');
        expect(data.persons[0]).toHaveProperty('last_name');
        expect(data.persons[0]).toHaveProperty('memberships');

        data.persons.forEach((person: any) => {
          person.memberships.forEach((membership: any) => {
            expect(membership).toHaveProperty('term_id');
            expect(membership).toHaveProperty('chamber');
            expect(membership).toHaveProperty('role');
            expect(membership).toHaveProperty('committees');
          });
        });
      }
    });

    it('should include committee memberships', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/terms/sb_12'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      data.persons.forEach((person: any) => {
        person.memberships.forEach((membership: any) => {
          expect(Array.isArray(membership.committees)).toBe(true);

          membership.committees.forEach((committee: any) => {
            expect(committee).toHaveProperty('id');
            expect(committee).toHaveProperty('role');
          });
        });
      });
    });

    it('should include committees array', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/terms/sb_12'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data).toHaveProperty('committees');
      expect(Array.isArray(data.committees)).toBe(true);

      if (data.committees.length > 0) {
        data.committees.forEach((committee: any) => {
          expect(committee).toHaveProperty('id');
          expect(committee).toHaveProperty('name');
          expect(committee).toHaveProperty('type');
          expect(committee).toHaveProperty('members');
        });
      }
    });

    it('should include session statistics', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/terms/sb_12'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data).toHaveProperty('statistics');
      expect(data.statistics).toHaveProperty('sessions');
      expect(data.statistics.sessions).toHaveProperty('total');
      expect(data.statistics.sessions).toHaveProperty('regular');
      expect(data.statistics.sessions).toHaveProperty('special');
      expect(data.statistics.sessions).toHaveProperty('inaugural');
    });

    it('should include document statistics', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/terms/sb_12'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data.statistics).toHaveProperty('documents');
      expect(typeof data.statistics.documents).toBe('object');
    });

    it('should return 404 for non-existent term', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/terms/nonexistent'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('not found');
    });

    it('should handle term with no persons gracefully', async () => {
      // Add a term with no memberships
      mockDb.setTable('terms', [
        ...mockDb.getTable('terms'),
        {
          id: 'sb_empty',
          term_number: 0,
          ordinal: '0th',
          name: 'Empty Term',
          year_range: '2000-2001',
          start_date: '2000-01-01',
          end_date: '2001-12-31',
          mayor_id: 'mayor_1',
          vice_mayor_id: 'vm_1',
        },
      ]);

      const request = createMockRequest(
        'https://example.com/api/openlgu/terms/sb_empty'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('persons');
      expect(data.persons).toEqual([]);
    });

    it('should handle term with no committees gracefully', async () => {
      // Add a term with no committee memberships
      mockDb.setTable('terms', [
        ...mockDb.getTable('terms'),
        {
          id: 'sb_no_committees',
          term_number: 0,
          ordinal: '0th',
          name: 'Term Without Committees',
          year_range: '2000-2001',
          start_date: '2000-01-01',
          end_date: '2001-12-31',
          mayor_id: 'mayor_1',
          vice_mayor_id: 'vm_1',
        },
      ]);
      mockDb.setTable('memberships', [
        ...mockDb.getTable('memberships'),
        {
          id: 'membership_no_comm',
          person_id: 'person_1',
          term_id: 'sb_no_committees',
          chamber: 'sangguniang_bayan',
          role: 'Councilor',
          rank: 1,
        },
      ]);

      const request = createMockRequest(
        'https://example.com/api/openlgu/terms/sb_no_committees'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('committees');
      expect(data.committees).toEqual([]);
    });

    it('should handle term with no sessions gracefully', async () => {
      // Create a new term with no sessions
      mockDb.setTable('terms', [
        ...mockDb.getTable('terms'),
        {
          id: 'sb_no_sessions',
          term_number: 13,
          ordinal: '13th',
          name: 'Future Term',
          year_range: '2025-2028',
          start_date: '2025-07-01',
          end_date: '2028-06-30',
          mayor_id: 'mayor_1',
          vice_mayor_id: 'vm_1',
        },
      ]);

      const request = createMockRequest(
        'https://example.com/api/openlgu/terms/sb_no_sessions'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.statistics.sessions.total).toBe(0);
      expect(data.statistics.sessions.regular).toBe(0);
      expect(data.statistics.sessions.special).toBe(0);
      expect(data.statistics.sessions.inaugural).toBe(0);
    });
  });

  describe('Cache headers', () => {
    it('should include cache headers for list endpoint', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/terms'
      );
      const response = await onRequestGet({ request, env: mockEnv });

      expect(response.headers).toHaveProperty('cache-control');
    });

    it('should include cache headers for detail endpoint', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/terms/sb_12'
      );
      const response = await onRequestGet({ request, env: mockEnv });

      expect(response.headers).toHaveProperty('cache-control');
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
        'https://example.com/api/openlgu/terms'
      );
      const response = await onRequestGet({ request, env: brokenEnv });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });

    it('should handle database errors in detail endpoint', async () => {
      const brokenEnv = createMockEnv();
      (brokenEnv.BETTERLB_DB as any).prepare = () => {
        throw new Error('Database connection failed');
      };

      const request = createMockRequest(
        'https://example.com/api/openlgu/terms/sb_12'
      );
      const response = await onRequestGet({ request, env: brokenEnv });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });
});
