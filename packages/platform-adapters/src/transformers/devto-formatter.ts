/**
 * DEV.to Markdown Formatter.
 * Addresses observed DEV.to Forem engine incompatibilities:
 * 1. Guarantees mandatory blank lines before and after fenced code blocks.
 * 2. Trims trailing whitespace on language tags and normalizes language aliases for Rouge highlighter.
 * 3. Preserves all other GFM markdown (tables, external images, blockquotes, lists) untouched.
 */

/**
 * Common language aliases mapped to DEV.to Rouge syntax highlighter identifiers.
 */
const DEVTO_LANGUAGE_MAP: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  py: 'python',
  sh: 'bash',
  zsh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  cs: 'csharp',
  md: 'markdown',
  rb: 'ruby',
  rs: 'rust',
  golang: 'go',
  kt: 'kotlin',
  docker: 'dockerfile',
};

/**
 * Normalizes language identifier for DEV.to syntax highlighting.
 */
export function normalizeDevtoLanguage(rawLang: string): string {
  const cleaned = rawLang.trim().toLowerCase().replace(/[^a-z0-9_+-]/g, '');
  if (!cleaned) return '';
  return DEVTO_LANGUAGE_MAP[cleaned] || cleaned;
}

/**
 * Formats canonical markdown for DEV.to compatibility.
 * Strictly avoids mutating tables or images where DEV.to already has native support.
 */
export function formatDevtoMarkdown(markdown: string): string {
  if (!markdown) return '';

  // 1. Normalize carriage returns to standard newlines
  const normalized = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  const outputLines: string[] = [];

  let inCodeBlock = false;
  let currentFenceChar = '';
  let currentFenceLen = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for fenced code delimiter (``` or ~~~)
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})(.*)$/);

    if (!inCodeBlock && fenceMatch) {
      inCodeBlock = true;
      currentFenceChar = fenceMatch[1][0];
      currentFenceLen = fenceMatch[1].length;
      const rawLang = fenceMatch[2].trim();
      const normalizedLang = normalizeDevtoLanguage(rawLang);

      // Forem requirement: ensure an empty line precedes the code block
      if (outputLines.length > 0 && outputLines[outputLines.length - 1].trim() !== '') {
        outputLines.push('');
      }

      outputLines.push(`${currentFenceChar.repeat(currentFenceLen)}${normalizedLang}`);
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

      // Forem requirement: ensure an empty line succeeds the code block if next line is not empty
      if (i + 1 < lines.length && lines[i + 1].trim() !== '') {
        outputLines.push('');
      }
      continue;
    }

    // Inside code blocks or in regular text, preserve lines verbatim
    outputLines.push(line);
  }

  return outputLines.join('\n');
}
