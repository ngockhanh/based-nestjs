import { getNodeEnv } from '@/core/core.helpers';

export type SentryConfig = {
  dsn: string,
  env: string,
  ignoreErrors: any[]
};

export default () => ({
  dsn: process.env.SENTRY_DSN,
  env: getNodeEnv(),
  ignoreErrors: [
    'Invalid token',
    'Invalid refresh token',
    'Unauthenticated',
    'Unauthorized',
  ],
});
