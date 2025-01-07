import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@db/schema";
import { log } from "../server/vite";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

log("Initializing database connection...");

const db = drizzle({
  connection: process.env.DATABASE_URL,
  schema,
  ws: ws,
});

log("Database connection initialized successfully");

export { db };