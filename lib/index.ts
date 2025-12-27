import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema';


if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}

const connectionString = process.env.DATABASE_URL as string;

// Disable prefetch as it is not supported for "Transaction" pool mode 
const client = postgres(connectionString, {ssl: { rejectUnauthorized: false }, prepare: false })
export const db = drizzle(client, { schema });
