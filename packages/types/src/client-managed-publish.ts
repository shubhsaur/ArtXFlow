import { isClientManagedHashnodeDestination } from './hashnode-publish-mode';
import { isClientManagedMediumDestination } from './medium-publish-mode';

/**
 * Destinations whose publish step runs in the browser (extension / web editor /
 * pasted live URL) instead of the platform API worker.
 */
export function isClientManagedDestination(destination: {
  type: string;
  config?: Record<string, unknown> | null;
}): boolean {
  return (
    isClientManagedHashnodeDestination(destination) || isClientManagedMediumDestination(destination)
  );
}
