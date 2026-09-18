import { describe, it, expect } from 'vitest';
import {
  DEFAULT_HASHNODE_PUBLISH_MODE,
  isClientManagedHashnodeDestination,
  isClientManagedHashnodePublish,
  isHashnodePublishMode,
  resolveHashnodePublishMode,
} from './hashnode-publish-mode';

describe('hashnode publish mode helpers', () => {
  it('accepts the four supported modes', () => {
    expect(isHashnodePublishMode('extension')).toBe(true);
    expect(isHashnodePublishMode('hn_new')).toBe(true);
    expect(isHashnodePublishMode('manual')).toBe(true);
    expect(isHashnodePublishMode('api')).toBe(true);
    expect(isHashnodePublishMode('other')).toBe(false);
    expect(isHashnodePublishMode(undefined)).toBe(false);
  });

  it('defaults missing metadata to the legacy API worker path', () => {
    expect(resolveHashnodePublishMode(undefined)).toBe('api');
    expect(resolveHashnodePublishMode({})).toBe('api');
    expect(resolveHashnodePublishMode({ hashnodePublishMode: 'nope' })).toBe('api');
  });

  it('reads a stored preference from destination config or connection metadata', () => {
    expect(resolveHashnodePublishMode({ hashnodePublishMode: 'hn_new' })).toBe('hn_new');
    expect(DEFAULT_HASHNODE_PUBLISH_MODE).toBe('extension');
  });

  it('treats non-API modes as client-managed', () => {
    expect(isClientManagedHashnodePublish('api')).toBe(false);
    expect(isClientManagedHashnodePublish('extension')).toBe(true);
    expect(isClientManagedHashnodePublish('hn_new')).toBe(true);
    expect(isClientManagedHashnodePublish('manual')).toBe(true);
  });

  it('detects client-managed Hashnode destinations', () => {
    expect(
      isClientManagedHashnodeDestination({
        type: 'hashnode',
        config: { hashnodePublishMode: 'extension' },
      }),
    ).toBe(true);
    expect(
      isClientManagedHashnodeDestination({
        type: 'HASHNODE',
        config: { hashnodePublishMode: 'api' },
      }),
    ).toBe(false);
    expect(
      isClientManagedHashnodeDestination({
        type: 'devto',
        config: { hashnodePublishMode: 'extension' },
      }),
    ).toBe(false);
  });
});
