/**
 * Frontmatter extraction and stripping utility.
 * Removes YAML frontmatter blocks from canonical Markdown so provider body payloads
 * never leak raw metadata into external article renderers.
 */

export interface FrontmatterParseResult {
  frontmatter: Record<string, string>;
  content: string;
}

/**
 * Strips YAML frontmatter from the beginning of a Markdown string if present.
 */
export function stripFrontmatter(markdown: string): string {
  if (!markdown) return '';
  return markdown.replace(/^\uFEFF?---[\r\n]+[\s\S]*?[\r\n]+---(?:[\r\n]+|$)/, '');
}

/**
 * Extracts key-value frontmatter pairs and returns the stripped content.
 */
export function extractFrontmatter(markdown: string): FrontmatterParseResult {
  if (!markdown) {
    return { frontmatter: {}, content: '' };
  }

  const match = markdown.match(/^\uFEFF?---[\r\n]+([\s\S]*?)[\r\n]+---(?:[\r\n]+|$)/);
  if (!match) {
    return { frontmatter: {}, content: markdown };
  }

  const rawYaml = match[1];
  const content = markdown.slice(match[0].length);
  const frontmatter: Record<string, string> = {};

  for (const line of rawYaml.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0) {
      const key = trimmed.slice(0, colonIdx).trim();
      const val = trimmed.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key) {
        frontmatter[key] = val;
      }
    }
  }

  return { frontmatter, content };
}
