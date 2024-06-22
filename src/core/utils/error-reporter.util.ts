import * as Sentry from '@sentry/node';
import { SentryConfig } from '@/configs/sentry.config';
import { HttpStatus } from '@nestjs/common';
import { getNodeEnv, isProduction } from '../core.helpers';
import { ErrorReporterTags } from '../interfaces/error-reporter-tags.interface';
import { UrlUtil } from './url.util';

export class ErrorReporterUtil {
  constructor(private config: SentryConfig) {}

  init(): void {
    if (this.isActive()) {
      Sentry.init({
        dsn: this.config.dsn,
        debug: !isProduction(),
        environment: getNodeEnv(),
        ignoreErrors: this.config.ignoreErrors,
      });
    }
  }

  captureException(exception: any, tags: ErrorReporterTags = {}): void {
    if (this.isActive()) {
      Sentry.captureException(exception, {
        tags: {
          app: 'INP Backend',
          status: tags?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          url: tags?.url ? UrlUtil.getPathName(tags.url) : '',
        },
      });
    }
  }

  isActive(): boolean {
    const dsn = this.config.dsn ? this.config.dsn.trim() : this.config.dsn;

    return !!dsn;
  }
}
