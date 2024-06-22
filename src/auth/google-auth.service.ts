import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import googleConfig from '@/configs/google.config';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class GoogleAuthService {
  /**
   * @type {{ clientId: string; clientSecret: string; redirectUrl: string; }}
   */
  private config: { clientId: string; clientSecret: string; redirectUrl: string; };

  /**
   * Creates an instance of GoogleAuthService.
   *
   * @param {JwtService} jwtService
   */
  constructor(private readonly jwtService: JwtService) {
    this.config = googleConfig().auth;
  }

  /**
   * Call the auth client to verify the auth code.
   *
   * @param {string} code
   * @param {string} origin
   *
   * @return {Promise<AuthDto>}
   */
  async verify(code: string, origin: string): Promise<AuthDto> {
    const client = this.getOAuthClient(origin);
    const result = await client.getToken(code);

    const decoded = <any> this.jwtService.decode(result.tokens.id_token);

    return <AuthDto>{
      email: decoded.email,
      name: decoded.name,
      avatar: decoded.picture,
    };
  }

  /**
   * Get an instance of OAuth2 client with custom
   * redirect url depending on the origin.
   *
   * @private
   * @param {string} origin
   *
   * @return {OAuth2Client}
   */
  private getOAuthClient(origin: string): OAuth2Client {
    const { redirectUrl } = this.config;

    return new OAuth2Client(
      this.config.clientId,
      this.config.clientSecret,
      redirectUrl ? `${origin}/${redirectUrl}` : origin,
    );
  }
}
