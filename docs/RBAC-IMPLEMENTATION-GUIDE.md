# Role-Based Access Control (RBAC) Implementation Guide

## Overview

BetterLB now supports Role-Based Access Control (RBAC) for admin operations. This provides fine-grained permissions for different user roles, improving security and enabling the principle of least privilege.

## User Roles

### 1. **ADMIN** (Full Access)
- All permissions granted
- Can perform any operation
- Includes: create, read, update, delete, merge, admin settings, audit logs

### 2. **EDITOR** (Read/Write Access)
- Can read and write most resources
- Cannot delete documents or persons
- Cannot merge persons
- Cannot access admin settings or audit logs
- Typical for: content editors, data entry staff

### 3. **VIEWER** (Read-Only Access)
- Can only read resources
- Cannot make any changes
- Typical for: stakeholders, auditors, reviewers

## Permission System

Permissions are organized by resource and action:

### Document Permissions
- `documents:read` - View documents
- `documents:write` - Create/edit documents
- `documents:delete` - Delete documents

### Person Permissions
- `persons:read` - View persons
- `persons:write` - Create/edit persons
- `persons:delete` - Delete persons
- `persons:merge` - Merge duplicate person records

### Session Permissions
- `sessions:read` - View legislative sessions
- `sessions:write` - Create/edit sessions

### Review Queue Permissions
- `review_queue:read` - View review queue
- `review_queue:assign` - Assign review tasks
- `review_queue:status` - Update review status

### Admin Permissions
- `reconcile` - Reconcile data conflicts
- `parse_facebook` - Parse Facebook posts
- `admin:settings` - Manage admin settings
- `admin:audit_logs` - View audit logs

## How to Use RBAC

### 1. Assign Roles to Users

When creating sessions in your auth callback, include the user's role:

```typescript
// In functions/api/admin/auth/callback.ts or auth-google/callback.ts
const sessionData = {
  user: githubUser,
  login_at: new Date().toISOString(),
  expires_at: expiresAt,
  role: UserRole.EDITOR, // or UserRole.ADMIN, UserRole.VIEWER
};

await env.WEATHER_KV.put(`session:${sessionId}`, JSON.stringify(sessionData));
```

**User Role Source**: You'll need a way to determine which role a user has. Options:
- Environment variable mapping: `ADMIN_USERS`, `EDITOR_USERS`
- Database query to user_roles table
- External API call to user management service

Example with environment variables:
```typescript
// Determine user role
let role = UserRole.VIEWER; // Default to least privilege

if (env.ADMIN_USERS?.includes(githubUser.login)) {
  role = UserRole.ADMIN;
} else if (env.EDITOR_USERS?.includes(githubUser.login)) {
  role = UserRole.EDITOR;
}
```

### 2. Protect Endpoints by Permission

Use the `requirePermission` option in `withAuth`:

```typescript
import { withAuth } from '../../../utils/admin-auth';
import { Permission } from '../../../utils/rbac';

// Document creation (requires write permission)
export const onRequestPost = withAuth(handleCreateDocument, {
  requirePermission: Permission.DOCUMENTS_WRITE,
  requireCSRF: true,
});

// Document deletion (requires delete permission - ADMIN only)
export const onRequestDelete = withAuth(handleDeleteDocument, {
  requirePermission: Permission.DOCUMENTS_DELETE,
  requireCSRF: true,
});

// Person merge (requires merge permission - ADMIN only)
export const onRequestPost = withAuth(handleMergePersons, {
  requirePermission: Permission.PERSONS_MERGE,
  requireCSRF: true,
});

// View documents (any role can read)
export const onRequestGet = withAuth(handleListDocuments);
// No permission needed - all authenticated users can read
```

### 3. Protect Endpoints by Role

Use the `requireRole` option for coarse-grained access control:

```typescript
import { withAuth } from '../../../utils/admin-auth';
import { UserRole } from '../../../utils/rbac';

// Admin settings (ADMIN only)
export const onRequestPut = withAuth(handleUpdateSettings, {
  requireRole: UserRole.ADMIN,
  requireCSRF: true,
});

// Audit logs (ADMIN only)
export const onRequestGet = withAuth(handleGetAuditLogs, {
  requireRole: UserRole.ADMIN,
});

// Document editing (ADMIN or EDITOR)
export const onRequestPost = withAuth(handleEditDocument, {
  requireRole: [UserRole.ADMIN, UserRole.EDITOR],
  requireCSRF: true,
});
```

### 4. Combined RBAC + CSRF

For state-changing operations, combine RBAC with CSRF protection:

```typescript
// Best practice: Always use both for non-GET endpoints
export const onRequestPost = withAuth(handleUpdateDocument, {
  requirePermission: Permission.DOCUMENTS_WRITE,
  requireCSRF: true,
});

export const onRequestDelete = withAuth(handleDeleteDocument, {
  requirePermission: Permission.DOCUMENTS_DELETE,
  requireRole: UserRole.ADMIN, // Double protection: permission + role
  requireCSRF: true,
});
```

## Permission Matrix

