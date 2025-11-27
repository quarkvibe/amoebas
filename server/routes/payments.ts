import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { strictRateLimit, standardRateLimit } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validation';
import { createCheckoutSchema, createSubscriptionCheckoutSchema } from '../validation/monetization';
import { stripeService } from '../services/stripeService';
import { storage } from '../storage';

/**
 * PAYMENT ROUTES (Stripe Integration)
 * Handles checkout sessions and payment history
 */

export function registerPaymentRoutes(router: Router) {
  
  // Create Stripe checkout session for $3.50 license
  router.post('/payments/checkout/license', 
    isAuthenticated, 
    strictRateLimit,
    validateBody(createCheckoutSchema),
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { successUrl, cancelUrl, email } = req.body;

        const checkoutUrl = await stripeService.createLicenseCheckoutSession({
          userId,
          email: email || req.user.claims.email || 'no-email@example.com',
          type: 'license',
          successUrl,
          cancelUrl,
        });

        res.json({ 
          success: true,
          url: checkoutUrl,
        });
      } catch (error: any) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ message: error.message || 'Failed to create checkout session' });
      }
    }
  );

  // Create Stripe checkout session for managed hosting subscription
  router.post('/payments/checkout/subscription', 
    isAuthenticated, 
    strictRateLimit,
    validateBody(createSubscriptionCheckoutSchema),
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { priceId, successUrl, cancelUrl, email } = req.body;

        const checkoutUrl = await stripeService.createSubscriptionCheckoutSession({
          userId,
          email: email || req.user.claims.email || 'no-email@example.com',
          type: 'subscription',
          priceId,
          successUrl,
          cancelUrl,
        });

        res.json({ 
          success: true,
          url: checkoutUrl,
        });
      } catch (error: any) {
        console.error('Error creating subscription checkout:', error);
        res.status(500).json({ message: error.message || 'Failed to create subscription checkout' });
      }
    }
  );

  // Create checkout session for NEW subscription tiers (Pro/Business)
  router.post('/checkout/session',
    strictRateLimit,
    async (req: any, res) => {
      try {
        const { tier, billingPeriod } = req.body;
        const userId = req.user?.claims?.sub;
        const email = req.user?.claims?.email || req.body.email;
        
        if (!tier || !billingPeriod) {
          return res.status(400).json({ 
            error: 'Missing required fields',
            message: 'tier and billingPeriod are required' 
          });
        }
        
        // Get price ID based on tier and billing period
        const priceIds: Record<string, Record<string, string>> = {
          pro: {
            monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
            yearly: process.env.STRIPE_PRICE_PRO_YEARLY || '',
          },
          business: {
            monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',
            yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY || '',
          },
        };
        
        const priceId = priceIds[tier]?.[billingPeriod];
        
        if (!priceId) {
          return res.status(400).json({ 
            error: 'Invalid tier or billing period',
            message: `Tier must be 'pro' or 'business', period must be 'monthly' or 'yearly'` 
          });
        }
        
        // Create Stripe checkout session
        const checkoutUrl = await stripeService.createSubscriptionCheckoutSession({
          userId: userId || 'guest',
          email: email || 'no-email@example.com',
          type: 'subscription',
          priceId,
          successUrl: process.env.STRIPE_SUCCESS_URL || `${req.headers.origin}/dashboard?subscribed=true`,
          cancelUrl: process.env.STRIPE_CANCEL_URL || `${req.headers.origin}/pricing`,
        });
        
        res.json({ url: checkoutUrl });
      } catch (error: any) {
        console.error('Error creating subscription checkout:', error);
        res.status(500).json({ 
          error: 'Checkout failed',
          message: error.message || 'Failed to create checkout session' 
        });
      }
    }
  );

  // Get user's subscription info
  router.get('/subscription',
    isAuthenticated,
    standardRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
          tier: user.subscriptionTier || 'free',
          status: user.subscriptionStatus || 'active',
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId,
          startDate: user.subscriptionStartDate,
          endDate: user.subscriptionEndDate,
          canceledAt: user.subscriptionCanceledAt,
        });
      } catch (error: any) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ error: 'Failed to fetch subscription' });
      }
    }
  );

  // Create Stripe customer portal session (for managing subscription)
  router.post('/subscription/portal',
    isAuthenticated,
    standardRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        
        if (!user?.stripeCustomerId) {
          return res.status(400).json({ 
            error: 'No subscription',
            message: 'You do not have an active subscription' 
          });
        }
        
        const portalUrl = await stripeService.createCustomerPortalSession(
          user.stripeCustomerId,
          req.body.returnUrl || `${req.headers.origin}/dashboard/billing`
        );
        
        res.json({ url: portalUrl });
      } catch (error: any) {
        console.error('Error creating portal session:', error);
        res.status(500).json({ error: 'Failed to create portal session' });
      }
    }
  );

  // Get user's payment history
  router.get('/payments', 
    isAuthenticated, 
    standardRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const payments = await storage.getUserPayments(userId);
        res.json(payments);
      } catch (error: any) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Failed to fetch payment history' });
      }
    }
  );
}




