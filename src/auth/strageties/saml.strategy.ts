import { Strategy, Profile } from 'passport-saml';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import ssoConfig from '@/configs/sso.config';
import { AuthDto } from '../dto/auth.dto';

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  /**
   * Creates an instance of SamlStrategy.
   */
  constructor() {
    const config = ssoConfig();

    super({
      issuer: config.issuer,
      callbackUrl: config.callbackUrl,
      cert: config.cert,
      entryPoint: config.entryPoint,
      forceAuthn: true,
      wantAssertionsSigned: true,
    });
  }

  /**
   * Validate SAML implementation and
   * eturn the available user data.
   *
   * @param {Profile} profile
   *
   * @return {Promise<AuthDto>}
   */
  async validate(profile: Profile): Promise<AuthDto> {
    return <AuthDto>{
      name: `${profile.firstName} ${profile.lastName}`,
      email: profile.email,
    };
  }
}
