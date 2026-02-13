"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TASK_WRITE_ROLES = exports.AUDIT_READ_ROLES = exports.PERMISSIONS = void 0;
exports.hasPermission = hasPermission;
const role_1 = require("./role");
exports.PERMISSIONS = {
    TASK_CREATE: 'task:create',
    TASK_READ: 'task:read',
    TASK_UPDATE: 'task:update',
    TASK_DELETE: 'task:delete',
    AUDIT_READ: 'audit:read',
};
const ROLE_PERMISSIONS = {
    [role_1.Role.Owner]: [
        exports.PERMISSIONS.TASK_CREATE,
        exports.PERMISSIONS.TASK_READ,
        exports.PERMISSIONS.TASK_UPDATE,
        exports.PERMISSIONS.TASK_DELETE,
        exports.PERMISSIONS.AUDIT_READ,
    ],
    [role_1.Role.Admin]: [
        exports.PERMISSIONS.TASK_CREATE,
        exports.PERMISSIONS.TASK_READ,
        exports.PERMISSIONS.TASK_UPDATE,
        exports.PERMISSIONS.TASK_DELETE,
        exports.PERMISSIONS.AUDIT_READ,
    ],
    [role_1.Role.Viewer]: [exports.PERMISSIONS.TASK_READ],
};
/**
 * Returns whether the given role has the specified permission.
 */
function hasPermission(role, permission) {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions ? permissions.includes(permission) : false;
}
/**
 * Roles that can access the audit log (Owner and Admin only).
 */
exports.AUDIT_READ_ROLES = [role_1.Role.Owner, role_1.Role.Admin];
/**
 * Roles that can create/update/delete tasks.
 */
exports.TASK_WRITE_ROLES = [role_1.Role.Owner, role_1.Role.Admin];
//# sourceMappingURL=permissions.js.map