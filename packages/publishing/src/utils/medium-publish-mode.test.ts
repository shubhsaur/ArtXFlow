import { describe, it, expect } from 'vitest';
import {
  DEFAULT_MEDIUM_PUBLISH_MODE,
  isClientManagedDestination,
  isClientManagedMediumDestination,
  isClientManagedMediumPublish,
  isMediumPublishMode,
  resolveMediumPublishMode,
} from './medium-publish-mode';

describe('medium publish mode helpers', () => {
  it('accepts the four supported modes', () => {
    expect(isMediumPublishMode('extension')).toBe(true);
    expect(isMediumPublishMode('medium_new')).toBe(true);
    expect(isMediumPublishMode('manual')).toBe(true);
    expect(isMediumPublishMode('api')).toBe(true);
    expect(isMediumPublishMode('hn_new')).toBe(false);
    expect(isMediumPublishMode(undefined)).toBe(false);
  });

  it('defaults missing metadata to the legacy API worker path', () => {
    expect(resolveMediumPublishMode(undefined)).toBe('api');
    expect(resolveMediumPublishMode({})).toBe('api');
    expect(resolveMediumPublishMode({ mediumPublishMode: 'nope' })).toBe('api');
  });

  it('reads a stored preference from destination config', () => {
    expect(resolveMediumPublishMode({ mediumPublishMode: 'medium_new' })).toBe('medium_new');
    expect(DEFAULT_MEDIUM_PUBLISH_MODE).toBe('extension');
  });

  it('treats non-API modes as client-managed', () => {
    expect(isClientManagedMediumPublish('api')).toBe(false);
    expect(isClientManagedMediumPublish('extension')).toBe(true);
    expect(
      isClientManagedMediumDestination({
        type: 'medium',
        config: { mediumPublishMode: 'extension' },
      }),
    ).toBe(true);
    expect(
      isClientManagedMediumDestination({
        type: 'MEDIUM',
        config: { mediumPublishMode: 'api' },
      }),
    ).toBe(false);
  });

  it('detects client-managed destinations across Hashnode and Medium', () => {
    expect(
      isClientManagedDestination({
        type: 'hashnode',
        config: { hashnodePublishMode: 'hn_new' },
      }),
    ).toBe(true);
    expect(
      isClientManagedDestination({
        type: 'medium',
        config: { mediumPublishMode: 'manual' },
      }),
    ).toBe(true);
    expect(
      isClientManagedDestination({
        type: 'devto',
        config: {},
      }),
    ).toBe(false);
  });
});
