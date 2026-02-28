# API Integration Tests

This directory contains integration tests for the BetterLB API endpoints (Cloudflare Pages Functions).

## Overview

The API integration tests provide comprehensive coverage for the OpenLGU API endpoints, including:

- **Documents API** (`/api/openlgu/documents`) - List and detail endpoints with filtering, search, and pagination
- **Persons API** (`/api/openlgu/persons`) - List and detail endpoints with memberships and attendance statistics
- **Sessions API** (`/api/openlgu/sessions`) - List endpoint with attendance tracking
- **Committees API** (`/api/openlgu/committees`) - List endpoint with member information
- **Terms API** (`/api/openlgu/terms`) - List and detail endpoints with comprehensive statistics

## Test Structure

```
functions/
├── test/
│   ├── test-utils.ts           # Mock implementations and test utilities
│   ├── fixtures/
│   │   └── sample-data.ts      # Sample test data
│   └── README.md               # This file
└── api/
    └── openlgu/
        └── __tests__/
            ├── documents.test.ts
            ├── persons.test.ts
            ├── sessions.test.ts
            ├── committees.test.ts
            └── terms.test.ts
```

## Running Tests

### Run all API integration tests
```bash
npm test -- functions/api/openlgu/__tests__/
```

### Run a specific test file
```bash
npm test -- functions/api/openlgu/__tests__/documents.test.ts
```

### Run tests in watch mode
```bash
npm test -- --watch functions/api/openlgu/__tests__/
```

### Run tests with coverage
```bash
npm run test:coverage -- functions/api/openlgu/__tests__/
```

## Test Utilities

### MockD1Database

A mock implementation of Cloudflare D1 database for testing. Supports:

- **Data population**: Set test data with `setTable(table, rows)`
- **Query execution**: Basic SELECT with WHERE, ORDER BY, LIMIT, OFFSET
- **Batch processing**: Handles multiple queries efficiently

```typescript
import { MockD1Database, createMockEnv } from './test/test-utils';

const mockDb = new MockD1Database();
mockDb.setTable('documents', sampleDocuments);

const env = createMockEnv();
```

### MockKVNamespace

A mock implementation of Cloudflare KV for testing. Supports:

- **Get/Put/Delete**: Standard KV operations
- **TTL**: Expiration time support
- **Metadata**: Key-value metadata storage
- **List**: Prefix-based key listing

```typescript
import { createMockEnv } from './test/test-utils';

const env = createMockEnv();
await env.WEATHER_KV.put('key', 'value', { expirationTtl: 3600 });
const value = await env.WEATHER_KV.get('key', 'json');
```

### Helper Functions

- **`createMockEnv(overrides?)`**: Creates a complete mock Environment object
- **`createMockRequest(url, options?)`**: Creates a mock Request object
- **`wait(ms)`**: Promise-based delay for async operations

## Test Data

Sample test data is provided in `fixtures/sample-data.ts`:

- `sampleTerms` - Legislative terms (sb_12, sb_11)
- `samplePersons` - Council members and officials
- `sampleMemberships` - Term memberships
- `sampleSessions` - Legislative sessions
- `sampleSessionAbsences` - Attendance records
- `sampleDocuments` - Ordinances, resolutions, executive orders
- `sampleDocumentAuthors` - Document author relationships
- `sampleCommittees` - Standing and special committees
- `sampleCommitteeMemberships` - Committee assignments

### Using Sample Data

```typescript
import { createSampleDatabase } from './test/fixtures/sample-data';
import { createMockEnv, MockD1Database } from './test/test-utils';

const mockEnv = createMockEnv();
const mockDb = mockEnv.BETTERLB_DB as MockD1Database;

const sampleData = createSampleDatabase();
Object.entries(sampleData).forEach(([table, rows]) => {
  mockDb.setTable(table, rows);
});
```

## Test Coverage

### Documents API (documents.test.ts)

**List endpoint tests:**
- ✅ Returns list of documents
- ✅ Pagination metadata
- ✅ Filter by type (ordinance, resolution, executive_order)
- ✅ Filter by term
- ✅ Filter by session_id
- ✅ Search by title (with SQL injection protection)
- ✅ Filter by needs_review flag
- ✅ Custom limit and offset
- ✅ Author IDs included
- ✅ Session information included
- ✅ Rate limiting (100 req/min)
- ✅ Error handling

**Detail endpoint tests:**
- ✅ Returns single document with full details
- ✅ Includes authors array
- ✅ Includes subjects array
- ✅ Session with term information
- ✅ Document metadata
- ✅ 404 for non-existent documents
- ✅ Error handling

### Persons API (persons.test.ts)

**List endpoint tests:**
- ✅ Returns list of persons
- ✅ Pagination metadata
- ✅ Basic person information
- ✅ Filter by term
- ✅ Filter by committee
- ✅ Custom limit and offset
- ✅ Memberships with term details
- ✅ Committee memberships
- ✅ Aliases handling
- ✅ Roles array
- ✅ Rate limiting
- ✅ Error handling

**Detail endpoint tests:**
- ✅ Returns single person with full details
- ✅ Memberships with term details
- ✅ Committee memberships for each membership
- ✅ Authored documents (limited to 100)
- ✅ Attendance statistics
- ✅ Attendance rate calculation
- ✅ 404 for non-existent persons
- ✅ Handles persons with no memberships
- ✅ Handles persons with no authored documents
- ✅ Rate limiting
- ✅ Error handling

