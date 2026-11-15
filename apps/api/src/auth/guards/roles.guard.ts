import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ROLE_HIERARCHY } from '../auth.constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || (!user.role && !user.roles)) {
      throw new ForbiddenException('Access denied: User credentials or role not established.');
    }

    const userRoles: string[] = user.roles || [user.role];

    // Check if any user role satisfies any of the required roles directly or through hierarchy
    const hasRole = userRoles.some((uRole) => {
      const allowedRoles = ROLE_HIERARCHY[uRole] || [uRole];
      return requiredRoles.some((reqRole) => allowedRoles.includes(reqRole));
    });

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: Your assigned role '${user.role}' lacks permission to access this resource. Required: [${requiredRoles.join(', ')}]`
      );
    }

    return true;
  }
}
