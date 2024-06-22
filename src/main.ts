import { Tracer } from './core/metrics/tracer.metrics'; // tracer first
import helmet from 'helmet';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { NestExpressApplication } from '@nestjs/platform-express';
import { StorageDriver, initializeTransactionalContext } from 'typeorm-transactional';
import { AppModule } from './app.module';
import appConfig from './configs/app.config';
import { isProduction } from './core/core.helpers';
import { initSwagger } from './swagger/swagger.init';
import { ApiExceptionsFilter } from './core/exceptions/api-exceptions.filter';
import { ErrorReporterUtil } from './core/utils/error-reporter.util';
import sentryConfig from './configs/sentry.config';

async function bootstrap() {
  Tracer.start();
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

  const config = appConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, config.appOptions);

  app.use(helmet(config.helmet));

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ApiExceptionsFilter(httpAdapterHost));
  app.enableCors({ origin: config.whitelistOrigins });

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  const bodyParserOpts = {
    limit: config.bodyParser.maxLimit,
    extended: true,
  };

  app.useBodyParser('json', bodyParserOpts);
  app.useBodyParser('urlencoded', bodyParserOpts);

  (new ErrorReporterUtil(sentryConfig())).init();

  if (!isProduction()) {
    initSwagger('/apidocs', app);
  }

  await app.listen(config.port || 3000);

  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
