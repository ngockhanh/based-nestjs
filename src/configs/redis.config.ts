export type RedisConfig = {
  host: string;
  port: number;
  db?: number;
  password?: string;
  timeout: number;
};

export default () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  db: process.env.REDIS_DB || 0,
  password: process.env.REDIS_PASSWORD,
  timeout: 1000 * (+process.env.REDIS_TIMEOUT || 30), // default 30 secs
} as RedisConfig);
