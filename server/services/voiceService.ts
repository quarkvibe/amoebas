import Twilio from 'twilio';
import { storage } from '../storage';
import { activityMonitor } from './activityMonitor';

/**
 * Voice Service
 * Handles text-to-speech and voice call delivery
 * Supports: Twilio (primary), AWS Polly + Connect (future)
 */

export interface VoiceCallOptions {
  to: string;              // Phone number to call (E.164 format: +1234567890)
  content: string;         // Text to convert to speech
  voice?: string;          // Voice type (male/female, language)
  speed?: number;          // Speech rate (0.5 - 2.0)
  language?: string;       // Language code (e.g., 'en-US', 'es-ES')
}

export interface VoiceCallResult {
  success: boolean;
  callSid?: string;
  status?: string;
  duration?: number;
  cost?: number;
  error?: string;
  metadata?: any;
}

class VoiceService {
  
  /**
   * Make a voice call with text-to-speech
   */
  async makeVoiceCall(
    userId: string,
    options: VoiceCallOptions
  ): Promise<VoiceCallResult> {
    
    activityMonitor.logActivity('info', `📞 Initiating voice call to ${options.to}`);
    
    try {
      // Get voice credential (Twilio)
      const credential = await this.getVoiceCredential(userId);
      
      if (!credential) {
        throw new Error('No voice service credential configured. Please add Twilio credentials in Settings.');
      }
      
      // Route to appropriate provider
      switch (credential.provider.toLowerCase()) {
        case 'twilio':
          return await this.callViaTwilio(credential, options);
        
        case 'aws':
          return await this.callViaAWS(credential, options);
        
        default:
          throw new Error(`Unsupported voice provider: ${credential.provider}`);
      }
      
    } catch (error: any) {
      activityMonitor.logError(error, 'Voice Call');
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Make voice call via Twilio
   */
  private async callViaTwilio(
    credential: any,
    options: VoiceCallOptions
  ): Promise<VoiceCallResult> {
    
    try {
      const client = Twilio(credential.accountSid, credential.apiKey);
      
      // Get Twilio phone number (from credential config or first available)
      const fromNumber = credential.config?.phoneNumber || await this.getTwilioPhoneNumber(client);
      
      if (!fromNumber) {
        throw new Error('No Twilio phone number configured. Please add a phone number in Twilio console.');
      }
      
      // Prepare TwiML for text-to-speech
      const twiml = this.generateTwiML(options.content, {
        voice: options.voice || 'Polly.Joanna',  // Amazon Polly voices via Twilio
        language: options.language || 'en-US',
        speed: options.speed || 1.0,
      });
      
      activityMonitor.logActivity('debug', `📞 Calling ${options.to} from ${fromNumber}`);
      
      // Make the call
      const call = await client.calls.create({
        to: options.to,
        from: fromNumber,
        twiml: twiml,
        statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL, // Optional webhook for call status
      });
      
      activityMonitor.logActivity('success', `✅ Voice call initiated: ${call.sid}`);
      
      // Estimate cost (Twilio: ~$0.013/minute, assume 1 minute for TTS)
      const estimatedCost = 0.013;
      
      return {
        success: true,
        callSid: call.sid,
        status: call.status,
        cost: estimatedCost,
        metadata: {
          provider: 'twilio',
          to: options.to,
          from: fromNumber,
          voice: options.voice,
          contentLength: options.content.length,
        },
      };
      
    } catch (error: any) {
      activityMonitor.logError(error, 'Twilio Voice Call');
      
      // Parse Twilio errors for user-friendly messages
      if (error.code === 21608) {
        throw new Error('Invalid phone number format. Use E.164 format: +1234567890');
      } else if (error.code === 21606) {
        throw new Error('Phone number is not verified. Verify number in Twilio console or upgrade account.');
      } else if (error.code === 20003) {
        throw new Error('Invalid Twilio credentials. Please check Account SID and Auth Token.');
      }
      
      throw error;
    }
  }
  
  /**
   * Make voice call via AWS (Polly TTS + Connect)
   */
  private async callViaAWS(
    credential: any,
    options: VoiceCallOptions
  ): Promise<VoiceCallResult> {
    
    // Future implementation for AWS
    // Would use:
    // 1. AWS Polly for text-to-speech
    // 2. AWS Connect for making calls
    // 3. S3 to host audio file
    
    activityMonitor.logActivity('warning', 'AWS voice calls not yet implemented');
    
    return {
      success: false,
      error: 'AWS voice provider not yet implemented. Please use Twilio.',
    };
  }
  
  /**
   * Generate TwiML (Twilio Markup Language) for text-to-speech
   */
  private generateTwiML(
    content: string,
    options: {
      voice?: string;
      language?: string;
      speed?: number;
    }
  ): string {
    
    // Prepare content for voice (convert special characters, add pauses)
    const voiceContent = this.prepareForVoice(content);
    
    // Build TwiML with Say verb for TTS
    const twiml = `
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${options.voice}" language="${options.language}">
    ${this.escapeXML(voiceContent)}
  </Say>
  <Pause length="1"/>
  <Say voice="${options.voice}" language="${options.language}">
    This message was generated by Amoeba AI. Goodbye!
  </Say>
</Response>
    `.trim();
    
    return twiml;
  }
  
  /**
   * Prepare content for voice delivery
   * - Adds pauses for readability
   * - Expands abbreviations
   * - Formats numbers for speech
   */
  private prepareForVoice(content: string): string {
    let voiceContent = content;
    
    // Add pauses after sentences
    voiceContent = voiceContent.replace(/\.\s/g, '. <break time="500ms"/> ');
    
    // Add pauses after paragraphs
    voiceContent = voiceContent.replace(/\n\n/g, ' <break time="1s"/> ');
    
    // Expand common abbreviations
    const abbreviations: Record<string, string> = {
      'Dr.': 'Doctor',
      'Mr.': 'Mister',
      'Mrs.': 'Missus',
      'Ms.': 'Miss',
      'Inc.': 'Incorporated',
      'LLC': 'Limited Liability Company',
      'AI': 'A I',
      'API': 'A P I',
      'URL': 'U R L',
      'USD': 'U S Dollars',
      'CEO': 'C E O',
      'CFO': 'C F O',
    };
    
    for (const [abbrev, expansion] of Object.entries(abbreviations)) {
      const regex = new RegExp(`\\b${abbrev.replace('.', '\\.')}\\b`, 'g');
      voiceContent = voiceContent.replace(regex, expansion);
    }
    
    // Format numbers for speech
    voiceContent = voiceContent.replace(/\$(\d+)/g, '$1 dollars');
    voiceContent = voiceContent.replace(/(\d+)%/g, '$1 percent');
    
    return voiceContent;
  }
  
  /**
   * Escape XML special characters
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
  
  /**
   * Get Twilio phone number
   */
  private async getTwilioPhoneNumber(client: any): Promise<string | null> {
    try {
      const numbers = await client.incomingPhoneNumbers.list({ limit: 1 });
      return numbers[0]?.phoneNumber || null;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Get voice service credential for user
   */
  private async getVoiceCredential(userId: string): Promise<any> {
    // For now, get from phone service credentials
    // In future, might have dedicated voice credentials table
    const credentials = await storage.getPhoneServiceCredentials?.(userId);
    
    if (credentials && credentials.length > 0) {
      return credentials.find((c: any) => c.isDefault) || credentials[0];
    }
    
    return null;
  }
  
  /**
   * Generate voice-optimized content from regular content
   * - Shortens sentences
   * - Adds natural pauses
   * - Formats for listening comprehension
   */
  async optimizeForVoice(content: string): Promise<string> {
    // Split into sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Limit to most important sentences (voice attention span is shorter)
    const maxSentences = 10;
    const keySentences = sentences.slice(0, maxSentences);
    
    // Rejoin with explicit pauses
    const voiceOptimized = keySentences
      .map(s => s.trim())
      .join('. <break time="700ms"/> ') + '.';
    
    return voiceOptimized;
  }
  
  /**
   * Validate phone number format (E.164)
   */
  validatePhoneNumber(phoneNumber: string): { valid: boolean; formatted?: string; error?: string } {
    // E.164 format: +[country code][number]
    // Example: +14155552671
    
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    
    if (e164Regex.test(phoneNumber)) {
      return { valid: true, formatted: phoneNumber };
    }
    
    // Try to parse and format common US numbers
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    if (digitsOnly.length === 10) {
      // Assume US number
      return { valid: true, formatted: `+1${digitsOnly}` };
    }
    
    if (digitsOnly.length === 11 && digitsOnly[0] === '1') {
      // US number with country code
      return { valid: true, formatted: `+${digitsOnly}` };
    }
    
    return {
      valid: false,
      error: 'Invalid phone number. Use E.164 format: +1234567890',
    };
  }
}

export const voiceService = new VoiceService();

