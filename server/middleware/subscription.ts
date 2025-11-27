import { storage } from '../storage';
import type { Request, Response, NextFunction } from 'express';

/**
 * Subscription Middleware
 * Check user's subscription tier and enforce access
 */

export type SubscriptionTier = 'free' | 'pro' | 'business' | 'enterprise';

const tierLevels: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  business: 2,
  enterprise: 3,
};

/**
 * Require specific subscription tier or higher
 */
export function requireTier(requiredTier: SubscriptionTier) {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to continue',
        });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User account not found',
        });
      }
      
      const userTier = (user.subscriptionTier as SubscriptionTier) || 'free';
      const userLevel = tierLevels[userTier];
      const requiredLevel = tierLevels[requiredTier];
      
      if (userLevel < requiredLevel) {
        return res.status(403).json({
          error: 'Upgrade required',
          message: `This feature requires ${requiredTier} tier or higher`,
          currentTier: userTier,
          requiredTier: requiredTier,
          upgradeUrl: '/pricing',
          subscriptionNeeded: true,
        });
      }
      
      // User has required tier, continue
      next();
    } catch (error: any) {
      console.error('Subscription check error:', error);
      res.status(500).json({
        error: 'Subscription check failed',
        message: 'Failed to verify subscription status',
      });
    }
  };
}

/**
 * Check if user has active subscription (any paid tier)
 */
export function requirePaidTier() {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required',
        });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }
      
      const userTier = (user.subscriptionTier as SubscriptionTier) || 'free';
      
      if (userTier === 'free') {
        return res.status(403).json({
          error: 'Paid subscription required',
          message: 'This feature requires a paid subscription',
          currentTier: 'free',
          upgradeUrl: '/pricing',
          subscriptionNeeded: true,
        });
      }
      
      // Check subscription is active
      if (user.subscriptionStatus !== 'active') {
        return res.status(403).json({
          error: 'Inactive subscription',
          message: `Your subscription is ${user.subscriptionStatus}. Please update your payment method.`,
          subscriptionStatus: user.subscriptionStatus,
          manageUrl: '/dashboard/billing',
        });
      }
      
      next();
    } catch (error: any) {
      console.error('Paid tier check error:', error);
      res.status(500).json({
        error: 'Subscription check failed',
      });
    }
  };
}

/**
 * Check if subscription is active (not past_due, canceled, etc.)
 */
export async function isSubscriptionActive(userId: string): Promise<boolean> {
  try {
    const user = await storage.getUser(userId);
    if (!user) return false;
    
    // Free tier is always "active"
    if (user.subscriptionTier === 'free') return true;
    
    // Paid tiers must have active status
    return user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';
  } catch (error) {
    console.error('Subscription status check error:', error);
    return false;
  }
}

/**
 * Get user's subscription tier
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  try {
    const user = await storage.getUser(userId);
    return (user?.subscriptionTier as SubscriptionTier) || 'free';
  } catch (error) {
    console.error('Get tier error:', error);
    return 'free';
  }
}

/**
 * Check if user can access a feature
 */
export async function canAccessFeature(
  userId: string,
  feature: string
): Promise<boolean> {
  const tier = await getUserTier(userId);
  
  // Feature access rules
  const featureAccess: Record<string, SubscriptionTier[]> = {
    // Pro features
    'priority_support': ['pro', 'business', 'enterprise'],
    'early_access': ['pro', 'business', 'enterprise'],
    'private_discord': ['pro', 'business', 'enterprise'],
    'roadmap_voting': ['pro', 'business', 'enterprise'],
    'remove_branding': ['pro', 'business', 'enterprise'],
    
    // Business features
    'white_label': ['business', 'enterprise'],
    'sla_support': ['business', 'enterprise'],
    'multi_instance': ['business', 'enterprise'],
    'priority_bugs': ['business', 'enterprise'],
    'quarterly_calls': ['business', 'enterprise'],
    
    // Enterprise features
    'dedicated_engineer': ['enterprise'],
    'custom_development': ['enterprise'],
    'training': ['enterprise'],
    'legal_agreements': ['enterprise'],
  };
  
  const allowedTiers = featureAccess[feature];
  if (!allowedTiers) return true; // Feature not gated
  
  return allowedTiers.includes(tier);
}

/**
 * Middleware to attach subscription info to request
 */
export async function attachSubscriptionInfo(
  req: any,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id || req.user?.claims?.sub;
    
    if (userId) {
      const user = await storage.getUser(userId);
      if (user) {
        req.subscription = {
          tier: user.subscriptionTier || 'free',
          status: user.subscriptionStatus || 'active',
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId,
          startDate: user.subscriptionStartDate,
          endDate: user.subscriptionEndDate,
        };
      }
    }
    
    next();
  } catch (error) {
    // Don't block request if subscription check fails
    console.error('Attach subscription error:', error);
    next();
  }
}

