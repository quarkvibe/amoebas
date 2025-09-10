#!/usr/bin/env node

/**
 * Populate Zodiac Signs with Full Schema
 */

import pkg from 'pg';
const { Pool } = pkg;

const DATABASE_URL = process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const zodiacSigns = [
  { id: 1, name: 'aries', symbol: '♈', element: 'fire', quality: 'cardinal', ruling_planet: 'Mars', date_range: 'Mar 21 - Apr 19' },
  { id: 2, name: 'taurus', symbol: '♉', element: 'earth', quality: 'fixed', ruling_planet: 'Venus', date_range: 'Apr 20 - May 20' },
  { id: 3, name: 'gemini', symbol: '♊', element: 'air', quality: 'mutable', ruling_planet: 'Mercury', date_range: 'May 21 - Jun 20' },
  { id: 4, name: 'cancer', symbol: '♋', element: 'water', quality: 'cardinal', ruling_planet: 'Moon', date_range: 'Jun 21 - Jul 22' },
  { id: 5, name: 'leo', symbol: '♌', element: 'fire', quality: 'fixed', ruling_planet: 'Sun', date_range: 'Jul 23 - Aug 22' },
  { id: 6, name: 'virgo', symbol: '♍', element: 'earth', quality: 'mutable', ruling_planet: 'Mercury', date_range: 'Aug 23 - Sep 22' },
  { id: 7, name: 'libra', symbol: '♎', element: 'air', quality: 'cardinal', ruling_planet: 'Venus', date_range: 'Sep 23 - Oct 22' },
  { id: 8, name: 'scorpio', symbol: '♏', element: 'water', quality: 'fixed', ruling_planet: 'Pluto', date_range: 'Oct 23 - Nov 21' },
  { id: 9, name: 'sagittarius', symbol: '♐', element: 'fire', quality: 'mutable', ruling_planet: 'Jupiter', date_range: 'Nov 22 - Dec 21' },
  { id: 10, name: 'capricorn', symbol: '♑', element: 'earth', quality: 'cardinal', ruling_planet: 'Saturn', date_range: 'Dec 22 - Jan 19' },
  { id: 11, name: 'aquarius', symbol: '♒', element: 'air', quality: 'fixed', ruling_planet: 'Uranus', date_range: 'Jan 20 - Feb 18' },
  { id: 12, name: 'pisces', symbol: '♓', element: 'water', quality: 'mutable', ruling_planet: 'Neptune', date_range: 'Feb 19 - Mar 20' }
];

async function populateZodiacSigns() {
  console.log('🔮 Populating Zodiac Signs with Full Schema...\n');
  
  try {
    const client = await pool.connect();
    
    // Clear existing data first
    await client.query('DELETE FROM zodiac_signs');
    console.log('🗑️  Cleared existing zodiac signs data');
    
    // Insert all zodiac signs with full data
    for (const sign of zodiacSigns) {
      await client.query(`
        INSERT INTO zodiac_signs (id, name, symbol, element, quality, ruling_planet, date_range) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [sign.id, sign.name, sign.symbol, sign.element, sign.quality, sign.ruling_planet, sign.date_range]);
      
      console.log(`✅ ${sign.name.toUpperCase()} ${sign.symbol} (${sign.element}/${sign.quality})`);
    }
    
    // Verify the data
    console.log('\n🔍 Verifying zodiac signs...');
    const verifyResult = await client.query('SELECT id, name, symbol, element FROM zodiac_signs ORDER BY id');
    
    console.log('📊 Zodiac signs now in database:');
    verifyResult.rows.forEach(row => {
      console.log(`  ${row.id}: ${row.name.toUpperCase()} ${row.symbol} (${row.element})`);
    });
    
    client.release();
    console.log('\n✅ Zodiac signs populated successfully!');
    
  } catch (error) {
    console.error('❌ Error populating zodiac signs:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

populateZodiacSigns()
  .then(() => {
    console.log('\n🎉 Zodiac signs setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  });