import { PublicSignatureConfig } from '../../configs/public-signature.config';
import * as crypto from 'crypto';

export class HmacUtil {
  private readonly algorithm = 'sha256';

  constructor(private config: PublicSignatureConfig) {}

  generateHmac(data: string): string {
    const hmac = crypto.createHmac(this.algorithm, this.config.secretKey);
    hmac.update(data);

    return hmac.digest('hex');
  }

  verifyHmac(expectedSignature: string, receivedSignature: string): boolean {
    return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(receivedSignature));
  }
}
