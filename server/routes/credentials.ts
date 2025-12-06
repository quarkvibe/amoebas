import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { standardRateLimit, generousRateLimit, strictRateLimit } from '../middleware/rateLimiter';
import { storage } from '../storage';

/**
 * CREDENTIALS ROUTES (BYOK - Bring Your Own Keys)
 * Manages user-provided AI and email service credentials
 * All API keys are encrypted at rest using AES-256-GCM
 */

export function registerCredentialRoutes(router: Router) {

  // =============================================================================
  // AI CREDENTIALS (OpenAI, Anthropic, Cohere, Ollama)
  // =============================================================================

  // List AI credentials (masked)
  router.get('/ai-credentials',
    isAuthenticated,
    generousRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const credentials = await storage.getAiCredentials(userId);

        // Mask API keys in list view for security
        const safeCredentials = credentials.map(cred => ({
          ...cred,
          apiKey: `${cred.apiKey.substring(0, 8)}...${cred.apiKey.substring(cred.apiKey.length - 4)}`,
        }));

        res.json(safeCredentials);
      } catch (error) {
        console.error('Error fetching AI credentials:', error);
        res.status(500).json({ message: 'Failed to fetch AI credentials' });
      }
    }
  );

  // Get single AI credential (full key for editing)
  router.get('/ai-credentials/:id',
    isAuthenticated,
    standardRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;

        const credential = await storage.getAiCredential(id, userId);

        if (!credential) {
          return res.status(404).json({ message: 'Credential not found' });
        }

        res.json(credential);
      } catch (error) {
        console.error('Error fetching AI credential:', error);
        res.status(500).json({ message: 'Failed to fetch credential' });
      }
    }
  );

  // Create AI credential
  router.post('/ai-credentials',
    isAuthenticated,
    standardRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { provider, name, apiKey, additionalConfig, isDefault, isActive } = req.body;

        // Validation
        if (!provider || !name || !apiKey) {
          return res.status(400).json({
            message: 'provider, name, and apiKey are required'
          });
        }

        if (!['openai', 'anthropic', 'cohere', 'ollama'].includes(provider.toLowerCase())) {
          return res.status(400).json({
            message: 'Invalid provider. Must be: openai, anthropic, cohere, or ollama'
          });
        }

        // Create credential (encryption happens in storage layer)
        const credential = await storage.createAiCredential({
          userId,
          provider: provider.toLowerCase(),
          name,
          apiKey,
          additionalConfig: additionalConfig || null,
          isDefault: isDefault || false,
          isActive: isActive !== false,
        });

        // Mask API key in response
        res.status(201).json({
          ...credential,
          apiKey: `${credential.apiKey.substring(0, 8)}...${credential.apiKey.substring(credential.apiKey.length - 4)}`,
        });
      } catch (error) {
        console.error('Error creating AI credential:', error);
        res.status(500).json({ message: 'Failed to create credential' });
      }
    }
  );

  // Update AI credential
  router.put('/ai-credentials/:id',
    isAuthenticated,
    standardRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;

        // Verify ownership
        const existing = await storage.getAiCredential(id, userId);
        if (!existing) {
          return res.status(404).json({ message: 'Credential not found' });
        }

        // Update (only provided fields)
        const updated = await storage.updateAiCredential(id, userId, req.body);

        if (!updated) {
          return res.status(404).json({ message: 'Credential not found' });
        }

        // Mask API key in response
        res.json({
          ...updated,
          apiKey: `${updated.apiKey.substring(0, 8)}...${updated.apiKey.substring(updated.apiKey.length - 4)}`,
        });
      } catch (error) {
        console.error('Error updating AI credential:', error);
        res.status(500).json({ message: 'Failed to update credential' });
      }
    }
  );

  // Delete AI credential
  router.delete('/ai-credentials/:id',
    isAuthenticated,
    standardRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;

        // Verify ownership
        const credential = await storage.getAiCredential(id, userId);
        if (!credential) {
          return res.status(404).json({ message: 'Credential not found' });
        }

        await storage.deleteAiCredential(id, userId);

        res.json({ success: true, message: 'Credential deleted' });
      } catch (error) {
        console.error('Error deleting AI credential:', error);
        res.status(500).json({ message: 'Failed to delete credential' });
      }
    }
  );

  // Test AI credential (verify it works)
  router.post('/ai-credentials/:id/test',
    isAuthenticated,
    strictRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;

        const credential = await storage.getAiCredential(id, userId);
        if (!credential) {
          return res.status(404).json({ message: 'Credential not found' });
        }

        let success = false;
        let message = '';

        // Real validation logic
        try {
          switch (credential.provider) {
            case 'openai':
              const openaiRes = await fetch('https://api.openai.com/v1/models', {
                headers: { 'Authorization': `Bearer ${credential.apiKey}` }
              });
              if (openaiRes.ok) {
                success = true;
                message = '✅ OpenAI key is valid';
              } else {
                const err = await openaiRes.json();
                message = `❌ OpenAI Error: ${err.error?.message || openaiRes.statusText}`;
              }
              break;

            case 'anthropic':
              const anthropicRes = await fetch('https://api.anthropic.com/v1/models', {
                headers: {
                  'x-api-key': credential.apiKey,
                  'anthropic-version': '2023-06-01'
                }
              });
              if (anthropicRes.ok) {
                success = true;
                message = '✅ Anthropic key is valid';
              } else {
                const err = await anthropicRes.json();
                message = `❌ Anthropic Error: ${err.error?.message || anthropicRes.statusText}`;
              }
              break;

            case 'ollama':
              // For Ollama, we check the configured URL (default localhost:11434)
              const baseUrl = credential.additionalConfig?.baseUrl || 'http://localhost:11434';
              try {
                const ollamaRes = await fetch(`${baseUrl}/api/tags`);
                if (ollamaRes.ok) {
                  success = true;
                  message = '✅ Ollama connection successful';
                } else {
                  message = `❌ Ollama Error: ${ollamaRes.statusText}`;
                }
              } catch (e: any) {
                message = `❌ Ollama Connection Failed: ${e.message}`;
              }
              break;

            default:
              // Fallback for others
              success = true;
              message = `⚠️ Validation not implemented for ${credential.provider}, assuming valid`;
          }
        } catch (validationError: any) {
          message = `❌ Validation Error: ${validationError.message}`;
        }

        res.json({
          success,
          provider: credential.provider,
          message
        });
      } catch (error) {
        console.error('Error testing AI credential:', error);
        res.status(500).json({
          success: false,
          message: 'Credential test failed'
        });
      }
    }
  );

  // =============================================================================
  // EMAIL SERVICE CREDENTIALS (SendGrid, AWS SES)
  // =============================================================================

  // List email credentials (masked)
  router.get('/email-credentials',
    isAuthenticated,
    generousRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const credentials = await storage.getEmailServiceCredentials(userId);

        // Mask sensitive fields
        const safeCredentials = credentials.map(cred => ({
          ...cred,
          apiKey: cred.apiKey ? `${cred.apiKey.substring(0, 8)}...${cred.apiKey.substring(cred.apiKey.length - 4)}` : null,
          awsSecretAccessKey: cred.awsSecretAccessKey ? '***MASKED***' : null,
        }));

        res.json(safeCredentials);
      } catch (error) {
        console.error('Error fetching email credentials:', error);
        res.status(500).json({ message: 'Failed to fetch email credentials' });
      }
    }
  );

  // Get single email credential
  router.get('/email-credentials/:id',
    isAuthenticated,
    standardRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;

        const credential = await storage.getEmailServiceCredential(id, userId);

        if (!credential) {
          return res.status(404).json({ message: 'Credential not found' });
        }

        res.json(credential);
      } catch (error) {
        console.error('Error fetching email credential:', error);
        res.status(500).json({ message: 'Failed to fetch credential' });
      }
    }
  );

  // Create email credential
  router.post('/email-credentials',
    isAuthenticated,
    standardRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { provider, name, fromEmail, fromName, apiKey, awsAccessKeyId, awsSecretAccessKey, awsRegion, isDefault, isActive } = req.body;

        // Validation
        if (!provider || !name || !fromEmail) {
          return res.status(400).json({
            message: 'provider, name, and fromEmail are required'
          });
        }

        if (!['sendgrid', 'ses'].includes(provider.toLowerCase())) {
          return res.status(400).json({
            message: 'Invalid provider. Must be: sendgrid or ses'
          });
        }

        // Provider-specific validation
        if (provider.toLowerCase() === 'sendgrid' && !apiKey) {
          return res.status(400).json({ message: 'apiKey required for SendGrid' });
        }

        if (provider.toLowerCase() === 'ses' && (!awsAccessKeyId || !awsSecretAccessKey)) {
          return res.status(400).json({ message: 'AWS credentials required for SES' });
        }

        // Create credential
        const credential = await storage.createEmailServiceCredential({
          userId,
          provider: provider.toLowerCase(),
          name,
          fromEmail,
          fromName: fromName || null,
          apiKey: apiKey || null,
          awsAccessKeyId: awsAccessKeyId || null,
          awsSecretAccessKey: awsSecretAccessKey || null,
          awsRegion: awsRegion || 'us-east-1',
          isDefault: isDefault || false,
          isActive: isActive !== false,
        });

        // Mask sensitive fields in response
        res.status(201).json({
          ...credential,
          apiKey: credential.apiKey ? `${credential.apiKey.substring(0, 8)}...${credential.apiKey.substring(credential.apiKey.length - 4)}` : null,
          awsSecretAccessKey: credential.awsSecretAccessKey ? '***MASKED***' : null,
        });
      } catch (error) {
        console.error('Error creating email credential:', error);
        res.status(500).json({ message: 'Failed to create credential' });
      }
    }
  );

  // Update email credential
  router.put('/email-credentials/:id',
    isAuthenticated,
    standardRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;

        // Verify ownership
        const existing = await storage.getEmailServiceCredential(id, userId);
        if (!existing) {
          return res.status(404).json({ message: 'Credential not found' });
        }

        // Update
        const updated = await storage.updateEmailServiceCredential(id, userId, req.body);

        if (!updated) {
          return res.status(404).json({ message: 'Credential not found' });
        }

        // Mask sensitive fields
        res.json({
          ...updated,
          apiKey: updated.apiKey ? `${updated.apiKey.substring(0, 8)}...${updated.apiKey.substring(updated.apiKey.length - 4)}` : null,
          awsSecretAccessKey: updated.awsSecretAccessKey ? '***MASKED***' : null,
        });
      } catch (error) {
        console.error('Error updating email credential:', error);
        res.status(500).json({ message: 'Failed to update credential' });
      }
    }
  );

  // Delete email credential
  router.delete('/email-credentials/:id',
    isAuthenticated,
    standardRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;

        // Verify ownership
        const credential = await storage.getEmailServiceCredential(id, userId);
        if (!credential) {
          return res.status(404).json({ message: 'Credential not found' });
        }

        await storage.deleteEmailServiceCredential(id, userId);

        res.json({ success: true, message: 'Credential deleted' });
      } catch (error) {
        console.error('Error deleting email credential:', error);
        res.status(500).json({ message: 'Failed to delete credential' });
      }
    }
  );

  // Test email credential (send test email)
  router.post('/email-credentials/:id/test',
    isAuthenticated,
    strictRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;
        const { testEmail } = req.body;

        if (!testEmail) {
          return res.status(400).json({ message: 'testEmail is required' });
        }

        const credential = await storage.getEmailServiceCredential(id, userId);
        if (!credential) {
          return res.status(404).json({ message: 'Credential not found' });
        }

        let success = false;
        let message = '';

        try {
          switch (credential.provider) {
            case 'sendgrid':
              const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${credential.apiKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  personalizations: [{ to: [{ email: testEmail }] }],
                  from: { email: credential.fromEmail, name: credential.fromName || 'Amoeba Test' },
                  subject: 'Amoeba Credential Test',
                  content: [{ type: 'text/plain', value: 'Your SendGrid credential is working correctly!' }]
                })
              });

              if (sgRes.ok || sgRes.status === 202) {
                success = true;
                message = `✅ Test email sent to ${testEmail}`;
              } else {
                const err = await sgRes.json().catch(() => ({}));
                message = `❌ SendGrid Error: ${err.errors?.[0]?.message || sgRes.statusText}`;
              }
              break;

            case 'ses':
              // For SES, we'd typically use aws-sdk, but for now we'll just check if we can list identities
              // This avoids adding a heavy dependency just for a test if not already present
              // TODO: Implement full SES send test if aws-sdk is available
              if (credential.awsAccessKeyId && credential.awsSecretAccessKey) {
                success = true;
                message = '✅ AWS Credentials present (Full validation requires AWS SDK)';
              } else {
                message = '❌ Missing AWS Credentials';
              }
              break;

            default:
              success = true;
              message = `⚠️ Validation not implemented for ${credential.provider}`;
          }
        } catch (validationError: any) {
          message = `❌ Validation Error: ${validationError.message}`;
        }

        res.json({
          success,
          provider: credential.provider,
          message
        });
      } catch (error) {
        console.error('Error testing email credential:', error);
        res.status(500).json({
          success: false,
          message: 'Email test failed'
        });
      }
    }
  );

  // =============================================================================
  // PHONE SERVICE CREDENTIALS (Twilio, AWS SNS) - NEW
  // =============================================================================

  // List phone credentials (masked)
  router.get('/phone-credentials',
    isAuthenticated,
    generousRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const credentials = await storage.getPhoneServiceCredentials(userId);

        // Mask sensitive fields
        const safeCredentials = credentials.map(cred => ({
          ...cred,
          apiKey: cred.apiKey ? `${cred.apiKey.substring(0, 8)}...***` : null,
          maskedKey: cred.apiKey ? `${cred.apiKey.substring(0, 8)}...***` : null,
        }));

        res.json(safeCredentials);
      } catch (error) {
        console.error('Error fetching phone credentials:', error);
        res.status(500).json({ message: 'Failed to fetch phone credentials' });
      }
    }
  );

  // Get single phone credential
  router.get('/phone-credentials/:id',
    isAuthenticated,
    standardRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;

        const credential = await storage.getPhoneServiceCredential(id, userId);

        if (!credential) {
          return res.status(404).json({ message: 'Credential not found' });
        }

        res.json(credential);
      } catch (error) {
        console.error('Error fetching phone credential:', error);
        res.status(500).json({ message: 'Failed to fetch credential' });
      }
    }
  );

  // Create phone credential
  router.post('/phone-credentials',
    isAuthenticated,
    standardRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { provider, name, accountSid, apiKey, phoneNumber, config, isDefault, isActive } = req.body;

        // Validation
        if (!provider || !name) {
          return res.status(400).json({
            message: 'provider and name are required'
          });
        }

        if (!['twilio', 'aws_sns'].includes(provider.toLowerCase())) {
          return res.status(400).json({
            message: 'Invalid provider. Must be: twilio or aws_sns'
          });
        }

        // Provider-specific validation
        if (provider.toLowerCase() === 'twilio' && (!accountSid || !apiKey)) {
          return res.status(400).json({ message: 'accountSid and apiKey required for Twilio' });
        }

        // Create credential
        const credential = await storage.createPhoneServiceCredential({
          userId,
          provider: provider.toLowerCase(),
          name,
          accountSid: accountSid || null,
          apiKey: apiKey || null,
          phoneNumber: phoneNumber || null,
          config: config || null,
          isDefault: isDefault || false,
          isActive: isActive !== false,
        });

        res.status(201).json({
          ...credential,
          apiKey: `${credential.apiKey.substring(0, 8)}...***`,
        });
      } catch (error) {
        console.error('Error creating phone credential:', error);
        res.status(500).json({ message: 'Failed to create credential' });
      }
    }
  );

  // Update phone credential
  router.put('/phone-credentials/:id',
    isAuthenticated,
    standardRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;
        const { name, accountSid, apiKey, phoneNumber, config, isDefault, isActive } = req.body;

        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (accountSid !== undefined) updates.accountSid = accountSid;
        if (apiKey !== undefined) updates.apiKey = apiKey;
        if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
        if (config !== undefined) updates.config = config;
        if (isDefault !== undefined) updates.isDefault = isDefault;
        if (isActive !== undefined) updates.isActive = isActive;

        const credential = await storage.updatePhoneServiceCredential(id, userId, updates);

        if (!credential) {
          return res.status(404).json({ message: 'Credential not found' });
        }

        res.json({
          ...credential,
          apiKey: credential.apiKey ? `${credential.apiKey.substring(0, 8)}...***` : null,
        });
      } catch (error) {
        console.error('Error updating phone credential:', error);
        res.status(500).json({ message: 'Failed to update credential' });
      }
    }
  );

  // Delete phone credential
  router.delete('/phone-credentials/:id',
    isAuthenticated,
    standardRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;

        await storage.deletePhoneServiceCredential(id, userId);

        res.json({ message: 'Phone credential deleted successfully' });
      } catch (error) {
        console.error('Error deleting phone credential:', error);
        res.status(500).json({ message: 'Failed to delete credential' });
      }
    }
  );

  // Test phone credential (send test SMS or make test call)
  router.post('/phone-credentials/:id/test',
    isAuthenticated,
    strictRateLimit,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;
        const { testPhoneNumber, testType } = req.body; // testType: 'sms' or 'voice'

        if (!testPhoneNumber) {
          return res.status(400).json({ message: 'testPhoneNumber required' });
        }

        const credential = await storage.getPhoneServiceCredential(id, userId);
        if (!credential) {
          return res.status(404).json({ message: 'Credential not found' });
        }

        let success = false;
        let message = '';

        try {
          switch (credential.provider) {
            case 'twilio':
              // Basic Auth for Twilio
              const auth = Buffer.from(`${credential.accountSid}:${credential.apiKey}`).toString('base64');
              const body = new URLSearchParams();
              body.append('To', testPhoneNumber);
              body.append('From', credential.phoneNumber || ''); // Must be a valid Twilio number
              body.append('Body', 'Amoeba System Test: Your credentials are working!');

              const twilioRes = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${credential.accountSid}/Messages.json`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                  },
                  body: body
                }
              );

              if (twilioRes.ok || twilioRes.status === 201) {
                success = true;
                message = `✅ Test SMS sent to ${testPhoneNumber}`;
              } else {
                const err = await twilioRes.json();
                message = `❌ Twilio Error: ${err.message || twilioRes.statusText}`;
              }
              break;

            case 'aws_sns':
              // Placeholder for SNS
              if (credential.apiKey) { // Using apiKey field for Access Key ID in schema mapping
                success = true;
                message = '✅ AWS SNS Credentials present (Full validation requires AWS SDK)';
              } else {
                message = '❌ Missing AWS Credentials';
              }
              break;

            default:
              success = true;
              message = `⚠️ Validation not implemented for ${credential.provider}`;
          }
        } catch (validationError: any) {
          message = `❌ Validation Error: ${validationError.message}`;
        }

        res.json({
          success,
          provider: credential.provider,
          message
        });
      } catch (error) {
        console.error('Error testing phone credential:', error);
        res.status(500).json({
          success: false,
          message: 'Phone test failed'
        });
      }
    }
  );
}




