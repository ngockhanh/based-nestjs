import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '@/configs/jwt.config';
import { UserRepository } from '@/user/user.repository';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strageties/jwt.strategy';
import { GoogleAuthService } from './google-auth.service';
import { InvalidTokenRepository } from './invalid-token.repository';
import { SamlStrategy } from './strageties/saml.strategy';
import { SamlAuthGuard } from './guards/saml-auth.guard';
import { GoogleAdminProvider } from './google-admin.provider';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync(jwtConfig),
  ],
  providers: [
    InvalidTokenRepository,
    UserRepository,
    AuthService,
    JwtStrategy,
    GoogleAuthService,
    SamlStrategy,
    SamlAuthGuard,
    GoogleAdminProvider,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
