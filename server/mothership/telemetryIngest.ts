import { db } from "../db";
import { instanceHeartbeats } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface HeartbeatPayload {
    instanceId: string;
    licenseKey?: string;
    ipAddress?: string;
    version?: string;
    userCount?: number;
    activeUserCount?: number;
    licenseStats?: any;
    systemStats?: any;
}

export class TelemetryIngestService {
    async processHeartbeat(payload: HeartbeatPayload) {
        try {
            console.log(`[Mothership] Received heartbeat from ${payload.instanceId}`);

            // Store the heartbeat
            await db.insert(instanceHeartbeats).values({
                instanceId: payload.instanceId,
                licenseKey: payload.licenseKey,
                ipAddress: payload.ipAddress,
                version: payload.version,
                userCount: payload.userCount,
                activeUserCount: payload.activeUserCount,
                licenseStats: payload.licenseStats,
                systemStats: payload.systemStats,
            });

            return { success: true };
        } catch (error) {
            console.error("[Mothership] Error processing heartbeat:", error);
            throw error;
        }
    }
}

export const telemetryIngestService = new TelemetryIngestService();
