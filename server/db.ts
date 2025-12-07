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
export let pgliteClient: PGlite | undefined;

if (process.env.DATABASE_URL) {
  // Use Neon / Postgres if configured
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // Fallback to local PGlite (Zero-Config)
  console.log("⚠️ No DATABASE_URL found. Using local PGlite database (./amoeba.db).");
  pgliteClient = new PGlite("./amoeba.db");
  db = drizzlePglite(pgliteClient, { schema });
}

// Initialize PGlite schema (creates tables if they don't exist)
export async function initializePGliteSchema(): Promise<void> {
  if (!pgliteClient) return;

  console.log("📦 Initializing PGlite schema...");

  // Core tables for lightweight local testing
  await pgliteClient.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
      username VARCHAR UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email VARCHAR,
      first_name VARCHAR,
      last_name VARCHAR,
      profile_image_url VARCHAR,
      is_admin BOOLEAN DEFAULT false,
      subscription_tier VARCHAR(50) DEFAULT 'free',
      subscription_status VARCHAR(50) DEFAULT 'active',
      stripe_customer_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      subscription_start_date TIMESTAMP,
      subscription_end_date TIMESTAMP,
      subscription_canceled_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Sessions table
    CREATE TABLE IF NOT EXISTS sessions (
      sid VARCHAR PRIMARY KEY,
      sess JSONB NOT NULL,
      expire TIMESTAMP NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_session_expire ON sessions(expire);

    -- Content templates
    CREATE TABLE IF NOT EXISTS content_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      content_type VARCHAR(50) NOT NULL,
      ai_prompt TEXT NOT NULL,
      system_prompt TEXT,
      variables JSONB,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Generated content
    CREATE TABLE IF NOT EXISTS generated_content (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
      template_id UUID,
      content TEXT NOT NULL,
      metadata JSONB,
      quality_score INTEGER,
      status VARCHAR(50) DEFAULT 'pending',
      distribution_status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Scheduled jobs
    CREATE TABLE IF NOT EXISTS scheduled_jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      template_id UUID,
      cron_expression VARCHAR(100) NOT NULL,
      timezone VARCHAR(50) DEFAULT 'UTC',
      is_active BOOLEAN DEFAULT true,
      next_run TIMESTAMP,
      last_run TIMESTAMP,
      last_status VARCHAR(50),
      last_error TEXT,
      total_runs INTEGER DEFAULT 0,
      success_count INTEGER DEFAULT 0,
      error_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- AI credentials (BYOK)
    CREATE TABLE IF NOT EXISTS ai_credentials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
      provider VARCHAR(50) NOT NULL,
      name VARCHAR(100) NOT NULL,
      api_key TEXT NOT NULL,
      additional_config JSONB,
      is_default BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Output channels
    CREATE TABLE IF NOT EXISTS output_channels (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(50) NOT NULL,
      config JSONB NOT NULL,
      output_format VARCHAR(50),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Data sources
    CREATE TABLE IF NOT EXISTS data_sources (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(50) NOT NULL,
      config JSONB NOT NULL,
      parsing_rules JSONB,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- API Keys
    CREATE TABLE IF NOT EXISTS api_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      key_hash VARCHAR(255) NOT NULL,
      permissions JSONB NOT NULL,
      is_active BOOLEAN DEFAULT true,
      last_used TIMESTAMP,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Licenses
    CREATE TABLE IF NOT EXISTS licenses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      license_key VARCHAR(255) UNIQUE NOT NULL,
      user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'community',
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      machine_id VARCHAR(255),
      is_active BOOLEAN DEFAULT true,
      activated_at TIMESTAMP,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("✅ PGlite schema initialized");
}