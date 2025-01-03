import { drizzle } from "drizzle-orm/neon-serverless";
import { Client } from "@neondatabase/serverless";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

let client: Client | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!client || !db) {
    client = new Client(process.env.DATABASE_URL);
    await client.connect();
    db = drizzle(client, { schema });
  }
  return db;
}

export async function verifyDatabaseConnection() {
  try {
    if (!client) {
      await getDb();
    }
    await client!.query('SELECT 1');
    return true;
  } catch (error) {
    console.error("Database connection verification failed:", error);
    throw error;
  }
}

// For backwards compatibility
export const db = await getDb();