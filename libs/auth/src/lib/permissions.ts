import { Role } from './role';

export const PERMISSIONS = {
  TASK_CREATE: 'task:create',
  TASK_READ: 'task:read',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  AUDIT_READ: 'audit:read',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [Role.Owner]: [
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.AUDIT_READ,
  ],
  [Role.Admin]: [
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.AUDIT_READ,
  ],
  [Role.Viewer]: [PERMISSIONS.TASK_READ],
};

/**
 * Returns whether the given role has the specified permission.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

/**
 * Roles that can access the audit log (Owner and Admin only).
 */
export const AUDIT_READ_ROLES: Role[] = [Role.Owner, Role.Admin];

/**
 * Roles that can create/update/delete tasks.
 */
export const TASK_WRITE_ROLES: Role[] = [Role.Owner, Role.Admin];
