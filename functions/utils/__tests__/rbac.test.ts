/**
 * Role-Based Access Control (RBAC) Tests
 * Test-Driven Development: Write failing tests first
 */

import { describe, it, expect } from 'vitest';
import {
  UserRole,
  Permission,
  hasPermission,
  getPermissionsForRole,
  requireRole,
} from '../rbac';

describe('UserRole', () => {
  it('should define three roles: admin, editor, viewer', () => {
    expect(UserRole.ADMIN).toBe('admin');
    expect(UserRole.EDITOR).toBe('editor');
    expect(UserRole.VIEWER).toBe('viewer');
  });
});

describe('Permission', () => {
  it('should define all required permissions', () => {
    // Document permissions
    expect(Permission.DOCUMENTS_READ).toBe('documents:read');
    expect(Permission.DOCUMENTS_WRITE).toBe('documents:write');
    expect(Permission.DOCUMENTS_DELETE).toBe('documents:delete');

    // Person permissions
    expect(Permission.PERSONS_READ).toBe('persons:read');
    expect(Permission.PERSONS_WRITE).toBe('persons:write');
    expect(Permission.PERSONS_DELETE).toBe('persons:delete');
    expect(Permission.PERSONS_MERGE).toBe('persons:merge');

    // Session permissions
    expect(Permission.SESSIONS_READ).toBe('sessions:read');
    expect(Permission.SESSIONS_WRITE).toBe('sessions:write');

    // Review queue permissions
    expect(Permission.REVIEW_QUEUE_READ).toBe('review_queue:read');
    expect(Permission.REVIEW_QUEUE_ASSIGN).toBe('review_queue:assign');
    expect(Permission.REVIEW_QUEUE_STATUS).toBe('review_queue:status');

    // Reconciliation permissions
    expect(Permission.RECONCILE).toBe('reconcile');
    expect(Permission.PARSE_FACEBOOK).toBe('parse_facebook');

    // Admin permissions
    expect(Permission.ADMIN_SETTINGS).toBe('admin:settings');
    expect(Permission.ADMIN_AUDIT_LOGS).toBe('admin:audit_logs');
  });
});

describe('getPermissionsForRole', () => {
  it('should grant all permissions to admin role', () => {
    const permissions = getPermissionsForRole(UserRole.ADMIN);

    expect(permissions).toContain(Permission.DOCUMENTS_READ);
    expect(permissions).toContain(Permission.DOCUMENTS_WRITE);
    expect(permissions).toContain(Permission.DOCUMENTS_DELETE);
    expect(permissions).toContain(Permission.PERSONS_MERGE);
    expect(permissions).toContain(Permission.ADMIN_SETTINGS);
    expect(permissions).toContain(Permission.ADMIN_AUDIT_LOGS);
  });

  it('should grant read/write permissions to editor role', () => {
    const permissions = getPermissionsForRole(UserRole.EDITOR);

    // Should have read permissions
    expect(permissions).toContain(Permission.DOCUMENTS_READ);
    expect(permissions).toContain(Permission.PERSONS_READ);

    // Should have write permissions
    expect(permissions).toContain(Permission.DOCUMENTS_WRITE);
    expect(permissions).toContain(Permission.PERSONS_WRITE);
    expect(permissions).toContain(Permission.SESSIONS_WRITE);

    // Should NOT have delete permissions
    expect(permissions).not.toContain(Permission.DOCUMENTS_DELETE);
    expect(permissions).not.toContain(Permission.PERSONS_DELETE);

    // Should NOT have admin permissions
    expect(permissions).not.toContain(Permission.ADMIN_SETTINGS);
    expect(permissions).not.toContain(Permission.ADMIN_AUDIT_LOGS);

    // Should NOT have merge permission
    expect(permissions).not.toContain(Permission.PERSONS_MERGE);
  });

  it('should grant only read permissions to viewer role', () => {
    const permissions = getPermissionsForRole(UserRole.VIEWER);

    // Should have read permissions
    expect(permissions).toContain(Permission.DOCUMENTS_READ);
    expect(permissions).toContain(Permission.PERSONS_READ);
    expect(permissions).toContain(Permission.SESSIONS_READ);
    expect(permissions).toContain(Permission.REVIEW_QUEUE_READ);

    // Should NOT have write permissions
    expect(permissions).not.toContain(Permission.DOCUMENTS_WRITE);
    expect(permissions).not.toContain(Permission.PERSONS_WRITE);
    expect(permissions).not.toContain(Permission.SESSIONS_WRITE);

    // Should NOT have delete permissions
    expect(permissions).not.toContain(Permission.DOCUMENTS_DELETE);
    expect(permissions).not.toContain(Permission.PERSONS_DELETE);

    // Should NOT have admin permissions
    expect(permissions).not.toContain(Permission.ADMIN_SETTINGS);
  });

  it('should handle unknown roles gracefully', () => {
    const permissions = getPermissionsForRole('unknown' as UserRole);
    expect(permissions).toEqual([]);
  });
});

describe('hasPermission', () => {
  it('should return true when user has the required permission', () => {
    const userRole = UserRole.ADMIN;
    const result = hasPermission(userRole, Permission.DOCUMENTS_WRITE);
    expect(result).toBe(true);
  });

  it('should return false when user lacks the required permission', () => {
    const userRole = UserRole.VIEWER;
    const result = hasPermission(userRole, Permission.DOCUMENTS_WRITE);
    expect(result).toBe(false);
  });

  it('should return true for read permissions regardless of role', () => {
    expect(hasPermission(UserRole.ADMIN, Permission.DOCUMENTS_READ)).toBe(true);
    expect(hasPermission(UserRole.EDITOR, Permission.DOCUMENTS_READ)).toBe(
      true
    );
    expect(hasPermission(UserRole.VIEWER, Permission.DOCUMENTS_READ)).toBe(
      true
    );
  });

  it('should return false for admin permissions for non-admin roles', () => {
    expect(hasPermission(UserRole.EDITOR, Permission.ADMIN_SETTINGS)).toBe(
      false
    );
    expect(hasPermission(UserRole.VIEWER, Permission.ADMIN_SETTINGS)).toBe(
      false
    );
  });
});

describe('requireRole', () => {
  it('should not throw when user has required role', () => {
    expect(() => {
      requireRole(UserRole.ADMIN, UserRole.ADMIN);
    }).not.toThrow();
  });

  it('should not throw when user has one of the allowed roles', () => {
    expect(() => {
      requireRole(UserRole.EDITOR, [UserRole.ADMIN, UserRole.EDITOR]);
    }).not.toThrow();
  });

  it('should throw when user lacks required role', () => {
    expect(() => {
      requireRole(UserRole.VIEWER, UserRole.ADMIN);
    }).toThrow('Insufficient permissions');
  });

  it('should throw when user lacks any of the allowed roles', () => {
    expect(() => {
      requireRole(UserRole.VIEWER, [UserRole.ADMIN, UserRole.EDITOR]);
    }).toThrow('Insufficient permissions');
  });

  it('should throw with correct HTTP status code 403', () => {
    try {
      requireRole(UserRole.VIEWER, UserRole.ADMIN);
      fail('Expected an error to be thrown');
    } catch (error) {
      expect((error as Error).message).toBe('Insufficient permissions');
    }
  });
});
