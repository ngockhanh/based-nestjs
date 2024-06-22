import { ModuleRef } from '@nestjs/core';
import { Bindings } from '@/configs/event-bindings.config';
import { Event } from './event';
import { EventHandler } from './event.handler';

class FakeEvent extends Event {}

describe('EventHandler', () => {
  const listeners = {
    FakeEventListener: { handle: jest.fn() },
  };
  const bindings = <Bindings><unknown>{
    FakeEvent: [listeners.FakeEventListener], // format from TYPES container bindings
  };

  const mockModuleRef = <ModuleRef><unknown>{
    get: jest.fn().mockImplementation((instance) => instance),
  };

  const handler = new EventHandler(mockModuleRef, bindings);

  describe('handle(event)', () => {
    it('throws an error if event is null', async () => {
      expect.assertions(3);

      try {
        await handler.handle(null);
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error.message).toContain('Invalid event null');
        expect(listeners.FakeEventListener.handle).not.toBeCalled();
      }
    });

    it('throws an error if event has no event name', async () => {
      expect.assertions(3);

      try {
        await handler.handle(<Event>{});
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error.message).toContain('Invalid event');
        expect(listeners.FakeEventListener.handle).not.toBeCalled();
      }
    });

    it('throws an error if event has no listener', async () => {
      expect.assertions(3);

      try {
        await handler.handle(<Event>{ event: 'no-listener' });
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error.message).toContain('Listener(s) not found for event no-listener');
        expect(listeners.FakeEventListener.handle).not.toBeCalled();
      }
    });

    it('handles valid event', async () => {
      const data = { one: 1 };
      const event = new FakeEvent(data);

      await handler.handle(event);

      expect(listeners.FakeEventListener.handle).toBeCalledTimes(1);
      expect(listeners.FakeEventListener.handle).toBeCalledWith(data);
    });
  });
});
