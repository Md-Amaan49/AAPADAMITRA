const { describe, it } = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { AuthService } = require('../dist/auth/auth.service');
const { AUTH_ROLES, JWT_CONFIG } = require('../dist/auth/auth.constants');
const { JwtAuthGuard } = require('../dist/auth/guards/jwt-auth.guard');
const { RolesGuard } = require('../dist/auth/guards/roles.guard');

describe('Authentication & Identity Service Suite', () => {
  const mockPrisma = {
    checkHealth: async () => ({ status: 'disconnected', error: 'DB unauthenticated' }),
  };
  const authService = new AuthService(mockPrisma);

  describe('Citizen Registration', () => {
    it('successfully registers a new citizen account with CITIZEN role', async () => {
      const dto = {
        fullName: 'Vijay Sharma',
        email: 'vijay.sharma@example.in',
        phone: '9811122233',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      };

      const result = await authService.registerCitizen(dto);
      assert.strictEqual(result.email, 'vijay.sharma@example.in');
      assert.strictEqual(result.role, AUTH_ROLES.CITIZEN);
      assert.ok(result.userId);
    });

    it('rejects registration when password and confirmation mismatch', async () => {
      const dto = {
        fullName: 'Test User',
        email: 'mismatch@example.in',
        phone: '9811122234',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword!',
        termsAccepted: true,
      };

      await assert.rejects(
        async () => authService.registerCitizen(dto),
        /Password and confirmation password do not match/
      );
    });

    it('rejects duplicate email registration', async () => {
      const dto = {
        fullName: 'Duplicate Check',
        email: 'vijay.sharma@example.in', // Already registered above
        phone: '9811122299',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      };

      await assert.rejects(
        async () => authService.registerCitizen(dto),
        /An account with this email address already exists/
      );
    });

    it('rejects duplicate phone number registration', async () => {
      const dto = {
        fullName: 'Duplicate Phone Check',
        email: 'unique.email@example.in',
        phone: '9811122233', // Already registered
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      };

      await assert.rejects(
        async () => authService.registerCitizen(dto),
        /An account with this mobile number already exists/
      );
    });
  });

  describe('Login & Credential Verification', () => {
    it('authenticates valid operator credentials and returns access and refresh tokens', async () => {
      const loginDto = {
        email: 'operator@aapadamitra.gov.in',
        password: 'Operator@12345',
      };

      const res = await authService.login(loginDto);
      assert.ok(res.accessToken, 'Access token must be returned');
      assert.ok(res.refreshToken, 'Refresh token must be returned');
      assert.strictEqual(res.user.email, 'operator@aapadamitra.gov.in');
      assert.strictEqual(res.user.role, AUTH_ROLES.MONITORING_OPERATOR);

      // Verify token payload
      const decoded = jwt.verify(res.accessToken, JWT_CONFIG.ACCESS_SECRET);
      assert.strictEqual(decoded.email, 'operator@aapadamitra.gov.in');
      assert.strictEqual(decoded.role, AUTH_ROLES.MONITORING_OPERATOR);
    });

    it('rejects invalid password with generic error message', async () => {
      const loginDto = {
        email: 'operator@aapadamitra.gov.in',
        password: 'WrongPassword!',
      };

      await assert.rejects(
        async () => authService.login(loginDto),
        /Invalid email or password/
      );
    });

    it('rejects non-existent email with the same generic error message', async () => {
      const loginDto = {
        email: 'unknown_user_99@aapadamitra.gov.in',
        password: 'SomePassword!',
      };

      await assert.rejects(
        async () => authService.login(loginDto),
        /Invalid email or password/
      );
    });
  });

  describe('Token Refresh & Password Reset', () => {
    it('refreshes session tokens with a valid refresh token', async () => {
      const loginRes = await authService.login({
        email: 'citizen@aapadamitra.gov.in',
        password: 'Citizen@12345',
      });

      const refreshRes = await authService.refreshSession(loginRes.refreshToken);
      assert.ok(refreshRes.accessToken);
      assert.ok(refreshRes.refreshToken);
      assert.strictEqual(refreshRes.user.email, 'citizen@aapadamitra.gov.in');
    });

    it('rejects an invalid refresh token', async () => {
      await assert.rejects(
        async () => authService.refreshSession('invalid.jwt.token'),
        /Invalid or expired refresh token/
      );
    });

    it('executes forgot password and reset password workflow', async () => {
      const forgotRes = await authService.forgotPassword('citizen@aapadamitra.gov.in');
      assert.ok(forgotRes.message);
      assert.strictEqual(forgotRes.email_delivery, 'SMTP_PROVIDER_PENDING_CONFIGURATION');
      const resetToken = forgotRes.reset_token_demo;
      assert.ok(resetToken);

      const resetRes = await authService.resetPassword({
        token: resetToken,
        newPassword: 'NewCitizenPass123!',
        confirmPassword: 'NewCitizenPass123!',
      });
      assert.strictEqual(resetRes.message, 'Password has been successfully updated. You may now sign in.');

      // Verify login with new password
      const newLogin = await authService.login({
        email: 'citizen@aapadamitra.gov.in',
        password: 'NewCitizenPass123!',
      });
      assert.ok(newLogin.accessToken);
    });
  });
});

describe('RBAC & Route Protection Guards Suite', () => {
  const jwtGuard = new JwtAuthGuard();

  it('rejects requests with missing authentication token', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {}, cookies: {} }),
      }),
    };

    assert.throws(
      () => jwtGuard.canActivate(mockContext),
      /Authentication token missing/
    );
  });

  it('allows requests with valid JWT access token and populates user context', () => {
    const token = jwt.sign(
      { sub: 'usr-1', email: 'admin@gov.in', fullName: 'Collector', role: 'DISTRICT_AUTHORITY', roles: ['DISTRICT_AUTHORITY'] },
      JWT_CONFIG.ACCESS_SECRET
    );

    const reqObj = { headers: { authorization: `Bearer ${token}` } };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => reqObj,
      }),
    };

    assert.strictEqual(jwtGuard.canActivate(mockContext), true);
    assert.strictEqual(reqObj.user.email, 'admin@gov.in');
    assert.strictEqual(reqObj.user.role, 'DISTRICT_AUTHORITY');
  });

  it('enforces role restrictions via RolesGuard', () => {
    const mockReflector = {
      getAllAndOverride: (key) => ['DISTRICT_AUTHORITY'],
    };
    const rolesGuard = new RolesGuard(mockReflector);

    // Citizen attempting to access District Authority endpoint
    const citizenContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'CITIZEN', roles: ['CITIZEN'] },
        }),
      }),
      getHandler: () => {},
      getClass: () => {},
    };

    assert.throws(
      () => rolesGuard.canActivate(citizenContext),
      /lacks permission to access this resource/
    );

    // Authority accessing District Authority endpoint
    const authorityContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'DISTRICT_AUTHORITY', roles: ['DISTRICT_AUTHORITY'] },
        }),
      }),
      getHandler: () => {},
      getClass: () => {},
    };

    assert.strictEqual(rolesGuard.canActivate(authorityContext), true);
  });
});

