import redisConfig from './redis.config';

export type CacheConfig = {
  prefix?: string;
  driver?: string;
  clients: {
    null: object;
    redis?: object;
  }
};
export default () => ({
  prefix: process.env.CACHE_PREFIX || '',
  driver: process.env.CACHE_DRIVER || 'null',
  clients: {
    null: {},
    redis: redisConfig(),
  },
});
