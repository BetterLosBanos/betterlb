/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Test code uses any for mock data which is acceptable in test context
// Auth parameters in test handlers are unused by design (testing middleware, not handler logic)
/**
 * Admin Auth Middleware with RBAC Tests
 * Test-Driven Development: Write failing tests first
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { withAuth, AuthContext } from '../admin-auth';
import { UserRole, Permission } from '../rbac';
import { MockKVNamespace } from '../../test/test-utils';

describe('withAuth with RBAC', () => {
  let mockKV: MockKVNamespace;
  let mockEnv: any;

  beforeEach(async () => {
    mockKV = new MockKVNamespace();
    mockEnv = {
      WEATHER_KV: mockKV,
      AUTHORIZED_USERS: JSON.stringify([
        'testuser',
        'editoruser',
        'vieweruser',
      ]),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createSessionWithRole = async (login: string, role: UserRole) => {
    const sessionId = `session-${login}-${Math.random()}`;
    const sessionData = {
      user: {
        id: 1,
        login,
        name: 'Test User',
        email: 'test@example.com',
        avatar_url: 'https://example.com/avatar.png',
      },
      login_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      role, // Include role in session
    };

    await mockKV.put(`session:${sessionId}`, JSON.stringify(sessionData));
    return sessionId;
  };

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
    const originalGet = request.headers.get.bind(request.headers);
    vi.spyOn(request.headers, 'get').mockImplementation((name: string) => {
      if (name === 'Cookie') {
        return options.headers?.['Cookie'] || '';
      }
      return originalGet(name);
    });

    return request;
  }

  describe('without RBAC requirement', () => {
    it('should allow authenticated users regardless of role', async () => {
      const sessionId = await createSessionWithRole(
        'testuser',
        UserRole.VIEWER
      );
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          headers: {
            Cookie: `admin_session=${sessionId}`,
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
    });
  });

  describe('with RBAC permission requirement', () => {
    it('should allow users with required permission', async () => {
      const sessionId = await createSessionWithRole('testuser', UserRole.ADMIN);
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          method: 'POST',
          headers: {
            Cookie: `admin_session=${sessionId}`,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler, {
        requirePermission: Permission.DOCUMENTS_DELETE,
      });
      const response = await wrappedHandler({ request, env: mockEnv });

      expect(response.status).toBe(200);
    });

    it('should reject users without required permission', async () => {
      const sessionId = await createSessionWithRole(
        'vieweruser',
        UserRole.VIEWER
      );
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          method: 'POST',
          headers: {
            Cookie: `admin_session=${sessionId}`,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler, {
        requirePermission: Permission.DOCUMENTS_WRITE,
      });
      const response = await wrappedHandler({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Insufficient permissions');
    });

    it('should allow editors with write permissions', async () => {
      const sessionId = await createSessionWithRole(
        'editoruser',
        UserRole.EDITOR
      );
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          method: 'POST',
          headers: {
            Cookie: `admin_session=${sessionId}`,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler, {
        requirePermission: Permission.DOCUMENTS_WRITE,
      });
      const response = await wrappedHandler({ request, env: mockEnv });

      expect(response.status).toBe(200);
    });

    it('should reject editors for delete operations', async () => {
      const sessionId = await createSessionWithRole(
        'editoruser',
        UserRole.EDITOR
      );
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          method: 'DELETE',
          headers: {
            Cookie: `admin_session=${sessionId}`,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler, {
        requirePermission: Permission.DOCUMENTS_DELETE,
      });
      const response = await wrappedHandler({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Insufficient permissions');
    });
  });

  describe('with RBAC role requirement', () => {
    it('should allow users with required role', async () => {
      const sessionId = await createSessionWithRole('testuser', UserRole.ADMIN);
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          headers: {
            Cookie: `admin_session=${sessionId}`,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler, {
        requireRole: UserRole.ADMIN,
      });
      const response = await wrappedHandler({ request, env: mockEnv });

      expect(response.status).toBe(200);
    });

    it('should allow users with one of multiple allowed roles', async () => {
      const sessionId = await createSessionWithRole(
        'editoruser',
        UserRole.EDITOR
      );
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          headers: {
            Cookie: `admin_session=${sessionId}`,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler, {
        requireRole: [UserRole.ADMIN, UserRole.EDITOR],
      });
      const response = await wrappedHandler({ request, env: mockEnv });

      expect(response.status).toBe(200);
    });

    it('should reject users without required role', async () => {
      const sessionId = await createSessionWithRole(
        'vieweruser',
        UserRole.VIEWER
      );
      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          headers: {
            Cookie: `admin_session=${sessionId}`,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler, {
        requireRole: UserRole.ADMIN,
      });
      const response = await wrappedHandler({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Insufficient permissions');
    });
  });

  describe('backward compatibility', () => {
    it('should work with sessions that do not have role field', async () => {
      // Create session without role (backward compatibility)
      const sessionId = `session-old-${Math.random()}`;
      const sessionData = {
        user: {
          id: 1,
          login: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
          avatar_url: 'https://example.com/avatar.png',
        },
        login_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        // No role field - should default to ADMIN for backward compatibility
      };

      await mockKV.put(`session:${sessionId}`, JSON.stringify(sessionData));

      const request = createMockRequestWithCookie(
        'https://example.com/api/test',
        {
          headers: {
            Cookie: `admin_session=${sessionId}`,
          },
        }
      );

      const handler = async ({ auth }: { auth: AuthContext }) => {
        return Response.json({ success: true });
      };

      const wrappedHandler = withAuth(handler);
      const response = await wrappedHandler({ request, env: mockEnv });

      // Should work (backward compatibility - defaults to ADMIN)
      expect(response.status).toBe(200);
    });
  });
});
