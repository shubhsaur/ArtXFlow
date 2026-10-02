'use client';

import React from 'react';
import {
  PlatformConnectionsView,
  type PlatformConnection,
} from './profile/platform-connections-view';

interface ConnectedPlatformsProps {
  initialConnections?: PlatformConnection[];
  workspaceName?: string;
}

export function ConnectedPlatforms({
  initialConnections,
  workspaceName,
}: ConnectedPlatformsProps) {
  return (
    <PlatformConnectionsView
      initialConnections={initialConnections}
      workspaceName={workspaceName}
    />
  );
}

export { PlatformConnectionsView };
export type { PlatformConnection };
