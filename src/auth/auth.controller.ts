import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Headers as FormHeaders } from 'form-data';
import { User } from '@/core/decorators/user.decorator';
import { BaseController } from '@/core/base/base.controller';
import { AccessToken, AuthTokens, AuthUserData } from '@/auth/auth.interface';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthService } from './google-auth.service';
import { AuthDto } from './dto/auth.dto';
import { VerifyDto } from './dto/verify.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
import { AuthToken } from './decorators/auth-token.decorator';
import { SamlAuthGuard } from './guards/saml-auth.guard';
import { SamlAuthDto } from './dto/saml-auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController extends BaseController {
  /**
   * Creates an instance of AuthController.
   *
   * @param {AuthService} authService
   * @param {GoogleAuthService} googleAuthService
   */
  constructor(
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
  ) {
    super();
  }

  @Get('/saml')
  @UseGuards(SamlAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async samlLogin() {}

  @Post('/saml/verify')
  @UseGuards(SamlAuthGuard)
  async samlAssertionConsumer(
  @User() user: AuthDto,
    @Body() body: SamlAuthDto,
    @Res() res: any,
  ) {
    const { RelayState } = body;

    if (RelayState) {
      try {
        const tokens = await this.authService.login(user);
        // delete the access and expiration to force refresh in FE
        // this will make the token smaller hence making the url shorter
        delete tokens.access;
        delete tokens.expiration;

        const encoded = this.authService.sign(tokens);

        return res.redirect(`${RelayState}?tokens=${encoded}`);
      } catch (error) {
        const params = new URLSearchParams({
          errorCode: error.code || '',
          errorMessage: error.message,
        });

        return res.redirect(`${RelayState}?${params.toString()}`);
      }
    }

    return user;
  }

  @Post('/google/verify')
  @HttpCode(200)
  async googleAuthVerify(
    @Body() body: VerifyDto,
      @Headers() headers: FormHeaders,
  ): Promise<object> {
    const { code } = body;
    const origin = headers.origin || '';

    const user = await this.googleAuthService.verify(code, origin) as AuthDto;
    const tokens = await this.authService.login(user);

    return tokens;
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async me(@User() user: AuthUserData): Promise<AuthUserData> {
    return user;
  }

  @Post('/refresh')
  @HttpCode(200)
  async refresh(@Body() body: RefreshDto): Promise<AccessToken | void> {
    const freshToken = await this.authService.refresh(body.token);

    if (!freshToken) {
      return this.throwForbiddenException('Invalid refresh token', 'refresh_token');
    }

    return freshToken;
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @User() user: AuthUserData,
      @AuthToken() authToken: string,
      @Body() body: LogoutDto,
  ): Promise<object | unknown> {
    const tokens = <AuthTokens>{
      access: authToken,
      refresh: body.refreshToken || null,
    };

    const isLoggedOut = await this.authService.logout(user.id, tokens);

    if (!isLoggedOut) {
      return this.throwForbiddenException('Invalid credentials', 'logout');
    }

    return { success: true };
  }
}
