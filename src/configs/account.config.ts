export type AccountConfig = {
  baseUrl: string
};

export default () => ({
  baseUrl: process.env.ACCOUNT_URL,
});
