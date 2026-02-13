import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasPermission, Permission } from '@app/auth';
import { Role } from '@app/data';
import { PERMISSIONS_KEY } from './require-permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (!requiredPermissions?.length) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    const role = user.role as Role;
    const hasAll = requiredPermissions.every((perm) =>
      hasPermission(role, perm)
    );
    if (!hasAll) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
