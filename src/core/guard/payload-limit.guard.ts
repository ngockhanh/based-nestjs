import appConfig from '@/configs/app.config';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PayloadLimitGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const config = appConfig().bodyParser;
    const request = context.switchToHttp().getRequest();
    const limit = this.reflector.getAllAndOverride<number>('limit', [
      context.getHandler(),
      context.getClass(),
    ]) || config.defaultLimit;

    const contentType = request.headers['content-type'];

    if (contentType && contentType.includes('multipart/form-data')) {
      return true;
    }

    const length = request.headers['content-length'];

    if (length && length > limit) {
      throw new HttpException('Request Entity Too Large Error', HttpStatus.PAYLOAD_TOO_LARGE);
    }

    return true;
  }
}
