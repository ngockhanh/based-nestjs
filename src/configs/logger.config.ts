import { startTime } from 'pino-http';
import { Params } from 'nestjs-pino';
import { isDev } from '@/core/core.helpers';

export const IGNORED_ROUTES = [
  '/ping',
  '/health',
  '/apidocs',
];

export default (): Params => ({
  pinoHttp: {
    useLevel: 'info',
    messageKey: 'message',
    transport: isDev() ? {
      target: 'pino-pretty',
      options: { singleLine: true },
    } : undefined,
    serializers: {
      req: (req: any) => {
        const parsed = JSON.parse(JSON.stringify(req));
        parsed.headers = {
          host: req.raw.headers.host,
          'user-agent': req.raw.headers['user-agent'],
          referer: req.raw.headers.referer,
        };

        return parsed;
      },
      res: (res: any) => {
        const parsed = JSON.parse(JSON.stringify(res));
        parsed.headers = {
          'content-type': res.headers['content-type'],
          'content-length': res.headers['content-length'],
        };

        return parsed;
      },
      err: (err: any) => JSON.stringify(err),
    },
    customSuccessMessage: (req: any, res: any) => {
      const { ip, method, originalUrl } = req;
      const agent = req.get('user-agent') || '';
      const size = res.get('content-length') || '';
      const responseTime = `${Date.now() - res[startTime]}ms`;

      return `${method} ${originalUrl} ${res.statusCode} ${responseTime} ${size} - ${agent} ${ip}`;
    },
    autoLogging: {
      ignore: (req: any) => {
        const { originalUrl } = req;

        if (!originalUrl) {
          return false;
        }

        return IGNORED_ROUTES.some((path: string) => originalUrl.includes(path));
      },
    },
  },
});
