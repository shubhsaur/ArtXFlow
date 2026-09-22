import React from 'react';
import { PageLoader } from '@artxflow/ui';

export default function RootLoading() {
  return <PageLoader message="Loading ArtXFlow..." fullScreen={true} size="md" />;
}
