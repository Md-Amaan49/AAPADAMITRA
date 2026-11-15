import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../auth.constants';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (request.cookies?.access_token) {
      token = request.cookies.access_token;
    }

    if (!token) {
      throw new UnauthorizedException('Authentication token missing. Please sign in to access this resource.');
    }

    try {
      const decoded = jwt.verify(token, JWT_CONFIG.ACCESS_SECRET) as any;
      request.user = {
        id: decoded.sub,
        email: decoded.email,
        fullName: decoded.fullName,
        role: decoded.role,
        roles: decoded.roles || [decoded.role],
        organizationId: decoded.organizationId,
      };
      return true;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Session token has expired. Please refresh your session or sign in again.');
      }
      throw new UnauthorizedException('Invalid authentication token.');
    }
  }
}
