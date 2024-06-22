import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '../../core/exceptions/unauthorized-exception';
import { AuthUserData } from '../auth.interface';
import { AuthService } from '../auth.service';
import { ErrorCode } from '../auth.constant';

type Request = {
  headers: Record<string, string | string[]>
  authToken: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  /**
   * Creates an instance of JwtStrategy.
   *
   * @param {AuthService} auth
   * @param {ConfigService} configs
   */
  constructor(private readonly auth: AuthService, configs: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configs.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  /**
   * Validation strategy implementation.
   *
   * @param {Request} request
   * @param {*} payload
   *
   * @return {Promise<AuthUserData>}
   */
  async validate(request: Request, payload: any): Promise<AuthUserData> {
    const token = this.extractToken(request);
    const verified = await this.auth.verifyValidToken(token);

    if (!verified) {
      throw new UnauthorizedException('Invalid token', ErrorCode.AuthError);
    }

    request.authToken = token;

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      avatar: payload.avatar,
      role: payload.role,
      permissions: payload.permissions,
      isSuperAdmin: payload.isSuperAdmin,
      preferences: payload.preferences,
      adminAppUserId: payload.adminAppUserId,
    };
  }

  /**
   * Extract the auth token from the request.
   *
   * @private
   * @param {Request} request
   *
   * @return {(string | null)}
   */
  private extractToken(request: Request): string | null {
    const { authorization: auth } = request?.headers || {};

    if (!auth) {
      return null;
    }

    const [scheme, token] = (auth as string).split(' ');

    if (scheme.toLowerCase() === 'bearer') {
      return token;
    }

    return null;
  }
}
