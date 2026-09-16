import { Inngest, EventSchemas } from 'inngest';
import type { InngestEvents } from './events';

/**
 * ArtXFlow Inngest client instance.
 * Secret keys are strictly server-only and read from environment variables.
 */
export const inngest = new Inngest({
  id: 'artxflow',
  schemas: new EventSchemas().fromRecord<InngestEvents>(),
  eventKey: process.env.INNGEST_EVENT_KEY,
});
