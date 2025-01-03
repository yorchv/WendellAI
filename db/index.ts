import { drizzle } from "drizzle-orm/neon-serverless";
import { Client } from "@neondatabase/serverless";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create database connection with better error handling
const createDbConnection = () => {
  try {
    const client = new Client(process.env.DATABASE_URL);
    return drizzle(client, { schema });
  } catch (error) {
    console.error("Failed to create database connection:", error);
    throw error;
  }
};

export const db = createDbConnection();

// Export a function to verify the database connection
export async function verifyDatabaseConnection() {
  try {
    await db.query.users.findMany();
    return true;
  } catch (error) {
    console.error("Database connection verification failed:", error);
    throw error;
  }
}