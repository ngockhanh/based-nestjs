import { api, resources, NodeSDK } from '@opentelemetry/sdk-node';
import {
  Sampler,
  SamplingDecision,
  BatchSpanProcessor,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis-4';
import { IGNORED_ROUTES, SERVICE_NAME } from './metrics.constant';
import { isProduction, isStaging } from '../core.helpers';

type FilterFunction = (
  spanName: string,
  spanKind: api.SpanKind,
  attributes: api.Attributes
) => boolean;

export class MetricsTracer {
  private sdk: NodeSDK;

  /**
   * Creates an instance of MetricsTracer.
   *
   * @param {string} serviceName
   * @param {boolean} isDev
   */
  constructor(
    private readonly serviceName: string,
    private readonly isDev: boolean,
  ) {
    this.sdk = this.createSdk();
  }

  /**
   * Start the tracer sdk.
   *
   * @return {void}
   */
  start(): void {
    if (!this.sdk) {
      return null;
    }

    return this.sdk.start();
  }

  /**
   * Shutdown the tracer sdk.
   *
   * @return {Promise<void>}
   */
  async shutdown(): Promise<void> {
    if (!this.sdk) {
      return null;
    }

    return this.sdk.shutdown();
  }

  /**
   * Create the opentelemetry sdk with GCP
   * trace exporter if env is not dev.
   *
   * @private
   *
   * @return {(NodeSDK | null)}
   */
  private createSdk(): NodeSDK | null {
    if (this.isDev) {
      return null;
    }

    const { serviceName } = this;
    const parentSampler = new ParentBasedSampler({
      root: new TraceIdRatioBasedSampler(0.4),
    });

    return new NodeSDK({
      resource: new resources.Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: this.serviceName,
      }),
      sampler: this.filterSampler(this.ignoreSpans, parentSampler, serviceName),
      spanProcessor: new BatchSpanProcessor(new TraceExporter()),
      textMapPropagator: new B3Propagator(),
      instrumentations: [
        new RedisInstrumentation({
          dbStatementSerializer: (cmdName, cmdArgs) => {
            const statement = [cmdName, ...cmdArgs].join(' ');

            return `${statement.substring(0, 40)}...`;
          },
        }),
        new PgInstrumentation(),
        new HttpInstrumentation({
          ignoreIncomingRequestHook: ({ url, method }) => {
            const isIgnored = url && IGNORED_ROUTES.some((v: string) => v === url);

            return isIgnored || method.toUpperCase() === 'OPTIONS';
          },
        }),
        new ExpressInstrumentation(),
        new NestInstrumentation(),
      ],
    });
  }

  /**
   * A sampler that fixes service name not getting populated
   * and will filter spans that we don't want to be traced.
   *
   * @private
   * @param {FilterFunction} filterFn
   * @param {Sampler} parent
   * @param {string} serviceName
   *
   * @return {Sampler}
   */
  private filterSampler(filterFn: FilterFunction, parent: Sampler, serviceName: string): Sampler {
    return {
      shouldSample(ctx, tid, spanName, spanKind, attr, links) {
        if (!filterFn(spanName, spanKind, attr)) {
          return { decision: SamplingDecision.NOT_RECORD };
        }

        if (!attr[SemanticResourceAttributes.SERVICE_NAME]) {
          Object.assign(attr, {
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
          });
        }

        return parent.shouldSample(ctx, tid, spanName, spanKind, attr, links);
      },
      toString() {
        return `FilterSampler(${parent.toString()})`;
      },
    };
  }

  /**
   * Ignore some spans.
   *
   * @private
   * @param {string} spanName
   *
   * @return {boolean}
   */
  private ignoreSpans(spanName: string): boolean {
    if (spanName === 'Create Nest App') {
      return false;
    }

    return true;
  }
}

const isDev = !(isStaging() || isProduction());
export const Tracer = new MetricsTracer(SERVICE_NAME, isDev);
