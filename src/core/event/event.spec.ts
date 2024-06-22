import { Event } from './event';

class FakeEvent extends Event {}

describe('Base Event', () => {
  const event = new FakeEvent({});

  it('has an event name', () => {
    expect(event.event).toEqual('FakeEvent');
  });

  it('sets data on creation', () => {
    expect(event.data).toEqual({});
  });

  it('throws an error if data was not set on creation', async () => {
    expect.assertions(2);

    try {
      const fn = () => new FakeEvent(null);

      fn();
    } catch (error) {
      expect(error).not.toBeNull();
      expect(error.message).toContain('The event must accept data on creation.');
    }
  });

  it('throws an error for a not implemented "queueMessage" method', async () => {
    expect.assertions(2);

    try {
      event.queueMessage();
    } catch (error) {
      expect(error).not.toBeNull();
      expect(error.message).toContain('"queueMessage" method is not implemented.');
    }
  });
});
