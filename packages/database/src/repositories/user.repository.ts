import { eq } from 'drizzle-orm';
import { db } from '../client';
import { user } from '../schema/auth';

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const userRepository = {
  async findById(id: string): Promise<UserInfo | null> {
    const [record] = await db.select().from(user).where(eq(user.id, id)).limit(1);
    return record ? (record as unknown as UserInfo) : null;
  },

  async findByEmail(email: string): Promise<UserInfo | null> {
    const [record] = await db.select().from(user).where(eq(user.email, email)).limit(1);
    return record ? (record as unknown as UserInfo) : null;
  },

  async updateEmail(id: string, email: string): Promise<void> {
    await db
      .update(user)
      .set({ email, emailVerified: false })
      .where(eq(user.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(user).where(eq(user.id, id));
  },
};
