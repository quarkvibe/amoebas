#!/usr/bin/env node

/**
 * Comprehensive Database Explorer
 * This script will thoroughly explore the production database structure
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

async function exploreDatabase() {
  console.log('🔍 Comprehensive Database Exploration\n');
  
  try {
    const client = await pool.connect();
    
    // 1. List ALL tables
    console.log('📋 ALL TABLES in database:');
    const tablesResult = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    tablesResult.rows.forEach(row => {
      console.log(`  📊 ${row.table_name} (${row.table_type})`);
    });
    
    // 2. Look specifically for zodiac-related tables
    console.log('\n🔍 ZODIAC-related tables:');
    const zodiacTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name ILIKE '%zodiac%'
      ORDER BY table_name;
    `);
    
    if (zodiacTablesResult.rows.length === 0) {
      console.log('  ❌ No zodiac-related tables found!');
    } else {
      zodiacTablesResult.rows.forEach(row => {
        console.log(`  🔮 ${row.table_name}`);
      });
    }
    
    // 3. Check if zodiac_signs table exists and what's in it
    const zodiacSignsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'zodiac_signs'
      );
    `);
    
    console.log(`\n🔮 zodiac_signs table exists: ${zodiacSignsCheck.rows[0].exists}`);
    
    if (zodiacSignsCheck.rows[0].exists) {
      // Get structure
      console.log('\n📋 zodiac_signs table structure:');
      const structureResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'zodiac_signs' 
        ORDER BY ordinal_position;
      `);
      
      structureResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'}) default: ${row.column_default || 'none'}`);
      });
      
      // Get data
      console.log('\n📊 zodiac_signs table data:');
      const dataResult = await client.query('SELECT * FROM zodiac_signs ORDER BY id');
      
      if (dataResult.rows.length === 0) {
        console.log('  ❌ Table is EMPTY!');
      } else {
        dataResult.rows.forEach(row => {
          console.log(`  🔮 ID ${row.id}: ${row.name}`);
        });
      }
    }
    
    // 4. Check if horoscopes table exists
    const horoscopesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'horoscopes'
      );
    `);
    
    console.log(`\n📜 horoscopes table exists: ${horoscopesCheck.rows[0].exists}`);
    
    if (horoscopesCheck.rows[0].exists) {
      console.log('\n📊 Sample horoscopes data:');
      const horoscopesData = await client.query('SELECT * FROM horoscopes LIMIT 3');
      
      if (horoscopesData.rows.length === 0) {
        console.log('  ❌ Horoscopes table is EMPTY!');
      } else {
        horoscopesData.rows.forEach(row => {
          console.log(`  📜 ${row.date}: Sign ID ${row.zodiac_sign_id} - ${row.content.substring(0, 50)}...`);
        });
      }
    }
    
    // 5. Create zodiac_signs table and populate if it doesn't exist
    if (!zodiacSignsCheck.rows[0].exists) {
      console.log('\n🛠️  Creating zodiac_signs table...');
      
      await client.query(`
        CREATE TABLE zodiac_signs (
          id INTEGER PRIMARY KEY,
          name VARCHAR NOT NULL UNIQUE
        );
      `);
      
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
      
      console.log('🔮 Inserting zodiac signs...');
      for (const sign of zodiacSigns) {
        await client.query(
          'INSERT INTO zodiac_signs (id, name) VALUES ($1, $2)',
          [sign.id, sign.name]
        );
        console.log(`  ✅ ${sign.name.toUpperCase()}`);
      }
    }
    
    client.release();
    console.log('\n✅ Database exploration completed!');
    
  } catch (error) {
    console.error('❌ Database exploration failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the exploration
exploreDatabase()
  .then(() => {
    console.log('\n🎉 Exploration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Exploration failed:', error.message);
    process.exit(1);
  });