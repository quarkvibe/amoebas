import { Router } from "express";
import { integrationService } from "../services/integrationService";
import { storage } from "../storage";
import { isAuthenticated } from "../middleware/auth";

export const integrationsRouter = Router();

// Apply auth middleware
integrationsRouter.use(isAuthenticated);

// =============================================================================
// API KEY MANAGEMENT
// =============================================================================

// Get all API keys for the current user
integrationsRouter.get("/api-keys", async (req: any, res) => {
    try {
        const apiKeys = await integrationService.getApiKeys();
        // Don't return the actual key hash, only metadata
        const safeApiKeys = apiKeys.map(key => ({
            id: key.id,
            name: key.name,
            permissions: key.permissions,
            isActive: key.isActive,
            lastUsed: key.lastUsed,
            expiresAt: key.expiresAt,
            createdAt: key.createdAt,
            updatedAt: key.updatedAt
        }));
        res.json(safeApiKeys);
    } catch (error) {
        console.error("Error fetching API keys:", error);
        res.status(500).json({ message: "Failed to fetch API keys" });
    }
});

// Generate a new API key
integrationsRouter.post("/api-keys", async (req: any, res) => {
    try {
        const { name, permissions } = req.body;

        if (!name || !permissions || !Array.isArray(permissions)) {
            return res.status(400).json({
                message: "Name and permissions array are required"
            });
        }

        const result = await integrationService.generateApiKey(name, permissions);

        res.json({
            message: "API key generated successfully",
            apiKey: {
                id: result.apiKey.id,
                name: result.apiKey.name,
                permissions: result.apiKey.permissions,
                key: result.key // Only return the actual key on creation
            }
        });
    } catch (error) {
        console.error("Error generating API key:", error);
        res.status(500).json({ message: "Failed to generate API key" });
    }
});

// Revoke an API key
integrationsRouter.delete("/api-keys/:id", async (req: any, res) => {
    try {
        const { id } = req.params;
        await integrationService.revokeApiKey(id);
        res.json({ message: "API key revoked successfully" });
    } catch (error) {
        console.error("Error revoking API key:", error);
        res.status(500).json({ message: "Failed to revoke API key" });
    }
});

// =============================================================================
// INTEGRATION MANAGEMENT
// =============================================================================

// Get integrations
integrationsRouter.get("/integrations", async (req: any, res) => {
    try {
        const apiKeys = await integrationService.getApiKeys();
        const webhooks = await storage.getActiveWebhooks();
        res.json({ apiKeys, webhooks });
    } catch (error) {
        console.error("Error fetching integrations:", error);
        res.status(500).json({ message: "Failed to fetch integrations" });
    }
});

// Create API key (legacy endpoint - use /api-keys instead)
integrationsRouter.post("/integrations/keys", async (req: any, res) => {
    try {
        const { name, permissions } = req.body;
        const result = await integrationService.generateApiKey(name, permissions);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error creating API key:", error);
        res.status(500).json({ message: "Failed to create API key" });
    }
});

// =============================================================================
// BYOK CREDENTIALS MANAGEMENT
// =============================================================================

// AI Credentials CRUD
integrationsRouter.get("/ai-credentials", async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const credentials = await storage.getAiCredentials(userId);

        // Don't return the full API key in list view for security
        const safeCredentials = credentials.map(cred => ({
            ...cred,
            apiKey: `${cred.apiKey.substring(0, 8)}...${cred.apiKey.substring(cred.apiKey.length - 4)}`,
        }));

        res.json(safeCredentials);
    } catch (error) {
        console.error("Error fetching AI credentials:", error);
        res.status(500).json({ message: "Failed to fetch AI credentials" });
    }
});

integrationsRouter.post("/ai-credentials", async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const credential = await storage.createAiCredential({ ...req.body, userId });

        // Mask the API key in response (show first 8 and last 4 chars)
        res.status(201).json({
            ...credential,
            apiKey: `${credential.apiKey.substring(0, 8)}...${credential.apiKey.substring(credential.apiKey.length - 4)}`,
        });
    } catch (error) {
        console.error("Error creating AI credential:", error);
        res.status(500).json({ message: "Failed to create AI credential" });
    }
});

