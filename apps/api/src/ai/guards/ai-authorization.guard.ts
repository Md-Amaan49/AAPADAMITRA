import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const AUTHORIZED_AI_ROLES = [
  'CONTROL_ROOM_OPERATOR',
  'ALERT_APPROVER',
  'ADMIN',
  'SUPER_ADMIN',
  'DATA_SCIENTIST',
];

@Injectable()
export class AiAuthorizationGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const isDev = this.configService.get<string>('NODE_ENV', 'development') === 'development';

    // Check for authorization header or role simulation headers
    const userRole = request.headers['x-user-role'] as string;
    const userId = request.headers['x-user-id'] as string;
    const authHeader = request.headers['authorization'] as string;

    // Attach requester context for audit logging
    request.requester = {
      userId: userId || 'system-operator',
      role: userRole || (isDev ? 'CONTROL_ROOM_OPERATOR' : 'ANONYMOUS'),
    };

    if (userRole) {
      if (AUTHORIZED_AI_ROLES.includes(userRole.toUpperCase())) {
        return true;
      }
      throw new ForbiddenException(
        `Role '${userRole}' is not authorized to trigger manual AI hazard predictions. Required roles: ${AUTHORIZED_AI_ROLES.join(', ')}`
      );
    }

    // In development mode, allow operator requests with default dev context
    if (isDev) {
      return true;
    }

    // In production without valid credentials
    if (!authHeader && !userRole) {
      throw new UnauthorizedException(
        'Authentication required to execute manual AI hazard prediction.'
      );
    }

    return true;
  }
}
