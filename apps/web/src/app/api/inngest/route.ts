import { serve } from 'inngest/next';
import { inngest, inngestFunctions } from '@artxflow/worker';

/**
 * Inngest endpoint serving ArtXFlow background functions.
 * Compatible with Next.js App Router and the Inngest Dev Server.
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
