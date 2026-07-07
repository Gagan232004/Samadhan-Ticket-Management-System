import { PgBoss } from 'pg-boss';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for pg-boss");
}

export const boss = new PgBoss(connectionString);
