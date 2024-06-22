import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import { toInt } from '@/core/core.helpers';

export type TokenExpiration = {
  oneDay: number;
  fiveMinutes: number;
  access: number
};

export const tokenExpiration = (): TokenExpiration => ({
  oneDay: 60 * 60 * 24,
  fiveMinutes: 60 * 5,
  access: toInt(process.env.ACCESS_EXPIRATION) || 60 * 5,
});

export const jwtConfig: JwtModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
  }),
  inject: [ConfigService],
};
