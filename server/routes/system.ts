import { Router } from "express";
import { storage } from "../storage";
import { cronService } from "../services/cronService";
import { isAuthenticated } from "../middleware/auth";

export const systemRouter = Router();

// =============================================================================
// PUBLIC HEALTH CHECKS
// =============================================================================

// Health check endpoint (public) - Simple version
systemRouter.get("/health", async (req, res) => {
    try {
        // Simple health check - just verify DB connection
        const dbHealth = await storage.healthCheck();
        res.json({
            status: dbHealth.healthy ? "healthy" : "degraded",
            icon: dbHealth.healthy ? "🟢" : "🔴",
            message: dbHealth.message || "System operational",
            timestamp: new Date().toISOString(),
            service: "Amoeba AI Platform",
            version: "2.0.0",
        });
    } catch (error) {
        console.error("Health check error:", error);
        res.status(500).json({
            status: "critical",
            message: "Health check failed"
        });
    }
});

// =============================================================================
// AUTHENTICATED SYSTEM ROUTES
// =============================================================================

// System readiness check (authenticated) - Simplified
systemRouter.get("/system/readiness", isAuthenticated, async (req: any, res) => {
    try {
        const dbHealth = await storage.healthCheck();
        res.json({
            status: dbHealth.healthy ? "ready" : "degraded",
            database: dbHealth,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Readiness check error:", error);
        res.status(500).json({ message: "Failed to check system readiness" });
    }
});

// Setup & System Status
systemRouter.get("/setup/status", async (_req, res) => {
    try {
        const userCount = await storage.getUserCount();
        res.json({
            requiresSetup: userCount === 0,
            userCount
        });
    } catch (error) {
        console.error("Error checking setup status:", error);
        res.status(500).json({ message: "Failed to check setup status" });
    }
});

// Get system configurations
systemRouter.get("/system/config", isAuthenticated, async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        // Return basic config - can be expanded later
        res.json({
            version: '2.0.0',
            features: ['content_generation', 'scheduling', 'delivery'],
            userId
        });
    } catch (error) {
        console.error("Error fetching system config:", error);
        res.status(500).json({ message: "Failed to fetch system config" });
    }
});

// Update system configuration
systemRouter.put("/system/config", isAuthenticated, async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        // Stub - acknowledge update
        res.json({ message: 'Configuration updated', userId });
    } catch (error) {
        console.error("Error updating system config:", error);
        res.status(500).json({ message: "Failed to update system config" });
    }
});

// =============================================================================
// CRON JOB MANAGEMENT
// =============================================================================

// Get cron job status
systemRouter.get("/cron/status", isAuthenticated, async (req, res) => {
    try {
        const status = cronService.getStatus();
        res.json(status);
    } catch (error) {
        console.error("Error fetching cron status:", error);
        res.status(500).json({ message: "Failed to fetch cron status" });
    }
});