### Sessions API (sessions.test.ts)

**List endpoint tests:**
- ✅ Returns list of sessions
- ✅ Pagination metadata
- ✅ Basic session information
- ✅ Filter by term
- ✅ Filter by type (Regular, Special, Inaugural)
- ✅ Custom limit and offset
- ✅ Attendance data (present and absent arrays)
- ✅ Correct attendance calculation
- ✅ Term information included
- ✅ Handles sessions with no absences
- ✅ Handles sessions with all members absent
- ✅ Batch processing for large datasets
- ✅ Orders by term and date
- ✅ Rate limiting
- ✅ Error handling

### Committees API (committees.test.ts)

**List endpoint tests:**
- ✅ Returns list of committees
- ✅ Basic committee information
- ✅ Members array for each committee
- ✅ Filter by term
- ✅ Ordered by committee name
- ✅ Members ordered by last name
- ✅ Handles committees with no members
- ✅ Handles terms with no committees
- ✅ Error handling

### Terms API (terms.test.ts)

**List endpoint tests:**
- ✅ Returns list of terms
- ✅ Basic term information
- ✅ Executive information (mayor, vice mayor)
- ✅ Member and document counts
- ✅ Ordered by term_number descending
- ✅ Handles missing mayor/vice mayor
- ✅ Created_at timestamp
- ✅ Error handling

**Detail endpoint tests:**
- ✅ Returns single term with full details
- ✅ Executive with full details
- ✅ Persons array with memberships
- ✅ Committee memberships included
- ✅ Committees array with members
- ✅ Session statistics (total, regular, special, inaugural)
- ✅ Document statistics by type
- ✅ 404 for non-existent terms
- ✅ Handles terms with no persons
- ✅ Handles terms with no committees
- ✅ Handles terms with no sessions
- ✅ Error handling

## Key Features Tested

### Rate Limiting
- All endpoints implement rate limiting (100 requests per minute per client)
- Tests verify rate limit headers are present
- Tests verify rate limit enforcement

### Caching
- All endpoints use KV caching with appropriate TTLs
- Tests verify cache-control headers are present

### Error Handling
- Database connection failures
- Invalid query parameters
- Non-existent resources (404 responses)
- SQL injection protection

### Edge Cases
- Empty result sets
- Missing optional fields
- Large datasets (batch processing)
- Malformed input data

## Best Practices

### Writing New Tests

1. **Use descriptive test names**: "should return 404 for non-existent document"
2. **Arrange-Act-Assert pattern**: Set up data, execute action, verify results
3. **Test happy paths and edge cases**: Both success and failure scenarios
4. **Mock external dependencies**: Use provided mock implementations
5. **Keep tests independent**: Each test should work in isolation

### Test Organization

```typescript
describe('Endpoint Name', () => {
  beforeEach(() => {
    // Set up fresh test data for each test
  });

  describe('GET /endpoint (list)', () => {
    it('should return...', async () => {
      // Test implementation
    });
  });

  describe('Rate limiting', () => {
    it('should rate limit requests', async () => {
      // Test implementation
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully', async () => {
      // Test implementation
    });
  });
});
```

### Common Test Patterns

**Testing filtered queries:**
```typescript
it('should filter by field', async () => {
  const request = createMockRequest(
    'https://example.com/api/endpoint?field=value'
  );
  const response = await onRequestGet({ request, env: mockEnv });
  const data = await response.json();

  expect(data.items.every(item => item.field === 'value')).toBe(true);
});
```

**Testing pagination:**
```typescript
it('should support pagination', async () => {
  const request = createMockRequest(
    'https://example.com/api/endpoint?limit=10&offset=0'
  );
  const response = await onRequestGet({ request, env: mockEnv });
  const data = await response.json();

  expect(data.items.length).toBeLessThanOrEqual(10);
  expect(data.pagination.limit).toBe(10);
  expect(data.pagination.offset).toBe(0);
});
```

**Testing error responses:**
```typescript
it('should return 404 for non-existent resource', async () => {
  const request = createMockRequest(
    'https://example.com/api/endpoint/nonexistent'
  );
  const response = await onRequestGet({ request, env: mockEnv });
  const data = await response.json();

  expect(response.status).toBe(404);
  expect(data.error).toContain('not found');
});
```

## Limitations

The mock implementations are simplified versions of Cloudflare Workers APIs:

- **D1**: Basic SQL parsing only (no complex joins, aggregations, or subqueries)
- **KV**: In-memory storage (not persistent across tests)
- **Rate limiting**: Simplified implementation (not time-accurate)

For production-level testing, consider:
- Integration testing against local D1 database (`wrangler dev`)
- End-to-end testing with real Cloudflare Workers environment
- Load testing for rate limiting verification

## Contributing

When adding new API endpoints:

1. Create test file in `functions/api/openlgu/__tests__/`
2. Add sample data to `fixtures/sample-data.ts`
3. Implement comprehensive tests following patterns above
4. Update this README with new test coverage

When modifying existing endpoints:

1. Update tests to reflect new behavior
2. Add tests for new features
3. Ensure all existing tests still pass
4. Update test data if schema changes

## Future Improvements

- [ ] Add performance benchmarks for query optimization
- [ ] Implement test data factories for more variety
- [ ] Add visual regression tests for API response formats
- [ ] Integrate with CI/CD pipeline for automated testing
- [ ] Add contract testing for frontend-backend API agreement
- [ ] Implement stress tests for high-volume scenarios
