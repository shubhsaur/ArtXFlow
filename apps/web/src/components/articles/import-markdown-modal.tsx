'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface ImportMarkdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedMarkdown {
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  content: string;
  wordCount: number;
}

export function ImportMarkdownModal({ isOpen, onClose }: ImportMarkdownModalProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedMarkdown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.md') && !selectedFile.name.endsWith('.markdown')) {
      setError('Please upload a .md or .markdown file.');
      return;
    }
    setError(null);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawText = e.target?.result as string;
      try {
        let title = selectedFile.name.replace(/\.(md|markdown)$/i, '');
        let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        let excerpt = '';
        let tags: string[] = [];
        let body = rawText;

        // Simple frontmatter parser
        if (rawText.startsWith('---')) {
          const secondDashIndex = rawText.indexOf('---', 3);
          if (secondDashIndex !== -1) {
            const frontmatter = rawText.slice(3, secondDashIndex).trim();
            body = rawText.slice(secondDashIndex + 3).trim();

            const lines = frontmatter.split('\n');
            for (const line of lines) {
              const colonIndex = line.indexOf(':');
              if (colonIndex !== -1) {
                const key = line.slice(0, colonIndex).trim().toLowerCase();
                const val = line.slice(colonIndex + 1).trim().replace(/^['"]|['"]$/g, '');
                if (key === 'title' && val) title = val;
                if (key === 'slug' && val) slug = val;
                if (key === 'excerpt' && val) excerpt = val;
                if (key === 'tags' && val) {
                  tags = val
                    .replace(/^\[|\]$/g, '')
                    .split(',')
                    .map((t) => t.trim().replace(/^['"]|['"]$/g, ''))
                    .filter(Boolean);
                }
              }
            }
          }
        }

        const words = body.trim() ? body.trim().split(/\s+/).length : 0;

        setParsed({
          title,
          slug,
          excerpt,
          tags,
          content: body,
          wordCount: words,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to parse markdown file');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!parsed) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: parsed.title,
          slug: parsed.slug,
          excerpt: parsed.excerpt || undefined,
          content: parsed.content,
          metadata: { tags: parsed.tags },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create article from markdown');
      }

      const data = await res.json();
      onClose();
      router.push(`/articles/${data.article.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: '16px',
          backgroundColor: 'var(--surface-raised, #0D1420)',
          border: '1px solid var(--border-default, #243447)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle, #172333)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--flow-cyan, #19D7FE)' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)', margin: 0 }}>
              Import Markdown Article
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted, #66768D)',
              cursor: 'pointer',
              display: 'flex',
              padding: '4px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(217, 45, 32, 0.15)',
                border: '1px solid rgba(217, 45, 32, 0.4)',
                color: 'var(--status-error, #D92D20)',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {error}
            </div>
          )}

          {/* Upload Dropzone */}
          <label
            style={{
              border: '2px dashed var(--border-default, #243447)',
              borderRadius: '12px',
              padding: '28px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: 'var(--surface-base, #070B12)',
              transition: 'all 0.15s ease',
              textAlign: 'center',
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dropped = e.dataTransfer.files[0];
              if (dropped) handleFileChange(dropped);
            }}
          >
            <input
              type="file"
              accept=".md,.markdown,text/markdown"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) handleFileChange(selected);
              }}
              style={{ display: 'none' }}
            />
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--flow-cyan, #19D7FE)', marginBottom: '8px' }}>
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
              <path d="M12 12v9" />
              <path d="m16 16-4-4-4 4" />
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
              {file ? file.name : 'Choose a Markdown file or drag it here'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)', marginTop: '4px' }}>
              Supports frontmatter tags, slug, and YAML header (.md, .markdown)
            </span>
          </label>

          {/* Parsed Preview Card */}
          {parsed && (
            <div
              style={{
                backgroundColor: 'var(--surface-base, #070B12)',
                border: '1px solid var(--border-subtle, #172333)',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>{parsed.title}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--flow-cyan, #19D7FE)' }}>
                  {parsed.wordCount} words
                </span>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted, #66768D)', fontSize: '11px' }}>
                Slug: /{parsed.slug}
              </div>
              {parsed.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {parsed.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--surface-container, #1B2027)',
                        border: '1px solid var(--border-subtle, #172333)',
                        fontSize: '10px',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: 'var(--text-secondary, #AAB5C4)',
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '14px 20px',
            borderTop: '1px solid var(--border-subtle, #172333)',
            backgroundColor: 'var(--surface-base, #070B12)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-default, #243447)',
              color: 'var(--text-secondary, #AAB5C4)',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!parsed || isSubmitting}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              backgroundColor: '#0B62F5',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              cursor: !parsed || isSubmitting ? 'not-allowed' : 'pointer',
              opacity: !parsed || isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting ? 'Importing...' : 'Create & Open Editor'}
          </button>
        </div>
      </div>
    </div>
  );
}
