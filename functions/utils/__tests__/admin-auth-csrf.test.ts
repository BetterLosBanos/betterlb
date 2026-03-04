/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Test code uses any for mock data which is acceptable in test context
// Auth parameters in test handlers are unused by design (testing middleware, not handler logic)
/**
 * Admin Auth Middleware with CSRF Protection Tests
 * Test-Driven Development: Write failing tests first
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { withAuth, AuthContext } from '../admin-auth';
import { MockKVNamespace } from '../../test/test-utils';
import { generateCSRFToken } from '../csrf';

describe('withAuth with CSRF Protection', () => {
  let mockKV: MockKVNamespace;
  let mockEnv: any;
  let validSessionId: string;
  let validCSRFToken: string;

  beforeEach(async () => {
    mockKV = new MockKVNamespace();
    mockEnv = {
      WEATHER_KV: mockKV,
      AUTHORIZED_USERS: JSON.stringify(['testuser']),
    };

    // Setup a valid session
    validSessionId = 'test-session-' + Math.random();
    const sessionData = {
      user: {
        id: 1,
        login: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        avatar_url: 'https://example.com/avatar.png',
      },
      login_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    };

    await mockKV.put(`session:${validSessionId}`, JSON.stringify(sessionData));

    // Generate a valid CSRF token
    validCSRFToken = await generateCSRFToken(mockEnv, validSessionId);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Helper function to create a Request with mocked Cookie header
   * This is needed because happy-dom doesn't support setting the Cookie header
   */
  function createMockRequestWithCookie(
    url: string,
    options: { method?: string; headers?: Record<string, string> } = {}
  ): Request {
    const request = new Request(url, { method: options.method || 'GET' });

    // Mock the get method to return the Cookie value when requested
    // Also preserve other headers
    const originalGet = request.headers.get.bind(request.headers);
    vi.spyOn(request.headers, 'get').mockImplementation((name: string) => {
      if (name === 'Cookie') {
        return options.headers?.['Cookie'] || '';
      }
      if (name === 'X-CSRF-Token') {
        return options.headers?.['X-CSRF-Token'] || '';
      }
      return originalGet(name);
    });

    return request;
  }

  describe('without CSRF requirement', () => {
    it('should allow requests without CSRF token', async () => {
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          headers: {
            Cookie: `admin_session=${validSessionId}`,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true, user: auth.user.login });
      };

      const wrappedHandler = withAuth(handler);
      const response = await wrappedHandler({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toBe('testuser');
    });

    it('should allow POST requests without CSRF token', async () => {
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          method: 'POST',
          headers: {
            Cookie: `admin_session=${validSessionId}`,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler);
      const response = await wrappedHandler({ request, env: mockEnv });

      expect(response.status).toBe(200);
    });
  });

  describe('with CSRF requirement', () => {
    it('should reject POST requests without CSRF token', async () => {
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          method: 'POST',
          headers: {
            Cookie: `admin_session=${validSessionId}`,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler, { requireCSRF: true });
      const response = await wrappedHandler({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Invalid CSRF token');
    });

    it('should accept POST requests with valid CSRF token', async () => {
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          method: 'POST',
          headers: {
            Cookie: `admin_session=${validSessionId}`,
            'X-CSRF-Token': validCSRFToken,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true, user: auth.user.login });
      };

      const wrappedHandler = withAuth(handler, { requireCSRF: true });
      const response = await wrappedHandler({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject POST requests with invalid CSRF token', async () => {
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          method: 'POST',
          headers: {
            Cookie: `admin_session=${validSessionId}`,
            'X-CSRF-Token': 'invalid-token-12345',
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler, { requireCSRF: true });
      const response = await wrappedHandler({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Invalid CSRF token');
    });

    it('should reject POST requests with consumed CSRF token', async () => {
      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler, { requireCSRF: true });

      // First request should succeed
      const request1 = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          method: 'POST',
          headers: {
            Cookie: `admin_session=${validSessionId}`,
            'X-CSRF-Token': validCSRFToken,
          },
        }
      );
      const response1 = await wrappedHandler({
        request: request1,
        env: mockEnv,
      });
      expect(response1.status).toBe(200);

      // Second request with same token should fail
      const request2 = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          method: 'POST',
          headers: {
            Cookie: `admin_session=${validSessionId}`,
            'X-CSRF-Token': validCSRFToken,
          },
        }
      );

      const response2 = await wrappedHandler({
        request: request2,
        env: mockEnv,
      });
      const data2 = await response2.json();

      expect(response2.status).toBe(403);
      expect(data2.error).toBe('Invalid CSRF token');
    });

    it('should allow GET requests without CSRF token', async () => {
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          method: 'GET',
          headers: {
            Cookie: `admin_session=${validSessionId}`,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler, { requireCSRF: true });
      const response = await wrappedHandler({ request, env: mockEnv });

      expect(response.status).toBe(200);
    });

    it('should allow HEAD requests without CSRF token', async () => {
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          method: 'HEAD',
          headers: {
            Cookie: `admin_session=${validSessionId}`,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler, { requireCSRF: true });
      const response = await wrappedHandler({ request, env: mockEnv });

      expect(response.status).toBe(200);
    });

    it('should allow OPTIONS requests without CSRF token', async () => {
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          method: 'OPTIONS',
          headers: {
            Cookie: `admin_session=${validSessionId}`,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler, { requireCSRF: true });
      const response = await wrappedHandler({ request, env: mockEnv });

      expect(response.status).toBe(200);
    });

    it('should reject PUT requests without CSRF token', async () => {
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          method: 'PUT',
          headers: {
            Cookie: `admin_session=${validSessionId}`,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler, { requireCSRF: true });
      const response = await wrappedHandler({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Invalid CSRF token');
    });

    it('should reject DELETE requests without CSRF token', async () => {
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          method: 'DELETE',
          headers: {
            Cookie: `admin_session=${validSessionId}`,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler, { requireCSRF: true });
      const response = await wrappedHandler({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Invalid CSRF token');
    });

    it('should reject PATCH requests without CSRF token', async () => {
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          method: 'PATCH',
          headers: {
            Cookie: `admin_session=${validSessionId}`,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler, { requireCSRF: true });
      const response = await wrappedHandler({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Invalid CSRF token');
    });

    it('should still validate authentication when CSRF is required', async () => {
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          method: 'POST',
          headers: {
            Cookie: 'admin_session=invalid-session',
            'X-CSRF-Token': validCSRFToken,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler, { requireCSRF: true });
      const response = await wrappedHandler({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.authenticated).toBe(false);
    });
  });
});
