import {
  withTransaction,
  OrganizationRepository,
  MembershipRepository,
  type Organization,
  type Membership,
  type DbClient,
} from '@artxflow/database';

export interface BootstrapPersonalOrgInput {
  userId: string;
  name?: string | null;
  email: string;
}

export interface BootstrapPersonalOrgResult {
  organization: Organization;
  membership: Membership;
  created: boolean;
}

/**
 * Normalizes an arbitrary string into a deterministic URL-safe base slug.
 */
export function generateOrgSlug(rawName: string): string {
  const normalized = rawName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'personal';
}

/**
 * Resolves a collision-safe unique slug for an organization.
 */
export async function resolveUniqueSlug(
  baseSlug: string,
  orgRepo: OrganizationRepository,
): Promise<string> {
  let candidate = baseSlug;
  let counter = 1;

  while (await orgRepo.findBySlug(candidate)) {
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }

  return candidate;
}

/**
 * Idempotently and transactionally creates a personal organization
 * and an OWNER membership for a newly authenticated user.
 */
export async function bootstrapPersonalOrganization(
  input: BootstrapPersonalOrgInput,
  dbInstance?: DbClient,
): Promise<BootstrapPersonalOrgResult> {
  const membershipRepo = new MembershipRepository(dbInstance);

  // 1. Check if the user already has an owned organization
  const existingMemberships = await membershipRepo.listUserOrganizations(input.userId);
  const existingOwner = existingMemberships.find((m) => m.membership.role === 'OWNER');

  if (existingOwner) {
    return {
      organization: existingOwner.organization,
      membership: existingOwner.membership,
      created: false,
    };
  }

  // 2. Transactionally create the organization and OWNER membership
  return withTransaction(async (tx) => {
    const txOrgRepo = new OrganizationRepository(tx);
    const txMembershipRepo = new MembershipRepository(tx);

    // Double-check within transaction in case of concurrent requests
    const concurrentCheck = await txMembershipRepo.listUserOrganizations(input.userId);
    const concurrentOwner = concurrentCheck.find((m) => m.membership.role === 'OWNER');
    if (concurrentOwner) {
      return {
        organization: concurrentOwner.organization,
        membership: concurrentOwner.membership,
        created: false,
      };
    }

    const displayName = input.name?.trim() || input.email.split('@')[0] || 'Personal';
    const orgName = `${displayName}'s Workspace`;

    const baseSlug = generateOrgSlug(displayName);
    const uniqueSlug = await resolveUniqueSlug(baseSlug, txOrgRepo);

    const organization = await txOrgRepo.create({
      name: orgName,
      slug: uniqueSlug,
    });

    const membership = await txMembershipRepo.create({
      organizationId: organization.id,
      userId: input.userId,
      role: 'OWNER',
    });

    return {
      organization,
      membership,
      created: true,
    };
  }, dbInstance);
}
