import { Factory } from './queue.factory';
import { GooglePubSub } from './queue.google-pubsub';
import { Null } from './queue.null';

describe('QueueFactory', () => {
  it('creates class based from valid driver', () => {
    const pubsubQueue = Factory.create('pubsub');
    const nullQueue = Factory.create('null');

    expect(pubsubQueue).toBeInstanceOf(GooglePubSub);
    expect(nullQueue).toBeInstanceOf(Null);
  });

  it('defaults to null queue if driver is invalid', () => {
    const nullQueue = Factory.create('invalid');

    expect(nullQueue).toBeInstanceOf(Null);
  });
});
