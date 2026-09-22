import { eq } from 'drizzle-orm';
import { getDb } from '../client';
import { user, account, type User } from '../schema/auth';
import {
  userProfiles,
  type UserProfile,
  type NewUserProfile,
} from '../schema/profiles';
import type { BaseRepository } from './index';
import type { DbExecutor } from './organization.repository';

export interface FullUserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  username: string | null;
  jobTitle: string | null;
  canonicalUrl: string | null;
  bio: string | null;
  publicEmail: string | null;
  githubHandle: string | null;
  devtoHandle: string | null;
  hashnodeHandle: string | null;
  twitterHandle: string | null;
  notifySuccess: boolean;
  notifyFailure: boolean;
  notifyWeeklyDigest: boolean;
  launchpadDismissed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ProfileRepository implements BaseRepository<UserProfile, string> {
  private customDb?: DbExecutor;

  constructor(db?: DbExecutor) {
    this.customDb = db;
  }

  private get db(): DbExecutor {
    return this.customDb || getDb();
  }

  async create(data: NewUserProfile): Promise<UserProfile> {
    const [result] = await this.db.insert(userProfiles).values(data).returning();
    if (!result) {
      throw new Error('Failed to create user profile');
    }
    return result;
  }

  async findById(userId: string): Promise<UserProfile | null> {
    const [result] = await this.db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    return result || null;
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    return this.findById(userId);
  }

  async update(
    userId: string,
    data: Partial<Omit<NewUserProfile, 'userId' | 'createdAt'>>,
  ): Promise<UserProfile | null> {
    const [result] = await this.db
      .update(userProfiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return result || null;
  }

  async upsert(
    userId: string,
    data: Partial<Omit<NewUserProfile, 'userId' | 'createdAt'>>,
  ): Promise<UserProfile> {
    const existing = await this.findByUserId(userId);
    if (existing) {
      const updated = await this.update(userId, data);
      if (!updated) {
        throw new Error('Failed to update user profile');
      }
      return updated;
    }

    return this.create({
      userId,
      ...data,
    });
  }

  async delete(userId: string): Promise<boolean> {
    const result = await this.db
      .delete(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .returning();
    return result.length > 0;
  }

  async updateUserBasic(
    userId: string,
    data: { name?: string; image?: string | null },
  ): Promise<User | null> {
    const [result] = await this.db
      .update(user)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();
    return result || null;
  }

  async getFullUserProfile(userId: string): Promise<FullUserProfile | null> {
    const [userRecord] = await this.db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userRecord) {
      return null;
    }

    let profileRecord = await this.findByUserId(userId);
    if (!profileRecord) {
      // Auto-initialize profile record with sensible defaults based on user name/email
      const autoSlug = (userRecord.name || userRecord.email.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '');

      profileRecord = await this.create({
        userId,
        username: autoSlug,
        publicEmail: userRecord.email,
        notifySuccess: true,
        notifyFailure: true,
        notifyWeeklyDigest: false,
      });
    }

    return {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      image: userRecord.image,
      username: profileRecord.username,
      jobTitle: profileRecord.jobTitle,
      canonicalUrl: profileRecord.canonicalUrl,
      bio: profileRecord.bio,
      publicEmail: profileRecord.publicEmail || userRecord.email,
      githubHandle: profileRecord.githubHandle,
      devtoHandle: profileRecord.devtoHandle,
      hashnodeHandle: profileRecord.hashnodeHandle,
      twitterHandle: profileRecord.twitterHandle,
      notifySuccess: profileRecord.notifySuccess,
      notifyFailure: profileRecord.notifyFailure,
      notifyWeeklyDigest: profileRecord.notifyWeeklyDigest,
      launchpadDismissed: profileRecord.launchpadDismissed,
      createdAt: profileRecord.createdAt,
      updatedAt: profileRecord.updatedAt,
    };
  }

  async dismissLaunchpad(userId: string): Promise<UserProfile> {
    return this.upsert(userId, { launchpadDismissed: true });
  }

  async getSecurityTelemetry(userId: string): Promise<{
    ssoProvider: string;
    ssoAccountId: string;
    hasPassword: boolean;
  }> {
    const accounts = await this.db
      .select()
      .from(account)
      .where(eq(account.userId, userId));
    const oauthAccount =
      accounts.find((a) => a.providerId !== 'credential') || accounts[0];
    return {
      ssoProvider: oauthAccount?.providerId || 'credential',
      ssoAccountId: oauthAccount?.accountId || `usr_${userId.slice(0, 8)}`,
      hasPassword: accounts.some((a) => a.providerId === 'credential' || Boolean(a.password)),
    };
  }
}

export const profileRepository = new ProfileRepository();
