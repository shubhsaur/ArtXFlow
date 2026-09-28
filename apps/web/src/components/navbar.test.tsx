import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Navbar } from './navbar';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('Navbar Component', () => {
  it('renders desktop navigation links with responsive header-nav-links class', () => {
    const html = renderToStaticMarkup(<Navbar />);
    expect(html).toContain('class="header-nav-links"');
    expect(html).toContain('Features');
    expect(html).toContain('Adapters');
    expect(html).toContain('Compare');
    expect(html).toContain('Architecture');
  });

  it('renders open source badge with header-open-source-badge class to hide on mobile', () => {
    const html = renderToStaticMarkup(<Navbar />);
    expect(html).toContain('class="header-open-source-badge"');
    expect(html).toContain('Open Source');
  });

  it('renders desktop auth actions with header-desktop-auth class to hide on mobile', () => {
    const html = renderToStaticMarkup(<Navbar />);
    expect(html).toContain('class="header-desktop-auth"');
    expect(html).toContain('Sign In');
    expect(html).toContain('Launch');
  });

  it('renders mobile hamburger toggle button with header-mobile-toggle and md:hidden classes', () => {
    const html = renderToStaticMarkup(<Navbar />);
    expect(html).toContain('class="header-mobile-toggle md:hidden"');
    expect(html).toContain('aria-label="Toggle Navigation Menu"');
    expect(html).toContain('aria-expanded="false"');
  });

  it('does not render mobile menu drawer in initial closed state', () => {
    const html = renderToStaticMarkup(<Navbar />);
    expect(html).not.toContain('header-mobile-drawer');
  });

  it('renders user details when logged in', () => {
    const html = renderToStaticMarkup(
      <Navbar
        user={{
          id: 'usr_1',
          name: 'Jane Doe',
          email: 'jane@example.com',
          image: null,
        }}
        organizationName="Acme Inc"
        role="OWNER"
      />,
    );
    expect(html).toContain('Dashboard');
    expect(html).toContain('Jane Doe');
    expect(html).toContain('header-desktop-auth');
  });
});
