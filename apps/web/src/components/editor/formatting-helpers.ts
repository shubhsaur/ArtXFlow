/**
 * Pure formatting helpers for the assisted article editor.
 * Operates on content strings and selection ranges, returning the new content
 * and new selection range so the editor can restore focus seamlessly.
 */

export interface FormattingResult {
  newContent: string;
  newSelectionStart: number;
  newSelectionEnd: number;
}

/**
 * Wraps or toggles inline formatting (bold **, italic *, code `, strikethrough ~~, underline <u></u>).
 */
export function applyInlineFormatting(
  content: string,
  start: number,
  end: number,
  prefix: string,
  suffix = prefix,
  placeholder = 'text',
): FormattingResult {
  const selectedText = content.substring(start, end);

  // Check if selection is already surrounded by prefix & suffix
  const isSurrounded =
    start >= prefix.length &&
    end + suffix.length <= content.length &&
    content.substring(start - prefix.length, start) === prefix &&
    content.substring(end, end + suffix.length) === suffix;

  if (isSurrounded) {
    // Unwrap / Toggle off
    const before = content.substring(0, start - prefix.length);
    const after = content.substring(end + suffix.length);
    const newContent = `${before}${selectedText}${after}`;
    const newStart = start - prefix.length;
    const newEnd = newStart + selectedText.length;
    return { newContent, newSelectionStart: newStart, newSelectionEnd: newEnd };
  }

  // If text is selected, wrap it
  if (selectedText.length > 0) {
    const before = content.substring(0, start);
    const after = content.substring(end);
    const newContent = `${before}${prefix}${selectedText}${suffix}${after}`;
    const newStart = start + prefix.length;
    const newEnd = newStart + selectedText.length;
    return { newContent, newSelectionStart: newStart, newSelectionEnd: newEnd };
  }

  // Nothing selected: insert prefix + placeholder + suffix, select placeholder
  const before = content.substring(0, start);
  const after = content.substring(end);
  const newContent = `${before}${prefix}${placeholder}${suffix}${after}`;
  const newStart = start + prefix.length;
  const newEnd = newStart + placeholder.length;
  return { newContent, newSelectionStart: newStart, newSelectionEnd: newEnd };
}

/**
 * Changes heading level for the current line (1 = #, 2 = ##, 3 = ###, 0 = regular paragraph).
 */
export function applyHeading(
  content: string,
  cursor: number,
  level: 1 | 2 | 3 | 0,
): FormattingResult {
  const lines = content.split('\n');
  let currentOffset = 0;
  let targetLineIndex = 0;
  let lineStartOffset = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineLengthWithNewline = lines[i].length + (i < lines.length - 1 ? 1 : 0);
    if (cursor >= currentOffset && cursor <= currentOffset + lineLengthWithNewline) {
      targetLineIndex = i;
      lineStartOffset = currentOffset;
      break;
    }
    currentOffset += lineLengthWithNewline;
  }

  const rawLine = lines[targetLineIndex] || '';
  // Strip existing heading markdown
  const strippedLine = rawLine.replace(/^#{1,6}\s+/, '');
  const prefix = level > 0 ? `${'#'.repeat(level)} ` : '';
  const updatedLine = `${prefix}${strippedLine}`;

  lines[targetLineIndex] = updatedLine;
  const newContent = lines.join('\n');
  const newCursor = lineStartOffset + updatedLine.length;

  return {
    newContent,
    newSelectionStart: newCursor,
    newSelectionEnd: newCursor,
  };
}

/**
 * Toggles blockquote (>) on the current line or selection.
 */
export function applyBlockquote(
  content: string,
  start: number,
  end: number,
): FormattingResult {
  const before = content.substring(0, start);
  const selectedText = content.substring(start, end);
  const after = content.substring(end);

  if (selectedText.length > 0) {
    const lines = selectedText.split('\n');
    const isAllQuoted = lines.every((l) => l.startsWith('> ') || l.trim() === '');
    const updatedLines = isAllQuoted
      ? lines.map((l) => (l.startsWith('> ') ? l.substring(2) : l))
      : lines.map((l) => (l.trim() ? `> ${l}` : l));
    const joined = updatedLines.join('\n');
    const newContent = `${before}${joined}${after}`;
    return {
      newContent,
      newSelectionStart: start,
      newSelectionEnd: start + joined.length,
    };
  }

  // Single cursor position
  const prefix = before.length > 0 && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
  const snippet = '> Quote text here\n';
  const newContent = `${before}${prefix}${snippet}${after}`;
  const quoteTextStart = before.length + prefix.length + 2;
  return {
    newContent,
    newSelectionStart: quoteTextStart,
    newSelectionEnd: quoteTextStart + 15,
  };
}

/**
 * Toggles bullet or numbered list on the selected lines or cursor position.
 */
export function applyList(
  content: string,
  start: number,
  end: number,
  type: 'bullet' | 'number',
): FormattingResult {
  const before = content.substring(0, start);
  const selectedText = content.substring(start, end);
  const after = content.substring(end);

  if (selectedText.length > 0) {
    const lines = selectedText.split('\n');
    const updatedLines = lines.map((line, idx) => {
      const clean = line.replace(/^([-*+]|\d+\.)\s+/, '');
      if (!clean.trim()) return line;
      return type === 'bullet' ? `- ${clean}` : `${idx + 1}. ${clean}`;
    });
    const joined = updatedLines.join('\n');
    const newContent = `${before}${joined}${after}`;
    return {
      newContent,
      newSelectionStart: start,
      newSelectionEnd: start + joined.length,
    };
  }

  const prefix = before.length > 0 && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
  const snippet = type === 'bullet' ? '- List item\n' : '1. List item\n';
  const newContent = `${before}${prefix}${snippet}${after}`;
  const textStart = before.length + prefix.length + (type === 'bullet' ? 2 : 3);
  return {
    newContent,
    newSelectionStart: textStart,
    newSelectionEnd: textStart + 9,
  };
}

