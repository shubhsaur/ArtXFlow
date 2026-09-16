import { describe, it, expect, vi } from 'vitest';
import {
  DeterministicTransformer,
  AiContentTransformer,
  TransformationPipeline,
  computeInputHash,
  type AiTransformerProvider,
  type TransformationInput,
} from './index';

describe('Transformations Boundary (TASK-029)', () => {
  const sampleInput: TransformationInput = {
    title: '  Microservices Architecture and Event Driven Workflows  ',
    content: `---
title: Ignored
date: 2026-01-01
---
# Welcome

This is an architectural deep dive into publishing workflows.`,
    excerpt: 'An overview of workflows.',
    tags: ['Architecture', 'TypeScript', ' '],
    canonicalUrl: 'https://artxflow.com/posts/microservices',
    destinationType: 'DEVTO',
  };

  describe('Deterministic Transformation', () => {
    const transformer = new DeterministicTransformer();

    it('transforms content deterministically without AI', async () => {
      const result = await transformer.transform(sampleInput);

      expect(result.title).toBe('Microservices Architecture and Event Driven Workflows');
      expect(result.isAiGenerated).toBe(false);
      expect(result.requiresReview).toBe(false);
      expect(result.provider).toBe('deterministic');
      expect(result.kind).toBe('DETERMINISTIC');
      expect(result.tags).toEqual(['Architecture', 'TypeScript']);
      expect(result.inputHash).toBeDefined();
    });

    it('strips YAML frontmatter when option is enabled', async () => {
      const result = await transformer.transform({
        ...sampleInput,
        options: { stripFrontmatter: true },
      });

      expect(result.content).not.toContain('---');
      expect(result.content.startsWith('# Welcome')).toBe(true);
    });

    it('appends canonical footer attribution when option is enabled', async () => {
      const result = await transformer.transform({
        ...sampleInput,
        options: { appendCanonicalFooter: true },
      });

      expect(result.content).toContain(
        '*Originally published at [https://artxflow.com/posts/microservices](https://artxflow.com/posts/microservices)*',
      );
    });

    it('produces identical input hashes for identical inputs', () => {
      const hash1 = computeInputHash(sampleInput);
      const hash2 = computeInputHash({ ...sampleInput });
      expect(hash1).toBe(hash2);

      const modifiedHash = computeInputHash({ ...sampleInput, title: 'Different' });
      expect(hash1).not.toBe(modifiedHash);
    });
  });

  describe('Pluggable AI Transformation', () => {
    const mockAiProvider: AiTransformerProvider = {
      name: 'gemini-mock',
      generate: vi.fn().mockResolvedValue({
        title: 'Optimized: Microservices Architecture',
        content: '# Welcome to Microservices\n\nRefined and optimized content by AI.',
        excerpt: 'AI-generated concise summary.',
        tags: ['architecture', 'microservices'],
        metadata: { tokensUsed: 140 },
      }),
    };

    it('plugs in custom AI provider without altering core publishing contracts', async () => {
      const aiTransformer = new AiContentTransformer(mockAiProvider, 'AI_ADAPTATION');
      const result = await aiTransformer.transform(sampleInput);

      expect(result.isAiGenerated).toBe(true);
      expect(result.requiresReview).toBe(true);
      expect(result.provider).toBe('gemini-mock');
      expect(result.title).toBe('Optimized: Microservices Architecture');
      expect(result.content).toContain('Refined and optimized content by AI.');
      expect(mockAiProvider.generate).toHaveBeenCalledTimes(1);
    });

    it('allows hot-swapping AI providers (e.g. OpenAI / Claude / Gemini)', async () => {
      const secondaryProvider: AiTransformerProvider = {
        name: 'claude-mock',
        generate: vi.fn().mockResolvedValue({
          title: 'Claude Adapted Article',
          content: 'Content adapted by Claude model.',
        }),
      };

      const aiTransformer = new AiContentTransformer(secondaryProvider);
      const result = await aiTransformer.transform(sampleInput);

      expect(result.provider).toBe('claude-mock');
      expect(result.title).toBe('Claude Adapted Article');
    });
  });

  describe('Transformation Pipeline & Explicit Approval Guard', () => {
    const mockAiProvider: AiTransformerProvider = {
      name: 'test-ai',
      generate: vi.fn().mockResolvedValue({
        title: 'AI Title',
        content: 'AI Content',
      }),
    };

    it('runs deterministic baseline when AI is not configured', async () => {
      const pipeline = new TransformationPipeline();
      const result = await pipeline.transformWithAi(sampleInput);

      expect(result.isAiGenerated).toBe(false);
      expect(result.requiresReview).toBe(false);
    });

    it('runs AI transformation when configured and enforces review requirement', async () => {
      const aiTransformer = new AiContentTransformer(mockAiProvider);
      const pipeline = new TransformationPipeline(aiTransformer);
      const result = await pipeline.transformWithAi(sampleInput);

      expect(result.isAiGenerated).toBe(true);
      expect(result.requiresReview).toBe(true);

      // Invariant: AI-generated content CANNOT be published without explicit approval
      expect(pipeline.isApprovedForPublishing(result, false)).toBe(false);
      expect(pipeline.isApprovedForPublishing(result, true)).toBe(true);
    });

    it('always permits deterministic content to be published without approval', async () => {
      const pipeline = new TransformationPipeline();
      const deterministicResult = await pipeline.transformDeterministic(sampleInput);

      expect(pipeline.isApprovedForPublishing(deterministicResult, false)).toBe(true);
    });
  });
});
