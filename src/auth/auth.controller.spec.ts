import { Test, TestingModule } from '@nestjs/testing';
import { AuthUserData } from '@/auth/auth.interface';
import { ForbiddenException } from '@/core/exceptions';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { GoogleAuthService } from './google-auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    refresh: jest.fn(),
    sign: jest.fn(),
  };
  const mockGoogleAuthService = { verify: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: GoogleAuthService, useValue: mockGoogleAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('google auth verify', () => {
    const tokens = {
      access: 'access-token',
      expiration: (new Date()).getTime() + 10,
      refresh: 'refresh-token',
    };
    const headers = {
      origin: 'http://localhost:1000',
    };

    it('verifies google code', async () => {
      const code = 'a-code-from-google';
      const data = <AuthDto>{ email: 'email@test.com' };

      mockAuthService.login.mockResolvedValue(tokens);
      mockGoogleAuthService.verify.mockResolvedValue(data);

      const response = await controller.googleAuthVerify({ code }, headers);

      expect(response).toEqual(tokens);
      expect(mockGoogleAuthService.verify).toHaveBeenCalledExactlyOnceWith(code, headers.origin);
      expect(mockAuthService.login).toHaveBeenCalledExactlyOnceWith(data);
    });
  });

  describe('saml()', () => {
    it('defines the saml method with guard', () => {
      expect(controller.samlLogin).toBeDefined();
    });
  });

  describe('samlAssertionConsumer()', () => {
    const user = <AuthDto>{ email: 'email@test.com' };
    const response = { redirect: jest.fn() };

    it('returns the auth user if body has relay state', async () => {
      const data = await controller.samlAssertionConsumer(user, {}, response);

      expect(response.redirect).not.toBeCalled();
      expect(mockAuthService.login).not.toBeCalled();
      expect(mockAuthService.sign).not.toBeCalled();
      expect(data).toStrictEqual(user);
    });

    it('redirects to relay state if provided with only the refresh token', async () => {
      const refresh = 'refresh-token';
      const tokens = {
        access: 'access-token',
        expiration: 1000,
        refresh,
      };
      const hashedTokens = 'hashed-tokens';

      mockAuthService.login.mockResolvedValue(tokens);
      mockAuthService.sign.mockReturnValue(hashedTokens);

      const body = { RelayState: '/redirect-url' };
      const data = await controller.samlAssertionConsumer(user, body, response);

      expect(mockAuthService.login).toHaveBeenCalledExactlyOnceWith(user);
      expect(mockAuthService.sign).toHaveBeenCalledExactlyOnceWith({ refresh });
      expect(response.redirect).toHaveBeenCalledExactlyOnceWith(
        `${body.RelayState}?tokens=${hashedTokens}`,
      );

      expect(data).toBeUndefined();
    });
  });

  describe('me(user)', () => {
    it('returns the current user', async () => {
      const data = <AuthUserData> {
        id: 'uuid',
        name: 'John D',
        email: 'john@test.com',
        avatar: '',
        role: null,
        permissions: [],
      };

      const user = await controller.me(data);

      expect(user).toStrictEqual(data);
    });
  });

  describe('refresh(body)', () => {
    it('throws forbidden exception if refresh returned null', async () => {
      mockAuthService.refresh.mockResolvedValue(null);

      expect.assertions(4);

      try {
        await controller.refresh({ token: 'invalid' });
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('Invalid refresh token');
        expect(error.code).toBe('refresh_token');
        expect(mockAuthService.refresh).toHaveBeenCalledExactlyOnceWith('invalid');
      }
    });

    it('returns valid fresh access token', async () => {
      const body = { token: 'valid-refresh-token' };
      const freshToken = {
        access: 'fresh-access-token',
        expiration: (new Date()).getTime() + 10,
      };

      mockAuthService.refresh.mockResolvedValue(freshToken);

      const data = await controller.refresh(body);

      expect(data).toStrictEqual(freshToken);
      expect(mockAuthService.refresh).toHaveBeenCalledExactlyOnceWith(body.token);
    });
  });
});
