import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { User } from '@/user/user.entity';
import { BadRequestException } from '@/core/exceptions/bad-request-exception';
import { UserRepository } from '@/user/user.repository';
import { EVENTS } from '@/constants/user';
import appConfig from '@/configs/app.config';
import { TokenExpiration, tokenExpiration } from '@/configs/jwt.config';
import { AccessToken, AuthTokens } from './auth.interface';
import { AuthDto } from './dto/auth.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { InvalidTokenRepository } from './invalid-token.repository';
import { GoogleAdminService } from './google-admin.service';

@Injectable()
export class AuthService {
  /**
   * @private
   * @type {{ host: string, userGroupId: string }}
   */
  private appConfig: { host: string, userGroupId: string };

  /**
   * @private
   * @type {TokenExpiration}
   */
  private tokenExpiration: TokenExpiration;

  /**
   * Creates an instance of AuthService.
   *
   * @param {JwtService} jwtService
   * @param {UserRepository} users
   * @param {InvalidTokenRepository} invalidTokens
   * @param {GoogleAdminService} googleAdmin
   */
  constructor(
    private readonly jwtService: JwtService,
    private readonly users: UserRepository,
    private readonly invalidTokens: InvalidTokenRepository,
    private readonly googleAdmin: GoogleAdminService,
  ) {
    this.appConfig = appConfig();
    this.tokenExpiration = tokenExpiration();
  }

  /**
   * Generate a JWT token with one day
   * expiration for password reset use.
   *
   * @param {string} userId
   *
   * @return {string}
   */
  generateInviteToken(userId: string): string {
    return this.generateJwt({
      id: userId,
      event: EVENTS.INVITED,
    }, this.tokenExpiration.oneDay);
  }

  /**
   * Generate JWT.
   *
   * @param {(object | Buffer)} payload
   * @param {number} [expiration=EXPIRATION.FIVE_MINUTES]
   *
   * @return {string}
   */
  generateJwt(
    payload: object | Buffer,
    expiration: number = this.tokenExpiration.fiveMinutes,
  ): string {
    return this.sign(payload, {
      issuer: this.appConfig.host,
      audience: this.appConfig.host,
      expiresIn: expiration,
    });
  }

  /**
   * Create raw JWT.
   *
   * @param {(object | Buffer)} payload
   * @param {object} [opts={}]
   *
   * @return {string}
   */
  sign(payload: object | Buffer, opts: object = {}): string {
    return this.jwtService.sign(payload, opts);
  }

  /**
   * Attempt to login the user.
   *
   * @param {AuthDto} user
   *
   * @return {Promise<AuthTokens>}
   */
  async login(user: AuthDto): Promise<AuthTokens> {
    if (!user) {
      throw new BadRequestException('Unauthenticated', 'unauthenticated');
    }

    const record = await this.getAuthUser(user.email);

    if (record && !record.active) {
      throw new BadRequestException('Not exist', 'not_exist');
    }

    const saved = await this.saveAuthUser(user, record);

    return {
      ...this.generateAccessToken(saved),
      refresh: this.generateJwt({ id: saved.id }, this.tokenExpiration.oneDay),
    };
  }

  /**
   * Generate fresh tokens based from the refresh token.
   *
   * @param {string} token the refresh token
   *
   * @returns {Promise<AccessToken | null>}
   */
  async refresh(token: string): Promise<AccessToken | null> {
    try {
      const claims = this.jwtService.verify(token);

      if (!claims.id) {
        return null;
      }

      const user = await this.users
        .withPermissions()
        .getById(claims.id);

      if (!user || !user.active) {
        return null;
      }

      const isActiveMember = await this.googleAdmin.isActiveMember(
        user.email,
        this.appConfig.userGroupId,
      );

      if (!isActiveMember) {
        return null;
      }

      return this.generateAccessToken(user);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get an authenticating user record.
   *
   * @param {string} email
   *
   * @return {Promise<User>}
   */
  async getByEmail(email: string): Promise<User> {
    return this.users
      .withDeleted()
      .getByEmail(email);
  }

  /**
   * Invalidate tokens of the current user.
   *
   * @param {string} userId
   * @param {AuthTokens} tokens
   *
   * @returns {Promise<boolean>}
   */
  async logout(userId: string, tokens: AuthTokens): Promise<boolean> {
    try {
      const { access, refresh } = tokens;

      const accessData = this.jwtService.verify(access);
      const refreshData = this.jwtService.verify(refresh);

      if (userId !== refreshData.id) {
        return false;
      }

      await this.invalidTokens.createMany([
        {
          userId,
          value: access,
          expiration: this.expInSeconds(accessData.exp),
        },
        {
          userId,
          value: refresh,
          expiration: this.expInSeconds(refreshData.exp),
        },
      ]);

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify the token it is a valid JWT and
   * if it is not in the invalid tokens' repository.
   *
   * @param {string} token
   *
   * @returns {Promise<boolean|object>} the token data
   */
  async verifyValidToken(token: string): Promise<boolean | object> {
    const data = this.jwtService.verify(token);

    if (!data || !data.id) {
      return false;
    }

    const invalidAuthToken = await this.invalidTokens.get(data.id, token);

    if (invalidAuthToken) {
      return false;
    }

    return data;
  }

  /**
   * Generate auth tokens.
   *
   * @private
   * @param {User} user
   *
   * @returns {AccessToken}
   */
  private generateAccessToken(user: User): AccessToken {
    return {
      access: this.generateJwt((new AuthUserDto(user)).data(), this.tokenExpiration.access),
      expiration: new Date().getTime() + (this.tokenExpiration.access * 1000),
    };
  }

  /**
   * Get user with permissions.
   *
   * @private
   * @param {string} email
   * @return {Promise<User>}
   */
  private async getAuthUser(email: string): Promise<User> {
    return this.users
      .withPermissions()
      .getByEmail(email);
  }

  /**
   * Upsert user record with extracted google data.
   *
   * @private
   * @param {AuthDto} user
   * @param {User | null} [record=null]
   *
   * @return {User}
   */
  private async saveAuthUser(user: AuthDto, record: User | null = null): Promise<User> {
    const now = new Date();
    const payload = <User>{
      email: user.email,
      name: user.name,
      lastActive: now,
      invitedAt: now,
      active: true,
      isSuperAdmin: false,
    };

    payload.avatar = await this.googleAdmin.getPhoto(user.email);

    if (record) {
      payload.id = record.id;
      payload.preferences = record.preferences;
      payload.adminAppUserId = record.adminAppUserId;

      delete payload.invitedAt;
      delete payload.active;
      delete payload.isSuperAdmin;
    }

    if (!record || !record.joinedAt) {
      payload.joinedAt = now;
    }

    const saved = await this.users.save(payload);

    return Object.assign(record || saved, payload);
  }

  /**
   * Convert the numeric expiration time from jwt claims
   * to seconds without the float point value.
   *
   * "exp" value is in seconds from epoch time so we need to
   * normalize it by multiplying 1000 when subtracting it
   * to the current time. And then dividing it to 1000 again
   * to convert it back to "seconds".
   *
   * @private
   * @param {number} exp
   *
   * @returns {number}
   */
  private expInSeconds(exp: number): number {
    const now = new Date().getTime();

    return Math.floor((new Date(exp * 1000).getTime() - now) / 1000);
  }
}
