import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterCitizenDto } from './dto/register-citizen.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AUTH_ROLES, JWT_CONFIG } from './auth.constants';

interface InMemUser {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  passwordHash: string;
  role: string;
  roles: string[];
  accountStatus: string;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // In-memory fallback repository for dev sessions when PostgreSQL credentials are unconfigured
  private readonly inMemoryUsers: Map<string, InMemUser> = new Map();
  // Reset tokens store: token -> { email, expiresAt }
  private readonly resetTokens: Map<string, { email: string; expiresAt: number }> = new Map();

  constructor(private readonly prisma: PrismaService) {
    this.seedDevAccountsSync();
  }

  private seedDevAccountsSync() {
    const devSeeds = [
      {
        id: 'usr-admin-00000000-0000-0000-0000-000000000001',
        email: 'admin@aapadamitra.gov.in',
        phone: '9800000001',
        fullName: 'District Collector Nanded',
        role: AUTH_ROLES.DISTRICT_AUTHORITY,
        roles: [AUTH_ROLES.DISTRICT_AUTHORITY, AUTH_ROLES.ADMIN],
        password: 'Admin@12345',
      },
      {
        id: 'usr-oper-00000000-0000-0000-0000-000000000002',
        email: 'operator@aapadamitra.gov.in',
        phone: '9800000002',
        fullName: 'Vishnupuri Dam Monitoring Officer',
        role: AUTH_ROLES.MONITORING_OPERATOR,
        roles: [AUTH_ROLES.MONITORING_OPERATOR, AUTH_ROLES.CONTROL_ROOM_OPERATOR],
        password: 'Operator@12345',
      },
      {
        id: 'usr-resp-00000000-0000-0000-0000-000000000003',
        email: 'responder@aapadamitra.gov.in',
        phone: '9800000003',
        fullName: 'NDRF Field Commander 04',
        role: AUTH_ROLES.EMERGENCY_RESPONDER,
        roles: [AUTH_ROLES.EMERGENCY_RESPONDER, AUTH_ROLES.FIELD_RESPONDER],
        password: 'Responder@12345',
      },
      {
        id: 'usr-citi-00000000-0000-0000-0000-000000000004',
        email: 'citizen@aapadamitra.gov.in',
        phone: '9800000004',
        fullName: 'Pooja Deshmukh',
        role: AUTH_ROLES.CITIZEN,
        roles: [AUTH_ROLES.CITIZEN],
        password: 'Citizen@12345',
      },
    ];

    for (const seed of devSeeds) {
      const hash = bcrypt.hashSync(seed.password, JWT_CONFIG.SALT_ROUNDS);
      this.inMemoryUsers.set(seed.email.toLowerCase(), {
        id: seed.id,
        email: seed.email.toLowerCase(),
        phone: seed.phone,
        fullName: seed.fullName,
        passwordHash: hash,
        role: seed.role,
        roles: seed.roles,
        accountStatus: 'ACTIVE',
        createdAt: new Date(),
      });
    }
    this.logger.log(`Initialized ${devSeeds.length} standard role accounts in auth store.`);
  }

