import { IStorage } from './IStorage';
import { SQLiteAdapter } from './SQLiteAdapter';

/**
 * Storage Factory
 * 
 * Following ARCHITECTURE.md:
 * - The BLOB: IStorage interface (abstract)
 * - The CILIA: Database adapters (PostgreSQL, SQLite, MySQL, MongoDB)
 * - Swap via .env: DATABASE_TYPE=postgres|sqlite|mysql|mongodb
 * 
 * Following SIMPLICITY_DOCTRINE.md:
 * - Configuration over code (swap via env var)
 * - No complex factory pattern (simple switch statement)
 * - Each adapter is independent
 * 
 * Baseline:
 * - SQLite (serverless, zero config, built-in)
 * - Perfect for dev, testing, single-user
 * 
 * Production:
 * - PostgreSQL (via Drizzle ORM) - Recommended
 * - MySQL (via Drizzle ORM)
 * - MongoDB (via Mongoose)
 * - Swap by changing .env
 */

export class StorageFactory {
  
  /**
   * Create storage adapter based on environment
   */
  static async create(): Promise<IStorage> {
    const dbType = (process.env.DATABASE_TYPE || 'postgres').toLowerCase();
    const dbUrl = process.env.DATABASE_URL;
    
    console.log(`🗄️ Initializing storage: ${dbType}`);
    
    let storage: IStorage;
    
    switch (dbType) {
      case 'sqlite':
        storage = new SQLiteAdapter(process.env.SQLITE_PATH);
        break;
      
      case 'postgres':
      case 'postgresql':
        // Use existing Drizzle-based PostgreSQL storage
        const { PostgresAdapter } = await import('./PostgresAdapter');
        storage = new PostgresAdapter(dbUrl!);
        break;
      
      case 'mysql':
        // Future: MySQL adapter via Drizzle
        throw new Error('MySQL adapter not yet implemented. Use PostgreSQL or SQLite.');
      
      case 'mongodb':
      case 'mongo':
        // Future: MongoDB adapter via Mongoose
        throw new Error('MongoDB adapter not yet implemented. Use PostgreSQL or SQLite.');
      
      case 'memory':
        // Future: In-memory adapter for testing
        console.warn('⚠️ Using in-memory storage (data will be lost on restart)');
        storage = new SQLiteAdapter(':memory:');
        break;
      
      default:
        console.warn(`⚠️ Unknown DATABASE_TYPE: ${dbType}, falling back to SQLite`);
        storage = new SQLiteAdapter();
    }
    
    // Initialize (create tables, etc.)
    await storage.initialize();
    
    console.log(`✅ Storage initialized: ${dbType}`);
    
    return storage;
  }
  
  /**
   * Get recommended database for scenario
   */
  static getRecommendation(scenario: string): {
    database: string;
    reason: string;
    setup: string;
  } {
    
    const recommendations: Record<string, any> = {
      development: {
        database: 'SQLite',
        reason: 'Zero configuration, file-based, fast for dev',
        setup: 'DATABASE_TYPE=sqlite (or leave blank, SQLite is fallback)',
      },
      testing: {
        database: 'SQLite (in-memory)',
        reason: 'Fast, isolated, no cleanup needed',
        setup: 'DATABASE_TYPE=memory',
      },
      'single-user': {
        database: 'SQLite',
        reason: 'Simple, reliable, no server needed',
        setup: 'DATABASE_TYPE=sqlite\nSQLITE_PATH=./amoeba.db',
      },
      production: {
        database: 'PostgreSQL (Neon.tech free tier)',
        reason: 'Scalable, reliable, free tier available, best features',
        setup: 'DATABASE_TYPE=postgres\nDATABASE_URL=postgresql://...',
      },
      enterprise: {
        database: 'PostgreSQL (managed)',
        reason: 'Scalable, ACID compliant, excellent JSON support',
        setup: 'DATABASE_TYPE=postgres\nDATABASE_URL=postgresql://...',
      },
      'high-volume': {
        database: 'PostgreSQL with read replicas',
        reason: 'Handle millions of records, horizontal scaling',
        setup: 'DATABASE_TYPE=postgres\nDATABASE_URL=postgresql://...\nREAD_REPLICA_URL=postgresql://...',
      },
    };
    
    return recommendations[scenario] || recommendations.production;
  }
}

