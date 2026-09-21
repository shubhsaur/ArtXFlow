import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { UserDropdown } from './user-dropdown';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('UserDropdown', () => {
  const defaultProps = {
    userName: 'Shubham Saurabh',
    userEmail: 'shubham@artxflow.com',
    userImage: null,
    organizationName: 'Personal Space',
    role: 'OWNER',
  };

  it('renders trigger button with user display name and navigation aria attributes', () => {
    const html = renderToStaticMarkup(<UserDropdown {...defaultProps} />);

    expect(html).toContain('Shubham Saurabh');
    expect(html).toContain('aria-haspopup="true"');
    expect(html).toContain('aria-expanded="false"');
  });

  it('renders fallback display name from email when name is not provided', () => {
    const props = {
      ...defaultProps,
      userName: null,
      userEmail: 'alex.developer@artxflow.com',
    };

    const html = renderToStaticMarkup(<UserDropdown {...props} />);
    expect(html).toContain('alex.developer');
  });
});
