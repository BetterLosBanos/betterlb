/**
 * API Integration Tests: Committees Endpoint
 * Tests for /api/openlgu/committees
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// Test code uses 'any' for mock data which is acceptable in test context

import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestGet } from '../committees';
import {
  createMockEnv,
  createMockRequest,
  MockD1Database,
} from '../../../test/test-utils';
import { createSampleDatabase } from '../../../test/fixtures/sample-data';
import type { CommitteeResponse } from '../../../test/test-types';

describe('Committees API - GET /api/openlgu/committees', () => {
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

  describe('GET /api/openlgu/committees (list)', () => {
    it('should return a list of committees', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/committees'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('committees');
      expect(Array.isArray(data.committees)).toBe(true);
      expect(data.committees.length).toBeGreaterThan(0);
    });

    it('should include basic committee information', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/committees'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      data.committees.forEach(
        (committee: CommitteeResponse['committees'][number]) => {
          expect(committee).toHaveProperty('id');
          expect(committee).toHaveProperty('name');
          expect(committee).toHaveProperty('type');
          expect(committee).toHaveProperty('members');
        }
      );
    });

    it('should include members array for each committee', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/committees'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      data.committees.forEach(
        (committee: CommitteeResponse['committees'][number]) => {
          expect(Array.isArray(committee.members)).toBe(true);

          committee.members.forEach((member: any) => {
            expect(member).toHaveProperty('id');
            expect(member).toHaveProperty('first_name');
            expect(member).toHaveProperty('last_name');
            expect(member).toHaveProperty('term_id');
            expect(member).toHaveProperty('role');
          });
        }
      );
    });

    it('should filter committees by term', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/committees?term=sb_12'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      // Should return committees that have members in sb_12
      expect(data.committees.length).toBeGreaterThan(0);

      // All members should be from sb_12
      data.committees.forEach(
        (committee: CommitteeResponse['committees'][number]) => {
          committee.members.forEach((member: any) => {
            expect(member.term_id).toBe('sb_12');
          });
        }
      );
    });

    it('should order committees by name', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/committees'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      for (let i = 1; i < data.committees.length; i++) {
        const currentName = data.committees[i].name;
        const prevName = data.committees[i - 1].name;
        expect(currentName >= prevName).toBe(true);
      }
    });

    it('should order members by last name within committees', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/committees?term=sb_12'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      data.committees.forEach(
        (committee: CommitteeResponse['committees'][number]) => {
          if (committee.members.length > 1) {
            for (let i = 1; i < committee.members.length; i++) {
              const currentLastName = committee.members[i].last_name;
              const prevLastName = committee.members[i - 1].last_name;
              expect(currentLastName >= prevLastName).toBe(true);
            }
          }
        }
      );
    });

    it('should handle committees with no members', async () => {
      // Add a committee with no members
      mockDb.setTable('committees', [
        ...mockDb.getTable('committees'),
        {
          id: 'committee_empty',
          name: 'Empty Committee',
          type: 'special',
        },
      ]);

      const request = createMockRequest(
        'https://example.com/api/openlgu/committees'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      const emptyCommittee = data.committees.find(
        (c: any) => c.id === 'committee_empty'
      );
      expect(emptyCommittee).toBeDefined();
      expect(emptyCommittee.members).toEqual([]);
    });

    it('should handle term with no committees gracefully', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/committees?term=nonexistent_term'
      );
      const response = await onRequestGet({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.committees).toEqual([]);
    });
  });

  describe('Cache headers', () => {
    it('should include cache headers', async () => {
      const request = createMockRequest(
        'https://example.com/api/openlgu/committees'
      );
      const response = await onRequestGet({ request, env: mockEnv });

      expect(response.headers.has('cache-control')).toBe(true);
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
        'https://example.com/api/openlgu/committees'
      );
      const response = await onRequestGet({ request, env: brokenEnv });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });
});
