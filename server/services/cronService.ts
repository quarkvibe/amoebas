import { horoscopeService } from './horoscopeService';
import { premiumEmailService } from './premiumEmailService';

export class CronService {
  private dailyHoroscopeInterval: NodeJS.Timeout | null = null;
  private premiumEmailInterval: NodeJS.Timeout | null = null;

  /**
   * Start the automated daily horoscope generation and email distribution
   */
  start(): void {
    console.log('🌟 Starting Amoeba Horoscope Cron Service...');

    // Generate daily horoscopes at 12:00 AM UTC every day
    this.scheduleDailyHoroscopeGeneration();
    
    // Send premium emails at 6:00 AM UTC every day
    this.schedulePremiumEmailDistribution();

    console.log('✅ Cron service started successfully');
  }

  /**
   * Stop all cron jobs
   */
  stop(): void {
    if (this.dailyHoroscopeInterval) {
      clearInterval(this.dailyHoroscopeInterval);
      this.dailyHoroscopeInterval = null;
    }

    if (this.premiumEmailInterval) {
      clearInterval(this.premiumEmailInterval);
      this.premiumEmailInterval = null;
    }

    console.log('🛑 Cron service stopped');
  }

  /**
   * Schedule daily horoscope generation at midnight UTC
   */
  private scheduleDailyHoroscopeGeneration(): void {
    // Calculate time until next midnight UTC
    const now = new Date();
    const nextMidnight = new Date();
    nextMidnight.setUTCHours(24, 0, 0, 0); // Next midnight UTC
    
    const timeUntilMidnight = nextMidnight.getTime() - now.getTime();

    // Set initial timeout to next midnight
    setTimeout(() => {
      this.generateDailyHoroscopes();
      
      // Then run every 24 hours
      this.dailyHoroscopeInterval = setInterval(() => {
        this.generateDailyHoroscopes();
      }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
      
    }, timeUntilMidnight);

    console.log(`📅 Daily horoscope generation scheduled for ${nextMidnight.toISOString()}`);
  }

  /**
   * Schedule premium email distribution at 6:00 AM UTC
   */
  private schedulePremiumEmailDistribution(): void {
    // Calculate time until next 6 AM UTC
    const now = new Date();
    const next6AM = new Date();
    next6AM.setUTCHours(6, 0, 0, 0); // 6 AM UTC
    
    // If it's already past 6 AM today, schedule for tomorrow
    if (now.getTime() > next6AM.getTime()) {
      next6AM.setUTCDate(next6AM.getUTCDate() + 1);
    }
    
    const timeUntil6AM = next6AM.getTime() - now.getTime();

    // Set initial timeout to next 6 AM
    setTimeout(() => {
      this.sendPremiumEmails();
      
      // Then run every 24 hours
      this.premiumEmailInterval = setInterval(() => {
        this.sendPremiumEmails();
      }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
      
    }, timeUntil6AM);

    console.log(`📧 Premium email distribution scheduled for ${next6AM.toISOString()}`);
  }

  /**
   * Generate horoscopes for all zodiac signs for today
   */
  private async generateDailyHoroscopes(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log(`🌟 Starting daily horoscope generation for ${today}...`);
      
      const result = await horoscopeService.generateDailyHoroscopes(today);
      
      console.log(`✅ Daily horoscope generation completed:`, {
        date: today,
        generated: result.generated,
        skipped: result.skipped,
        failed: result.failed
      });
      
    } catch (error) {
      console.error('❌ Failed to generate daily horoscopes:', error);
    }
  }

  /**
   * Send personalized horoscopes to all premium users
   */
  private async sendPremiumEmails(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log(`📧 Starting premium email distribution for ${today}...`);
      
      const result = await premiumEmailService.sendDailyHoroscopesToPremiumUsers(today);
      
      console.log(`✅ Premium email distribution completed:`, {
        date: today,
        queued: result.queued,
        failed: result.failed,
        alreadySent: result.alreadySent
      });
      
    } catch (error) {
      console.error('❌ Failed to send premium emails:', error);
    }
  }

  /**
   * Manually trigger horoscope generation (for testing)
   */
  async triggerHoroscopeGeneration(date?: string): Promise<any> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    console.log(`🔄 Manually triggering horoscope generation for ${targetDate}...`);
    
    try {
      const result = await horoscopeService.generateDailyHoroscopes(targetDate);
      console.log(`✅ Manual horoscope generation completed`);
      return result;
    } catch (error) {
      console.error('❌ Manual horoscope generation failed:', error);
      throw error;
    }
  }

  /**
   * Manually trigger premium email distribution (for testing)
   */
  async triggerPremiumEmails(date?: string): Promise<any> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    console.log(`🔄 Manually triggering premium email distribution for ${targetDate}...`);
    
    try {
      const result = await premiumEmailService.sendDailyHoroscopesToPremiumUsers(targetDate);
      console.log(`✅ Manual premium email distribution completed`);
      return result;
    } catch (error) {
      console.error('❌ Manual premium email distribution failed:', error);
      throw error;
    }
  }

  /**
   * Get the status of the cron service
   */
  getStatus(): {
    isRunning: boolean;
    horoscopeJobActive: boolean;
    emailJobActive: boolean;
    nextHoroscopeGeneration: Date;
    nextEmailDistribution: Date;
  } {
    const now = new Date();
    
    // Calculate next midnight UTC
    const nextMidnight = new Date();
    nextMidnight.setUTCHours(24, 0, 0, 0);
    
    // Calculate next 6 AM UTC
    const next6AM = new Date();
    next6AM.setUTCHours(6, 0, 0, 0);
    if (now.getTime() > next6AM.getTime()) {
      next6AM.setUTCDate(next6AM.getUTCDate() + 1);
    }

    return {
      isRunning: this.dailyHoroscopeInterval !== null || this.premiumEmailInterval !== null,
      horoscopeJobActive: this.dailyHoroscopeInterval !== null,
      emailJobActive: this.premiumEmailInterval !== null,
      nextHoroscopeGeneration: nextMidnight,
      nextEmailDistribution: next6AM
    };
  }
}

export const cronService = new CronService();