import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppHeader } from './app-header';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/dashboard',
}));

describe('AppHeader Component', () => {
  const defaultProps = {
    user: {
      id: 'usr_123',
      name: 'Sarah Connor',
      email: 'sarah@sky.net',
      image: null,
    },
    organization: {
      id: 'org_123',
      name: 'Resistance HQ',
    },
    membership: {
      role: 'OWNER',
    },
  };

  it('renders brand logo and organization metadata with app-header-brand-meta class', () => {
    const html = renderToStaticMarkup(<AppHeader {...defaultProps} />);
    expect(html).toContain('Resistance HQ');
    expect(html).toContain('OWNER');
    expect(html).toContain('class="app-header-brand-meta"');
  });

  it('renders desktop navigation links with app-header-nav class', () => {
    const html = renderToStaticMarkup(<AppHeader {...defaultProps} />);
    expect(html).toContain('class="app-header-nav"');
    expect(html).toContain('Dashboard');
    expect(html).toContain('Articles');
  });

  it('renders mobile hamburger toggle button with app-mobile-toggle md:hidden classes', () => {
    const html = renderToStaticMarkup(<AppHeader {...defaultProps} />);
    expect(html).toContain('class="app-mobile-toggle md:hidden"');
    expect(html).toContain('aria-label="Toggle App Menu"');
    expect(html).toContain('aria-expanded="false"');
  });

  it('does not render mobile drawer in initial closed state', () => {
    const html = renderToStaticMarkup(<AppHeader {...defaultProps} />);
    expect(html).not.toContain('app-mobile-drawer');
  });

  it('renders user details inside UserDropdown', () => {
    const html = renderToStaticMarkup(<AppHeader {...defaultProps} />);
    expect(html).toContain('Sarah Connor');
    expect(html).toContain('aria-label="User navigation menu"');
  });
});
