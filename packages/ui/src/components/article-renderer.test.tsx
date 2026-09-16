import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ArticleRenderer, safeUrlTransform } from './article-renderer';
import { ArticlePreview } from './article-preview';

describe('ArticleRenderer Component', () => {
  describe('Canonical Markdown Rendering', () => {
    it('renders empty content gracefully', () => {
      const html = renderToString(<ArticleRenderer content="" />);
      expect(html).toContain('No content to render.');
      expect(html).toContain('axf-empty-renderer');
    });

    it('renders headings with proper levels and typography styles', () => {
      const markdown = `
# Main Title
## Section Heading
### Subsection Heading
#### Deep Heading
##### Minor Heading
###### Micro Heading
`;
      const html = renderToString(<ArticleRenderer content={markdown} />);
      expect(html).toContain('<h1');
      expect(html).toContain('Main Title</h1>');
      expect(html).toContain('<h2');
      expect(html).toContain('Section Heading</h2>');
      expect(html).toContain('<h3');
      expect(html).toContain('Subsection Heading</h3>');
      expect(html).toContain('<h4');
      expect(html).toContain('Deep Heading</h4>');
      expect(html).toContain('<h5');
      expect(html).toContain('Minor Heading</h5>');
      expect(html).toContain('<h6');
      expect(html).toContain('Micro Heading</h6>');
    });

    it('renders paragraphs and formatting', () => {
      const markdown = `This is a paragraph with **bold text**, *italic text*, and ~~strikethrough~~.`;
      const html = renderToString(<ArticleRenderer content={markdown} />);
      expect(html).toContain('<p');
      expect(html).toContain('<strong');
      expect(html).toContain('bold text</strong>');
      expect(html).toContain('<em');
      expect(html).toContain('italic text</em>');
      expect(html).toContain('<del');
      expect(html).toContain('strikethrough</del>');
    });

    it('renders blockquotes with accent border styling', () => {
      const markdown = `> This is an important quote from ArtXFlow.`;
      const html = renderToString(<ArticleRenderer content={markdown} />);
      expect(html).toContain('<blockquote');
      expect(html).toContain('This is an important quote from ArtXFlow.');
    });

    it('renders unordered and ordered lists', () => {
      const markdown = `
- Item 1
- Item 2

1. First step
2. Second step
`;
      const html = renderToString(<ArticleRenderer content={markdown} />);
      expect(html).toContain('<ul');
      expect(html).toContain('<li');
      expect(html).toContain('Item 1');
      expect(html).toContain('<ol');
      expect(html).toContain('First step');
    });

    it('renders GFM tables with headers and rows', () => {
      const markdown = `
| Platform | Status |
| :--- | :--- |
| DEV.to | Connected |
| Medium | Pending |
`;
      const html = renderToString(<ArticleRenderer content={markdown} />);
      expect(html).toContain('<table');
      expect(html).toContain('<thead');
      expect(html).toContain('<th');
      expect(html).toContain('Platform');
      expect(html).toContain('Status');
      expect(html).toContain('<td');
      expect(html).toContain('DEV.to');
      expect(html).toContain('Connected');
    });

    it('renders inline code and fenced code blocks with language tag', () => {
      const markdown = `
Here is \`inlineCode()\` snippet.

\`\`\`typescript
const greeting: string = "Hello, ArtXFlow!";
console.log(greeting);
\`\`\`
`;
      const html = renderToString(<ArticleRenderer content={markdown} />);
      // Inline code
      expect(html).toContain('<code');
      expect(html).toContain('inlineCode()');
      // Fenced code block
      expect(html).toContain('axf-code-block');
      expect(html).toContain('typescript');
      expect(html).toContain('console.log(greeting);');
    });

    it('renders images with alt text and captions', () => {
      const markdown = `![Architecture Diagram](https://example.com/diagram.png "System Flow")`;
      const html = renderToString(<ArticleRenderer content={markdown} />);
      expect(html).toContain('<figure');
      expect(html).toContain('<img');
      expect(html).toContain('src="https://example.com/diagram.png"');
      expect(html).toContain('alt="Architecture Diagram"');
      expect(html).toContain('<figcaption');
      expect(html).toContain('System Flow');
    });
  });

  describe('Security & XSS Prevention', () => {
    it('does not evaluate raw script tags as executable DOM', () => {
      const malicious = `
# Unsafe Content
<script>alert('xss')</script>
`;
      const html = renderToString(<ArticleRenderer content={malicious} />);
      // Should not produce an unescaped <script> tag
      expect(html).not.toContain('<script>alert');
      // It should be safely escaped by React as text
      expect(html).toContain('&lt;script&gt;alert');
    });

    it('sanitizes javascript: links preventing execution', () => {
      const malicious = `[Click here for prize](javascript:alert('pwned'))`;
      const html = renderToString(<ArticleRenderer content={malicious} />);
      // href must not contain javascript:
      expect(html).not.toContain('href="javascript:');
    });

    it('sanitizes vbscript: and file: link schemes', () => {
      const maliciousVb = `[VBScript Link](vbscript:msgbox(1))`;
      const maliciousFile = `[Local File](file:///etc/passwd)`;

      const htmlVb = renderToString(<ArticleRenderer content={maliciousVb} />);
      expect(htmlVb).not.toContain('href="vbscript:');

      const htmlFile = renderToString(<ArticleRenderer content={maliciousFile} />);
      expect(htmlFile).not.toContain('href="file:');
    });

    it('sanitizes malicious image schemes while preserving safe images', () => {
      const maliciousImg = `![Bad](javascript:alert(1))`;
      const safeImg = `![Safe](https://cdn.artxflow.com/logo.png)`;

      const htmlBad = renderToString(<ArticleRenderer content={maliciousImg} />);
      expect(htmlBad).not.toContain('src="javascript:');

      const htmlSafe = renderToString(<ArticleRenderer content={safeImg} />);
      expect(htmlSafe).toContain('src="https://cdn.artxflow.com/logo.png"');
    });

    it('does not evaluate arbitrary inline event handlers', () => {
      const maliciousHtml = `<img src="x" onerror="alert('xss')" />`;
      const html = renderToString(<ArticleRenderer content={maliciousHtml} />);
      expect(html).not.toContain('onerror="alert');
      expect(html).toContain('&lt;img');
    });

    it('adds rel="noopener noreferrer" and target="_blank" to external links', () => {
      const markdown = `[Official Website](https://artxflow.com)`;
      const html = renderToString(<ArticleRenderer content={markdown} />);
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
      expect(html).toContain('href="https://artxflow.com"');
    });

    it('safeUrlTransform helper blocks dangerous schemes and allows safe schemes', () => {
      expect(safeUrlTransform('javascript:alert(1)')).toBe('');
      expect(safeUrlTransform('JAVASCRIPT:alert(1)')).toBe('');
      expect(safeUrlTransform('vbscript:run()')).toBe('');
      expect(safeUrlTransform('file:///etc/shadow')).toBe('');
      expect(safeUrlTransform('data:text/html,<script>alert(1)</script>')).toBe('');

      // Allowed schemes
      expect(safeUrlTransform('https://artxflow.com')).toBe('https://artxflow.com');
      expect(safeUrlTransform('http://localhost:3000')).toBe('http://localhost:3000');
      expect(safeUrlTransform('mailto:team@artxflow.com')).toBe('mailto:team@artxflow.com');
      expect(safeUrlTransform('/articles/123')).toBe('/articles/123');
      expect(safeUrlTransform('#heading-1')).toBe('#heading-1');
      expect(safeUrlTransform('data:image/png;base64,iVBOR...')).toBe(
        'data:image/png;base64,iVBOR...',
      );
    });
  });
});

