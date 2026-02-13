import { hasPermission, PERMISSIONS } from './permissions';
import { Role } from '@app/data';

describe('hasPermission', () => {
  it('Owner has all task and audit permissions', () => {
    expect(hasPermission(Role.Owner, PERMISSIONS.TASK_CREATE)).toBe(true);
    expect(hasPermission(Role.Owner, PERMISSIONS.TASK_READ)).toBe(true);
    expect(hasPermission(Role.Owner, PERMISSIONS.TASK_UPDATE)).toBe(true);
    expect(hasPermission(Role.Owner, PERMISSIONS.TASK_DELETE)).toBe(true);
    expect(hasPermission(Role.Owner, PERMISSIONS.AUDIT_READ)).toBe(true);
  });

  it('Admin has all task and audit permissions', () => {
    expect(hasPermission(Role.Admin, PERMISSIONS.TASK_CREATE)).toBe(true);
    expect(hasPermission(Role.Admin, PERMISSIONS.AUDIT_READ)).toBe(true);
  });

  it('Viewer has only TASK_READ', () => {
    expect(hasPermission(Role.Viewer, PERMISSIONS.TASK_READ)).toBe(true);
    expect(hasPermission(Role.Viewer, PERMISSIONS.TASK_CREATE)).toBe(false);
    expect(hasPermission(Role.Viewer, PERMISSIONS.TASK_UPDATE)).toBe(false);
    expect(hasPermission(Role.Viewer, PERMISSIONS.TASK_DELETE)).toBe(false);
    expect(hasPermission(Role.Viewer, PERMISSIONS.AUDIT_READ)).toBe(false);
  });
});
