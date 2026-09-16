import { db } from '../client';
import { systemMeta } from '../schema';

export async function runSeed(): Promise<void> {
  console.log('Running development database seed...');
  await db
    .insert(systemMeta)
    .values({
      key: 'seed_initialized',
      value: new Date().toISOString(),
    })
    .onConflictDoNothing();
  console.log('Database seed completed successfully.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Database seed error:', err);
      process.exit(1);
    });
}
