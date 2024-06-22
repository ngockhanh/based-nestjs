import {
  CanActivate,
  Injectable,
  ExecutionContext,
} from '@nestjs/common';

import cronConfig from '@/configs/cron.config';

@Injectable()
export class CronAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const config = cronConfig();
    const request = context.switchToHttp().getRequest();
    const cronToken = request.headers['x-cron-token'];

    if (!config.cronAuthToken || (cronToken !== config.cronAuthToken)) {
      return false;
    }

    return true;
  }
}
