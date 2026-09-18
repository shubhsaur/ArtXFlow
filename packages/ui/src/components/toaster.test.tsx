import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { toast, dismissToast, Toaster } from './toaster';

describe('Toaster & toast notification system', () => {
  beforeEach(() => {
    dismissToast();
    vi.clearAllTimers();
  });

  it('creates toasts imperatively with appropriate types', () => {
    const successId = toast.success('Platform connected');
    expect(successId).toBeTruthy();

    const errorId = toast.error('Publish failed');
    expect(errorId).toBeTruthy();

    const infoId = toast.info('Loading extension');
    expect(infoId).toBeTruthy();

    const warnId = toast.warning('Missing configuration');
    expect(warnId).toBeTruthy();
  });

  it('dismisses a single toast by id and dismisses all when no id passed', () => {
    const id1 = toast.success('Message 1');
    const id2 = toast.info('Message 2');

    dismissToast(id1);
    // Dismissing nonexistent or remaining works
    dismissToast(id2);
    dismissToast();
  });

  it('renders Toaster component to string without crashing', () => {
    toast.success('Test notification', { description: 'Detailed info' });
    const html = renderToString(<Toaster position="bottom-right" />);
    expect(html).toContain('aria-label="Notifications"');
    expect(html).toContain('Test notification');
    expect(html).toContain('Detailed info');
  });

  it('renders different positions', () => {
    const htmlTop = renderToString(<Toaster position="top-right" />);
    expect(htmlTop).toContain('aria-label="Notifications"');
  });
});
