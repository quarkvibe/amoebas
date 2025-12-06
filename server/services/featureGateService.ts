import { storage } from '../storage';

/**
 * Feature Gate Service
 * Enforces tier-based limits for freemium model
 * 
 * Tiers:
 * - FREE: Limited features, no license required
 * - PRO: Full features, $29/month
 * - BUSINESS: Pro + white-label, $99/month
 * - ENTERPRISE: Custom pricing
 */

export interface TierLimits {
    // Content Generation
    maxGenerationsPerMonth: number;
    maxTemplates: number;
    maxDataSources: number;
    maxScheduledJobs: number;

    // Delivery
    allowedChannels: string[];
    maxOutputChannels: number;

    // Features
    allowWhiteLabel: boolean;
    allowMultiInstance: boolean;
    allowCustomBranding: boolean;
    allowPrioritySupport: boolean;
    allowAPIAccess: boolean;
    allowCLIAccess: boolean;
    allowSMSCommands: boolean;

    // AI
    allowedAIProviders: string[];
    maxAICredentials: number;

    // Advanced
    allowWebhooks: boolean;
    allowSocialMedia: boolean;
    allowVoiceCalls: boolean;
    maxWebhooks: number;
}

const TIER_LIMITS: Record<string, TierLimits> = {
    free: {
        maxGenerationsPerMonth: 10,
        maxTemplates: 3,
        maxDataSources: 2,
        maxScheduledJobs: 1,
        allowedChannels: ['email'],
        maxOutputChannels: 1,
        allowWhiteLabel: false,
        allowMultiInstance: false,
        allowCustomBranding: false,
        allowPrioritySupport: false,
        allowAPIAccess: true,
        allowCLIAccess: true,
        allowSMSCommands: false,
        allowedAIProviders: ['openai', 'ollama'],
        maxAICredentials: 1,
        allowWebhooks: false,
        allowSocialMedia: false,
        allowVoiceCalls: false,
        maxWebhooks: 0,
    },

    pro: {
        maxGenerationsPerMonth: -1, // unlimited
        maxTemplates: -1,
        maxDataSources: -1,
        maxScheduledJobs: -1,
        allowedChannels: ['email', 'sms', 'webhook', 'social', 'voice'],
        maxOutputChannels: -1,
        allowWhiteLabel: false,
        allowMultiInstance: false,
        allowCustomBranding: false,
        allowPrioritySupport: true,
        allowAPIAccess: true,
        allowCLIAccess: true,
        allowSMSCommands: true,
        allowedAIProviders: ['openai', 'anthropic', 'cohere', 'ollama'],
        maxAICredentials: -1,
        allowWebhooks: true,
        allowSocialMedia: true,
        allowVoiceCalls: true,
        maxWebhooks: 10,
    },

    business: {
        maxGenerationsPerMonth: -1,
        maxTemplates: -1,
        maxDataSources: -1,
        maxScheduledJobs: -1,
        allowedChannels: ['email', 'sms', 'webhook', 'social', 'voice'],
        maxOutputChannels: -1,
        allowWhiteLabel: true,
        allowMultiInstance: true,
        allowCustomBranding: true,
        allowPrioritySupport: true,
        allowAPIAccess: true,
        allowCLIAccess: true,
        allowSMSCommands: true,
        allowedAIProviders: ['openai', 'anthropic', 'cohere', 'ollama'],
        maxAICredentials: -1,
        allowWebhooks: true,
        allowSocialMedia: true,
        allowVoiceCalls: true,
        maxWebhooks: -1,
    },

    enterprise: {
        maxGenerationsPerMonth: -1,
        maxTemplates: -1,
        maxDataSources: -1,
        maxScheduledJobs: -1,
        allowedChannels: ['email', 'sms', 'webhook', 'social', 'voice'],
        maxOutputChannels: -1,
        allowWhiteLabel: true,
        allowMultiInstance: true,
        allowCustomBranding: true,
        allowPrioritySupport: true,
        allowAPIAccess: true,
        allowCLIAccess: true,
        allowSMSCommands: true,
        allowedAIProviders: ['openai', 'anthropic', 'cohere', 'ollama'],
        maxAICredentials: -1,
        allowWebhooks: true,
        allowSocialMedia: true,
        allowVoiceCalls: true,
        maxWebhooks: -1,
    },
};

export class FeatureGateService {
    /**
     * Get tier limits for a user
     */
    async getTierLimits(userId: string): Promise<TierLimits> {
        try {
            const user = await storage.getUser(userId);
            if (!user) {
                return TIER_LIMITS.free;
            }

            const tier = user.subscriptionTier || 'free';
            return TIER_LIMITS[tier] || TIER_LIMITS.free;
        } catch (error) {
            console.error('Error getting tier limits:', error);
            return TIER_LIMITS.free;
        }
    }

    /**
     * Check if user can create more templates
     */
    async canCreateTemplate(userId: string): Promise<{ allowed: boolean; reason?: string }> {
        const limits = await this.getTierLimits(userId);

        if (limits.maxTemplates === -1) {
            return { allowed: true };
        }

        const templates = await storage.getContentTemplates(userId);

        if (templates.length >= limits.maxTemplates) {
            return {
                allowed: false,
                reason: `Template limit reached (${limits.maxTemplates}). Upgrade to Pro for unlimited templates.`,
            };
        }

        return { allowed: true };
    }

