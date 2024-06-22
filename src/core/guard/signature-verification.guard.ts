import {
  CanActivate,
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import publicSignatureConfig from '@/configs/public-signature.config';
import { HmacUtil } from '../utils/hmac.util';

@Injectable()
export class VerifySignatureGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const hmacUtil = new HmacUtil(publicSignatureConfig());
    const request = ctx.switchToHttp().getRequest();
    const { method, originalUrl } = request;
    const requestData = `${method} ${originalUrl}`;
    const receivedSignature = request.headers['x-inp-signature'];

    if (!receivedSignature) {
      return false;
    }

    const expectedSignature = hmacUtil.generateHmac(requestData);

    if (!hmacUtil.verifyHmac(expectedSignature, receivedSignature)) {
      return false;
    }

    return true;
  }
}
