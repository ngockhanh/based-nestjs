import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { Profile } from 'passport-saml';
import { SamlStrategy } from './saml.strategy';

describe('SamlStrategy', () => {
  let strategy: SamlStrategy;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [SamlStrategy],
    }).compile();

    strategy = module.get(SamlStrategy);
  });

  describe('validate', () => {
    it('validates saml authentication strategy', async () => {
      const profile = <Profile>{
        email: 'user@test.com',
        firstName: 'First',
        lastName: 'First',
        invalid: 'invalid',
      };

      const user = await strategy.validate(profile);

      expect(user).toStrictEqual({
        email: profile.email,
        name: `${profile.firstName} ${profile.lastName}`,
      });
    });
  });
});
