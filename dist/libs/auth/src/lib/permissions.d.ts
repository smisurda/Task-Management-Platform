import { Role } from './role';
export declare const PERMISSIONS: {
    readonly TASK_CREATE: "task:create";
    readonly TASK_READ: "task:read";
    readonly TASK_UPDATE: "task:update";
    readonly TASK_DELETE: "task:delete";
    readonly AUDIT_READ: "audit:read";
};
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
/**
 * Returns whether the given role has the specified permission.
 */
export declare function hasPermission(role: Role, permission: Permission): boolean;
/**
 * Roles that can access the audit log (Owner and Admin only).
 */
export declare const AUDIT_READ_ROLES: Role[];
/**
 * Roles that can create/update/delete tasks.
 */
export declare const TASK_WRITE_ROLES: Role[];
//# sourceMappingURL=permissions.d.ts.map