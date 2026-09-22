import React from 'react';
import { PageLoader } from '@artxflow/ui';

export default function AppLoading() {
  return (
    <div style={{ padding: '60px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <PageLoader message="Streaming workspace..." fullScreen={false} size="md" />
    </div>
  );
}
