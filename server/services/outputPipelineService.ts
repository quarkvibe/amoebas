import { activityMonitor } from './activityMonitor';

/**
 * Output Pipeline Service
 * Controls AI output through multi-stage processing:
 * 1. Format parsing (JSON, Markdown, HTML)
 * 2. Safety checks (content moderation)
 * 3. Quality scoring
 * 4. Cleanup & formatting
 * 5. Validation
 * 6. Review queue management
 */

export interface PipelineConfig {
  // Pre-generation
  validateInput?: boolean;
  enhancePrompt?: boolean;
  
  // Post-generation
  parseFormat?: 'json' | 'markdown' | 'html' | 'text';
  validateOutput?: boolean;
  safetyCheck?: boolean;
  qualityScore?: boolean;
  
  // Review
  requireApproval?: boolean;
  autoApprovalRules?: Array<{
    field: string;
    condition: 'equals' | 'greater_than' | 'less_than' | 'contains';
    value: any;
  }>;
  
  // Transformation
  cleanup?: boolean;
  formatting?: {
    removeEmptyLines?: boolean;
    trimWhitespace?: boolean;
    fixPunctuation?: boolean;
    capitalizeFirst?: boolean;
    removeDuplicateSpaces?: boolean;
  };
  
  // Constraints
  minLength?: number;
  maxLength?: number;
  requiredKeywords?: string[];
  forbiddenKeywords?: string[];
}

export interface PipelineResult {
  success: boolean;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  original: string;
  processed: string;
  metadata: {
    qualityScore?: number;
    safetyFlags?: string[];
    validationErrors?: string[];
    parsedData?: any;
    transformations?: string[];
    wordCount?: number;
    processingTime?: number;
  };
}

interface ParseResult {
  parsed: string;
  data?: any;
  transformed: boolean;
}

interface SafetyResult {
  safe: boolean;
  flags: string[];
  confidence: number;
}

interface QualityResult {
  score: number;
  reasons: string[];
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

class OutputPipelineService {
  
  /**
   * Process AI output through complete pipeline
   */
  async processOutput(
    rawOutput: string,
    config: PipelineConfig,
    context?: any
  ): Promise<PipelineResult> {
    
    const startTime = Date.now();
    activityMonitor.logActivity('debug', '🔄 Starting output pipeline');
    
    let processed = rawOutput;
    const metadata: any = {
      transformations: [],
      validationErrors: [],
      safetyFlags: [],
    };
    
    try {
      // Step 1: Parse format
      if (config.parseFormat) {
        activityMonitor.logActivity('debug', `📝 Parsing format: ${config.parseFormat}`);
        const parseResult = await this.parseFormat(processed, config.parseFormat);
        processed = parseResult.parsed;
        metadata.parsedData = parseResult.data;
        if (parseResult.transformed) {
          metadata.transformations.push('format_parsed');
        }
      }
      
      // Step 2: Safety check
      if (config.safetyCheck) {
        activityMonitor.logActivity('debug', '🛡️ Running safety checks');
        const safetyResult = await this.checkSafety(processed);
        metadata.safetyFlags = safetyResult.flags;
        
        if (!safetyResult.safe) {
          activityMonitor.logActivity('warning', `⚠️ Safety check failed: ${safetyResult.flags.join(', ')}`);
          return {
            success: false,
            status: 'rejected',
            original: rawOutput,
            processed,
            metadata: {
              ...metadata,
              processingTime: Date.now() - startTime,
            },
          };
        }
      }
      
      // Step 3: Quality scoring
      if (config.qualityScore) {
        activityMonitor.logActivity('debug', '⭐ Calculating quality score');
        const qualityResult = await this.scoreQuality(processed, context);
        metadata.qualityScore = qualityResult.score;
        metadata.qualityReasons = qualityResult.reasons;
      }
      
      // Step 4: Cleanup & formatting
      if (config.cleanup) {
        activityMonitor.logActivity('debug', '🧹 Cleaning up output');
        const cleanupResult = await this.cleanup(processed, config.formatting);
        processed = cleanupResult.cleaned;
        if (cleanupResult.changes > 0) {
          metadata.transformations.push(`cleanup_${cleanupResult.changes}_changes`);
        }
      }
      
      // Step 5: Validation
      if (config.validateOutput) {
        activityMonitor.logActivity('debug', '✓ Validating output');
        const validationResult = await this.validateOutput(processed, config, context);
        metadata.validationErrors = validationResult.errors;
        
        if (!validationResult.valid) {
          activityMonitor.logActivity('warning', `❌ Validation failed: ${validationResult.errors.join(', ')}`);
          // Could implement auto-retry here
          return {
            success: false,
            status: 'rejected',
            original: rawOutput,
            processed,
            metadata: {
              ...metadata,
              processingTime: Date.now() - startTime,
            },
          };
        }
      }
      
      // Step 6: Calculate word count
      metadata.wordCount = processed.split(/\s+/).length;
      
      // Step 7: Determine approval status
      let status: 'draft' | 'pending_review' | 'approved' | 'rejected' = 'approved';
      
      if (config.requireApproval) {
        // Check auto-approval rules
        const autoApproved = this.checkAutoApproval(
          processed,
          metadata,
          config.autoApprovalRules || []
        );
        
        status = autoApproved ? 'approved' : 'pending_review';
        activityMonitor.logActivity('info', `📋 Status: ${status} (auto-approved: ${autoApproved})`);
      }
      
      metadata.processingTime = Date.now() - startTime;
      activityMonitor.logActivity('success', `✅ Pipeline complete: ${status} (${metadata.processingTime}ms)`);
      
      return {
        success: true,
        status,
        original: rawOutput,
        processed,
        metadata,
      };
      
    } catch (error: any) {
      activityMonitor.logError(error, 'Output Pipeline');
      
      return {
        success: false,
        status: 'rejected',
        original: rawOutput,
        processed,
        metadata: {
          ...metadata,
          error: error.message,
          processingTime: Date.now() - startTime,
        },
      };
    }
  }
  
