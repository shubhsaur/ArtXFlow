/**
 * Medium publish methods a workspace can choose as its default.
 *
 * Medium stopped issuing new Integration Tokens in January 2025. Existing
 * tokens still work for the REST API; everyone else publishes from a browser
 * session (extension / medium.com/new-story / manual URL record).
 */
export const MEDIUM_PUBLISH_MODES = ['extension', 'medium_new', 'manual', 'api'] as const;

export type MediumPublishMode = (typeof MEDIUM_PUBLISH_MODES)[number];

export const DEFAULT_MEDIUM_PUBLISH_MODE: MediumPublishMode = 'extension';

/** Legacy connections with no stored preference keep the original API worker path. */
export const LEGACY_MEDIUM_PUBLISH_MODE: MediumPublishMode = 'api';

/** Placeholder stored when Medium is connected without an Integration Token. */
export const CLIENT_MANAGED_CONNECTION_SECRET = '__artxflow_client_managed__';

export function isMediumPublishMode(value: unknown): value is MediumPublishMode {
  return typeof value === 'string' && (MEDIUM_PUBLISH_MODES as readonly string[]).includes(value);
}

export function resolveMediumPublishMode(
  source?: Record<string, unknown> | null,
): MediumPublishMode {
  const raw = source?.mediumPublishMode;
  return isMediumPublishMode(raw) ? raw : LEGACY_MEDIUM_PUBLISH_MODE;
}

export function isClientManagedMediumPublish(mode: MediumPublishMode): boolean {
  return mode !== 'api';
}

export function isMediumDestinationType(type: string | null | undefined): boolean {
  return Boolean(type && type.toLowerCase().includes('medium'));
}

export function isClientManagedMediumDestination(destination: {
  type: string;
  config?: Record<string, unknown> | null;
}): boolean {
  if (!isMediumDestinationType(destination.type)) {
    return false;
  }
  return isClientManagedMediumPublish(resolveMediumPublishMode(destination.config));
}
