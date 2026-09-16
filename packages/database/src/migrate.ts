import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { createDbClient } from './client';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export async function runMigrations(): Promise<void> {
  const { db, sqlClient } = createDbClient();
  console.log('Applying migrations from drizzle folder...');
  await migrate(db, {
    migrationsFolder: path.resolve(__dirname, '../drizzle'),
  });
  console.log('Migrations applied successfully.');
  await sqlClient.end();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