integrationsRouter.get("/ai-credentials/:id", async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const credential = await storage.getAiCredential(req.params.id, userId);

        if (!credential) {
            return res.status(404).json({ message: "AI credential not found" });
        }

        // Return full credential (caller has permission)
        res.json(credential);
    } catch (error) {
        console.error("Error fetching AI credential:", error);
        res.status(500).json({ message: "Failed to fetch AI credential" });
    }
});

integrationsRouter.put("/ai-credentials/:id", async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const credential = await storage.updateAiCredential(req.params.id, userId, req.body);

        if (!credential) {
            return res.status(404).json({ message: "AI credential not found" });
        }

        res.json({
            ...credential,
            apiKey: `${credential.apiKey.substring(0, 8)}...${credential.apiKey.substring(credential.apiKey.length - 4)}`,
        });
    } catch (error) {
        console.error("Error updating AI credential:", error);
        res.status(500).json({ message: "Failed to update AI credential" });
    }
});

integrationsRouter.delete("/ai-credentials/:id", async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const deleted = await storage.deleteAiCredential(req.params.id, userId);

        if (!deleted) {
            return res.status(404).json({ message: "AI credential not found" });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting AI credential:", error);
        res.status(500).json({ message: "Failed to delete AI credential" });
    }
});

// Email Service Credentials CRUD
integrationsRouter.get("/email-credentials", async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const credentials = await storage.getEmailServiceCredentials(userId);

        // Mask sensitive fields in list view
        const safeCredentials = credentials.map(cred => ({
            ...cred,
            apiKey: cred.apiKey ? `${cred.apiKey.substring(0, 8)}...` : null,
            awsSecretAccessKey: cred.awsSecretAccessKey ? '***HIDDEN***' : null,
        }));

        res.json(safeCredentials);
    } catch (error) {
        console.error("Error fetching email credentials:", error);
        res.status(500).json({ message: "Failed to fetch email credentials" });
    }
});

integrationsRouter.post("/email-credentials", async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const credential = await storage.createEmailServiceCredential({ ...req.body, userId });

        res.status(201).json({
            ...credential,
            apiKey: credential.apiKey ? `${credential.apiKey.substring(0, 8)}...` : null,
            awsSecretAccessKey: credential.awsSecretAccessKey ? '***HIDDEN***' : null,
        });
    } catch (error) {
        console.error("Error creating email credential:", error);
        res.status(500).json({ message: "Failed to create email credential" });
    }
});

integrationsRouter.get("/email-credentials/:id", async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const credential = await storage.getEmailServiceCredential(req.params.id, userId);

        if (!credential) {
            return res.status(404).json({ message: "Email credential not found" });
        }

        // Return full credential (caller has permission)
        res.json(credential);
    } catch (error) {
        console.error("Error fetching email credential:", error);
        res.status(500).json({ message: "Failed to fetch email credential" });
    }
});

integrationsRouter.put("/email-credentials/:id", async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const credential = await storage.updateEmailServiceCredential(req.params.id, userId, req.body);

        if (!credential) {
            return res.status(404).json({ message: "Email credential not found" });
        }

        res.json({
            ...credential,
            apiKey: credential.apiKey ? `${credential.apiKey.substring(0, 8)}...` : null,
            awsSecretAccessKey: credential.awsSecretAccessKey ? '***HIDDEN***' : null,
        });
    } catch (error) {
        console.error("Error updating email credential:", error);
        res.status(500).json({ message: "Failed to update email credential" });
    }
});

integrationsRouter.delete("/email-credentials/:id", async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const deleted = await storage.deleteEmailServiceCredential(req.params.id, userId);

        if (!deleted) {
            return res.status(404).json({ message: "Email credential not found" });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting email credential:", error);
        res.status(500).json({ message: "Failed to delete email credential" });
    }
});
