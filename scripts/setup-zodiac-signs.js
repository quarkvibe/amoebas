#!/usr/bin/env node

/**
 * Setup Zodiac Signs in Production Database
 * This script populates the zodiac_signs table with all 12 zodiac signs
 */

import pkg from 'pg';
const { Pool } = pkg;

const DATABASE_URL = process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const zodiacSigns = [
  { id: 1, name: 'aries' },
  { id: 2, name: 'taurus' },
  { id: 3, name: 'gemini' },
  { id: 4, name: 'cancer' },
  { id: 5, name: 'leo' },
  { id: 6, name: 'virgo' },
  { id: 7, name: 'libra' },
  { id: 8, name: 'scorpio' },
  { id: 9, name: 'sagittarius' },
  { id: 10, name: 'capricorn' },
  { id: 11, name: 'aquarius' },
  { id: 12, name: 'pisces' }
];

async function setupZodiacSigns() {
  console.log('🌟 Setting up Zodiac Signs in Production Database...\n');
  
  try {
    const client = await pool.connect();
    
    // First, check if zodiac_signs table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'zodiac_signs'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('📋 Creating zodiac_signs table...');
      await client.query(`
        CREATE TABLE zodiac_signs (
          id INTEGER PRIMARY KEY,
          name VARCHAR NOT NULL UNIQUE
        );
      `);
    }
    
    // Insert zodiac signs
    console.log('🔮 Inserting zodiac signs...');
    
    for (const sign of zodiacSigns) {
      try {
        await client.query(`
          INSERT INTO zodiac_signs (id, name) 
          VALUES ($1, $2) 
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
        `, [sign.id, sign.name]);
        
        console.log(`  ✅ ${sign.name.toUpperCase()} (ID: ${sign.id})`);
      } catch (error) {
        console.log(`  ⚠️  ${sign.name.toUpperCase()} already exists`);
      }
    }
    
    // Verify the data
    console.log('\n🔍 Verifying zodiac signs...');
    const verifyResult = await client.query('SELECT id, name FROM zodiac_signs ORDER BY id');
    
    console.log('📊 Zodiac signs in database:');
    verifyResult.rows.forEach(row => {
      console.log(`  ${row.id}: ${row.name.toUpperCase()}`);
    });
    
    client.release();
    console.log('\n✅ Zodiac signs setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up zodiac signs:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the setup
setupZodiacSigns()
  .then(() => {
    console.log('\n🎉 Setup script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup script failed:', error.message);
    process.exit(1);
  });