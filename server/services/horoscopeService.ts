import OpenAI from "openai";
import { storage } from "../storage";
import { 
  ZodiacSign, 
  AstrologyDataCache, 
  InsertAstrologyDataCache,
  InsertHoroscope,
  InsertHoroscopeGeneration 
} from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface PlanetaryPosition {
  planet: string;
  sign: string;
  degree: number;
  house?: number;
}

interface AstrologyApiResponse {
  planets: PlanetaryPosition[];
  aspects: any[];
  moon_phase: string;
  date: string;
}

export class HoroscopeService {
  
  /**
   * Fetch current planetary data from Free Astrology API
   */
  async fetchCurrentAstrologyData(date: string): Promise<AstrologyApiResponse> {
    try {
      // FreeAstrologyAPI.com endpoint for current planetary positions
      // Using current date to get today's planetary positions
      const response = await fetch('https://api.freeastrologyapi.com/api/v1/planetary-positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day: parseInt(date.split('-')[2]),
          month: parseInt(date.split('-')[1]),
          year: parseInt(date.split('-')[0]),
          hour: 12, // noon UTC
          min: 0,
          lat: 0, // Greenwich
          lon: 0,
          tzone: 0
        })
      });

      if (!response.ok) {
        throw new Error(`Astrology API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the response to our expected format
      return {
        planets: data.planets || [],
        aspects: data.aspects || [],
        moon_phase: data.moon_phase || 'unknown',
        date: date
      };
    } catch (error) {
      console.error('Error fetching astrology data:', error);
      // Fallback with basic data structure
      return {
        planets: [],
        aspects: [],
        moon_phase: 'unknown',
        date: date
      };
    }
  }

  /**
   * Get or cache astrology data for a specific date
   */
  async getAstrologyData(date: string): Promise<AstrologyDataCache | null> {
    // Check if we have cached data for this date
    const cached = await storage.getAstrologyDataByDate(date);
    if (cached && new Date(cached.expiresAt) > new Date()) {
      return cached;
    }

    // Fetch fresh data from API
    const apiData = await this.fetchCurrentAstrologyData(date);
    
    // Cache the data (expires in 24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const cacheData: InsertAstrologyDataCache = {
      date: date,
      planetaryPositions: apiData.planets,
      aspects: apiData.aspects,
      moonPhase: apiData.moon_phase,
      apiSource: 'freeastrology',
      rawData: apiData,
      expiresAt: expiresAt.toISOString(),
    };

    return await storage.createAstrologyDataCache(cacheData);
  }

  /**
   * Generate a horoscope for a specific zodiac sign using OpenAI
   */
  async generateHoroscopeForSign(
    zodiacSign: ZodiacSign, 
    astrologyData: AstrologyDataCache,
    date: string
  ): Promise<string> {
    try {
      const planetaryInfluences = this.analyzePlanetaryInfluences(zodiacSign, astrologyData);
      
      const prompt = `As a professional astrologer, generate a daily horoscope for ${zodiacSign.name.toUpperCase()} for ${date}.

ZODIAC SIGN DETAILS:
- Sign: ${zodiacSign.name} (${zodiacSign.symbol})
- Element: ${zodiacSign.element}
- Quality: ${zodiacSign.quality}
- Date Range: ${zodiacSign.dateRange}
- Ruling Planet: ${zodiacSign.traits?.ruling_planet || 'unknown'}
- Key Traits: ${zodiacSign.traits?.keywords?.join(', ') || 'none'}

CURRENT PLANETARY POSITIONS:
${JSON.stringify(astrologyData.planetaryPositions, null, 2)}

MOON PHASE: ${astrologyData.moonPhase}

PLANETARY INFLUENCES FOR ${zodiacSign.name.toUpperCase()}:
${planetaryInfluences}

Generate a personalized, engaging daily horoscope (150-200 words) that:
1. References specific planetary influences affecting ${zodiacSign.name} today
2. Provides guidance for love, career, health, and personal growth
3. Includes a lucky number (1-99) and lucky color
4. Uses an encouraging and mystical tone
5. Mentions the moon phase if relevant
6. Is specific to the actual planetary positions provided

Format as JSON:
{
  "content": "horoscope text here...",
  "mood": "positive|neutral|challenging",
  "luckNumber": number,
  "luckyColor": "color name"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional astrologer with deep knowledge of planetary influences and zodiac characteristics. Generate accurate, personalized horoscopes based on real astrological data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8, // Some creativity for engaging content
        max_tokens: 500
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.content || "The stars have a message for you today, but it's written in a language only the cosmos understands.";
      
    } catch (error) {
      console.error(`Error generating horoscope for ${zodiacSign.name}:`, error);
      return `The cosmic energies are aligning for ${zodiacSign.name} today, bringing opportunities for growth and positive change.`;
    }
  }

  /**
   * Analyze how current planetary positions affect a specific zodiac sign
   */
  private analyzePlanetaryInfluences(zodiacSign: ZodiacSign, astrologyData: AstrologyDataCache): string {
    const influences: string[] = [];
    const planets = astrologyData.planetaryPositions as PlanetaryPosition[];
    
    if (!planets || planets.length === 0) {
      return "General planetary influences suggest a day of reflection and growth.";
    }

    // Check for planets in the same element
    planets.forEach(planet => {
      if (this.getElementForSign(planet.sign) === zodiacSign.element) {
        influences.push(`${planet.planet} in ${planet.sign} harmonizes with your ${zodiacSign.element} nature`);
      }
    });

    // Check for planets in the zodiac sign itself
    planets.forEach(planet => {
      if (planet.sign.toLowerCase() === zodiacSign.name.toLowerCase()) {
        influences.push(`${planet.planet} is currently activating your sign, amplifying your natural ${zodiacSign.name} energy`);
      }
    });

    // Check compatibility with current moon phase
    if (astrologyData.moonPhase) {
      influences.push(`The ${astrologyData.moonPhase} moon phase encourages ${zodiacSign.name} to focus on inner wisdom`);
    }

    return influences.length > 0 
      ? influences.join('. ') + '.'
      : "The planetary alignments suggest a balanced day with opportunities for personal growth.";
  }

  /**
   * Get the element for a zodiac sign name
   */
  private getElementForSign(signName: string): string {
    const elementMap: Record<string, string> = {
      'aries': 'fire', 'leo': 'fire', 'sagittarius': 'fire',
      'taurus': 'earth', 'virgo': 'earth', 'capricorn': 'earth',
      'gemini': 'air', 'libra': 'air', 'aquarius': 'air',
      'cancer': 'water', 'scorpio': 'water', 'pisces': 'water'
    };
    return elementMap[signName.toLowerCase()] || 'unknown';
  }

  /**
   * Generate daily horoscopes for all 12 zodiac signs
   */
  async generateDailyHoroscopes(date: string): Promise<void> {
    try {
      // Create generation tracking record
      const generation = await storage.createHoroscopeGeneration({
        date: date,
        status: 'processing',
        totalSigns: 12,
        completedSigns: 0,
        startedAt: new Date().toISOString(),
      });

      // Get astrology data for the date
      const astrologyData = await this.getAstrologyData(date);
      if (!astrologyData) {
        throw new Error('Failed to fetch astrology data');
      }

      // Update generation with astrology data reference
      await storage.updateHoroscopeGeneration(generation.id, {
        astrologyDataId: astrologyData.id,
      });

      // Get all zodiac signs
      const zodiacSigns = await storage.getAllZodiacSigns();
      let completedCount = 0;

      // Generate horoscope for each sign
      for (const sign of zodiacSigns) {
        try {
          const content = await this.generateHoroscopeForSign(sign, astrologyData, date);
          
          // Parse the full response to extract mood, luck number, etc.
          let horoscopeData = { content, mood: 'positive', luckNumber: Math.floor(Math.random() * 99) + 1, luckyColor: 'blue' };
          
          try {
            const fullResponse = await this.generateFullHoroscopeData(sign, astrologyData, date);
            horoscopeData = { ...horoscopeData, ...fullResponse };
          } catch (e) {
            console.log('Using fallback horoscope data for', sign.name);
          }

          // Save the horoscope
          const horoscope: InsertHoroscope = {
            zodiacSignId: sign.id,
            date: date,
            content: horoscopeData.content,
            mood: horoscopeData.mood,
            luckNumber: horoscopeData.luckNumber,
            luckyColor: horoscopeData.luckyColor,
            planetaryInfluence: {
              moonPhase: astrologyData.moonPhase,
              keyPlanets: (astrologyData.planetaryPositions as PlanetaryPosition[]).slice(0, 3)
            },
          };

          await storage.createHoroscope(horoscope);
          completedCount++;

          // Update progress
          await storage.updateHoroscopeGeneration(generation.id, {
            completedSigns: completedCount,
          });

        } catch (error) {
          console.error(`Failed to generate horoscope for ${sign.name}:`, error);
        }
      }

      // Mark generation as completed
      await storage.updateHoroscopeGeneration(generation.id, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      });

      console.log(`Successfully generated ${completedCount}/12 horoscopes for ${date}`);

    } catch (error) {
      console.error('Error generating daily horoscopes:', error);
      throw error;
    }
  }

  /**
   * Generate full horoscope data including mood, lucky number, etc.
   */
  private async generateFullHoroscopeData(
    zodiacSign: ZodiacSign, 
    astrologyData: AstrologyDataCache, 
    date: string
  ): Promise<{ content: string; mood: string; luckNumber: number; luckyColor: string }> {
    const planetaryInfluences = this.analyzePlanetaryInfluences(zodiacSign, astrologyData);
    
    const prompt = `As a professional astrologer, generate a daily horoscope for ${zodiacSign.name.toUpperCase()} for ${date}.

ZODIAC SIGN DETAILS:
- Sign: ${zodiacSign.name} (${zodiacSign.symbol})
- Element: ${zodiacSign.element}
- Quality: ${zodiacSign.quality}
- Ruling Planet: ${zodiacSign.traits?.ruling_planet || 'unknown'}

CURRENT PLANETARY POSITIONS:
${JSON.stringify(astrologyData.planetaryPositions, null, 2)}

MOON PHASE: ${astrologyData.moonPhase}

Generate a personalized daily horoscope (150-200 words) in JSON format:
{
  "content": "engaging horoscope text referencing actual planetary positions...",
  "mood": "positive|neutral|challenging",
  "luckNumber": 1-99,
  "luckyColor": "specific color name"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system", 
          content: "You are a professional astrologer. Generate accurate, engaging horoscopes based on real planetary data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 500
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  /**
   * Get today's horoscope for a specific zodiac sign
   */
  async getTodaysHoroscope(zodiacSignName: string): Promise<any> {
    const today = new Date().toISOString().split('T')[0];
    return await storage.getHoroscopeBySignAndDate(zodiacSignName, today);
  }

  /**
   * Get horoscopes for all signs for a specific date
   */
  async getAllHoroscopesForDate(date: string): Promise<any[]> {
    return await storage.getAllHoroscopesForDate(date);
  }
}

export const horoscopeService = new HoroscopeService();