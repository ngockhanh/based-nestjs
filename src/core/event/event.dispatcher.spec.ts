import { Queue } from '../queue/queue';
import { Event } from './event';
import { EventDispatcher } from './event.dispatcher';
import { EventHandler } from './event.handler';

describe('EventDispatcher', () => {
  const queue = <Queue><unknown>{
    name: 'pubsub',
    publish: jest.fn(),
  };

  const handler: EventHandler = <EventHandler><unknown>{
    handle: jest.fn(),
  };
  const event = new Event({ some: 'data' });

  describe('dispatch(event)', () => {
    it('handles event immediately if queue driver is Null', async () => {
      const queueNull = <Queue><unknown>{ ...queue, name: null };
      const dispatcher = new EventDispatcher(queueNull, handler);

      await dispatcher.dispatch(event);

      expect(queueNull.publish).not.toBeCalled();
      expect(handler.handle).toBeCalledTimes(1);
      expect(handler.handle).toBeCalledWith(event);
    });

    it('publishes event if queue driver is not Null', async () => {
      const dispatcher = new EventDispatcher(queue, handler);

      await dispatcher.dispatch(event);

      expect(handler.handle).not.toBeCalled();
      expect(queue.publish).toBeCalledTimes(1);
      expect(queue.publish).toBeCalledWith(event);
    });
  });
});