| Operation | ADMIN | EDITOR | VIEWER |
|-----------|-------|--------|--------|
| View documents/records | ✅ | ✅ | ✅ |
| Create documents | ✅ | ✅ | ❌ |
| Edit documents | ✅ | ✅ | ❌ |
| Delete documents | ✅ | ❌ | ❌ |
| View persons | ✅ | ✅ | ✅ |
| Edit persons | ✅ | ✅ | ❌ |
| Delete persons | ✅ | ❌ | ❌ |
| Merge persons | ✅ | ❌ | ❌ |
| Edit sessions | ✅ | ✅ | ❌ |
| Assign reviews | ✅ | ✅ | ❌ |
| Reconcile conflicts | ✅ | ✅ | ❌ |
| Parse Facebook posts | ✅ | ✅ | ❌ |
| Admin settings | ✅ | ❌ | ❌ |
| View audit logs | ✅ | ❌ | ❌ |

## Migration Path

### Current State (All Users = ADMIN)
All existing authorized users currently have implicit ADMIN role. The system defaults missing `role` field to `UserRole.ADMIN` for backward compatibility.

### Recommended Rollout

1. **Phase 1**: Add role field to auth callbacks
   ```typescript
   // Default all existing users to ADMIN for safety
   const role = UserRole.ADMIN;
   ```

2. **Phase 2**: Add user role mapping
   ```typescript
   // Define which users have which roles
   const ADMIN_USERS = ['admin1', 'admin2'];
   const EDITOR_USERS = ['editor1', 'editor2', 'editor3'];
   // Everyone else is VIEWER
   ```

3. **Phase 3**: Gradually add RBAC to sensitive endpoints
   - Start with delete operations (highest risk)
   - Then merge operations (irreversible)
   - Then admin settings (critical)
   - Finally, write operations (moderate risk)

4. **Phase 4**: Test with EDITOR and VIEWER accounts
   - Verify EDITORS can write but not delete
   - Verify VIEWERS can only read
   - Verify ADMINs retain full access

### Example Endpoint Updates

**Before (no RBAC):**
```typescript
export const onRequestDelete = withAuth(handleDeleteDocument, {
  requireCSRF: true,
});
```

**After (with RBAC):**
```typescript
export const onRequestDelete = withAuth(handleDeleteDocument, {
  requirePermission: Permission.DOCUMENTS_DELETE, // ADMIN only
  requireCSRF: true,
});
```

## Testing RBAC

### Test Your Role Assignments

```typescript
// Create test sessions with different roles
const adminSession = await createSessionWithRole('admin', UserRole.ADMIN);
const editorSession = await createSessionWithRole('editor', UserRole.EDITOR);
const viewerSession = await createSessionWithRole('viewer', UserRole.VIEWER);

// Test that permissions work correctly
// Admin should be able to delete
expect(await canDeleteDocument(adminSession)).toBe(true);

// Editor should NOT be able to delete
expect(await canDeleteDocument(editorSession)).toBe(false);

// Viewer should NOT be able to delete
expect(await canDeleteDocument(viewerSession)).toBe(false);
```

## Security Best Practices

1. **Principle of Least Privilege**
   - Default to VIEWER role
   - Grant EDITOR only to users who need to write
   - Grant ADMIN only to trusted administrators

2. **Defense in Depth**
   - Combine RBAC with CSRF protection
   - Use both `requirePermission` and `requireRole` for critical operations
   - Always validate on the backend (never trust frontend)

3. **Audit Trail**
   - Log all authorization failures
   - Monitor for privilege escalation attempts
   - Review role assignments regularly

4. **Role Reviews**
   - Periodically review who has which roles
   - Remove access when users change roles
   - Revoke access immediately when staff leave

## Troubleshooting

### "Insufficient permissions" Error

**Problem**: User gets 403 error
**Solution**: Check that:
1. User's session includes `role` field
2. User's role has the required permission
3. Endpoint is using correct `requirePermission` or `requireRole`

### Old Sessions Don't Have Roles

**Problem**: Sessions created before RBAC don't work
**Solution**: The system defaults missing roles to `UserRole.ADMIN` for backward compatibility. Users will need to log out and log in again to get a session with the correct role.

### All Users Have Same Access

**Problem**: RBAC isn't restricting access
**Solution**: Ensure endpoints are using `requirePermission` or `requireRole` options:
```typescript
// ❌ Wrong - no RBAC
export const onRequestDelete = withAuth(handleDelete);

// ✅ Correct - with RBAC
export const onRequestDelete = withAuth(handleDelete, {
  requirePermission: Permission.DOCUMENTS_DELETE,
});
```

## Implementation Status

✅ **Completed**:
- RBAC types and permissions defined
- Permission checking utilities implemented
- `withAuth` wrapper updated with RBAC support
- Comprehensive test coverage (66 tests passing)
- Backward compatibility maintained

🔄 **Optional / Future**:
- Add user role mapping in auth callbacks
- Apply RBAC to admin endpoints (per endpoint needs)
- Create user role management UI
- Add RBAC to audit logging

## References

- Security Audit: `docs/security-audit.md` (Issue #9)
- RBAC Implementation: `functions/utils/rbac.ts`
- Auth Middleware: `functions/utils/admin-auth.ts`
- Tests: `functions/utils/__tests__/rbac.test.ts`, `admin-auth-rbac.test.ts`
