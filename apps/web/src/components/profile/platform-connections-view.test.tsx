import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  PlatformConnectionsView,
  type PlatformConnection,
} from './platform-connections-view';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockConnections: PlatformConnection[] = [
  {
    id: 'conn-devto-1',
    organizationId: 'org-1',
    provider: 'devto',
    status: 'CONNECTED',
    accounts: [
      {
        externalId: 'devto-user-1',
        username: 'alice_dev',
        displayName: 'Alice Developer',
      },
    ],
  },
  {
    id: 'conn-hashnode-1',
    organizationId: 'org-1',
    provider: 'hashnode',
    status: 'CONNECTED',
    tokenMetadata: {
      hashnodePublishMode: 'extension',
    },
    accounts: [
      {
        externalId: 'hn-user-1',
        username: 'alice_hn',
        displayName: 'Alice on Hashnode',
      },
    ],
  },
  {
    id: 'conn-medium-1',
    organizationId: 'org-1',
    provider: 'medium',
    status: 'CONNECTED',
    tokenMetadata: {
      mediumPublishMode: 'extension',
    },
    accounts: [
      {
        externalId: 'medium-user-1',
        username: 'alicedev',
        displayName: 'Alice',
      },
    ],
  },
];

describe('PlatformConnectionsView Component', () => {
  it('renders top breadcrumb, title, and description correctly', () => {
    const html = renderToStaticMarkup(
      <PlatformConnectionsView
        initialConnections={mockConnections}
        workspaceName="ArtXFlow Engineering"
      />,
    );

    expect(html).toContain('Workspace Settings');
    expect(html).toContain('Platform Connections');
    expect(html).toContain('Publishing Platform Credentials');
    expect(html).toContain('Configure authenticated endpoints');
  });

  it('renders cluster health & latency telemetry banner with operational status', () => {
    const html = renderToStaticMarkup(
      <PlatformConnectionsView initialConnections={mockConnections} />,
    );

    expect(html).toContain('CONNECTIONS CLUSTER HEALTH');
    expect(html).toContain('Operational');
    expect(html).toContain('AVG FAN-OUT LATENCY');
    expect(html).toContain('DISPATCH QUEUE');
    expect(html).toContain('4 of 6 Connected');
    expect(html).toContain('0 pending');
  });

  it('renders all 6 platform adapter cards (DEV, Hashnode, Medium, GitHub, Ghost, Substack)', () => {
    const html = renderToStaticMarkup(
      <PlatformConnectionsView initialConnections={mockConnections} />,
    );

    // DEV Community
    expect(html).toContain('DEV Community (DEV.to)');
    expect(html).toContain('Official Forem API Dispatch Adapter');

    // Hashnode
    expect(html).toContain('Hashnode');
    expect(html).toContain('GraphQL Publication Gateway');

    // Medium
    expect(html).toContain('Medium');
    expect(html).toContain('Browser Companion Bridge');

    // GitHub
    expect(html).toContain('GitHub Repositories');
    expect(html).toContain('GitOps Markdown Sync &amp; Storage');

    // Ghost CMS
    expect(html).toContain('Ghost CMS');
    expect(html).toContain('Self-Hosted / Managed Instance');
    expect(html).toContain('Pending Auth');

    // Substack
    expect(html).toContain('Substack');
    expect(html).toContain('Newsletter RSS Ingestion Bridge');
    expect(html).toContain('Disconnected');
  });

  it('renders filter controls and hardware enclave security indicator', () => {
    const html = renderToStaticMarkup(
      <PlatformConnectionsView initialConnections={mockConnections} />,
    );

    expect(html).toContain('All Adapters');
    expect(html).toContain('Pending Auth');
    expect(html).toContain('Credentials are encrypted via AES-256-GCM hardware enclave');
  });

  it('renders CTAs for Test All Pings and Save Credentials', () => {
    const html = renderToStaticMarkup(
      <PlatformConnectionsView initialConnections={mockConnections} />,
    );

    expect(html).toContain('Test All Pings');
    expect(html).toContain('Save Credentials');
  });

  it('renders rate limit reservoir and ping latency indicators', () => {
    const html = renderToStaticMarkup(
      <PlatformConnectionsView initialConnections={mockConnections} />,
    );

    expect(html).toContain('Rate limit reservoir:');
    expect(html).toContain('28 / 30 req (30s window)');
    expect(html).toContain('platform-rate-bar-track');
    expect(html).toContain('Test Ping');
  });

  it('renders adapter routing config accordion container with copy spec trigger', () => {
    const html = renderToStaticMarkup(
      <PlatformConnectionsView initialConnections={mockConnections} />,
    );

    expect(html).toContain('Adapter Routing Config');
    expect(html).toContain('artxflow.config.json');
    expect(html).toContain('Compiled routing');
  });
});
