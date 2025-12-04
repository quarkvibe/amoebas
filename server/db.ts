import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Unified DB interface (using any to allow both Postgres and PGlite types)
export let db: any;
export let pool: Pool | undefined;

if (process.env.DATABASE_URL) {
  // Use Neon / Postgres if configured
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // Fallback to local PGlite (Zero-Config)
  console.log("⚠️ No DATABASE_URL found. Using local PGlite database (./amoeba.db).");
  const client = new PGlite("./amoeba.db");
  db = drizzlePglite(client, { schema });
}