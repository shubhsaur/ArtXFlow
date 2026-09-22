import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { articleService } from '@artxflow/content-core';
import { profileRepository } from '@artxflow/database';
import { handleApiError } from '@/lib/handle-api-error';
import { parseJsonBody, onboardingLaunchSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

function buildSampleArticleContent(canonicalUrl: string): string {
  return `---
title: "Getting Started with ArtXFlow: Canonical Multi-Platform Publishing"
description: "A hands-on walkthrough demonstrating how ArtXFlow publishes to DEV.to, Hashnode, and Medium while preserving strict rel=canonical SEO authority."
canonical_url: "${canonicalUrl}"
tags: ["webdev", "devops", "publishing", "opensource"]
---

# Welcome to Your Canonical Distribution Engine

Congratulations on configuring your **ArtXFlow** workspace!

ArtXFlow is built from the ground up to solve the single biggest dilemma facing engineering blogs and technical creators:

> **How to reach audiences across DEV.to, Hashnode, and Medium without sacrificing search ranking, duplicate content penalties, or code formatting integrity.**

---

## 1. Single Source of Truth

When you publish this article through ArtXFlow, your hosted workspace remains the **canonical origin**:
- All syndicated projections contain an automated \`<link rel="canonical" href="..." />\` pointing back to your primary URL.
- Google, Bing, and search crawlers unambiguously attribute 100% of organic search authority to your canonical domain.

\`\`\`typescript
// Platform syndication payload preview
export interface CanonicalPayload {
  title: string;
  body_markdown: string;
  canonical_url: string; // Guaranteed injection
  tags: string[];
}
\`\`\`

---

## 2. Next Steps

1. **Edit or Replace**: Open this post in the ArtXFlow Editor and customize the frontmatter.
2. **Review Formatting**: Use the platform preview tabs to see how it renders for DEV.to, Hashnode, and Medium.
3. **Dispatch**: Hit **Publish** to project your post simultaneously to all connected channels!

Happy writing!
`;
}

export async function POST(request: Request) {
  const headersList = await headers();
  const session = await getSession(headersList);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { organization } = await bootstrapPersonalOrganization({
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
  });

  try {
    const { data: body, error } = await parseJsonBody(request, onboardingLaunchSchema);
    if (error) return error;

    const createSample = body.createSampleArticle !== false;
    const canonicalUrl = body.canonicalUrl?.trim() || 'https://artxflow.dev';

    if (canonicalUrl !== 'https://artxflow.dev') {
      try {
        await profileRepository.upsert(session.user.id, {
          canonicalUrl,
        });
      } catch (profileErr) {
        logger.warn({ err: profileErr }, 'Failed to persist canonical URL to profile');
      }
    }

    let createdArticle = null;

    if (createSample) {
      try {
        const baseSlug = 'getting-started-with-artxflow';
        const timestamp = Date.now().toString().slice(-4);
        const slug = `${baseSlug}-${timestamp}`;

        createdArticle = await articleService.createArticle(
          {
            userId: session.user.id,
            organizationId: organization.id,
          },
          {
            title: 'Getting Started with ArtXFlow: Canonical Multi-Platform Publishing',
            slug,
            excerpt:
              'A hands-on walkthrough demonstrating how ArtXFlow publishes to DEV.to, Hashnode, and Medium while preserving strict rel=canonical SEO authority.',
            content: buildSampleArticleContent(canonicalUrl),
            contentFormat: 'MARKDOWN',
          },
        );
      } catch (articleErr) {
        logger.warn({ err: articleErr }, 'Sample article generation skipped or failed');
      }
    }

    return NextResponse.json({
      ok: true,
      articleId: createdArticle?.article.id || null,
      message: 'Onboarding completed successfully',
    });
  } catch (error) {
    return handleApiError(error, { logPrefix: 'POST /api/onboarding/launch' });
  }
}
