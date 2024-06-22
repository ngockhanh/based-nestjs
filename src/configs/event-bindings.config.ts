import { EventListener } from '@/core/event/event.listener';
import { HcnJobEventListener } from '@/hcn-job/events/hcn-job-event.listener';
import
{ PropertyJobEventListener } from '@/property/property-job/events/property-job.event.listener';
import { MappingJobEventListener } from '@/mapping/mapping-job/events/mapping-job.event.listener';

export type Bindings = {
  [name: string]: { new(...args: any): EventListener }[],
};

/**
 * The purpose of this file is to map the events
 * with its designated listeners. An event can
 * have multiple listeners and the "key" must
 * be the constructor/class name of the event.
 */
export const LISTENERS = <Bindings>{
  HcnJobEvent: [HcnJobEventListener],
  PropertyJobEvent: [PropertyJobEventListener],
  MappingJobEvent: [MappingJobEventListener],
};

export default LISTENERS;
