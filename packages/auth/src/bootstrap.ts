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

const inFlightBootstrap = new Map<string, Promise<BootstrapPersonalOrgResult>>();

/**
 * For testing purposes only: clears active in-flight promises.
 */
export function _clearInFlightBootstrap(): void {
  inFlightBootstrap.clear();
}

/**
 * Idempotently and transactionally creates a personal organization
 * and an OWNER membership for a newly authenticated user.
 *
 * Resilient against:
 * 1. Intra-process SSR concurrency (Next.js layout + page executing in parallel).
 * 2. Inter-process concurrency and slug collisions (PostgreSQL 23505 unique constraint errors).
 */
export async function bootstrapPersonalOrganization(
  input: BootstrapPersonalOrgInput,
  dbInstance?: DbClient,
): Promise<BootstrapPersonalOrgResult> {
  // Intra-process concurrency guard: deduplicate concurrent calls for the same user (e.g. Layout & Page SSR)
  if (!dbInstance) {
    const existingPromise = inFlightBootstrap.get(input.userId);
    if (existingPromise) {
      return existingPromise;
    }

    const promise = executeBootstrap(input, dbInstance).finally(() => {
      inFlightBootstrap.delete(input.userId);
    });

    inFlightBootstrap.set(input.userId, promise);
    return promise;
  }

  return executeBootstrap(input, dbInstance);
}

async function executeBootstrap(
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

  // 2. Transactionally create the organization and OWNER membership with retry resilience against concurrent slug collisions
  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await withTransaction(async (tx) => {
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
        // If retrying due to slug collision, salt the candidate base
        const candidateBase =
          attempt === 0
            ? baseSlug
            : `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

        const uniqueSlug = await resolveUniqueSlug(candidateBase, txOrgRepo);

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
    } catch (err: unknown) {
      const isUniqueViolation =
        (typeof err === 'object' &&
          err !== null &&
          'code' in err &&
          (err as { code: string }).code === '23505') ||
        (err instanceof Error &&
          (err.message.includes('organizations_slug_unique') ||
            err.message.includes('duplicate key value violates unique constraint')));

      if (isUniqueViolation) {
        // Re-check if another concurrent request created an owned org for this user
        const recheckMemberships = await membershipRepo.listUserOrganizations(input.userId);
        const recheckOwner = recheckMemberships.find((m) => m.membership.role === 'OWNER');
        if (recheckOwner) {
          return {
            organization: recheckOwner.organization,
            membership: recheckOwner.membership,
            created: false,
          };
        }

        // If collision was with another workspace, retry with a salted unique slug candidate
        if (attempt < maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
          continue;
        }
      }

      throw err;
    }
  }

  throw new Error('Failed to bootstrap personal organization after maximum retry attempts');
}
