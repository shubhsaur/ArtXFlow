import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Button, Card, CardTitle, Avatar, Badge, Logo, ThemeToggle, PageLoader } from './index';

describe('UI Component Library', () => {
  describe('ThemeToggle', () => {
    it('renders theme toggle button with accessibility labels', () => {
      const html = renderToString(<ThemeToggle />);
      expect(html).toContain('axf-theme-toggle');
      expect(html).toContain('button');
    });

    it('renders different size variants correctly', () => {
      const smallHtml = renderToString(<ThemeToggle size="sm" />);
      const largeHtml = renderToString(<ThemeToggle size="lg" />);
      expect(smallHtml).toContain('width:32px');
      expect(largeHtml).toContain('width:44px');
    });
  });

  describe('Button', () => {
    it('renders with children and default variant', () => {
      const html = renderToString(<Button>Click me</Button>);
      expect(html).toContain('Click me');
      expect(html).toContain('axf-button');
    });

    it('renders disabled attribute and loading state', () => {
      const html = renderToString(<Button loading>Processing</Button>);
      expect(html).toContain('disabled=""');
      expect(html).toContain('aria-busy="true"');
    });
  });

  describe('Card', () => {
    it('renders card with title and content', () => {
      const html = renderToString(
        <Card>
          <CardTitle>Article Analytics</CardTitle>
        </Card>,
      );
      expect(html).toContain('Article Analytics');
      expect(html).toContain('axf-card');
      expect(html).toContain('axf-card-title');
    });
  });

  describe('Avatar', () => {
    it('renders initials from full name when image is not provided', () => {
      const html = renderToString(<Avatar name="Jane Doe" />);
      expect(html).toContain('JD');
    });

    it('falls back to single initial or question mark when name is empty', () => {
      const html = renderToString(<Avatar />);
      expect(html).toContain('?');
    });
  });

  describe('Badge', () => {
    it('renders role badge with appropriate variant style', () => {
      const html = renderToString(<Badge variant="success">OWNER</Badge>);
      expect(html).toContain('OWNER');
      expect(html).toContain('axf-badge');
    });
  });

  describe('Logo', () => {
    it('renders brand logo image and brand wordmark with gradient X', () => {
      const html = renderToString(<Logo />);
      expect(html).toContain('<img');
      expect(html).toContain('src="/logo.png"');
      expect(html).toContain('Art');
      expect(html).toContain('X');
      expect(html).toContain('Flow');
      expect(html).toContain('linear-gradient(135deg');
    });
  });

  describe('PageLoader', () => {
    it('renders with status role and custom message', () => {
      const html = renderToString(<PageLoader message="Connecting platforms..." />);
      expect(html).toContain('role="status"');
      expect(html).toContain('Connecting platforms...');
      expect(html).toContain('axf-page-loader');
    });
  });
});

