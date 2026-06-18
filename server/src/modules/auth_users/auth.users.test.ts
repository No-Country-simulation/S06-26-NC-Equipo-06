import request from 'supertest';
import app from '../../app';
import { prisma } from '../../config/prisma';

// Mock nodemailer so we don't send real emails during testing
jest.mock('../../config/nodemailer', () => ({
  sendEmail: jest.fn().mockResolvedValue({ messageId: 'mock-message-id' }),
}));

describe('Auth Endpoints - Integration Tests', () => {
  const testEmails: string[] = [];
  const testRucs: string[] = [];

  const mainEmail = `test_${Date.now()}_main@example.com`;
  const mainRuc = `123456789${Math.floor(10 + Math.random() * 90)}`;
  const resendEmail = `test_${Date.now()}_resend@example.com`;
  const resendRuc = `123456789${Math.floor(10 + Math.random() * 90)}`;

  let loginCookies: string[] = [];

  // Register emails in the tracking list for cleanup in afterAll
  beforeAll(() => {
    testEmails.push(mainEmail, resendEmail);
    testRucs.push(mainRuc, resendRuc);
  });

  // Database cleanup after all tests run
  afterAll(async () => {
    if (testEmails.length > 0) {
      await prisma.companyProfile.deleteMany({
        where: {
          user: {
            email: { in: testEmails }
          }
        }
      });
      await prisma.passwordResetToken.deleteMany({
        where: {
          user: {
            email: { in: testEmails }
          }
        }
      });
      await prisma.session.deleteMany({
        where: {
          user: {
            email: { in: testEmails }
          }
        }
      });
      await prisma.user.deleteMany({
        where: {
          email: { in: testEmails }
        }
      });
    }
    await prisma.$disconnect();
  });

  // ==========================================
  // 1. REGISTER TESTS
  // ==========================================
  describe('POST /register', () => {
    it('should successfully register a new company user', async () => {
      const res = await request(app)
        .post('/api/v1/auth-users/register')
        .send({
          email: mainEmail,
          password: 'password123',
          ruc: mainRuc,
          companyName: 'Main Test Company'
        });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        success: true,
        message: 'Empresa registrada exitosamente, por favor verifica tu email para activar tu cuenta',
        code: 'COMPANY_REGISTRATION_COMPLETED'
      });
    });

    it('should return 409 Conflict when attempting to register an already existing email', async () => {
      const res = await request(app)
        .post('/api/v1/auth-users/register')
        .send({
          email: mainEmail,
          password: 'password123',
          ruc: `999999999${Math.floor(10 + Math.random() * 90)}`,
          companyName: 'Main Test Company Duplicate'
        });

      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        success: false,
        message: 'Email ya registrado',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    });

    it('should return 500 when body does not match validation schema (Zod error caught as internal)', async () => {
      const res = await request(app)
        .post('/api/v1/auth-users/register')
        .send({
          email: 'invalid-email-format',
          password: '123', // too short
          ruc: '123', // too short
          companyName: ''
        });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        success: false,
        message: 'Ocurrió un error interno en el servidor',
        code: 'INTERNAL_SERVER_ERROR'
      });
    });
  });

  // ==========================================
  // 2. VERIFY EMAIL TESTS
  // ==========================================
  describe('POST /verify-email/:token', () => {
    it('should return 400 for an invalid or malformed token', async () => {
      const res = await request(app)
        .post('/api/v1/auth-users/verify-email/invalid_token_format')
        .send();

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: 'Token de verificacion no valido',
        code: 'INVALID_TOKEN'
      });
    });

    it('should successfully verify email with a valid token from the database', async () => {
      // Find the token created during mainEmail registration
      const dbToken = await prisma.passwordResetToken.findFirst({
        where: {
          user: {
            email: mainEmail
          }
        }
      });

      expect(dbToken).not.toBeNull();
      const token = dbToken!.token;

      const res = await request(app)
        .post(`/api/v1/auth-users/verify-email/${token}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Email verificado exitosamente',
        code: 'EMAIL_VERIFICATION_COMPLETED'
      });

      // Verify the user is now active in the database
      const user = await prisma.user.findUnique({
        where: { email: mainEmail }
      });
      expect(user?.isActive).toBe(true);
    });

    it('should return 409 Conflict if the user is already verified', async () => {
      const dbToken = await prisma.passwordResetToken.findFirst({
        where: {
          user: {
            email: mainEmail
          }
        }
      });

      const token = dbToken!.token;

      const res = await request(app)
        .post(`/api/v1/auth-users/verify-email/${token}`)
        .send();

      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        success: false,
        message: 'El usuario ya ha sido verificado',
        code: 'EMAIL_ALREADY_VERIFIED'
      });
    });
  });

  // ==========================================
  // 3. RESEND VERIFICATION EMAIL TESTS
  // ==========================================
  describe('POST /resend-verification-email/:email', () => {
    it('should return 404 for a non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth-users/resend-verification-email/nonexistent@example.com')
        .send();

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: 'El usuario no existe',
        code: 'USER_NOT_FOUND'
      });
    });

    it('should successfully resend verification email for an unverified user', async () => {
      // 1. Register resendEmail user
      await request(app)
        .post('/api/v1/auth-users/register')
        .send({
          email: resendEmail,
          password: 'password123',
          ruc: resendRuc,
          companyName: 'Resend Test Company'
        });

      // 2. Request resend email
      const res = await request(app)
        .post(`/api/v1/auth-users/resend-verification-email/${resendEmail}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Se ha enviado un nuevo enlace de verificación de correo electrónico',
        code: 'EMAIL_VERIFICATION_RESENT'
      });
    });

    it('should return 409 Conflict if requesting resend for an already verified user', async () => {
      const res = await request(app)
        .post(`/api/v1/auth-users/resend-verification-email/${mainEmail}`)
        .send();

      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        success: false,
        message: 'El usuario ya ha sido verificado',
        code: 'EMAIL_ALREADY_VERIFIED'
      });
    });
  });

  // ==========================================
  // 4. LOGIN TESTS
  // ==========================================
  describe('POST /login', () => {
    it('should return 400 for an unactivated/unverified user', async () => {
      const res = await request(app)
        .post('/api/v1/auth-users/login')
        .send({
          email: resendEmail,
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: 'Su cuenta no esta activada',
        code: 'ACCOUNT_NOT_ACTIVE'
      });
    });

    it('should return 401 for invalid password on active user', async () => {
      const res = await request(app)
        .post('/api/v1/auth-users/login')
        .send({
          email: mainEmail,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: 'Contraseña incorrecta',
        code: 'INVALID_PASSWORD'
      });
    });

    it('should return 404 for non-existing email', async () => {
      const res = await request(app)
        .post('/api/v1/auth-users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    });

    it('should successfully log in active user and return auth cookies', async () => {
      const res = await request(app)
        .post('/api/v1/auth-users/login')
        .send({
          email: mainEmail,
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Inicio de sesión exitoso',
        code: 'LOGIN_COMPLETED'
      });

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.length).toBeGreaterThanOrEqual(2);

      // Save cookies for authentication tests below
      loginCookies = cookies;
    });
  });

  // ==========================================
  // 5. VERIFY AUTH TESTS
  // ==========================================
  describe('GET /verify-auth', () => {
    it('should return 401 if request is missing token cookie', async () => {
      const res = await request(app)
        .get('/api/v1/auth-users/verify-auth')
        .send();

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('No estás autorizado (falta token)');
    });

    it('should return 200 if valid token and refreshToken cookies are supplied', async () => {
      const res = await request(app)
        .get('/api/v1/auth-users/verify-auth')
        .set('Cookie', loginCookies)
        .send();

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Usuario autenticado',
        code: 'USER_AUTHENTICATED'
      });
    });
  });

  // ==========================================
  // 6. LOGOUT TESTS
  // ==========================================
  describe('POST /logout', () => {
    it('should return 401 if calling logout without cookies', async () => {
      const res = await request(app)
        .post('/api/v1/auth-users/logout')
        .send();

      expect(res.status).toBe(401);
    });

    it('should successfully log out and clear cookies when valid cookies are supplied', async () => {
      const res = await request(app)
        .post('/api/v1/auth-users/logout')
        .set('Cookie', loginCookies)
        .send();

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Logout exitoso',
        code: 'LOGOUT_COMPLETED'
      });

      const setCookieHeaders = res.headers['set-cookie'];
      expect(setCookieHeaders).toBeDefined();

      // Ensure the cookies are cleared
      const tokenCleared = setCookieHeaders.some((c: string) => c.includes('token=;'));
      const refreshCleared = setCookieHeaders.some((c: string) => c.includes('refreshToken=;'));
      expect(tokenCleared).toBe(true);
      expect(refreshCleared).toBe(true);
    });
  });
});

