# ArtXFlow — Platform Adapter Contract

## Purpose

Isolate provider-specific APIs, authentication, capabilities, transformations, and errors.

## Package

```text
packages/platform-adapters/
```

## Contract

```ts
export interface PlatformAdapter {
  readonly provider: PlatformProvider;

  getCapabilities(): PlatformCapabilities;

  validate(input: PlatformArticle): Promise<ValidationResult>;

  transform(article: CanonicalArticle): Promise<PlatformArticle>;

  publish(input: PublishInput): Promise<PublishResult>;

  update(input: UpdateInput): Promise<PublishResult>;

  delete(input: DeleteInput): Promise<void>;

  fetchMetrics(input: MetricsInput): Promise<PlatformMetrics>;
}
```

## Capabilities

```ts
type PlatformCapabilities = {
  create: boolean;
  update: boolean;
  delete: boolean;
  analytics: boolean;
  canonicalUrl: boolean;
  images: boolean;
  scheduling: boolean;
};
```

## Canonical article

```ts
type CanonicalArticle = {
  id: string;
  versionId: string;
  title: string;
  excerpt?: string;
  markdown: string;
  coverImage?: AssetReference;
  tags: string[];
  canonicalUrl?: string;
};
```

## Platform article

```ts
type PlatformArticle = {
  title: string;
  content: string;
  tags?: string[];
  description?: string;
  canonicalUrl?: string;
  metadata?: Record<string, unknown>;
};
```

## Overrides

Destination-level overrides may change:

```text
title
description
tags
canonical URL
provider-specific metadata
```

Do not duplicate entire canonical articles.

## Error mapping

Map provider errors into:

```text
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
VALIDATION_ERROR
RATE_LIMITED
NETWORK_ERROR
PROVIDER_5XX
TIMEOUT
NOT_FOUND
CONFLICT
UNSUPPORTED_OPERATION
UNKNOWN_OUTCOME
```

## Credentials

Adapters receive a connection credential abstraction.

They must not read arbitrary environment variables for tenant credentials.

## Provider registry

Use an explicit registry/factory:

```ts
getPlatformAdapter(provider);
```

Do not dynamically import arbitrary modules from untrusted input.

## First integrations

```text
ArtXFlow Blog
DEV.to
Hashnode
Medium
```

## Testing

Each adapter needs validation, transformation, capability, success mapping, error mapping, and mocked HTTP integration coverage.
