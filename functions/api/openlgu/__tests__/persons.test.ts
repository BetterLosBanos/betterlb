/**
 * API Integration Tests: Persons Endpoint
 * Tests for /api/openlgu/persons (list and detail)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// Test code uses 'any' for mock data which is acceptable in test context

import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestGet } from '../persons';
import {
  createMockEnv,
  createMockRequest,
  MockD1Database,
} from '../../../test/test-utils';
import { createSampleDatabase } from '../../../test/fixtures/sample-data';

describe('Persons API - GET /api/openlgu/persons', () => {
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

  describe('GET /api/openlgu/persons (list)', () => {
    it('should return a list of persons', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('persons');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.persons)).toBe(true);
      expect(data.persons.length).toBeGreaterThan(0);
    });

    it('should include pagination metadata', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons'
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

    it('should include basic person information', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      data.persons.forEach((person: any) => {
        expect(person).toHaveProperty('id');
        expect(person).toHaveProperty('first_name');
        expect(person).toHaveProperty('last_name');
        expect(person).toHaveProperty('memberships');
        expect(person).toHaveProperty('roles');
      });
    });

    it('should filter persons by term', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons?term=sb_12'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      // Should return persons who have memberships in sb_12
      expect(data.persons.length).toBeGreaterThan(0);
      data.persons.forEach((person: any) => {
        const hasTermMembership = person.memberships.some(
          (m: any) => m.term_id === 'sb_12'
        );
        expect(hasTermMembership).toBe(true);
      });
    });

    it('should filter persons by committee', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons?committee=committee_1'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      // Should return persons who are members of committee_1
      expect(data.persons.length).toBeGreaterThan(0);
    });

    it('should support pagination with limit and offset', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons?limit=2&offset=0'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data.persons.length).toBeLessThanOrEqual(2);
      expect(data.pagination.limit).toBe(2);
      expect(data.pagination.offset).toBe(0);
    });

    it('should include memberships for each person', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      data.persons.forEach((person: any) => {
        expect(Array.isArray(person.memberships)).toBe(true);

        person.memberships.forEach((membership: any) => {
          expect(membership).toHaveProperty('term_id');
          expect(membership).toHaveProperty('chamber');
          expect(membership).toHaveProperty('role');
          expect(membership).toHaveProperty('committees');
        });
      });
    });

    it('should include committee memberships in each membership', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons'
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

    it('should include term information in memberships', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      data.persons.forEach((person: any) => {
        person.memberships.forEach((membership: any) => {
          if (membership.term) {
            expect(membership.term).toHaveProperty('id');
            expect(membership.term).toHaveProperty('term_number');
            expect(membership.term).toHaveProperty('name');
            expect(membership.term).toHaveProperty('year_range');
          }
        });
      });
    });

    it('should handle aliases correctly', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      // person_1 has aliases
      const personWithAliases = data.persons.find(
        (p: any) => p.id === 'person_1'
      );
      expect(personWithAliases).toBeDefined();
      expect(personWithAliases.aliases).toBeDefined();
    });

    it('should include roles array', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      data.persons.forEach((person: any) => {
        expect(Array.isArray(person.roles)).toBe(true);
      });
    });
  });

  describe('GET /api/openlgu/persons/:id (detail)', () => {
    it('should return a single person with full details', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons/person_1'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('id', 'person_1');
      expect(data).toHaveProperty('first_name');
      expect(data).toHaveProperty('last_name');
    });

    it('should include memberships with term details', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons/person_1'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data).toHaveProperty('memberships');
      expect(Array.isArray(data.memberships)).toBe(true);

      if (data.memberships.length > 0) {
        expect(data.memberships[0]).toHaveProperty('term_id');
        expect(data.memberships[0]).toHaveProperty('chamber');
        expect(data.memberships[0]).toHaveProperty('role');
        expect(data.memberships[0]).toHaveProperty('rank');
      }
    });

    it('should include committee memberships for each membership', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons/person_1'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      data.memberships.forEach((membership: any) => {
        expect(membership).toHaveProperty('committees');
        expect(Array.isArray(membership.committees)).toBe(true);

        membership.committees.forEach((committee: any) => {
          expect(committee).toHaveProperty('id');
          expect(committee).toHaveProperty('name');
          expect(committee).toHaveProperty('type');
          expect(committee).toHaveProperty('role');
        });
      });
    });

    it('should include authored documents', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons/person_1'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data).toHaveProperty('authored_documents');
      expect(Array.isArray(data.authored_documents)).toBe(true);

      if (data.authored_documents.length > 0) {
        expect(data.authored_documents[0]).toHaveProperty('id');
        expect(data.authored_documents[0]).toHaveProperty('type');
        expect(data.authored_documents[0]).toHaveProperty('title');
        expect(data.authored_documents[0]).toHaveProperty('date_enacted');
      }
    });

    it('should limit authored documents to 100', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons/person_1'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data.authored_documents.length).toBeLessThanOrEqual(100);
    });

    it('should include attendance statistics', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons/person_1'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data).toHaveProperty('attendance_stats');
      expect(data.attendance_stats).toHaveProperty('total_sessions');
      expect(data.attendance_stats).toHaveProperty('absences');
      expect(data.attendance_stats).toHaveProperty('present');
      expect(data.attendance_stats).toHaveProperty('attendance_rate');
    });

    it('should calculate attendance rate correctly', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons/person_1'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      const { total_sessions, absences, present, attendance_rate } =
        data.attendance_stats;

      expect(present).toBe(total_sessions - absences);

      if (total_sessions > 0) {
        const expectedRate = ((present / total_sessions) * 100).toFixed(1);
        expect(attendance_rate).toBe(expectedRate);
      } else {
        expect(attendance_rate).toBeNull();
      }
    });

    it('should return 404 for non-existent person', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons/nonexistent'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('not found');
    });

    it('should handle person with no memberships gracefully', async () => {
      // Add a person with no memberships
      mockDb.setTable('persons', [
        ...mockDb.getTable('persons'),
        {
          id: 'person_no_memberships',
          first_name: 'No',
          middle_name: null,
          last_name: 'Memberships',
          suffix: null,
          aliases: null,
        },
      ]);

      const request = createMockRequest(
        'https://example.com/api/openlgu/persons/person_no_memberships'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('memberships');
      expect(data.memberships).toEqual([]);
    });

    it('should handle person with no authored documents gracefully', async () => {
      // Use person_3 who has no authored documents in sample data
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons/person_3'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('authored_documents');
      expect(data.authored_documents).toEqual([]);
    });
  });

  describe('Rate limiting', () => {
    it('should rate limit requests per client', async () => {
      // Make multiple requests rapidly
      const requests = Array(101)
        .fill(null)
        .map(() =>
          createMockRequest('https://example.com/api/openlgu/persons')
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
        'https://example.com/api/openlgu/persons'
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
        'https://example.com/api/openlgu/persons'
      );
      const response = await onRequestGet({ request, env: brokenEnv });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });

    it('should handle invalid limit parameter', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons?limit=invalid'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      // Should default to 100 on invalid input
      expect(data).toHaveProperty('persons');
      expect(data.pagination?.limit).toBeDefined();
    });

    it('should handle invalid offset parameter', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons?offset=invalid'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(data).toHaveProperty('persons');
      expect(data.pagination?.offset).toBeDefined();
    });
  });

  describe('Cache headers', () => {
    it('should include cache headers', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/persons'
      );
      const response = await onRequestGet({ request, env: mockEnv });

      expect(response.headers.has('cache-control')).toBe(true);
    });
  });
});
