#!/usr/bin/env node

const { db } = require('../server/db.js');
const { horoscopes, zodiacSigns, horoscopeGenerations } = require('../shared/schema.ts');
const { HoroscopeService } = require('../server/services/horoscopeService.ts');
const { eq, and, notInArray } = require('drizzle-orm');

async function completeMissingHoroscopes() {
  const date = '2025-09-18';
  console.log(`🔄 Completing missing horoscopes for ${date}...`);

  try {
    // Get all zodiac signs
    const allSigns = await db.select().from(zodiacSigns);
    console.log(`📊 Total zodiac signs: ${allSigns.length}`);

    // Get existing horoscopes for the date
    const existingHoroscopes = await db.select({ zodiacSignId: horoscopes.zodiacSignId })
      .from(horoscopes)
      .where(eq(horoscopes.date, date));
    
    const existingSignIds = existingHoroscopes.map(h => h.zodiacSignId);
    console.log(`✅ Existing horoscopes: ${existingSignIds.length} signs`);
    console.log(`   Signs: ${existingSignIds.join(', ')}`);

    // Find missing signs
    const missingSigns = allSigns.filter(sign => !existingSignIds.includes(sign.id));
    console.log(`❌ Missing horoscopes: ${missingSigns.length} signs`);
    console.log(`   Missing signs: ${missingSigns.map(s => s.id).join(', ')}`);

    if (missingSigns.length === 0) {
      console.log('🎉 All horoscopes already complete!');
      return;
    }

    // Initialize horoscope service
    const horoscopeService = new HoroscopeService();

    // Get astrology data for the date
    console.log('📡 Fetching astrology data...');
    const astrologyData = await horoscopeService.getAstrologyData(date);
    
    if (!astrologyData) {
      console.error('❌ Failed to fetch astrology data');
      return;
    }

    console.log('✅ Astrology data fetched successfully');

    // Generate horoscopes for missing signs
    let completedCount = existingSignIds.length;
    
    for (const sign of missingSigns) {
      try {
        console.log(`🌟 Generating horoscope for ${sign.name} (${sign.id})...`);
        
        const content = await horoscopeService.generateHoroscopeForSign(sign, astrologyData, date);
        
        // Create horoscope record
        const newHoroscope = await db.insert(horoscopes).values({
          zodiacSignId: sign.id,
          date: date,
          content: content
        }).returning();

        console.log(`✅ Generated horoscope for ${sign.name}: ${content.substring(0, 50)}...`);
        completedCount++;
        
      } catch (error) {
        console.error(`❌ Error generating horoscope for ${sign.name}:`, error.message);
      }
    }

    // Update generation status
    await db.update(horoscopeGenerations)
      .set({ 
        completedSigns: completedCount,
        status: completedCount === 12 ? 'completed' : 'processing',
        completedAt: completedCount === 12 ? new Date() : null
      })
      .where(eq(horoscopeGenerations.date, date));

    console.log(`🎉 Completed! Generated ${completedCount}/12 horoscopes for ${date}`);

  } catch (error) {
    console.error('❌ Error completing horoscopes:', error);
  }
}

// Run the script
completeMissingHoroscopes().then(() => {
  console.log('✅ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});