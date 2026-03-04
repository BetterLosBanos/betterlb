/**
 * Role-Based Access Control (RBAC) Utilities
 * Provides role definitions and permission checking for admin operations
 */

/**
 * User roles with hierarchical permissions
 * ADMIN: Full access to all operations
 * EDITOR: Read/write access, no delete or admin operations
 * VIEWER: Read-only access
 */
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

/**
 * Permission identifiers for different operations
 * Format: resource:action (e.g., documents:read)
 */
export enum Permission {
  // Document permissions
  DOCUMENTS_READ = 'documents:read',
  DOCUMENTS_WRITE = 'documents:write',
  DOCUMENTS_DELETE = 'documents:delete',

  // Person permissions
  PERSONS_READ = 'persons:read',
  PERSONS_WRITE = 'persons:write',
  PERSONS_DELETE = 'persons:delete',
  PERSONS_MERGE = 'persons:merge',

  // Session permissions
  SESSIONS_READ = 'sessions:read',
  SESSIONS_WRITE = 'sessions:write',

  // Review queue permissions
  REVIEW_QUEUE_READ = 'review_queue:read',
  REVIEW_QUEUE_ASSIGN = 'review_queue:assign',
  REVIEW_QUEUE_STATUS = 'review_queue:status',

  // Reconciliation permissions
  RECONCILE = 'reconcile',
  PARSE_FACEBOOK = 'parse_facebook',

  // Admin permissions
  ADMIN_SETTINGS = 'admin:settings',
  ADMIN_AUDIT_LOGS = 'admin:audit_logs',
}

/**
 * Role-to-permissions mapping
 * Admins have all permissions
 * Editors have read/write but not delete or admin
 * Viewers have read-only access
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Documents
    Permission.DOCUMENTS_READ,
    Permission.DOCUMENTS_WRITE,
    Permission.DOCUMENTS_DELETE,
    // Persons
    Permission.PERSONS_READ,
    Permission.PERSONS_WRITE,
    Permission.PERSONS_DELETE,
    Permission.PERSONS_MERGE,
    // Sessions
    Permission.SESSIONS_READ,
    Permission.SESSIONS_WRITE,
    // Review queue
    Permission.REVIEW_QUEUE_READ,
    Permission.REVIEW_QUEUE_ASSIGN,
    Permission.REVIEW_QUEUE_STATUS,
    // Reconciliation
    Permission.RECONCILE,
    Permission.PARSE_FACEBOOK,
    // Admin
    Permission.ADMIN_SETTINGS,
    Permission.ADMIN_AUDIT_LOGS,
  ],
  [UserRole.EDITOR]: [
    // Documents - read and write only
    Permission.DOCUMENTS_READ,
    Permission.DOCUMENTS_WRITE,
    // Persons - read and write only
    Permission.PERSONS_READ,
    Permission.PERSONS_WRITE,
    // Sessions - read and write only
    Permission.SESSIONS_READ,
    Permission.SESSIONS_WRITE,
    // Review queue - read and assign
    Permission.REVIEW_QUEUE_READ,
    Permission.REVIEW_QUEUE_ASSIGN,
    Permission.REVIEW_QUEUE_STATUS,
    // Reconciliation - allowed
    Permission.RECONCILE,
    Permission.PARSE_FACEBOOK,
  ],
  [UserRole.VIEWER]: [
    // Read-only permissions
    Permission.DOCUMENTS_READ,
    Permission.PERSONS_READ,
    Permission.SESSIONS_READ,
    Permission.REVIEW_QUEUE_READ,
  ],
};

/**
 * Get all permissions for a given role
 *
 * @param role - User role
 * @returns Array of permissions for the role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role has a specific permission
 *
 * @param role - User role
 * @param permission - Permission to check
 * @returns true if role has the permission, false otherwise
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
}

/**
 * Require a specific role or one of multiple roles
 * Throws an error if the user doesn't have the required role
 *
 * @param userRole - Current user's role
 * @param requiredRole - Required role or array of allowed roles
 * @throws Error with message "Insufficient permissions" if role check fails
 */
export function requireRole(
  userRole: UserRole,
  requiredRole: UserRole | UserRole[]
): void {
  const allowedRoles = Array.isArray(requiredRole)
    ? requiredRole
    : [requiredRole];

  if (!allowedRoles.includes(userRole)) {
    throw new Error('Insufficient permissions');
  }
}

/**
 * Custom error class for authorization failures
 */
export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}
