import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import {
  organizationRepository,
  siteRepository,
  platformConnectionRepository,
} from '@artxflow/database';
import { handleApiError } from '@/lib/handle-api-error';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headersList = await headers();
  const session = await getSession(headersList);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { organization, membership } = await bootstrapPersonalOrganization({
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
  });

  const [sitesList, connectionsList] = await Promise.all([
    siteRepository.listByOrganization(organization.id),
    platformConnectionRepository.listByOrganization(organization.id),
  ]);

  return NextResponse.json({
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
    },
    membership: {
      role: membership.role,
    },
    site: sitesList[0] || null,
    connections: connectionsList.map((c) => ({
      id: c.id,
      provider: c.provider,
      status: c.status,
    })),
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    },
  });
}

export async function PATCH(request: Request) {
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
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : undefined;
    const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : undefined;

    if (slug) {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug)) {
        return NextResponse.json(
          { error: 'Workspace slug may only contain lowercase alphanumeric characters and hyphens.' },
          { status: 400 },
        );
      }

      // Check if slug is used by another organization
      const existingOrg = await organizationRepository.findBySlug(slug);
      if (existingOrg && existingOrg.id !== organization.id) {
        return NextResponse.json(
          { error: 'This subdomain slug is already reserved by another workspace. Please choose another.' },
          { status: 409 },
        );
      }
    }

    const updateData: { name?: string; slug?: string } = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;

    const updatedOrg = await organizationRepository.update(organization.id, updateData);

    // Synchronize or create primary hosted blog site
    const existingSites = await siteRepository.listByOrganization(organization.id);
    let site = existingSites[0] || null;

    const targetSubdomain = slug || organization.slug;
    const targetSiteName = name || organization.name;

    if (site) {
      site = await siteRepository.update(site.id, organization.id, {
        name: targetSiteName,
        subdomain: targetSubdomain,
      });
    } else {
      site = await siteRepository.create({
        organizationId: organization.id,
        name: targetSiteName,
        subdomain: targetSubdomain,
        status: 'ACTIVE',
        themeConfig: {},
      });
    }

    return NextResponse.json({
      ok: true,
      organization: updatedOrg,
      site,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
