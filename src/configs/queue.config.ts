import googleConfig from './google.config';

export default () => {
  const google = googleConfig();

  return {
    driver: process.env.QUEUE_DRIVER, // pubsub|null
    pubsub: {
      topic: process.env.QUEUE_NAME,
      keyPath: google.keyPath,
      projectId: google.projectId,
      subscription: process.env.QUEUE_SUBSCRIPTION,
    },
  };
};
