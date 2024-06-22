import { ModuleRef } from '@nestjs/core';
import { Bindings } from '@/configs/event-bindings.config';
import { Event } from './event';
import type { EventListener } from './event.listener';

/**
 * The main event handler that will
 * arrange the listeners to handle the event.
 *
 * @export
 * @class EventHandler
 */
export class EventHandler {
  /**
   *  Creates an instance of EventHandler.
   *
   * @param {ModuleRef} moduleRef the IoC
   * @param {Bindings} bindings the event -> listeners mapping
   */
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly bindings: Bindings,
  ) {
  }

  /**
   * Handle the event.
   *
   * @param {Event} event
   * @param {string} event.event the name of the event
   * @param {any} event.data
   *
   * @return {Promise<Array<any>>}
   */
  async handle(event: Event): Promise<Array<any>> {
    if (!event || !event.event) {
      throw new Error(`Invalid event ${JSON.stringify(event)}`);
    }

    const listeners = await this.getListeners(event.event);

    if (!listeners || listeners.length === 0) {
      throw new Error(`EventListener(s) not found for event ${event.event}`);
    }

    return this.doHandle(listeners, event.data);
  }

  /**
   * Call the listeners for the event
   * to handle the event's data.
   *
   * @private
   * @param {EventListener[]} listeners
   * @param {any} data
   *
   * @return {Promise<Array<any>>}
   */
  private async doHandle(listeners: EventListener[], data: any): Promise<Array<any>> {
    const handlers = [];

    for (let i = 0; i < listeners.length; i += 1) {
      const listener = listeners[i];

      handlers.push(listener.handle(data));
    }

    return Promise.all(handlers);
  }

  /**
   * Get the listeners for the event.
   *
   * @private
   * @param {string} eventName
   *
   * @return {Promise<EventListener[]>}
   */
  private async getListeners(eventName: string): Promise<EventListener[]> {
    const listenerNames = this.bindings[eventName];

    if (!listenerNames || listenerNames.length === 0) {
      return [];
    }

    const listeners = [];

    for (let i = 0; i < listenerNames.length; i += 1) {
      const instance = this.moduleRef.get(listenerNames[i], { strict: false });

      if (instance) {
        listeners.push(instance);
      }
    }

    return listeners;
  }
}
