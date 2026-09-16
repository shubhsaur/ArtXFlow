/**
 * @artxflow/transformations
 * Deterministic and AI-aware content transformation boundary (TASK-029, ADR-009).
 */

import crypto from 'crypto';

export type TransformationKind =
  | 'DETERMINISTIC'
  | 'AI_ADAPTATION'
  | 'AI_SUMMARY'
  | 'AI_SEO_OPTIMIZATION'
  | 'AI_TRANSLATION';

export interface TransformationInput {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  canonicalUrl?: string;
  destinationType?: string;
  options?: {
    stripFrontmatter?: boolean;
    appendCanonicalFooter?: boolean;
    customPrompt?: string;
    targetLanguage?: string;
  };
}

export interface TransformationResult {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  metadata: Record<string, unknown>;
  kind: TransformationKind;
  provider: string;
  inputHash: string;
  isAiGenerated: boolean;
  requiresReview: boolean;
}

/**
 * Common contract for all content transformers (deterministic or AI-backed).
 */
export interface ContentTransformer {
  readonly name: string;
  readonly isAi: boolean;
  transform(input: TransformationInput): Promise<TransformationResult>;
}

/**
 * Computes a SHA-256 hash of input content for change detection and caching.
 */
export function computeInputHash(input: TransformationInput): string {
  const hash = crypto.createHash('sha256');
  hash.update(input.title);
  hash.update(input.content);
  if (input.excerpt) hash.update(input.excerpt);
  if (input.tags) hash.update(input.tags.join(','));
  if (input.destinationType) hash.update(input.destinationType);
  return hash.digest('hex');
}

/**
 * Deterministic transformer that functions 100% offline without any AI or network dependency.
 */
export class DeterministicTransformer implements ContentTransformer {
  readonly name = 'deterministic';
  readonly isAi = false;

  async transform(input: TransformationInput): Promise<TransformationResult> {
    let transformedContent = input.content;

    // Optional: strip YAML frontmatter
    if (input.options?.stripFrontmatter) {
      transformedContent = transformedContent.replace(/^---[\s\S]*?---\n*/, '');
    }

    // Optional: append canonical attribution footer
    if (input.options?.appendCanonicalFooter && input.canonicalUrl) {
      const footer = `\n\n---\n*Originally published at [${input.canonicalUrl}](${input.canonicalUrl})*`;
      if (!transformedContent.includes(input.canonicalUrl)) {
        transformedContent += footer;
      }
    }

    // Sanitize tags
    const sanitizedTags = input.tags
      ? input.tags.map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

    return {
      title: input.title.trim(),
      content: transformedContent,
      excerpt: input.excerpt?.trim(),
      tags: sanitizedTags,
      metadata: {
        destinationType: input.destinationType,
      },
      kind: 'DETERMINISTIC',
      provider: this.name,
      inputHash: computeInputHash(input),
      isAiGenerated: false,
      requiresReview: false,
    };
  }
}

/**
 * Replaceable server-side AI provider contract (e.g. Gemini, OpenAI, Claude).
 * Keeps vendor-specific SDK calls isolated and credential handling strictly server-side.
 */
export interface AiTransformerProvider {
  readonly name: string;
  generate(options: {
    systemPrompt: string;
    userPrompt: string;
    input: TransformationInput;
  }): Promise<{
    content: string;
    title?: string;
    excerpt?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
  }>;
}

/**
 * AI-aware content transformer.
 * Produces reviewable candidate content that requires explicit user approval before publishing.
 */
export class AiContentTransformer implements ContentTransformer {
  readonly isAi = true;
  readonly name: string;
  private readonly provider: AiTransformerProvider;
  private readonly kind: TransformationKind;

  constructor(
    provider: AiTransformerProvider,
    kind: TransformationKind = 'AI_ADAPTATION',
  ) {
    this.provider = provider;
    this.name = `ai-${provider.name}`;
    this.kind = kind;
  }

  async transform(input: TransformationInput): Promise<TransformationResult> {
    const inputHash = computeInputHash(input);

    const systemPrompt =
      'You are an expert editorial AI optimizing and adapting technical content for publication.';
    const userPrompt =
      input.options?.customPrompt ||
      `Adapt and format the following technical article for target destination ${input.destinationType || 'general'}. Preserving technical accuracy is critical.`;

    const generated = await this.provider.generate({
      systemPrompt,
      userPrompt,
      input,
    });

    return {
      title: generated.title || input.title,
      content: generated.content,
      excerpt: generated.excerpt || input.excerpt,
      tags: generated.tags || input.tags,
      metadata: {
        ...generated.metadata,
        prompt: userPrompt,
        aiProvider: this.provider.name,
        targetDestination: input.destinationType,
      },
      kind: this.kind,
      provider: this.provider.name,
      inputHash,
      isAiGenerated: true,
      requiresReview: true, // Invariant: AI-generated output requires explicit review
    };
  }
}

/**
 * Transformation Pipeline.
 * Orchestrates deterministic baseline transformations and optional AI transformations.
 */
export class TransformationPipeline {
  private readonly deterministicTransformer = new DeterministicTransformer();
  private aiTransformer?: AiContentTransformer;

  constructor(aiTransformer?: AiContentTransformer) {
    this.aiTransformer = aiTransformer;
  }

  setAiTransformer(aiTransformer: AiContentTransformer): void {
    this.aiTransformer = aiTransformer;
  }

  /**
   * Transforms content deterministically without invoking AI.
   */
  async transformDeterministic(input: TransformationInput): Promise<TransformationResult> {
    return this.deterministicTransformer.transform(input);
  }

  /**
   * Optionally executes AI transformation if configured, otherwise falls back to deterministic.
   */
  async transformWithAi(input: TransformationInput): Promise<TransformationResult> {
    if (this.aiTransformer) {
      return this.aiTransformer.transform(input);
    }
    return this.deterministicTransformer.transform(input);
  }

  /**
   * Evaluates whether a transformation result is safe for direct publishing.
   * AI-generated content is blocked unless explicit approval is confirmed.
   */
  isApprovedForPublishing(result: TransformationResult, isExplicitlyApproved = false): boolean {
    if (!result.isAiGenerated) {
      return true;
    }
    return isExplicitlyApproved;
  }
}

export const deterministicTransformer = new DeterministicTransformer();
export const transformationPipeline = new TransformationPipeline();
