import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { GoogleAuthService } from './google-auth.service';

const mockOAuthClient = {
  new: jest.fn(),
  getToken: jest.fn(),
};

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn((...opts) => {
    mockOAuthClient.new(...opts);

    return { getToken: mockOAuthClient.getToken };
  }),
}));

describe('GoogleAuthService', () => {
  let service: GoogleAuthService;

  const mockJwtService = { decode: jest.fn() };
  const originalEnvs = {
    GOOGLE_AUTH_CLIENT_ID: process.env.GOOGLE_AUTH_CLIENT_ID,
    GOOGLE_AUTH_CLIENT_SECRET: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    GOOGLE_AUTH_REDIRECT_URL: process.env.GOOGLE_AUTH_REDIRECT_URL,
  };

  beforeEach(async () => {
    process.env.GOOGLE_AUTH_CLIENT_ID = 'client-id';
    process.env.GOOGLE_AUTH_CLIENT_SECRET = 'client-secret';
    process.env.GOOGLE_AUTH_REDIRECT_URL = '';

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        GoogleAuthService,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get(GoogleAuthService);
  });

  afterEach(() => {
    process.env.GOOGLE_AUTH_CLIENT_ID = originalEnvs.GOOGLE_AUTH_CLIENT_ID;
    process.env.GOOGLE_AUTH_CLIENT_SECRET = originalEnvs.GOOGLE_AUTH_CLIENT_SECRET;
    process.env.GOOGLE_AUTH_REDIRECT_URL = originalEnvs.GOOGLE_AUTH_REDIRECT_URL;
  });

  describe('verify', () => {
    const code = 'code-from-google';
    const idToken = 'id-token';
    const decoded = {
      email: 'email@test.com',
      name: 'Name',
      picture: 'https://image.com/avatar.jpg',
    };

    it('verifies google code and extracts tokens', async () => {
      const origin = 'http://localhost:1000';
      mockOAuthClient.getToken.mockResolvedValue({
        tokens: { id_token: idToken },
      });

      mockJwtService.decode.mockReturnValue(decoded);

      const user = await service.verify(code, origin);

      expect(user).toStrictEqual({
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.picture,
      });

      // assert constructor args
      expect(mockOAuthClient.new).toBeCalledTimes(1);
      expect(mockOAuthClient.new).toBeCalledWith(
        'client-id',
        'client-secret',
        origin,
      );

      expect(mockOAuthClient.getToken).toBeCalledTimes(1);
      expect(mockOAuthClient.getToken).toBeCalledWith(code);

      expect(mockJwtService.decode).toBeCalledTimes(1);
      expect(mockJwtService.decode).toBeCalledWith(idToken);
    });
  });
});
