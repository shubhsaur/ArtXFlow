'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface ArticleRendererProps {
  content: string;
  className?: string;
}

/**
 * Validates and transforms URLs to protect against script injection
 * and untrusted protocol schemes (e.g., javascript:, vbscript:, arbitrary data:).
 */
export function safeUrlTransform(url: string): string {
  const trimmed = url.trim();
  const lowercase = trimmed.toLowerCase();

  if (
    lowercase.startsWith('javascript:') ||
    lowercase.startsWith('vbscript:') ||
    lowercase.startsWith('file:')
  ) {
    return '';
  }

  // Allow data: URIs only if they are safe raster/vector image formats
  if (lowercase.startsWith('data:')) {
    if (
      lowercase.startsWith('data:image/png') ||
      lowercase.startsWith('data:image/jpeg') ||
      lowercase.startsWith('data:image/jpg') ||
      lowercase.startsWith('data:image/webp') ||
      lowercase.startsWith('data:image/gif') ||
      lowercase.startsWith('data:image/svg+xml')
    ) {
      return trimmed;
    }
    return '';
  }

  return trimmed;
}

interface CodeBlockProps {
  className?: string;
  children?: React.ReactNode;
}

function CodeBlock({ className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';
  const codeString = String(children || '').replace(/\n$/, '');

  const handleCopy = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback or ignore clipboard permission errors
      }
    }
  };

  return (
    <div
      className="axf-code-block"
      style={{
        margin: '20px 0',
        borderRadius: 'var(--radius-md, 8px)',
        border: '1px solid var(--border, #1C2A3A)',
        background: 'var(--surface, #0D1420)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          background: 'var(--surface-elevated, #131E2F)',
          borderBottom: '1px solid var(--border-subtle, #142232)',
          fontSize: '12px',
          fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
          color: 'var(--text-tertiary, #718096)',
        }}
      >
        <span style={{ textTransform: 'lowercase', fontWeight: 600 }}>{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          style={{
            background: 'transparent',
            border: '1px solid var(--border, #1C2A3A)',
            borderRadius: 'var(--radius-sm, 4px)',
            color: copied ? 'var(--axf-cyan, #19D7FE)' : 'var(--text-secondary, #AAB5C4)',
            padding: '2px 8px',
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontFamily: 'inherit',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: '16px',
          overflowX: 'auto',
          fontSize: '13.5px',
          lineHeight: '1.6',
          fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
          color: 'var(--text-primary, #F5F7FA)',
        }}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
}

export const ArticleRenderer: React.FC<ArticleRendererProps> = ({ content, className = '' }) => {
  if (!content || !content.trim()) {
    return (
      <div
        className={`axf-article-renderer axf-empty-renderer ${className}`}
        style={{
          padding: '32px 0',
          color: 'var(--text-tertiary, #718096)',
          fontStyle: 'italic',
          textAlign: 'center',
        }}
      >
        No content to render.
      </div>
    );
  }

  return (
    <div
      className={`axf-article-renderer ${className}`}
      style={{
        fontFamily: "var(--font-sans, 'Geist', -apple-system, sans-serif)",
        color: 'var(--text-primary, #F5F7FA)',
        lineHeight: 1.7,
        fontSize: '16px',
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={safeUrlTransform}
        components={{
          h1: ({ children }) => (
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary, #F5F7FA)',
                marginTop: '28px',
                marginBottom: '14px',
                paddingBottom: '10px',
                borderBottom: '1px solid var(--border-subtle, #142232)',
              }}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 650,
                lineHeight: 1.25,
                letterSpacing: '-0.015em',
                color: 'var(--text-primary, #F5F7FA)',
                marginTop: '24px',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border-subtle, #142232)',
              }}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 600,
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
                color: 'var(--text-primary, #F5F7FA)',
                marginTop: '20px',
                marginBottom: '10px',
              }}
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4
              style={{
                fontSize: '17px',
                fontWeight: 600,
                lineHeight: 1.35,
                color: 'var(--text-primary, #F5F7FA)',
                marginTop: '16px',
                marginBottom: '8px',
              }}
            >
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5
              style={{
                fontSize: '15px',
                fontWeight: 600,
                lineHeight: 1.4,
                color: 'var(--text-primary, #F5F7FA)',
                marginTop: '14px',
                marginBottom: '6px',
              }}
            >
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6
              style={{
                fontSize: '13px',
                fontWeight: 600,
                lineHeight: 1.4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-secondary, #AAB5C4)',
                marginTop: '12px',
                marginBottom: '4px',
              }}
            >
              {children}
            </h6>
          ),
          p: ({ children }) => (
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.7,
                color: 'var(--text-primary, #F5F7FA)',
                marginTop: 0,
                marginBottom: '16px',
              }}
            >
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target={href && href.startsWith('#') ? undefined : '_blank'}
              rel={href && href.startsWith('#') ? undefined : 'noopener noreferrer'}
              style={{
                color: 'var(--axf-blue, #0B87FE)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                fontWeight: 500,
                transition: 'color 0.15s ease',
              }}
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote
              style={{
                borderLeft: '3px solid var(--axf-cyan, #19D7FE)',
                background: 'rgba(25, 215, 254, 0.04)',
                padding: '12px 18px',
                margin: '18px 0',
                borderRadius: '0 var(--radius-md, 8px) var(--radius-md, 8px) 0',
                fontStyle: 'italic',
                color: 'var(--text-secondary, #AAB5C4)',
              }}
            >
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul
              style={{
                listStyleType: 'disc',
                paddingLeft: '24px',
                marginTop: 0,
                marginBottom: '16px',
                color: 'var(--text-primary, #F5F7FA)',
              }}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              style={{
                listStyleType: 'decimal',
                paddingLeft: '24px',
                marginTop: 0,
                marginBottom: '16px',
                color: 'var(--text-primary, #F5F7FA)',
              }}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li
              style={{
                marginTop: '4px',
                marginBottom: '4px',
                lineHeight: 1.6,
              }}
            >
              {children}
            </li>
          ),
          code: ({ className, children, ...props }) => {
            // If code has a className or multiline content, render full CodeBlock
            const isMultiline = typeof children === 'string' && children.includes('\n');
            const hasLanguage = Boolean(className && className.includes('language-'));

            if (hasLanguage || isMultiline) {
              return <CodeBlock className={className}>{children}</CodeBlock>;
            }

            return (
              <code
                {...props}
                style={{
                  background: 'rgba(208, 217, 229, 0.08)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm, 4px)',
                  fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
                  fontSize: '0.875em',
                  color: 'var(--axf-cyan, #19D7FE)',
                  border: '1px solid var(--border-subtle, #142232)',
                }}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => {
            // react-markdown nests <code> inside <pre>. Return children directly so CodeBlock can manage layout
            return <>{children}</>;
          },
          img: ({ src, alt, title }) => {
            if (!src) return null;
            return (
              <figure style={{ margin: '24px 0', textAlign: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt || ''}
                  title={title || undefined}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: '1px solid var(--border-subtle, #142232)',
                    display: 'inline-block',
                  }}
                />
                {(alt || title) && (
                  <figcaption
                    style={{
                      marginTop: '8px',
                      fontSize: '13px',
                      color: 'var(--text-tertiary, #718096)',
                      fontStyle: 'italic',
                    }}
                  >
                    {title || alt}
                  </figcaption>
                )}
              </figure>
            );
          },
          table: ({ children }) => (
            <div
              style={{
                overflowX: 'auto',
                margin: '20px 0',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border, #1C2A3A)',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '14px',
                }}
              >
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead
              style={{
                background: 'var(--surface-elevated, #131E2F)',
                borderBottom: '1px solid var(--border, #1C2A3A)',
              }}
            >
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th
              style={{
                padding: '10px 14px',
                fontWeight: 600,
                color: 'var(--text-primary, #F5F7FA)',
                fontFamily: "var(--font-sans, 'Geist', sans-serif)",
              }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid var(--border-subtle, #142232)',
                color: 'var(--text-secondary, #AAB5C4)',
              }}
            >
              {children}
            </td>
          ),
          hr: () => (
            <hr
              style={{
                border: 0,
                borderTop: '1px solid var(--border, #1C2A3A)',
                margin: '28px 0',
              }}
            />
          ),
          strong: ({ children }) => (
            <strong
              style={{
                fontWeight: 650,
                color: 'var(--text-primary, #F5F7FA)',
              }}
            >
              {children}
            </strong>
          ),
          em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
          del: ({ children }) => (
            <del
              style={{
                textDecoration: 'line-through',
                color: 'var(--text-tertiary, #718096)',
              }}
            >
              {children}
            </del>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
