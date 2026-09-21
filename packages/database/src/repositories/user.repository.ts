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
};
