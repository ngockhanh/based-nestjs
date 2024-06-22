export type KongConfig = {
  baseUrl: string
};

export default () => ({
  baseUrl: process.env.KONG_URL,
});
