export type PublicSignatureConfig = {
  secretKey: string,
};

export default () => ({
  secretKey: process.env.SIGNATURE_SECRET_KEY,
});
