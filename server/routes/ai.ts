import { Router } from "express";
import { codingAgentService } from "../services/codingAgentService";
import { organelleService } from "../services/organelleService";
import { registryService } from "../services/registryService";
import { mcpService } from "../services/mcpService";
import { aiAgent } from "../services/aiAgent";
import { storage } from "../storage";
import { isAuthenticated } from "../middleware/auth";

export const aiRouter = Router();

// Apply auth middleware to all AI routes
aiRouter.use(isAuthenticated);

// Coding Agent Chat
aiRouter.post("/agent/coding", async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const { message, context } = req.body;
        const response = await codingAgentService.processRequest(userId, message, context);
        res.json(response);
    } catch (error: any) {
        console.error("Error in coding agent:", error);
        res.status(500).json({ message: error.message || "Failed to process coding request" });
    }
});

// Organelles Management
aiRouter.get("/organelles", async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const organelles = await organelleService.getOrganelles(userId);
        res.json(organelles);
    } catch (error) {
        console.error("Error fetching organelles:", error);
        res.status(500).json({ message: "Failed to fetch organelles" });
    }
});

aiRouter.delete("/organelles/:name", async (req: any, res) => {
    try {
        const { name } = req.params;
        const result = await organelleService.deleteOrganelle(name);

        if (!result.success) {
            return res.status(404).json({ message: result.message });
        }

        res.json(result);
    } catch (error) {
        console.error("Error deleting organelle:", error);
        res.status(500).json({ message: "Failed to delete organelle" });
    }
});

// Organelles Registry
aiRouter.get("/registry", async (req: any, res) => {
    try {
        const items = await registryService.getRegistry();
        res.json(items);
    } catch (error) {
        console.error("Error fetching registry:", error);
        res.status(500).json({ message: "Failed to fetch registry" });
    }
});

aiRouter.post("/registry/install", async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Organelle ID is required" });
        }

        const result = await registryService.installOrganelle(id, userId);

        if (!result.success) {
            return res.status(500).json({ message: result.message });
        }

        res.json(result);
    } catch (error) {
        console.error("Error installing organelle:", error);
        res.status(500).json({ message: "Failed to install organelle" });
    }
});

// MCP Servers Management
aiRouter.get("/mcp", async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const tools = await mcpService.getTools(userId);
        res.json({ tools });
    } catch (error) {
        console.error("Error fetching MCP tools:", error);
        res.status(500).json({ message: "Failed to fetch MCP tools" });
    }
});

// Chat with AI agent
aiRouter.post("/agent/chat", async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const { message } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ message: 'Invalid message' });
        }

        const response = await aiAgent.processMessage(userId, message);
        res.json(response);
    } catch (error) {
        console.error("Error in AI agent chat:", error);
        res.status(500).json({ message: "Failed to process chat message" });
    }
});

// Get conversation history
aiRouter.get("/agent/conversations", async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const conversations = await storage.getAgentConversations(userId);
        res.json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: "Failed to fetch conversations" });
    }
});

// Get AI suggestions
aiRouter.get("/agent/suggestions", async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const suggestions = await aiAgent.suggestOptimizations(userId);
        res.json({ suggestions });
    } catch (error) {
        console.error("Optimization suggestions error:", error);
        res.json({ suggestions: ["Unable to generate suggestions at this time"] });
    }
});