  /**
   * Parse output format
   */
  private async parseFormat(
    content: string,
    format: 'json' | 'markdown' | 'html' | 'text'
  ): Promise<ParseResult> {
    
    switch (format) {
      case 'json':
        return this.parseJSON(content);
      
      case 'markdown':
        return this.parseMarkdown(content);
      
      case 'html':
        return this.parseHTML(content);
      
      default:
        return { parsed: content, transformed: false };
    }
  }
  
  /**
   * Parse JSON output - handles AI sometimes wrapping JSON in markdown
   */
  private async parseJSON(content: string): Promise<ParseResult> {
    try {
      // Try to find JSON in markdown code blocks
      const jsonMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
      
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[1]);
        return {
          parsed: JSON.stringify(data, null, 2),
          data,
          transformed: true,
        };
      }
      
      // Try to parse entire content as JSON
      const data = JSON.parse(content);
      return {
        parsed: JSON.stringify(data, null, 2),
        data,
        transformed: false,
      };
      
    } catch (error) {
      // AI didn't return valid JSON, extract what we can
      activityMonitor.logActivity('warning', '⚠️ Invalid JSON, attempting extraction');
      
      // Try to find JSON-like structures
      const objectMatch = content.match(/\{[\s\S]*\}/);
      const arrayMatch = content.match(/\[[\s\S]*\]/);
      
      if (objectMatch) {
        try {
          const data = JSON.parse(objectMatch[0]);
          return {
            parsed: JSON.stringify(data, null, 2),
            data,
            transformed: true,
          };
        } catch {}
      }
      
      if (arrayMatch) {
        try {
          const data = JSON.parse(arrayMatch[0]);
          return {
            parsed: JSON.stringify(data, null, 2),
            data,
            transformed: true,
          };
        } catch {}
      }
      
      // Couldn't extract valid JSON - return original
      return {
        parsed: content,
        data: null,
        transformed: false,
      };
    }
  }
  
  /**
   * Parse Markdown output - fix common AI markdown issues
   */
  private async parseMarkdown(content: string): Promise<ParseResult> {
    let cleaned = content;
    
    // Remove duplicate headings
    cleaned = cleaned.replace(/^(#+\s+.+)\n\1$/gm, '$1');
    
    // Fix list formatting (AI sometimes adds extra newlines)
    cleaned = cleaned.replace(/^(\d+\.)\s*\n/gm, '$1 ');
    cleaned = cleaned.replace(/^([-*])\s*\n/gm, '$1 ');
    
    // Remove trailing whitespace from lines
    cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n');
    
    // Fix multiple blank lines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    return {
      parsed: cleaned,
      transformed: cleaned !== content,
    };
  }
  
  /**
   * Parse HTML output - sanitize for safety
   */
  private async parseHTML(content: string): Promise<ParseResult> {
    let cleaned = content;
    
    // Remove script tags (XSS prevention)
    cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove event handlers (XSS prevention)
    cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Fix common formatting issues
    cleaned = cleaned.replace(/<\/p>\s*<p>/g, '</p>\n<p>');
    cleaned = cleaned.replace(/<br\s*\/?>\s*<br\s*\/?>/g, '<br/>');
    
    return {
      parsed: cleaned,
      transformed: cleaned !== content,
    };
  }
  
  /**
   * Safety check - content moderation
   */
  private async checkSafety(content: string): Promise<SafetyResult> {
    const flags: string[] = [];
    
    // Check for PII (Personal Identifiable Information)
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;
    const creditCardPattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
    
    if (emailPattern.test(content)) flags.push('contains_email');
    if (phonePattern.test(content)) flags.push('contains_phone');
    if (ssnPattern.test(content)) flags.push('contains_ssn');
    if (creditCardPattern.test(content)) flags.push('contains_credit_card');
    
    // Check for placeholder text that should have been replaced
    const placeholders = ['TODO', 'FIXME', '[INSERT', 'PLACEHOLDER', 'XXX', 'REPLACE'];
    for (const placeholder of placeholders) {
      if (content.toUpperCase().includes(placeholder)) {
        flags.push(`contains_placeholder_${placeholder.toLowerCase()}`);
      }
    }
    
    // Check for excessive repetition (could indicate AI failure)
    const words = content.toLowerCase().split(/\s+/);
    const wordCounts = new Map<string, number>();
    words.forEach(word => {
      if (word.length > 3) { // Only check longer words
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    });
    
    const maxRepetition = Math.max(...Array.from(wordCounts.values()));
    const totalWords = words.length;
    if (maxRepetition > totalWords * 0.1 && totalWords > 50) {
      flags.push('excessive_word_repetition');
    }
    
    // NOTE: In production, integrate with OpenAI Moderation API:
    // const moderation = await openai.moderations.create({ input: content });
    // if (moderation.results[0].flagged) {
    //   flags.push(...moderation.results[0].categories);
    // }
    
    return {
      safe: flags.length === 0,
      flags,
      confidence: flags.length === 0 ? 1.0 : Math.max(0, 1 - (flags.length * 0.2)),
    };
  }
  
  /**
   * Quality scoring - assess content quality
   */
  private async scoreQuality(
    content: string,
    context?: any
  ): Promise<QualityResult> {
    const reasons: string[] = [];
    let score = 100;
    
    // Check length
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 50) {
      score -= 20;
      reasons.push('too_short');
    } else if (wordCount > 5000) {
      score -= 10;
      reasons.push('too_long');
    } else {
      score += 5;
      reasons.push('good_length');
    }
    
    // Check for placeholder text
    const hasPlaceholders = /TODO|FIXME|\[INSERT|PLACEHOLDER|XXX/.test(content);
    if (hasPlaceholders) {
      score -= 30;
      reasons.push('contains_placeholders');
    }
    
    // Check for repetition
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const uniqueSentences = new Set(sentences.map(s => s.trim().toLowerCase()));
    const repetitionRatio = uniqueSentences.size / Math.max(sentences.length, 1);
    
    if (repetitionRatio < 0.6) {
      score -= 25;
      reasons.push('high_repetition');
    } else if (repetitionRatio > 0.9) {
      score += 10;
      reasons.push('unique_content');
    }
    
    // Check sentence structure
    const avgSentenceLength = content.length / Math.max(sentences.length, 1);
    if (avgSentenceLength < 20) {
      score -= 10;
      reasons.push('sentences_too_short');
    } else if (avgSentenceLength > 200) {
      score -= 10;
      reasons.push('sentences_too_long');
    } else if (avgSentenceLength >= 50 && avgSentenceLength <= 150) {
      score += 5;
      reasons.push('good_sentence_length');
    }
    
    // Check for incomplete sentences
    const incompletePattern = /\.\.\.$|\s+and\s*$|\s+or\s*$|\s+but\s*$/i;
    if (incompletePattern.test(content.trim())) {
      score -= 15;
      reasons.push('incomplete_ending');
    }
    
    // Check template variable usage (if context provided)
    if (context?.template?.variables && Array.isArray(context.template.variables)) {
      let variablesUsed = 0;
      for (const variable of context.template.variables) {
        // Check if variable value appears in content
        const variableValue = context.variables?.[variable];
        if (variableValue && content.includes(String(variableValue))) {
          variablesUsed++;
        }
      }
      
      if (variablesUsed === context.template.variables.length) {
        score += 10;
        reasons.push('all_variables_used');
      } else if (variablesUsed > 0) {
        score += 5;
        reasons.push('some_variables_used');
      } else {
        score -= 10;
        reasons.push('variables_not_used');
      }
    }
    
    // Check formatting quality
    const hasGoodFormatting = /^[A-Z]/.test(content) && /[.!?]$/.test(content.trim());
    if (hasGoodFormatting) {
      score += 5;
      reasons.push('good_formatting');
    }
    
    return {
      score: Math.max(0, Math.min(100, score)),
      reasons,
    };
  }
  
  /**
   * Cleanup and formatting
   */
  private async cleanup(
    content: string,
    config?: PipelineConfig['formatting']
  ): Promise<{ cleaned: string; changes: number }> {
    
    let cleaned = content;
    let changes = 0;
    
    if (config?.removeEmptyLines) {
      const before = cleaned;
      cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
      if (before !== cleaned) changes++;
    }
    
    if (config?.removeDuplicateSpaces) {
      const before = cleaned;
      cleaned = cleaned.replace(/  +/g, ' ');
      if (before !== cleaned) changes++;
    }
    
    if (config?.trimWhitespace) {
      const before = cleaned;
      cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n');
      cleaned = cleaned.trim();
      if (before !== cleaned) changes++;
    }
    
    if (config?.fixPunctuation) {
      const before = cleaned;
      // Fix spacing before punctuation
      cleaned = cleaned.replace(/\s+([,.!?;:])/g, '$1');
      // Fix spacing after punctuation
      cleaned = cleaned.replace(/([,.!?;:])([A-Za-z])/g, '$1 $2');
      // Fix multiple punctuation
      cleaned = cleaned.replace(/([.!?]){2,}/g, '$1');
      if (before !== cleaned) changes++;
    }
    
    if (config?.capitalizeFirst) {
      const before = cleaned;
      // Capitalize first letter of paragraphs
      cleaned = cleaned.replace(/(^|\n\n)([a-z])/gm, (match, p1, p2) => p1 + p2.toUpperCase());
      if (before !== cleaned) changes++;
    }
    
    return { cleaned, changes };
  }
  
  /**
   * Validate output against requirements
   */
  private async validateOutput(
    content: string,
    config: PipelineConfig,
    context?: any
  ): Promise<ValidationResult> {
    
    const errors: string[] = [];
    
    // Check minimum length
    if (config.minLength) {
      const wordCount = content.split(/\s+/).length;
      if (wordCount < config.minLength) {
        errors.push(`Content too short: ${wordCount} words (min: ${config.minLength})`);
      }
    }
    
    // Check maximum length
    if (config.maxLength) {
      const wordCount = content.split(/\s+/).length;
      if (wordCount > config.maxLength) {
        errors.push(`Content too long: ${wordCount} words (max: ${config.maxLength})`);
      }
    }
    
    // Check required keywords
    if (config.requiredKeywords && config.requiredKeywords.length > 0) {
      for (const keyword of config.requiredKeywords) {
        if (!content.toLowerCase().includes(keyword.toLowerCase())) {
          errors.push(`Missing required keyword: "${keyword}"`);
        }
      }
    }
    
    // Check forbidden keywords
    if (config.forbiddenKeywords && config.forbiddenKeywords.length > 0) {
      for (const keyword of config.forbiddenKeywords) {
        if (content.toLowerCase().includes(keyword.toLowerCase())) {
          errors.push(`Contains forbidden keyword: "${keyword}"`);
        }
      }
    }
    
    // Check output format validity
    if (config.parseFormat === 'json') {
      try {
        JSON.parse(content);
      } catch {
        errors.push('Invalid JSON format');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Check auto-approval rules
   */
  private checkAutoApproval(
    content: string,
    metadata: any,
    rules: Array<{ field: string; condition: string; value: any }>
  ): boolean {
    
    if (rules.length === 0) return false;
    
    // All rules must pass for auto-approval
    for (const rule of rules) {
      const fieldValue = rule.field === 'content' ? content : metadata[rule.field];
      
      let passes = false;
      
      switch (rule.condition) {
        case 'equals':
          passes = fieldValue === rule.value;
          break;
        
        case 'greater_than':
          passes = Number(fieldValue) > Number(rule.value);
          break;
        
        case 'less_than':
          passes = Number(fieldValue) < Number(rule.value);
          break;
        
        case 'contains':
          passes = String(fieldValue).includes(String(rule.value));
          break;
        
        default:
          passes = false;
      }
      
      if (!passes) {
        activityMonitor.logActivity('debug', `Auto-approval rule failed: ${rule.field} ${rule.condition} ${rule.value}`);
        return false;
      }
    }
    
    activityMonitor.logActivity('debug', 'All auto-approval rules passed');
    return true;
  }
}

export const outputPipelineService = new OutputPipelineService();

