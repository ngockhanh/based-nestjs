import { Null } from './queue.null';

describe('Null Queue', () => {
  let queue: Null;

  beforeEach(() => {
    queue = new Null();
  });

  it('has a name', () => {
    expect(queue.name).toEqual(null);
  });

  describe('publish()', () => {
    it('only returns the message', async () => {
      const message = await queue.publish('test');

      expect(message).toEqual('test');
    });
  });

  describe('consume()', () => {
    it('does nothing when calling consume', async () => {
      const consumer = await queue.consume('test-subscriber');

      expect(consumer).toBeNull();
    });
  });

  describe('getMessage()', () => {
    it('returns the raw message it received', () => {
      const message = queue.getMessage('a message');

      expect(message).toBe('a message');
    });
  });
});
