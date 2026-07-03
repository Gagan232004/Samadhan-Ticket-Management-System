import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

// Initialize the pg connection pool
const pool = new Pool({ connectionString });

// Initialize the Prisma pg adapter
const adapter = new PrismaPg(pool);

// Initialize the Prisma Client with the pg adapter
export const prisma = new PrismaClient({ adapter });
