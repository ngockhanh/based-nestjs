import { Queue } from '@/core/queue/queue';
import { Injectable } from '@nestjs/common';
import { EventHandler } from './event.handler';
import { Event } from './event';

/**
 * The event dispatcher.
 *
 * @export
 * @class EventDispatcher
 */
@Injectable()
export class EventDispatcher {
  /**
   * Creates an instance of EventDispatcher.
   *
   * @param {Queue} queue
   * @param {EventHandler} handler
   */
  constructor(
    private readonly queue: Queue,
    private readonly handler: EventHandler,
  ) {
  }

  /**
   * Dispatch the event. This will either
   * handle the event immediately or
   * publish to a queue if possible.
   *
   * @param {Event} event
   *
   * @return {Promise<any>}
   */
  async dispatch(event: Event): Promise<any> {
    if (this.queue.name === null) {
      return this.handler.handle(event);
    }

    return this.queue.publish(event);
  }
}
