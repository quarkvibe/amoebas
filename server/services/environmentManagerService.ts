import * as fs from 'fs/promises';
import * as path from 'path';
import { activityMonitor } from './activityMonitor';

/**
 * Environment Manager Service
 * Allows users to view, edit, and manage .env variables directly from UI
 * 
 * SECURITY NOTES:
 * - Only accessible by authenticated users
 * - Sensitive values are masked in read operations
 * - Changes require server restart notification
 * - Audit trail for all changes
 * - Backup created before modifications
 */

export interface EnvVariable {
  key: string;
  value: string;
  description?: string;
  required?: boolean;
  masked?: boolean;        // Whether to mask in UI (for secrets)
  category?: string;       // Group by: 'core', 'ai', 'email', 'phone', 'deployment'
  example?: string;
  validation?: string;     // Regex pattern for validation
}

export interface EnvChangeLog {
  timestamp: Date;
  userId: string;
  key: string;
  action: 'create' | 'update' | 'delete';
  oldValue?: string;
  newValue?: string;
}

class EnvironmentManagerService {
  
  private envPath: string;
  private backupPath: string;
  private changeLog: EnvChangeLog[] = [];
  
  // Define sensitive keys that should be masked
  private sensitiveKeys = [
    'ENCRYPTION_KEY',
    'SESSION_SECRET',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'SENDGRID_API_KEY',
    'TWILIO_AUTH_TOKEN',
    'AWS_SECRET_ACCESS_KEY',
    'STRIPE_SECRET_KEY',
    'DATABASE_PASSWORD',
  ];
  
  // Define env var metadata for UI
  private envMetadata: Record<string, Partial<EnvVariable>> = {
    // Core
    DATABASE_URL: {
      category: 'core',
      description: 'PostgreSQL connection string',
      required: true,
      example: 'postgresql://user:pass@host:5432/dbname',
      validation: '^postgres(ql)?://.+',
    },
    ENCRYPTION_KEY: {
      category: 'core',
      description: '64-character hex string for credential encryption',
      required: true,
      masked: true,
      validation: '^[a-f0-9]{64}$',
    },
    SESSION_SECRET: {
      category: 'core',
      description: 'Secret for session management (32+ characters)',
      required: true,
      masked: true,
      validation: '^.{32,}$',
    },
    
    // AI Providers
    OPENAI_API_KEY: {
      category: 'ai',
      description: 'OpenAI API key for GPT models',
      required: false,
      masked: true,
      example: 'sk-proj-...',
      validation: '^sk-(proj-)?[A-Za-z0-9]{48,}$',
    },
    ANTHROPIC_API_KEY: {
      category: 'ai',
      description: 'Anthropic API key for Claude models',
      required: false,
      masked: true,
      example: 'sk-ant-...',
      validation: '^sk-ant-[A-Za-z0-9-_]{95,}$',
    },
    OLLAMA_HOST: {
      category: 'ai',
      description: 'Ollama server URL for local AI models',
      required: false,
      example: 'http://localhost:11434',
    },
    
    // Email Services
    SENDGRID_API_KEY: {
      category: 'email',
      description: 'SendGrid API key for email delivery',
      required: false,
      masked: true,
      example: 'SG.xxx',
    },
    AWS_SES_ACCESS_KEY: {
      category: 'email',
      description: 'AWS SES access key for email delivery',
      required: false,
    },
    AWS_SES_SECRET_KEY: {
      category: 'email',
      description: 'AWS SES secret key',
      required: false,
      masked: true,
    },
    
    // Phone Services
    TWILIO_ACCOUNT_SID: {
      category: 'phone',
      description: 'Twilio Account SID for SMS & Voice',
      required: false,
      example: 'AC...',
    },
    TWILIO_AUTH_TOKEN: {
      category: 'phone',
      description: 'Twilio Auth Token',
      required: false,
      masked: true,
    },
    TWILIO_PHONE_NUMBER: {
      category: 'phone',
      description: 'Your Twilio phone number (E.164 format)',
      required: false,
      example: '+14155551234',
      validation: '^\\+[1-9]\\d{1,14}$',
    },
    
    // Deployment
    PORT: {
      category: 'deployment',
      description: 'Server port',
      required: false,
      example: '5000',
    },
    NODE_ENV: {
      category: 'deployment',
      description: 'Environment mode',
      required: false,
      example: 'production',
    },
    DOMAIN: {
      category: 'deployment',
      description: 'Your domain name',
      required: false,
      example: 'app.yourdomain.com',
    },
  };
  
  constructor() {
    this.envPath = path.join(process.cwd(), '.env');
    this.backupPath = path.join(process.cwd(), '.env.backup');
  }
  
