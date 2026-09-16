import type { PlatformAdapter, PlatformProvider } from './contract';
import { PlatformError } from './errors';
import { artxflowBlogAdapter } from './adapters/artxflow-blog.adapter';
import { devtoAdapter } from './adapters/devto.adapter';
import { mediumAdapter } from './adapters/medium.adapter';
import { hashnodeAdapter } from './adapters/hashnode.adapter';

/**
 * Registry holding instantiated platform adapters.
 * Prevents dynamic import of untrusted modules and enables clean dependency injection.
 */
export class PlatformAdapterRegistry {
  private readonly adapters = new Map<string, PlatformAdapter>();

  /**
   * Registers a platform adapter.
   */
  register(adapter: PlatformAdapter): void {
    const key = adapter.provider.toUpperCase();
    this.adapters.set(key, adapter);
  }

  /**
   * Looks up an adapter by provider name, returning null if unregistered.
   */
  get(provider: PlatformProvider): PlatformAdapter | null {
    const key = provider.toUpperCase();
    return this.adapters.get(key) || null;
  }

  /**
   * Resolves an adapter by provider name or throws a PlatformError if unsupported.
   */
  require(provider: PlatformProvider): PlatformAdapter {
    const adapter = this.get(provider);
    if (!adapter) {
      throw new PlatformError({
        provider,
        code: 'UNSUPPORTED_OPERATION',
        message: `No platform adapter registered for provider '${provider}'`,
        retryable: false,
      });
    }
    return adapter;
  }

  /**
   * Checks if an adapter is registered for the specified provider.
   */
  has(provider: PlatformProvider): boolean {
    return this.adapters.has(provider.toUpperCase());
  }

  /**
   * Returns a list of all registered provider names.
   */
  listProviders(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Clears all registered adapters (primarily used for test cleanup).
   */
  clear(): void {
    this.adapters.clear();
  }
}

export const platformAdapterRegistry = new PlatformAdapterRegistry();

/**
 * Registers first-party and standard built-in platform adapters into the registry.
 */
export function registerDefaultAdapters(
  registry: PlatformAdapterRegistry = platformAdapterRegistry,
): void {
  registry.register(artxflowBlogAdapter);
  registry.register(devtoAdapter);
  registry.register(mediumAdapter);
  registry.register(hashnodeAdapter);
}

// Auto-register built-in adapters on the singleton instance
registerDefaultAdapters(platformAdapterRegistry);

/**
 * Top-level helper function resolving an adapter by provider key.
 */
export function getPlatformAdapter(provider: PlatformProvider): PlatformAdapter {
  return platformAdapterRegistry.require(provider);
}
