import { Message } from '@google-cloud/pubsub';

export type PubSubOpts = {
  topic: string,
  keyPath: string,
  projectId: string,
  subscription: string,
};

export type QueueOpts = PubSubOpts | {};

export type QueueMessage = Message | any;
