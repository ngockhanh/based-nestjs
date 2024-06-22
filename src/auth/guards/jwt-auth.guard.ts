import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '../../core/exceptions/unauthorized-exception';
import { ErrorCode } from '../auth.constant';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /** @override */
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    const { name = '' } = info || err || {};

    if (name === 'TokenExpiredError' || name === 'JWTExpired') {
      throw new UnauthorizedException('Unauthorized', ErrorCode.AuthErrorExpired);
    }

    if (name === 'JsonWebTokenError' || name === 'JWEDecryptionFailed') {
      throw new UnauthorizedException('Unauthorized', ErrorCode.AuthError);
    }

    return super.handleRequest(err, user, info, context, status);
  }
}
