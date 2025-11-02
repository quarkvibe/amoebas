/**
 * IStorage - Universal Storage Interface
 * 
 * Following ARCHITECTURE.md:
 * - This is the BLOB (core abstraction)
 * - Database adapters are CILIA (implementations)
 * - Swap implementations via environment variable
 * 
 * Following SIMPLICITY_DOCTRINE.md:
 * - Single interface for all storage operations
 * - No ORM abstraction (each adapter uses best tool for its DB)
 * - Configuration over code (swap via .env)
 */

// Core entity types
export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface AICredential {
  id: string;
  userId: string;
  provider: string;
  name: string;
  apiKey: string; // Encrypted
  additionalConfig?: any;
  isDefault: boolean;
  isActive: boolean;
  lastUsed: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface EmailServiceCredential {
  id: string;
  userId: string;
  provider: string;
  name: string;
  apiKey: string | null; // Encrypted
  fromEmail: string;
  fromName: string | null;
  awsAccessKeyId: string | null;
  awsSecretAccessKey: string | null;
  awsRegion: string | null;
  isDefault: boolean;
  isActive: boolean;
  lastUsed: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface PhoneServiceCredential {
  id: string;
  userId: string;
  provider: string;
  name: string;
  accountSid: string | null;
  apiKey: string | null; // Encrypted (Auth Token)
  phoneNumber: string | null;
  awsAccessKeyId: string | null;
  awsSecretAccessKey: string | null;
  awsRegion: string | null;
  config: any;
  isDefault: boolean;
  isActive: boolean;
  lastUsed: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ContentTemplate {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  aiPrompt: string;
  systemPrompt: string | null;
  variables: any;
  settings: any;
  outputFormat: string;
  isActive: boolean;
  lastUsed: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface GeneratedContent {
  id: string;
  userId: string;
  templateId: string | null;
  content: string;
  title: string | null;
  metadata: any;
  jobId: string | null;
  distributionStatus: any;
  generatedAt: Date | null;
  // Review queue fields
  reviewStatus?: string | null;
  reviewMetadata?: any;
  reviewedAt?: Date | null;
  reviewedBy?: string | null;
  reviewNotes?: string | null;
}

/**
 * Universal Storage Interface
 * All database adapters must implement this
 */
export interface IStorage {
  
  // ===========================================================================
  // CONNECTION MANAGEMENT
  // ===========================================================================
  
  /**
   * Initialize connection and ensure schema exists
   */
  initialize(): Promise<void>;
  
  /**
   * Health check
   */
  healthCheck(): Promise<{ healthy: boolean; message?: string }>;
  
  /**
   * Close connection
   */
  close(): Promise<void>;
  
  // ===========================================================================
  // USER MANAGEMENT
  // ===========================================================================
  
  getUser(userId: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByPhoneNumber?(phoneNumber: string): Promise<User[]>;
  createUser(data: Partial<User>): Promise<User>;
  updateUser?(userId: string, data: Partial<User>): Promise<User | null>;
  deleteUser?(userId: string): Promise<void>;
  
  // ===========================================================================
  // AI CREDENTIALS (BYOK)
  // ===========================================================================
  
  getAiCredentials(userId: string): Promise<AICredential[]>;
  getAiCredential(id: string, userId: string): Promise<AICredential | null>;
  getDefaultAiCredential(userId: string): Promise<AICredential | null>;
  createAiCredential(data: Partial<AICredential>): Promise<AICredential>;
  updateAiCredential(id: string, userId: string, data: Partial<AICredential>): Promise<AICredential | null>;
  deleteAiCredential(id: string, userId: string): Promise<void>;
  
  // ===========================================================================
  // EMAIL SERVICE CREDENTIALS (BYOK)
  // ===========================================================================
  
  getEmailServiceCredentials(userId: string): Promise<EmailServiceCredential[]>;
  getEmailServiceCredential(id: string, userId: string): Promise<EmailServiceCredential | null>;
  getDefaultEmailServiceCredential(userId: string): Promise<EmailServiceCredential | null>;
  createEmailServiceCredential(data: Partial<EmailServiceCredential>): Promise<EmailServiceCredential>;
  updateEmailServiceCredential(id: string, userId: string, data: Partial<EmailServiceCredential>): Promise<EmailServiceCredential | null>;
  deleteEmailServiceCredential(id: string, userId: string): Promise<void>;
  
  // ===========================================================================
  // PHONE SERVICE CREDENTIALS (BYOK) - NEW
  // ===========================================================================
  
  getPhoneServiceCredentials(userId: string): Promise<PhoneServiceCredential[]>;
  getPhoneServiceCredential(id: string, userId: string): Promise<PhoneServiceCredential | null>;
  getDefaultPhoneServiceCredential(userId: string): Promise<PhoneServiceCredential | null>;
  createPhoneServiceCredential(data: Partial<PhoneServiceCredential>): Promise<PhoneServiceCredential>;
  updatePhoneServiceCredential(id: string, userId: string, data: Partial<PhoneServiceCredential>): Promise<PhoneServiceCredential | null>;
  deletePhoneServiceCredential(id: string, userId: string): Promise<void>;
  
  // ===========================================================================
  // CONTENT TEMPLATES
  // ===========================================================================
  
  getContentTemplates(userId: string): Promise<ContentTemplate[]>;
  getContentTemplate(id: string, userId: string): Promise<ContentTemplate | null>;
  createContentTemplate(data: Partial<ContentTemplate>): Promise<ContentTemplate>;
  updateContentTemplate(id: string, userId: string, data: Partial<ContentTemplate>): Promise<ContentTemplate | null>;
  deleteContentTemplate(id: string, userId: string): Promise<void>;
  
  // ===========================================================================
  // GENERATED CONTENT
  // ===========================================================================
  
  getGeneratedContent(userId: string, options?: any): Promise<GeneratedContent[]>;
  getGeneratedContentById?(id: string, userId: string): Promise<GeneratedContent | null>;
  createGeneratedContent(data: Partial<GeneratedContent>): Promise<GeneratedContent>;
  updateGeneratedContent(id: string, userId: string, data: Partial<GeneratedContent>): Promise<GeneratedContent | null>;
  deleteGeneratedContent?(id: string, userId: string): Promise<void>;
  
  // ===========================================================================
  // ADDITIONAL METHODS (as needed by adapters)
  // ===========================================================================
  
  // Data sources, output channels, scheduled jobs, etc.
  // Each adapter implements based on its DB capabilities
}