  /**
   * Register a new citizen account
   * STRICT: Only CITIZEN role can be created through public registration.
   */
  async registerCitizen(dto: RegisterCitizenDto): Promise<{
    message: string;
    userId: string;
    email: string;
    role: string;
    persistence_status: 'PERSISTED' | 'DATABASE_OFFLINE_DEV_MODE';
  }> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Password and confirmation password do not match.');
    }

    if (!dto.termsAccepted) {
      throw new BadRequestException('You must accept the terms of service to create an account.');
    }

    const emailKey = dto.email.toLowerCase().trim();

    // Check duplicate in memory
    if (this.inMemoryUsers.has(emailKey)) {
      throw new ConflictException('An account with this email address already exists.');
    }

    // Check duplicate phone in memory
    for (const user of this.inMemoryUsers.values()) {
      if (user.phone === dto.phone.trim()) {
        throw new ConflictException('An account with this mobile number already exists.');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, JWT_CONFIG.SALT_ROUNDS);
    let persistenceStatus: 'PERSISTED' | 'DATABASE_OFFLINE_DEV_MODE' = 'DATABASE_OFFLINE_DEV_MODE';
    let userId: string = crypto.randomUUID();

    // Attempt PostgreSQL persistence if connected
    try {
      const dbHealth = await this.prisma.checkHealth();
      if (dbHealth.status === 'connected') {
        const existing = await this.prisma.user.findFirst({
          where: { OR: [{ email: emailKey }, { phone: dto.phone.trim() }] },
        });
        if (existing) {
          throw new ConflictException('An account with this email or mobile number already exists.');
        }

        // Find or create citizen role
        let citizenRole = await this.prisma.role.findFirst({
          where: { code: AUTH_ROLES.CITIZEN },
        });

        if (!citizenRole) {
          citizenRole = await this.prisma.role.create({
            data: {
              code: AUTH_ROLES.CITIZEN,
              name: 'Citizen',
              description: 'General public citizen account with access to alerts and reporting.',
              isSystemRole: true,
            },
          });
        }

        const newUser = await this.prisma.user.create({
          data: {
            email: emailKey,
            phone: dto.phone.trim(),
            passwordHash,
            fullName: dto.fullName.trim(),
            accountStatus: 'ACTIVE',
            userRoles: {
              create: {
                roleId: citizenRole.id,
              },
            },
          },
        });

        userId = String(newUser.id);
        persistenceStatus = 'PERSISTED';
      }
    } catch (err: any) {
      if (err instanceof ConflictException) throw err;
      this.logger.debug(`Database offline or unreached during registration: ${err.message}. Stored in dev session.`);
      persistenceStatus = 'DATABASE_OFFLINE_DEV_MODE';
    }

    // Always keep in memory store for session continuity
    this.inMemoryUsers.set(emailKey, {
      id: userId,
      email: emailKey,
      phone: dto.phone.trim(),
      fullName: dto.fullName.trim(),
      passwordHash,
      role: AUTH_ROLES.CITIZEN,
      roles: [AUTH_ROLES.CITIZEN],
      accountStatus: 'ACTIVE',
      createdAt: new Date(),
    });

    return {
      message: 'Citizen account registered successfully.',
      userId,
      email: emailKey,
      role: AUTH_ROLES.CITIZEN,
      persistence_status: persistenceStatus,
    };
  }

  /**
   * Authenticate user with email and password
   */
  async login(dto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
      id: string;
      email: string;
      fullName: string;
      role: string;
      roles: string[];
    };
  }> {
    const emailKey = dto.email.toLowerCase().trim();

    let user: InMemUser | null = this.inMemoryUsers.get(emailKey) || null;

    // Check database if available
    try {
      const dbHealth = await this.prisma.checkHealth();
      if (dbHealth.status === 'connected') {
        const dbUser = await this.prisma.user.findUnique({
          where: { email: emailKey },
          include: { userRoles: { include: { role: true } } },
        });

        if (dbUser && dbUser.passwordHash) {
          const roles = dbUser.userRoles.map((ur) => ur.role.code);
          const primaryRole = roles[0] || AUTH_ROLES.CITIZEN;
          user = {
            id: dbUser.id,
            email: dbUser.email || emailKey,
            phone: dbUser.phone || '',
            fullName: dbUser.fullName,
            passwordHash: dbUser.passwordHash,
            role: primaryRole,
            roles,
            accountStatus: dbUser.accountStatus,
            createdAt: dbUser.createdAt,
          };
        }
      }
    } catch (err: any) {
      this.logger.debug(`Prisma check bypassed in login: ${err.message}`);
    }

    // Generic error: never reveal whether account exists
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.accountStatus !== 'ACTIVE') {
      throw new UnauthorizedException('Account is suspended or pending verification.');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Generate Tokens
    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      roles: user.roles,
    };

    const accessToken = jwt.sign(payload, JWT_CONFIG.ACCESS_SECRET as jwt.Secret, {
      expiresIn: JWT_CONFIG.ACCESS_EXPIRATION as any,
    });

    const refreshToken = jwt.sign(payload, JWT_CONFIG.REFRESH_SECRET as jwt.Secret, {
      expiresIn: JWT_CONFIG.REFRESH_EXPIRATION as any,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        roles: user.roles,
      },
    };
  }

  /**
   * Refresh session tokens
   */
  async refreshSession(refreshTokenStr: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: any;
  }> {
    try {
      const decoded = jwt.verify(refreshTokenStr, JWT_CONFIG.REFRESH_SECRET) as any;

      const user = await this.findUserById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User account no longer exists.');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        roles: user.roles,
      };

      const newAccessToken = jwt.sign(payload, JWT_CONFIG.ACCESS_SECRET as jwt.Secret, {
        expiresIn: JWT_CONFIG.ACCESS_EXPIRATION as any,
      });

      const newRefreshToken = jwt.sign(payload, JWT_CONFIG.REFRESH_SECRET as jwt.Secret, {
        expiresIn: JWT_CONFIG.REFRESH_EXPIRATION as any,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          roles: user.roles,
        },
      };
    } catch (err: any) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  /**
   * Get current user profile
   */
  async findUserById(id: string): Promise<InMemUser | null> {
    for (const user of this.inMemoryUsers.values()) {
      if (user.id === id) return user;
    }
    return null;
  }

  /**
   * Initiate password reset
   */
  async forgotPassword(email: string): Promise<{
    message: string;
    email_delivery: string;
    reset_token_demo?: string;
  }> {
    const emailKey = email.toLowerCase().trim();
    const user = this.inMemoryUsers.get(emailKey);

    // Generate single-use token valid for 1 hour
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000;

    if (user) {
      this.resetTokens.set(token, { email: emailKey, expiresAt });
    }

    return {
      message: 'If an account exists with this email address, password reset instructions have been issued.',
      email_delivery: 'SMTP_PROVIDER_PENDING_CONFIGURATION',
      // In development, return token for manual testing
      reset_token_demo: process.env.NODE_ENV === 'development' ? token : undefined,
    };
  }

  /**
   * Reset password with valid token
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('New password and confirmation do not match.');
    }

    const tokenEntry = this.resetTokens.get(dto.token);
    if (!tokenEntry || Date.now() > tokenEntry.expiresAt) {
      throw new BadRequestException('Password reset token is invalid or has expired.');
    }

    const user = this.inMemoryUsers.get(tokenEntry.email);
    if (user) {
      user.passwordHash = await bcrypt.hash(dto.newPassword, JWT_CONFIG.SALT_ROUNDS);
      this.resetTokens.delete(dto.token);
    }

    return { message: 'Password has been successfully updated. You may now sign in.' };
  }
}
