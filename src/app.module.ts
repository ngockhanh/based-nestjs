import { Logger, MiddlewareConsumer, Module, NestModule, OnApplicationShutdown } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './core/middlewares/logger.midleware';
import { Tracer } from './core/metrics/tracer.metrics';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule, OnApplicationShutdown {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }

  async onApplicationShutdown(signal?: string) {
    Logger.log({ message: `Shutting down, signal: ${signal}`, signal });

    await new Promise<void>((resolve) => {
      Tracer
        .shutdown()
        .then(() => Logger.log('Tracing terminated'))
        .catch((e: Error) => Logger.log('Error terminating tracing', e))
        .finally(() => resolve());
    });
  }
}