    /**
     * Check if user can create more data sources
     */
    async canCreateDataSource(userId: string): Promise<{ allowed: boolean; reason?: string }> {
        const limits = await this.getTierLimits(userId);

        if (limits.maxDataSources === -1) {
            return { allowed: true };
        }

        const dataSources = await storage.getDataSources(userId);

        if (dataSources.length >= limits.maxDataSources) {
            return {
                allowed: false,
                reason: `Data source limit reached (${limits.maxDataSources}). Upgrade to Pro for unlimited data sources.`,
            };
        }

        return { allowed: true };
    }

    /**
     * Check if user can create more scheduled jobs
     */
    async canCreateScheduledJob(userId: string): Promise<{ allowed: boolean; reason?: string }> {
        const limits = await this.getTierLimits(userId);

        if (limits.maxScheduledJobs === -1) {
            return { allowed: true };
        }

        const jobs = await storage.getScheduledJobs(userId);

        if (jobs.length >= limits.maxScheduledJobs) {
            return {
                allowed: false,
                reason: `Scheduled job limit reached (${limits.maxScheduledJobs}). Upgrade to Pro for unlimited jobs.`,
            };
        }

        return { allowed: true };
    }

    /**
     * Check if user can generate content this month
     */
    async canGenerateContent(userId: string): Promise<{ allowed: boolean; reason?: string }> {
        const limits = await this.getTierLimits(userId);

        if (limits.maxGenerationsPerMonth === -1) {
            return { allowed: true };
        }

        // Get generations this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get all generations and filter by date
        const allGenerations = await storage.getGeneratedContent(userId, 1000);
        const generations = allGenerations.filter(g => {
            const generatedAt = g.generatedAt ? new Date(g.generatedAt) : new Date();
            return generatedAt >= startOfMonth && generatedAt <= now;
        });

        if (generations.length >= limits.maxGenerationsPerMonth) {
            return {
                allowed: false,
                reason: `Monthly generation limit reached (${limits.maxGenerationsPerMonth}). Upgrade to Pro for unlimited generations.`,
            };
        }

        return { allowed: true };
    }

    /**
     * Check if user can use a specific delivery channel
     */
    async canUseChannel(userId: string, channel: string): Promise<{ allowed: boolean; reason?: string }> {
        const limits = await this.getTierLimits(userId);

        if (limits.allowedChannels.includes(channel)) {
            return { allowed: true };
        }

        return {
            allowed: false,
            reason: `Channel '${channel}' not available in your tier. Upgrade to Pro to unlock all channels.`,
        };
    }

    /**
     * Check if user can use SMS commands
     */
    async canUseSMSCommands(userId: string): Promise<{ allowed: boolean; reason?: string }> {
        const limits = await this.getTierLimits(userId);

        if (limits.allowSMSCommands) {
            return { allowed: true };
        }

        return {
            allowed: false,
            reason: 'SMS commands are only available in Pro tier and above.',
        };
    }

    /**
     * Check if user can use webhooks
     */
    async canUseWebhooks(userId: string): Promise<{ allowed: boolean; reason?: string }> {
        const limits = await this.getTierLimits(userId);

        if (!limits.allowWebhooks) {
            return {
                allowed: false,
                reason: 'Webhooks are only available in Pro tier and above.',
            };
        }

        if (limits.maxWebhooks === -1) {
            return { allowed: true };
        }

        const webhooks = await storage.getActiveWebhooks();

        if (webhooks.length >= limits.maxWebhooks) {
            return {
                allowed: false,
                reason: `Webhook limit reached (${limits.maxWebhooks}). Upgrade to Business for unlimited webhooks.`,
            };
        }

        return { allowed: true };
    }

    /**
     * Get usage stats for a user
     */
    async getUsageStats(userId: string): Promise<{
        tier: string;
        limits: TierLimits;
        usage: {
            templates: number;
            dataSources: number;
            scheduledJobs: number;
            generationsThisMonth: number;
            webhooks: number;
        };
    }> {
        const user = await storage.getUser(userId);
        const tier = user?.subscriptionTier || 'free';
        const limits = await this.getTierLimits(userId);

        const templates = await storage.getContentTemplates(userId);
        const dataSources = await storage.getDataSources(userId);
        const jobs = await storage.getScheduledJobs(userId);
        const webhooks = await storage.getActiveWebhooks();

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const allGenerations = await storage.getGeneratedContent(userId, 1000);
        const generations = allGenerations.filter(g => {
            const generatedAt = g.generatedAt ? new Date(g.generatedAt) : new Date();
            return generatedAt >= startOfMonth && generatedAt <= now;
        });

        return {
            tier,
            limits,
            usage: {
                templates: templates.length,
                dataSources: dataSources.length,
                scheduledJobs: jobs.length,
                generationsThisMonth: generations.length,
                webhooks: webhooks.length,
            },
        };
    }

    /**
     * Get upgrade prompt message
     */
    getUpgradePrompt(currentTier: string, feature: string): string {
        const prompts: Record<string, string> = {
            free: `🚀 Upgrade to Pro ($29/month) to unlock ${feature} and unlimited generations!`,
            pro: `🚀 Upgrade to Business ($99/month) to unlock ${feature} and white-label features!`,
            business: `💼 Contact sales for Enterprise features and custom pricing.`,
        };

        return prompts[currentTier] || prompts.free;
    }
}

export const featureGateService = new FeatureGateService();
