import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { UnauthorizedException } from '@/core/exceptions/unauthorized-exception';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../auth.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockAuthService = { verifyValidToken: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get(JwtStrategy);
  });

  describe('validate', () => {
    const request = {
      headers: {
        authorization: 'Bearer a-token',
      },
    } as any;

    it('throws Unauthorized exception if token is invalid', async () => {
      expect.assertions(5);

      mockAuthService.verifyValidToken.mockResolvedValue(false);

      try {
        await strategy.validate(request, {});
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Invalid token');

        expect(mockAuthService.verifyValidToken).toBeCalledTimes(1);
        expect(mockAuthService.verifyValidToken).toBeCalledWith('a-token');

        expect(request).not.toHaveProperty('authToken');
      }
    });

    it('validates jwt authentication strategy', async () => {
      mockAuthService.verifyValidToken.mockResolvedValue(true);

      const payload = {
        id: 'user-hash',
        email: 'user@test.com',
        name: 'User Name',
        avatar: 'https://image.com/avatar.jpg',
        role: null,
        permissions: [],
        isSuperAdmin: false,
        preferences: { timezone: 'Asia/Singapore' },
        adminAppUserId: 404,
        invalid: 'invalid',
      };

      const user = await strategy.validate(request, payload);

      expect(request).toHaveProperty('authToken', 'a-token');
      expect(user).toStrictEqual({
        id: payload.id,
        email: payload.email,
        name: payload.name,
        avatar: payload.avatar,
        role: payload.role,
        permissions: payload.permissions,
        isSuperAdmin: payload.isSuperAdmin,
        preferences: payload.preferences,
        adminAppUserId: payload.adminAppUserId,
      });
    });
  });
});
