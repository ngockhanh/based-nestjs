import { Module } from '@nestjs/common';
import queueConfig from '@/configs/queue.config';
import { Queue } from './queue';
import { Factory } from './queue.factory';

@Module({
  providers: [
    {
      provide: Queue,
      useFactory: async () => {
        const config = queueConfig();

        return Factory.create(config.driver, config.pubsub);
      },
    },
  ],
  exports: [Queue],
})
export class QueueModule {}