  /**
   * Get all environment variables (with masking for sensitive values)
   */
  async getAllVariables(userId: string): Promise<EnvVariable[]> {
    activityMonitor.logActivity('debug', `🔐 User ${userId} viewing environment variables`);
    
    try {
      // Read current .env file
      const envContent = await fs.readFile(this.envPath, 'utf-8');
      const envVars = this.parseEnvFile(envContent);
      
      // Merge with metadata
      const variables: EnvVariable[] = [];
      
      for (const [key, value] of Object.entries(envVars)) {
        const metadata = this.envMetadata[key] || {};
        const isSensitive = this.sensitiveKeys.includes(key) || metadata.masked;
        
        variables.push({
          key,
          value: isSensitive ? this.maskValue(value) : value,
          ...metadata,
        });
      }
      
      // Add known keys that aren't set yet
      for (const [key, metadata] of Object.entries(this.envMetadata)) {
        if (!envVars[key]) {
          variables.push({
            key,
            value: '',
            ...metadata,
          });
        }
      }
      
      // Sort by category and name
      variables.sort((a, b) => {
        if (a.category !== b.category) {
          return (a.category || '').localeCompare(b.category || '');
        }
        return a.key.localeCompare(b.key);
      });
      
      return variables;
      
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // .env doesn't exist, return metadata only
        return Object.entries(this.envMetadata).map(([key, metadata]) => ({
          key,
          value: '',
          ...metadata,
        }));
      }
      throw error;
    }
  }
  
  /**
   * Get single environment variable
   */
  async getVariable(key: string, userId: string): Promise<EnvVariable | null> {
    const all = await this.getAllVariables(userId);
    return all.find(v => v.key === key) || null;
  }
  
  /**
   * Set environment variable
   */
  async setVariable(
    key: string,
    value: string,
    userId: string
  ): Promise<{ success: boolean; requiresRestart: boolean; message: string }> {
    
    activityMonitor.logActivity('info', `🔧 User ${userId} updating env var: ${key}`);
    
    try {
      // Validate key name
      if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) {
        throw new Error('Invalid environment variable name. Use UPPERCASE_WITH_UNDERSCORES');
      }
      
      // Validate value against pattern (if defined)
      const metadata = this.envMetadata[key];
      if (metadata?.validation && value) {
        const regex = new RegExp(metadata.validation);
        if (!regex.test(value)) {
          throw new Error(`Invalid value format for ${key}. Expected: ${metadata.example || 'see documentation'}`);
        }
      }
      
      // Create backup before modification
      await this.createBackup();
      
      // Read current .env
      let envContent = '';
      try {
        envContent = await fs.readFile(this.envPath, 'utf-8');
      } catch (error: any) {
        if (error.code !== 'ENOENT') throw error;
        // .env doesn't exist, create new
      }
      
      const envVars = this.parseEnvFile(envContent);
      const oldValue = envVars[key];
      
      // Update variable
      envVars[key] = value;
      
      // Write back to .env
      const newContent = this.stringifyEnvVars(envVars);
      await fs.writeFile(this.envPath, newContent, 'utf-8');
      
      // Log change
      this.logChange({
        timestamp: new Date(),
        userId,
        key,
        action: oldValue === undefined ? 'create' : 'update',
        oldValue: oldValue ? this.maskValue(oldValue) : undefined,
        newValue: this.maskValue(value),
      });
      
      // Update process.env in memory (for non-critical vars)
      process.env[key] = value;
      
      activityMonitor.logActivity('success', `✅ Environment variable ${key} updated`);
      
      // Check if restart required
      const requiresRestart = this.isRestartRequired(key);
      
      return {
        success: true,
        requiresRestart,
        message: requiresRestart
          ? `${key} updated. Restart server for changes to take effect.`
          : `${key} updated successfully.`,
      };
      
    } catch (error: any) {
      activityMonitor.logError(error, 'Environment Variable Update');
      throw error;
    }
  }
  
  /**
   * Delete environment variable
   */
  async deleteVariable(
    key: string,
    userId: string
  ): Promise<{ success: boolean; requiresRestart: boolean; message: string }> {
    
    activityMonitor.logActivity('info', `🗑️ User ${userId} deleting env var: ${key}`);
    
    try {
      // Check if required
      const metadata = this.envMetadata[key];
      if (metadata?.required) {
        throw new Error(`Cannot delete required environment variable: ${key}`);
      }
      
      // Create backup
      await this.createBackup();
      
      // Read and parse
      const envContent = await fs.readFile(this.envPath, 'utf-8');
      const envVars = this.parseEnvFile(envContent);
      
      const oldValue = envVars[key];
      
      // Delete variable
      delete envVars[key];
      delete process.env[key];
      
      // Write back
      const newContent = this.stringifyEnvVars(envVars);
      await fs.writeFile(this.envPath, newContent, 'utf-8');
      
      // Log change
      this.logChange({
        timestamp: new Date(),
        userId,
        key,
        action: 'delete',
        oldValue: oldValue ? this.maskValue(oldValue) : undefined,
      });
      
      activityMonitor.logActivity('success', `✅ Environment variable ${key} deleted`);
      
      return {
        success: true,
        requiresRestart: this.isRestartRequired(key),
        message: `${key} deleted. Restart server for changes to take effect.`,
      };
      
    } catch (error: any) {
      activityMonitor.logError(error, 'Environment Variable Delete');
      throw error;
    }
  }
  
  /**
   * Bulk update environment variables
   */
  async bulkUpdate(
    updates: Record<string, string>,
    userId: string
  ): Promise<{ success: boolean; requiresRestart: boolean; updated: string[] }> {
    
    activityMonitor.logActivity('info', `🔧 User ${userId} bulk updating ${Object.keys(updates).length} env vars`);
    
    const updated: string[] = [];
    
    // Create backup once
    await this.createBackup();
    
    // Update each variable
    for (const [key, value] of Object.entries(updates)) {
      try {
        await this.setVariable(key, value, userId);
        updated.push(key);
      } catch (error: any) {
        activityMonitor.logError(error, `Bulk update failed for ${key}`);
        // Continue with other variables
      }
    }
    
    return {
      success: updated.length > 0,
      requiresRestart: updated.some(key => this.isRestartRequired(key)),
      updated,
    };
  }
  
  /**
   * Get environment file content (for direct editing)
   */
  async getEnvFileContent(userId: string): Promise<string> {
    activityMonitor.logActivity('debug', `📄 User ${userId} viewing .env file`);
    
    try {
      const content = await fs.readFile(this.envPath, 'utf-8');
      
      // Mask sensitive values in file view
      return this.maskSensitiveValues(content);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return '# Amoeba Environment Configuration\n# File will be created when you save\n';
      }
      throw error;
    }
  }
  
  /**
   * Update entire .env file content (advanced mode)
   */
  async updateEnvFileContent(
    content: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    
    activityMonitor.logActivity('warning', `⚠️ User ${userId} directly editing .env file`);
    
    try {
      // Validate content is valid env format
      this.validateEnvContent(content);
      
      // Create backup
      await this.createBackup();
      
      // Write new content
      await fs.writeFile(this.envPath, content, 'utf-8');
      
      // Reload process.env
      this.reloadEnvVars(content);
      
      activityMonitor.logActivity('success', '✅ .env file updated successfully');
      
      return {
        success: true,
        message: '.env file updated. Restart server for all changes to take effect.',
      };
      
    } catch (error: any) {
      activityMonitor.logError(error, '.env File Update');
      throw error;
    }
  }
  
  /**
   * Get change history
   */
  getChangeLog(limit: number = 50): EnvChangeLog[] {
    return this.changeLog.slice(-limit);
  }
  
  /**
   * Validate environment on startup
   */
  async validateEnvironment(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }> {
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    try {
      const variables = await this.getAllVariables('system');
      
      // Check required variables
      for (const varDef of variables) {
        if (varDef.required && !varDef.value) {
          errors.push(`Missing required: ${varDef.key} - ${varDef.description}`);
        }
      }
      
      // Check for common issues
      const dbUrl = variables.find(v => v.key === 'DATABASE_URL')?.value;
      if (dbUrl && !dbUrl.startsWith('postgres')) {
        errors.push('DATABASE_URL must start with postgresql://');
      }
      
      // Warnings for optional but recommended
      if (!variables.find(v => v.key === 'OPENAI_API_KEY')?.value && 
          !variables.find(v => v.key === 'ANTHROPIC_API_KEY')?.value &&
          !variables.find(v => v.key === 'OLLAMA_HOST')?.value) {
        warnings.push('No AI provider configured. Add OpenAI, Anthropic, or Ollama.');
      }
      
      // Suggestions
      if (!variables.find(v => v.key === 'TWILIO_ACCOUNT_SID')?.value) {
        suggestions.push('Add Twilio credentials to enable SMS & voice delivery');
      }
      
      if (!variables.find(v => v.key === 'SENDGRID_API_KEY')?.value) {
        suggestions.push('Add SendGrid credentials to enable email delivery');
      }
      
    } catch (error: any) {
      errors.push(`Validation error: ${error.message}`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }
  
  /**
   * Generate encryption key
   */
  generateEncryptionKey(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }
  
  /**
   * Generate session secret
   */
  generateSessionSecret(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }
  
  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================
  
  /**
   * Parse .env file content
   */
  private parseEnvFile(content: string): Record<string, string> {
    const vars: Record<string, string> = {};
    
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      // Parse KEY=VALUE
      const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) {
        const key = match[1];
        let value = match[2];
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        vars[key] = value;
      }
    }
    
    return vars;
  }
  
  /**
   * Stringify env vars back to .env format
   */
  private stringifyEnvVars(vars: Record<string, string>): string {
    const lines: string[] = [
      '# 🦠 Amoeba Configuration',
      '# Managed via Dashboard → Settings → Environment',
      '# Last updated: ' + new Date().toISOString(),
      '',
    ];
    
    // Group by category
    const categories: Record<string, string[]> = {};
    
    for (const [key, value] of Object.entries(vars)) {
      const category = this.envMetadata[key]?.category || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(key);
    }
    
    // Write each category
    const categoryOrder = ['core', 'ai', 'email', 'phone', 'deployment', 'other'];
    
    for (const category of categoryOrder) {
      const keys = categories[category];
      if (!keys || keys.length === 0) continue;
      
      lines.push('');
      lines.push('#' + '='.repeat(60));
      lines.push(`# ${category.toUpperCase()}`);
      lines.push('#' + '='.repeat(60));
      lines.push('');
      
      for (const key of keys.sort()) {
        const metadata = this.envMetadata[key];
        const value = vars[key];
        
        // Add description as comment
        if (metadata?.description) {
          lines.push(`# ${metadata.description}`);
        }
        if (metadata?.example && !value) {
          lines.push(`# Example: ${metadata.example}`);
        }
        
        // Add variable
        // Quote value if it contains spaces or special chars
        const needsQuotes = /[\s#'"$]/.test(value);
        lines.push(`${key}=${needsQuotes ? `"${value}"` : value}`);
        lines.push('');
      }
    }
    
    return lines.join('\n');
  }
  
  /**
   * Mask sensitive value for display
   */
  private maskValue(value: string): string {
    if (!value) return '';
    if (value.length <= 8) return '••••••••';
    
    // Show first 4 and last 4 characters
    return value.substring(0, 4) + '•'.repeat(Math.min(value.length - 8, 20)) + value.substring(value.length - 4);
  }
  
  /**
   * Mask sensitive values in file content
   */
  private maskSensitiveValues(content: string): string {
    let masked = content;
    
    for (const key of this.sensitiveKeys) {
      // Match KEY=value pattern
      const regex = new RegExp(`(${key}=)(.+)$`, 'gm');
      masked = masked.replace(regex, (match, prefix, value) => {
        return prefix + this.maskValue(value.replace(/['"]/g, ''));
      });
    }
    
    return masked;
  }
  
  /**
   * Validate .env file content
   */
  private validateEnvContent(content: string): void {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;
      
      // Check format
      if (!/^[A-Z_][A-Z0-9_]*=/.test(line)) {
        throw new Error(`Invalid format at line ${i + 1}: ${line.substring(0, 50)}`);
      }
    }
  }
  
  /**
   * Reload env vars into process.env
   */
  private reloadEnvVars(content: string): void {
    const vars = this.parseEnvFile(content);
    
    for (const [key, value] of Object.entries(vars)) {
      process.env[key] = value;
    }
  }
  
  /**
   * Create backup of .env file
   */
  private async createBackup(): Promise<void> {
    try {
      const content = await fs.readFile(this.envPath, 'utf-8');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = this.envPath + `.backup.${timestamp}`;
      await fs.writeFile(backupFile, content, 'utf-8');
      activityMonitor.logActivity('debug', `💾 Created backup: ${backupFile}`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        activityMonitor.logError(error, 'Backup creation');
      }
    }
  }
  
  /**
   * Log configuration change
   */
  private logChange(change: EnvChangeLog): void {
    this.changeLog.push(change);
    
    // Keep only last 1000 changes
    if (this.changeLog.length > 1000) {
      this.changeLog = this.changeLog.slice(-1000);
    }
  }
  
  /**
   * Check if key change requires server restart
   */
  private isRestartRequired(key: string): boolean {
    // These vars require restart
    const restartRequired = [
      'DATABASE_URL',
      'PORT',
      'NODE_ENV',
      'ENCRYPTION_KEY',
      'SESSION_SECRET',
    ];
    
    return restartRequired.includes(key);
  }
}

export const environmentManagerService = new EnvironmentManagerService();

