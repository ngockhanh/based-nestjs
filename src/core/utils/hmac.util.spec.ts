import { PublicSignatureConfig } from '@/configs/public-signature.config';
import { HmacUtil } from './hmac.util';

describe('HmacUtil', () => {
  describe('generateHmac', () => {
    const defaultConfig = {
      secretKey: 'key',
    } as PublicSignatureConfig;

    it('It generates hmac data', () => {
      const data = 'test';
      const hmacUtil = new HmacUtil(defaultConfig);
      const generatedSignature = hmacUtil.generateHmac(data);

      expect(generatedSignature).not.toBeEmpty();
    });

    it('It generates valid hmac data', () => {
      const data = 'test';
      const hmacUtil = new HmacUtil(defaultConfig);
      const generatedSignature = hmacUtil.generateHmac(data);
      const expectedSignature = hmacUtil.generateHmac(data);

      expect(hmacUtil.verifyHmac(expectedSignature, generatedSignature)).toBeTrue();
    });
  });
});
