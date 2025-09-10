import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

interface ProductionUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  subscriptionLevel?: string;
  isPremium: boolean;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  zodiacSign?: string;
  createdAt?: string;
}

interface PremiumUserSunChart {
  userId: string;
  email: string;
  zodiacSign: string;
  birthDate: string;
  birthTime?: string;
  birthLocation?: string;
  subscriptionLevel: string;
}

export class ProductionDbService {
  private pool: Pool;

  constructor() {
    // Use production database credentials from environment
    // For testing, fall back to hardcoded connection if env var not set
    const connectionString = process.env.PRODUCTION_DATABASE_URL || 
      "postgresql://neondb_owner:npg_RIekd8D9noar@ep-nameless-sound-aerd3xbt.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";
    
    this.pool = new Pool({ connectionString });
  }

  /**
   * Test the production database connection
   */
  async testConnection(): Promise<{ database: string; host: string; user: string }> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT current_database() as database, 
               current_user as user,
               inet_server_addr() as host
      `);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  /**
   * Get the horoscope table columns to understand the schema
   */
  async getHoroscopeColumns(): Promise<any[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'horoscopes'
        ORDER BY ordinal_position;
      `);
      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Get all tables in the production database to understand the schema
   */
  async getProductionSchema(): Promise<any[]> {
    try {
      const client = await this.pool.connect();
      
      // Get all tables
      const tablesResult = await client.query(`
        SELECT table_name, table_schema 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);
      
      const schema = [];
      
      for (const table of tablesResult.rows) {
        // Get columns for each table
        const columnsResult = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position;
        `, [table.table_name]);
        
        schema.push({
          tableName: table.table_name,
          columns: columnsResult.rows
        });
      }
      
      client.release();
      return schema;
    } catch (error) {
      console.error('Error fetching production schema:', error);
      throw error;
    }
  }

  /**
   * Get sample data from a specific table to understand the data structure
   */
  async getSampleData(tableName: string, limit = 5): Promise<any[]> {
    try {
      const client = await this.pool.connect();
      const result = await client.query(`SELECT * FROM ${tableName} LIMIT $1`, [limit]);
      client.release();
      return result.rows;
    } catch (error) {
      console.error(`Error fetching sample data from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Get premium users with subscription information
   */
  async getPremiumUsers(): Promise<ProductionUser[]> {
    try {
      const client = await this.pool.connect();
      
      const result = await client.query(`
        SELECT 
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.subscription_status,
          u.subscription_plan,
          u.stripe_customer_id,
          u.stripe_subscription_id,
          u.created_at,
          bc.sun_sign,
          bc.birth_date,
          bc.birth_time,
          bc.birth_location
        FROM users u
        LEFT JOIN birth_charts bc ON u.id = bc.user_id
        WHERE u.subscription_status IN ('premium', 'active', 'paid')
           OR u.subscription_plan != 'free'
           OR u.stripe_subscription_id IS NOT NULL
        ORDER BY u.created_at DESC;
      `);
      
      client.release();
      
      return result.rows.map(row => ({
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        subscriptionLevel: row.subscription_plan || row.subscription_status,
        isPremium: row.subscription_status !== 'free' || row.subscription_plan !== 'free' || !!row.stripe_subscription_id,
        birthDate: row.birth_date,
        birthTime: row.birth_time,
        birthLocation: row.birth_location,
        zodiacSign: row.sun_sign,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error fetching premium users:', error);
      throw error;
    }
  }

  /**
   * Get user sun chart data for horoscope personalization
   */
  async getUserSunChartData(): Promise<PremiumUserSunChart[]> {
    try {
      const client = await this.pool.connect();
      
      const result = await client.query(`
        SELECT 
          u.id as user_id,
          u.email,
          u.subscription_status,
          u.subscription_plan,
          bc.sun_sign,
          bc.birth_date,
          bc.birth_time,
          bc.birth_location,
          bc.latitude,
          bc.longitude,
          bc.timezone
        FROM users u
        INNER JOIN birth_charts bc ON u.id = bc.user_id
        WHERE bc.sun_sign IS NOT NULL 
          AND bc.birth_date IS NOT NULL
          AND (u.subscription_status IN ('premium', 'active', 'paid')
               OR u.subscription_plan != 'free'
               OR u.stripe_subscription_id IS NOT NULL)
        ORDER BY u.created_at DESC;
      `);
      
      client.release();
      
      return result.rows.map(row => ({
        userId: row.user_id,
        email: row.email,
        zodiacSign: row.sun_sign,
        birthDate: row.birth_date,
        birthTime: row.birth_time,
        birthLocation: row.birth_location,
        subscriptionLevel: row.subscription_plan || row.subscription_status
      }));
    } catch (error) {
      console.error('Error fetching user sun chart data:', error);
      throw error;
    }
  }

  /**
   * Check if a user has an active premium subscription
   */
  async isUserPremium(userId: string): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      
      const result = await client.query(`
        SELECT 
          subscription_status,
          subscription_plan,
          stripe_subscription_id
        FROM users 
        WHERE id = $1;
      `, [userId]);
      
      client.release();
      
      if (result.rows.length === 0) {
        return false;
      }
      
      const user = result.rows[0];
      return (
        user.subscription_status !== 'free' ||
        user.subscription_plan !== 'free' ||
        !!user.stripe_subscription_id
      );
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  /**
   * Get user's zodiac sign from production database
   */
  async getUserZodiacSign(userId: string): Promise<string | null> {
    try {
      const client = await this.pool.connect();
      
      const result = await client.query(`
        SELECT sun_sign 
        FROM birth_charts 
        WHERE user_id = $1;
      `, [userId]);
      
      client.release();
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0].sun_sign;
    } catch (error) {
      console.error('Error getting user zodiac sign:', error);
      return null;
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

export const productionDbService = new ProductionDbService();