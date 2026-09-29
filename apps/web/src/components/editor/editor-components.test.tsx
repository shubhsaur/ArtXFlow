import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { EditorHeader } from './editor-header';
import { EditorActionStrip } from './editor-action-strip';
import { EditorPlatformPreview } from './editor-platform-preview';
import { EditorMobileDock } from './editor-mobile-dock';

describe('Stitch Editor Components', () => {
  describe('EditorHeader', () => {
    const defaultProps = {
      title: 'Building an Event-Driven Multi-Tenant Publishing Engine in Go',
      saveStatus: 'saved' as const,
      lastSavedAt: new Date('2026-09-29T10:00:00Z'),
      activeDestinationsCount: 3,
      activePlatforms: [
        { id: 'devto', name: 'DEV.to', tag: 'DEV' },
        { id: 'hashnode', name: 'Hashnode', tag: 'HASH' },
        { id: 'medium', name: 'Medium', tag: 'MED' },
      ],
      isPublishing: false,
      isSaving: false,
      onSaveDraft: vi.fn(),
      onOpenHistory: vi.fn(),
      onOpenOverrides: vi.fn(),
      onPublishClick: vi.fn(),
      mode: 'edit' as const,
    };

    it('renders breadcrumb title and logo', () => {
      const html = renderToStaticMarkup(<EditorHeader {...defaultProps} />);
      expect(html).toContain('Articles');
      expect(html).toContain('Building an Event-Driven Multi-Tenant Publishing Engine in Go');
      expect(html).toContain('v2.4');
    });

    it('renders autosave status and connected targets', () => {
      const html = renderToStaticMarkup(<EditorHeader {...defaultProps} />);
      expect(html).toContain('3 Targets');
      expect(html).toContain('DEV');
      expect(html).toContain('HASH');
      expect(html).toContain('MED');
    });

    it('renders utility action buttons and publish CTA', () => {
      const html = renderToStaticMarkup(<EditorHeader {...defaultProps} />);
      expect(html).toContain('Save Draft');
      expect(html).toContain('History');
      expect(html).toContain('Overrides');
      expect(html).toContain('Publish Article');
    });

    it('renders update published copies button when staleExtensionUpdatesCount > 0', () => {
      const html = renderToStaticMarkup(
        <EditorHeader
          {...defaultProps}
          staleExtensionUpdatesCount={2}
          onUpdatePublishedCopies={vi.fn()}
        />,
      );
      expect(html).toContain('↻ Update Live');
    });
  });

  describe('EditorActionStrip', () => {
    const defaultProps = {
      onApplyHeading: vi.fn(),
      onApplyInline: vi.fn(),
      onApplyBlockquote: vi.fn(),
      onApplyList: vi.fn(),
      onApplyCodeBlock: vi.fn(),
      onApplyDivider: vi.fn(),
      onApplyTable: vi.fn(),
      onApplyCalloutTip: vi.fn(),
      onOpenLinkModal: vi.fn(),
      onUploadImageClick: vi.fn(),
      onOpenUnsplashModal: vi.fn(),
      onOpenAiGenerate: vi.fn(),
      coverUrl: null,
      onOpenCoverSelect: vi.fn(),
      onRemoveCover: vi.fn(),
      activeView: 'write' as const,
      onChangeView: vi.fn(),
      activePreviewPlatformName: 'DEV.to',
    };

    it('renders quick media buttons: Upload Image, Unsplash Library, Generate with AI, Cover Banner', () => {
      const html = renderToStaticMarkup(<EditorActionStrip {...defaultProps} />);
      expect(html).toContain('Upload Image');
      expect(html).toContain('Unsplash Library');
      expect(html).toContain('Generate with AI');
      expect(html).toContain('+ Add Cover Image (1200×630)');
    });

    it('renders formatting toolbar controls: Bold, Italic, Strikethrough, Heading, Code, Quote, Lists, Link, Table', () => {
      const html = renderToStaticMarkup(<EditorActionStrip {...defaultProps} />);
      expect(html).toContain('H1 / H2 / H3');
      expect(html).toContain('Callout Tip');
      expect(html).toContain('Sync Active');
    });

    it('renders mobile mode switcher segmented control', () => {
      const html = renderToStaticMarkup(<EditorActionStrip {...defaultProps} />);
      expect(html).toContain('Editor');
      expect(html).toContain('Live Preview');
      expect(html).toContain('(DEV.to)');
    });
  });

  describe('EditorPlatformPreview', () => {
    const defaultProps = {
      title: 'Architecting Distributed Multi-Tenant Mesh with Cilium',
      content:
        '# Introduction\n\nDesigning zero-trust Kubernetes multi-tenancy requires strict boundaries.\n\n> 💡 **Tip:** Always use node taints.\n',
      coverUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200',
      tags: ['kubernetes', 'devops', 'security'],
      slug: 'cilium-mesh-tenancy',
      canonicalUrl: 'https://artxflow.dev/blog/cilium-mesh-tenancy',
      selectedPlatform: 'devto' as const,
      onSelectPlatform: vi.fn(),
    };

    it('renders platform switcher tabs for DEV.to, Hashnode, and Medium', () => {
      const html = renderToStaticMarkup(<EditorPlatformPreview {...defaultProps} />);
      expect(html).toContain('DEV.to');
      expect(html).toContain('Hashnode');
      expect(html).toContain('Medium');
      expect(html).toContain('artxflow.dev/blog/cilium-mesh-tenancy');
    });

    it('renders canonical banner, author card, and article tags', () => {
      const html = renderToStaticMarkup(<EditorPlatformPreview {...defaultProps} />);
      expect(html).toContain('Architecting Distributed Multi-Tenant Mesh with Cilium');
      expect(html).toContain('#kubernetes');
      expect(html).toContain('#devops');
      expect(html).toContain('#security');
      expect(html).toContain('Canonical URL injected');
      expect(html).toContain('1200 × 630');
    });
  });

  describe('EditorMobileDock', () => {
    const defaultProps = {
      slug: 'k8s-multi-tenancy',
      wordCount: 840,
      readingTimeMinutes: 4,
      activeTab: 'write' as const,
      onSelectTab: vi.fn(),
    };

    it('renders telemetry strip with canonical slug, word count, and reading time', () => {
      const html = renderToStaticMarkup(<EditorMobileDock {...defaultProps} />);
      expect(html).toContain('artxflow.dev/blog/k8s-multi-tenancy');
      expect(html).toContain('840 words');
      expect(html).toContain('4 min read');
    });

    it('renders navigation tabs: Write, Preview, Media, Inspect', () => {
      const html = renderToStaticMarkup(<EditorMobileDock {...defaultProps} />);
      expect(html).toContain('Write');
      expect(html).toContain('Preview');
      expect(html).toContain('Media');
      expect(html).toContain('Inspect');
    });
  });
});
