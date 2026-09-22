import { describe, it, expect, vi } from 'vitest';
import { ProfileRepository } from './profile.repository';
import type { UserProfile } from '../schema/profiles';
import type { User } from '../schema/auth';
import type { DbExecutor } from './organization.repository';

describe('ProfileRepository', () => {
  const userId = 'usr_test_123';

  const mockProfile: UserProfile = {
    userId,
    username: 'alexrivera',
    jobTitle: 'Staff Platform Engineer & DevRel',
    canonicalUrl: 'https://alexrivera.dev',
    bio: 'Writing about distributed systems and cloud native.',
    publicEmail: 'alex@scaleops.io',
    githubHandle: 'alexrivera',
    devtoHandle: 'alexrivera',
    hashnodeHandle: 'alexrivera',
    twitterHandle: 'alexrivera_dev',
    notifySuccess: true,
    notifyFailure: true,
    notifyWeeklyDigest: false,
    launchpadDismissed: false,
    createdAt: new Date('2026-09-18T12:00:00Z'),
    updatedAt: new Date('2026-09-18T12:00:00Z'),
  };

  const mockUser: User = {
    id: userId,
    name: 'Alex Rivera',
    email: 'alex@scaleops.io',
    emailVerified: true,
    image: 'https://example.com/avatar.png',
    createdAt: new Date('2026-09-18T12:00:00Z'),
    updatedAt: new Date('2026-09-18T12:00:00Z'),
  };

  it('creates a user profile record', async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockProfile]),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new ProfileRepository(mockDb);
    const created = await repo.create({
      userId,
      username: 'alexrivera',
      jobTitle: 'Staff Platform Engineer & DevRel',
      publicEmail: 'alex@scaleops.io',
    });

    expect(created.userId).toBe(userId);
    expect(created.username).toBe('alexrivera');
    expect(created.jobTitle).toBe('Staff Platform Engineer & DevRel');
  });

  it('finds profile by user id', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockProfile]),
          }),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new ProfileRepository(mockDb);
    const result = await repo.findByUserId(userId);

    expect(result).not.toBeNull();
    expect(result?.username).toBe('alexrivera');
  });

  it('updates an existing profile', async () => {
    const updatedProfile = { ...mockProfile, bio: 'Updated bio content' };
    const mockDb = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedProfile]),
          }),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new ProfileRepository(mockDb);
    const result = await repo.update(userId, { bio: 'Updated bio content' });

    expect(result?.bio).toBe('Updated bio content');
  });

  it('updates basic user record', async () => {
    const updatedUser = { ...mockUser, name: 'Alex M. Rivera' };
    const mockDb = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedUser]),
          }),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new ProfileRepository(mockDb);
    const result = await repo.updateUserBasic(userId, { name: 'Alex M. Rivera' });

    expect(result?.name).toBe('Alex M. Rivera');
  });

  it('gets full user profile combining user and profile tables', async () => {
    const mockDb = {
      select: vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockUser]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockProfile]),
            }),
          }),
        }),
    } as unknown as DbExecutor;

    const repo = new ProfileRepository(mockDb);
    const fullProfile = await repo.getFullUserProfile(userId);

    expect(fullProfile).not.toBeNull();
    expect(fullProfile?.name).toBe('Alex Rivera');
    expect(fullProfile?.username).toBe('alexrivera');
    expect(fullProfile?.emailVerified).toBe(true);
    expect(fullProfile?.launchpadDismissed).toBe(false);
  });

  it('dismisses launchpad for a user account', async () => {
    const dismissedProfile = { ...mockProfile, launchpadDismissed: true };
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockProfile]),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([dismissedProfile]),
          }),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new ProfileRepository(mockDb);
    const result = await repo.dismissLaunchpad(userId);

    expect(result.launchpadDismissed).toBe(true);
  });
});
