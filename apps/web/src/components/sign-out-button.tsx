'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@artxflow/ui';

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
      });
      router.push('/login');
      router.refresh();
    } catch {
      // Fallback redirect
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      loading={loading}
      onClick={handleSignOut}
      aria-label="Sign out of ArtXFlow"
    >
      Sign out
    </Button>
  );
}