/**
 * Wraps or inserts a fenced code block with an optional language identifier.
 */
export function applyCodeBlock(
  content: string,
  start: number,
  end: number,
  language = 'typescript',
): FormattingResult {
  const before = content.substring(0, start);
  const selectedText = content.substring(start, end);
  const after = content.substring(end);

  const prefix = before.length > 0 && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
  const suffix = after.length > 0 && !after.startsWith('\n\n') ? (after.startsWith('\n') ? '\n' : '\n\n') : '';

  const codeBody = selectedText.trim() || '// write your code here';
  const block = `\`\`\`${language}\n${codeBody}\n\`\`\``;
  const newContent = `${before}${prefix}${block}${suffix}${after}`;

  const codeStart = before.length + prefix.length + 3 + language.length + 1;
  return {
    newContent,
    newSelectionStart: codeStart,
    newSelectionEnd: codeStart + codeBody.length,
  };
}

/**
 * Inserts a hyperlink with URL and text.
 */
export function applyLink(
  content: string,
  start: number,
  end: number,
  url: string,
  linkText?: string,
): FormattingResult {
  const before = content.substring(0, start);
  const selectedText = content.substring(start, end);
  const after = content.substring(end);

  const text = (linkText || selectedText || 'link title').trim();
  const linkSnippet = `[${text}](${url.trim() || 'https://'})`;
  const newContent = `${before}${linkSnippet}${after}`;

  return {
    newContent,
    newSelectionStart: before.length + 1,
    newSelectionEnd: before.length + 1 + text.length,
  };
}

/**
 * Inserts a line divider (---).
 */
export function applyDivider(content: string, cursor: number): FormattingResult {
  const before = content.substring(0, cursor);
  const after = content.substring(cursor);

  const prefix = before.length > 0 && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
  const suffix = after.length > 0 && !after.startsWith('\n\n') ? (after.startsWith('\n') ? '\n' : '\n\n') : '';
  const snippet = '---';
  const newContent = `${before}${prefix}${snippet}${suffix}${after}`;
  const newPos = before.length + prefix.length + snippet.length + suffix.length;

  return {
    newContent,
    newSelectionStart: newPos,
    newSelectionEnd: newPos,
  };
}

/**
 * Generates an aligned markdown table skeleton.
 */
export function applyTable(content: string, cursor: number): FormattingResult {
  const before = content.substring(0, cursor);
  const after = content.substring(cursor);

  const prefix = before.length > 0 && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
  const suffix = after.length > 0 && !after.startsWith('\n\n') ? (after.startsWith('\n') ? '\n' : '\n\n') : '';

  const tableSkeleton = [
    '| Header 1 | Header 2 | Header 3 |',
    '| :--- | :--- | :--- |',
    '| Item 1   | Item 2   | Item 3   |',
    '| Item 4   | Item 5   | Item 6   |',
  ].join('\n');

  const newContent = `${before}${prefix}${tableSkeleton}${suffix}${after}`;
  const newPos = before.length + prefix.length;

  return {
    newContent,
    newSelectionStart: newPos + 2,
    newSelectionEnd: newPos + 10,
  };
}

/**
 * Calculates document statistics: word count, character count, and estimated reading time.
 */
export function calculateReadingStats(content: string): {
  words: number;
  characters: number;
  readingTimeMinutes: number;
} {
  const clean = content.replace(/[#*`_~>[\]()]/g, ' ').trim();
  const characters = content.length;
  if (!clean) {
    return { words: 0, characters: 0, readingTimeMinutes: 1 };
  }
  const words = clean.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
  return { words, characters, readingTimeMinutes };
}

export interface PublisherReadiness {
  devto: { ready: boolean; issues: string[] };
  medium: { ready: boolean; issues: string[] };
  hashnode: { ready: boolean; issues: string[] };
}

/**
 * Live multi-platform compatibility check against platform rules.
 */
export function checkPublisherReadiness(
  title: string,
  tags: string[],
  content: string,
  coverImageUrl?: string | null,
): PublisherReadiness {
  const devtoIssues: string[] = [];
  const mediumIssues: string[] = [];
  const hashnodeIssues: string[] = [];

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();

  // DEV.to rules
  if (!trimmedTitle) devtoIssues.push('Title required');
  else if (trimmedTitle.length > 100) devtoIssues.push('Title exceeds 100 chars (max 100)');
  if (tags.length > 4) devtoIssues.push('Exceeds 4 tags limit (max 4)');
  if (!trimmedContent) devtoIssues.push('Content required');
  if (!coverImageUrl) devtoIssues.push('Cover image recommended');

  // Medium rules
  if (!trimmedTitle) mediumIssues.push('Title required');
  else if (trimmedTitle.length > 100) mediumIssues.push('Title exceeds 100 chars (max 100)');
  if (tags.length > 5) mediumIssues.push('Exceeds 5 tags limit (max 5)');
  for (const tag of tags) {
    if (tag.length > 25) mediumIssues.push(`Tag "${tag}" exceeds 25 chars`);
  }
  if (!trimmedContent) mediumIssues.push('Content required');

  // Hashnode rules
  if (!trimmedTitle) hashnodeIssues.push('Title required');
  if (!trimmedContent) hashnodeIssues.push('Content required');

  return {
    devto: { ready: devtoIssues.length === 0, issues: devtoIssues },
    medium: { ready: mediumIssues.length === 0, issues: mediumIssues },
    hashnode: { ready: hashnodeIssues.length === 0, issues: hashnodeIssues },
  };
}
