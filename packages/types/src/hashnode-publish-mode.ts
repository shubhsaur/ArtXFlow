/**
 * Hashnode publish methods a workspace can choose as its default.
 *
 * Hashnode paywalled GraphQL write APIs (`publishPost`) behind Pro. Free
 * alternatives run in the browser (extension / hn.new / manual URL record).
 */
export const HASHNODE_PUBLISH_MODES = ['extension', 'hn_new', 'manual', 'api'] as const;

export type HashnodePublishMode = (typeof HASHNODE_PUBLISH_MODES)[number];

export const DEFAULT_HASHNODE_PUBLISH_MODE: HashnodePublishMode = 'extension';

/** Legacy connections with no stored preference keep the original API worker path. */
export const LEGACY_HASHNODE_PUBLISH_MODE: HashnodePublishMode = 'api';

export function isHashnodePublishMode(value: unknown): value is HashnodePublishMode {
  return typeof value === 'string' && (HASHNODE_PUBLISH_MODES as readonly string[]).includes(value);
}

export function resolveHashnodePublishMode(
  source?: Record<string, unknown> | null,
): HashnodePublishMode {
  const raw = source?.hashnodePublishMode;
  return isHashnodePublishMode(raw) ? raw : LEGACY_HASHNODE_PUBLISH_MODE;
}

export function isClientManagedHashnodePublish(mode: HashnodePublishMode): boolean {
  return mode !== 'api';
}

export function isHashnodeDestinationType(type: string | null | undefined): boolean {
  return Boolean(type && type.toLowerCase().includes('hashnode'));
}

export function isClientManagedHashnodeDestination(destination: {
  type: string;
  config?: Record<string, unknown> | null;
}): boolean {
  if (!isHashnodeDestinationType(destination.type)) {
    return false;
  }
  return isClientManagedHashnodePublish(resolveHashnodePublishMode(destination.config));
}
