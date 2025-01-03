import { drizzle } from "drizzle-orm/neon-serverless";
import { Client } from "@neondatabase/serverless";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let client: Client | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!client || !dbInstance) {
    client = new Client(process.env.DATABASE_URL);
    await client.connect();
    dbInstance = drizzle(client, { schema });
  }
  return dbInstance;
}

export async function verifyDatabaseConnection() {
  try {
    const db = await getDb();
    const result = await client!.query("SELECT 1");
    return result.rowCount === 1;
  } catch (error) {
    console.error("Database connection verification failed:", error);
    throw error;
  }
}

// Export a simple drizzle instance for basic operations
export const db = drizzle(process.env.DATABASE_URL, { schema });
