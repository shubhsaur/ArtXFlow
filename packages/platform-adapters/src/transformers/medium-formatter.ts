/**
 * Medium Markdown Formatter.
 * Addresses observed Medium platform incompatibilities:
 * 1. Medium does NOT support HTML <table> or Markdown tables natively.
 *    Transforms Markdown tables into clean, aligned monospaced code blocks (```text)
 *    so tabular layout is preserved across desktop and mobile.
 * 2. Medium image handling: ensures external images have proper block separation
 *    and caption/alt attribution.
 * 3. Medium divider: preserves horizontal rules (---) with clean spacing to render
 *    Medium's signature 3-dot section divider (. . .).
 * 4. Fenced code blocks: ensures empty line separation.
 */

interface ParsedTable {
  headers: string[];
  alignments: Array<'left' | 'center' | 'right'>;
  rows: string[][];
  totalLines: number;
}

function parseTableAt(lines: string[], startIndex: number): ParsedTable | null {
  if (startIndex + 1 >= lines.length) return null;

  const headerLine = lines[startIndex].trim();
  const delimiterLine = lines[startIndex + 1].trim();

  // Basic check for table pipe delimiters
  if (!headerLine.includes('|') || !delimiterLine.includes('|')) {
    return null;
  }

  // Delimiter line check (e.g. |---|:---|---:|)
  if (!/^\|?[\s\-:|]+\|?$/.test(delimiterLine)) {
    return null;
  }

  const parseRow = (line: string) =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim());

  const headers = parseRow(headerLine);
  const delimiterCells = parseRow(delimiterLine);

  if (headers.length === 0 || delimiterCells.length !== headers.length) {
    return null;
  }

  const alignments: Array<'left' | 'center' | 'right'> = delimiterCells.map((cell) => {
    const hasLeftColon = cell.startsWith(':');
    const hasRightColon = cell.endsWith(':');
    if (hasLeftColon && hasRightColon) return 'center';
    if (hasRightColon) return 'right';
    return 'left';
  });

  const rows: string[][] = [];
  let lineIdx = startIndex + 2;

  while (lineIdx < lines.length) {
    const currentLine = lines[lineIdx].trim();
    if (!currentLine || !currentLine.includes('|')) {
      break;
    }
    rows.push(parseRow(currentLine));
    lineIdx++;
  }

  return {
    headers,
    alignments,
    rows,
    totalLines: lineIdx - startIndex,
  };
}

function formatTableAsCodeBlock(table: ParsedTable): string[] {
  const colCount = table.headers.length;
  const colWidths: number[] = new Array(colCount).fill(0);

  // Compute column widths
  for (let c = 0; c < colCount; c++) {
    colWidths[c] = Math.max(colWidths[c], (table.headers[c] || '').length);
  }
  for (const row of table.rows) {
    for (let c = 0; c < colCount; c++) {
      colWidths[c] = Math.max(colWidths[c], (row[c] || '').length);
    }
  }

  // Minimum column width for aesthetics
  for (let c = 0; c < colCount; c++) {
    colWidths[c] = Math.max(colWidths[c], 3);
  }

  const padCell = (content: string, width: number, align: 'left' | 'center' | 'right') => {
    const str = content || '';
    if (str.length >= width) return str;
    const diff = width - str.length;
    if (align === 'right') return ' '.repeat(diff) + str;
    if (align === 'center') {
      const leftPad = Math.floor(diff / 2);
      const rightPad = diff - leftPad;
      return ' '.repeat(leftPad) + str + ' '.repeat(rightPad);
    }
    return str + ' '.repeat(diff);
  };

  const headerRow =
    '| ' +
    table.headers.map((h, i) => padCell(h, colWidths[i], table.alignments[i])).join(' | ') +
    ' |';

  const dividerRow =
    '| ' +
    colWidths
      .map((w, i) => {
        const align = table.alignments[i];
        if (align === 'center') return ':' + '-'.repeat(Math.max(w - 2, 1)) + ':';
        if (align === 'right') return '-'.repeat(Math.max(w - 1, 1)) + ':';
        return '-'.repeat(w);
      })
      .join(' | ') +
    ' |';

  const dataRows = table.rows.map(
    (row) =>
      '| ' +
      Array.from({ length: colCount })
        .map((_, i) => padCell(row[i] || '', colWidths[i], table.alignments[i]))
        .join(' | ') +
      ' |',
  );

  return ['```text', headerRow, dividerRow, ...dataRows, '```'];
}

/**
 * Formats canonical markdown for Medium publication.
 */
export function formatMediumMarkdown(markdown: string): string {
  if (!markdown) return '';

  const normalized = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  const outputLines: string[] = [];

  let inCodeBlock = false;
  let currentFenceChar = '';
  let currentFenceLen = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check code fences
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})(.*)$/);

    if (!inCodeBlock && fenceMatch) {
      inCodeBlock = true;
      currentFenceChar = fenceMatch[1][0];
      currentFenceLen = fenceMatch[1].length;

      if (outputLines.length > 0 && outputLines[outputLines.length - 1].trim() !== '') {
        outputLines.push('');
      }

      outputLines.push(trimmed);
      continue;
    }

    if (
      inCodeBlock &&
      fenceMatch &&
      fenceMatch[1][0] === currentFenceChar &&
      fenceMatch[1].length >= currentFenceLen
    ) {
      inCodeBlock = false;
      outputLines.push(currentFenceChar.repeat(currentFenceLen));

      if (i + 1 < lines.length && lines[i + 1].trim() !== '') {
        outputLines.push('');
      }
      continue;
    }

    if (inCodeBlock) {
      outputLines.push(line);
      continue;
    }

    // 1. Table Detection outside code blocks
    if (trimmed.startsWith('|') || trimmed.includes('|')) {
      const table = parseTableAt(lines, i);
      if (table) {
        if (outputLines.length > 0 && outputLines[outputLines.length - 1].trim() !== '') {
          outputLines.push('');
        }

        const formattedCodeTable = formatTableAsCodeBlock(table);
        outputLines.push(...formattedCodeTable);

        i += table.totalLines - 1; // Advance past table lines

        if (i + 1 < lines.length && lines[i + 1].trim() !== '') {
          outputLines.push('');
        }
        continue;
      }
    }

    // 2. Standalone image formatting with alt caption
    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+?)(?:\s+"([^"]*)")?\)$/);
    if (imageMatch) {
      const altText = imageMatch[1].trim();
      const imageUrl = imageMatch[2].trim();
      const imageTitle = imageMatch[3]?.trim();

      if (outputLines.length > 0 && outputLines[outputLines.length - 1].trim() !== '') {
        outputLines.push('');
      }

      outputLines.push(`![${altText || imageTitle || 'image'}](${imageUrl})`);
      if (altText || imageTitle) {
        outputLines.push(`*${altText || imageTitle}*`);
      }

      if (i + 1 < lines.length && lines[i + 1].trim() !== '') {
        outputLines.push('');
      }
      continue;
    }

    // 3. Horizontal rule / divider (Medium's intentional 3-dot divider)
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      if (outputLines.length > 0 && outputLines[outputLines.length - 1].trim() !== '') {
        outputLines.push('');
      }
      outputLines.push('---');
      if (i + 1 < lines.length && lines[i + 1].trim() !== '') {
        outputLines.push('');
      }
      continue;
    }

    outputLines.push(line);
  }

  return outputLines.join('\n');
}
