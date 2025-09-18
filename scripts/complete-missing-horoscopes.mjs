#!/usr/bin/env node

import { execSync } from 'child_process';

async function completeMissingHoroscopes() {
  const date = '2025-09-18';
  console.log(`🔄 Completing missing horoscopes for ${date}...`);

  const missingSignsJson = `["leo", "libra", "pisces", "sagittarius", "scorpio", "taurus", "virgo"]`;
  const missingSigns = JSON.parse(missingSignsJson);
  
  console.log(`❌ Missing horoscopes for: ${missingSigns.join(', ')}`);

  for (const sign of missingSigns) {
    try {
      console.log(`🌟 Generating horoscope for ${sign}...`);
      
      // Use the test endpoint to generate individual horoscope
      const response = await fetch('http://localhost:5000/api/test/generate-single-horoscope', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sign: sign,
          date: date
        })
      });
      
      if (response.ok) {
        console.log(`✅ Generated horoscope for ${sign}`);
      } else {
        console.log(`❌ Failed to generate horoscope for ${sign}: ${response.status}`);
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error generating horoscope for ${sign}:`, error.message);
    }
  }

  console.log('🎉 Completed missing horoscope generation!');
}

// Run the script
completeMissingHoroscopes().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});