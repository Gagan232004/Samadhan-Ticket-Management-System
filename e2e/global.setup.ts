import { execSync } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.test') });

async function globalSetup() {
  console.log('Setting up the test database...');
  // Reset the database and apply all migrations before running tests
  execSync('bunx prisma migrate reset --force', {
    cwd: path.resolve(__dirname, '../backend'),
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL
    },
    stdio: 'inherit'
  });

  console.log('Seeding the test database...');
  execSync('bun run seed.ts', {
    cwd: path.resolve(__dirname, '../backend'),
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL
    },
    stdio: 'inherit'
  });
}

export default globalSetup;
