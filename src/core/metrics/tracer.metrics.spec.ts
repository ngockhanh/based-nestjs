import { MetricsTracer } from './tracer.metrics';

const mockSdk = {
  start: jest.fn(),
  shutdown: jest.fn(),
};

jest.mock('@opentelemetry/sdk-node', () => ({
  resources: { Resource: jest.fn() },
  NodeSDK: jest.fn(() => mockSdk),
}));

describe('MetricsTracer', () => {
  const serviceName = 'service-test';

  it('does not create NodeSDK if in dev env', () => {
    const tracer = new MetricsTracer(serviceName, true);

    tracer.start();
    tracer.shutdown();

    expect(mockSdk.start).not.toHaveBeenCalled();
    expect(mockSdk.shutdown).not.toHaveBeenCalled();
  });

  it('calls sdk start', () => {
    const tracer = new MetricsTracer(serviceName, false);

    tracer.start();

    expect(mockSdk.start).toHaveBeenCalledExactlyOnceWith();
    expect(mockSdk.shutdown).not.toHaveBeenCalled();
  });

  it('calls sdk shutdown', () => {
    const tracer = new MetricsTracer(serviceName, false);

    tracer.shutdown();

    expect(mockSdk.shutdown).toHaveBeenCalledExactlyOnceWith();
    expect(mockSdk.start).not.toHaveBeenCalled();
  });
});
