import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import eventBindings from '@/configs/event-bindings.config';
import { EventDispatcher } from './event.dispatcher';
import { QueueModule } from '../queue/queue.module';
import { EventHandler } from './event.handler';

@Module({
  imports: [
    QueueModule,
    ConfigModule,
  ],
  providers: [
    EventDispatcher,
    {
      provide: EventHandler,
      useFactory: async (moduleRef: ModuleRef) => new EventHandler(moduleRef, eventBindings),
      inject: [ModuleRef],
    },
  ],
  exports: [EventHandler, EventDispatcher],
})
export class EventModule {}
