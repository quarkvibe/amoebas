import { Router } from "express";
import { requireAdmin } from "../middleware/admin";
import { storage } from "../storage";
import { licenseService } from "../services/licenseService";
import { db } from "../db";
import { users, instanceHeartbeats } from "@shared/schema";
import { telemetryIngestService } from "./telemetryIngest";
import { desc } from "drizzle-orm";

export function registerMothershipRoutes(router: Router) {

    // --- TELEMETRY RECEIVER (Public/Protected by Signature in future) ---
    router.post("/api/mothership/telemetry", async (req, res) => {
        try {
            // TODO: Verify signature from the instance
            await telemetryIngestService.processHeartbeat({
                ...req.body,
                ipAddress: req.ip
            });
            res.json({ status: "received" });
        } catch (error) {
            res.status(500).json({ message: "Failed to process heartbeat" });
        }
    });

    // --- ADMIN DASHBOARD ROUTES (Protected by Admin Middleware) ---

    // Get System Stats (Local Instance)
    router.get("/api/admin/stats", requireAdmin, async (req, res) => {
        try {
            const userCount = await storage.getUserCount();
            const licenseStats = await licenseService.getLicenseStats();

            // Get DB size (approximate)
            const dbSizeResult = await db.execute(
                // @ts-ignore
                `SELECT pg_size_pretty(pg_database_size(current_database())) as size`
            );
            const dbSize = dbSizeResult.rows[0]?.size || "Unknown";

            res.json({
                users: {
                    total: userCount,
                    active: userCount,
                },
                licenses: licenseStats,
                system: {
                    version: "2.0.0",
                    uptime: process.uptime(),
                    dbSize,
                    nodeVersion: process.version,
                    platform: process.platform,
                    memoryUsage: process.memoryUsage(),
                }
            });
        } catch (error) {
            console.error("Error fetching admin stats:", error);
            res.status(500).json({ message: "Failed to fetch admin stats" });
        }
    });

    // Get All Users
    router.get("/api/admin/users", requireAdmin, async (req, res) => {
        try {
            const allUsers = await db.select().from(users);

            const safeUsers = allUsers.map((u: typeof users.$inferSelect) => ({
                id: u.id,
                username: u.username,
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                isAdmin: u.isAdmin,
                createdAt: u.createdAt,
                subscriptionTier: u.subscriptionTier,
            }));

            res.json(safeUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ message: "Failed to fetch users" });
        }
    });

    // Ban User
    router.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
        try {
            const userId = req.params.id;
            if (userId === req.user?.id) {
                return res.status(400).json({ message: "Cannot ban yourself" });
            }
            await storage.deleteUser(userId);
            res.json({ success: true, message: "User deleted" });
        } catch (error) {
            console.error("Error banning user:", error);
            res.status(500).json({ message: "Failed to ban user" });
        }
    });

    // --- MOTHERSHIP DASHBOARD (Global Ecosystem View) ---
    router.get("/api/mothership/instances", requireAdmin, async (req, res) => {
        try {
            const heartbeats = await db.select().from(instanceHeartbeats).orderBy(desc(instanceHeartbeats.receivedAt)).limit(50);
            res.json(heartbeats);
        } catch (error) {
            console.error("Error fetching instances:", error);
            res.status(500).json({ message: "Failed to fetch instances" });
        }
    });
}