describe('ArticlePreview Component', () => {
  it('renders preview with article title, subtitle, and metadata', () => {
    const html = renderToString(
      <ArticlePreview
        title="Distributing Developer Content with ArtXFlow"
        subtitle="A technical deep-dive into multi-destination publishing"
        content="Here is the canonical content of the article."
        tags={['architecture', 'typescript', 'distribution']}
        author={{ name: 'Shubham', email: 'shubham@example.com' }}
        canonicalUrl="https://artxflow.com/blog/distributing-developer-content"
      />,
    );

    expect(html).toContain('Distributing Developer Content with ArtXFlow');
    expect(html).toContain('A technical deep-dive into multi-destination publishing');
    expect(html).toContain('Shubham');
    expect(html).toContain('architecture');
    expect(html).toContain('typescript');
    expect(html).toContain('distribution');
    expect(html).toContain('https://artxflow.com/blog/distributing-developer-content');
    expect(html).toContain('Here is the canonical content of the article.');
  });

  it('renders cover image when provided', () => {
    const html = renderToString(
      <ArticlePreview
        title="Article With Cover"
        content="Body content"
        coverImageUrl="https://example.com/cover.jpg"
      />,
    );

    expect(html).toContain('axf-preview-cover');
    expect(html).toContain('src="https://example.com/cover.jpg"');
  });

  it('calculates reading time dynamically when not provided', () => {
    // 400 words = ~2 min read
    const longContent = Array(400).fill('word').join(' ');
    const html = renderToString(<ArticlePreview title="Long Article" content={longContent} />);

    expect(html).toContain('2 min read');
  });

  it('supports projection view mode changes and styling', () => {
    const htmlDevto = renderToString(
      <ArticlePreview
        title="Dev.to Preview Test"
        content="Hello world"
        viewMode="devto"
        tags={['webdev']}
      />,
    );

    expect(htmlDevto).toContain('axf-projection-devto');
    expect(htmlDevto).toContain('Simulated DEV.to Preview');
    expect(htmlDevto).toContain('#webdev');

    const htmlMedium = renderToString(
      <ArticlePreview title="Medium Preview Test" content="Hello world" viewMode="medium" />,
    );
    expect(htmlMedium).toContain('axf-projection-medium');
    expect(htmlMedium).toContain('Simulated Medium Preview');
  });
});
