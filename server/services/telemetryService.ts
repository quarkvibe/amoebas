import { storage } from '../storage';
import { licenseService } from './licenseService';

export class TelemetryService {
    private readonly HEARTBEAT_URL = 'https://api.quarkvibe.com/telemetry/heartbeat'; // Placeholder
    private readonly INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

    constructor() {
        // Start heartbeat loop
        setInterval(() => this.sendHeartbeat(), this.INTERVAL_MS);
    }

    /**
     * Send a heartbeat to the central server
     */
    async sendHeartbeat() {
        try {
            const userCount = await storage.getUserCount();
            const licenseStats = await licenseService.getLicenseStats();

            // Get the active license for the first admin user (heuristic)
            // In a real multi-tenant system, we'd iterate all licenses
            // For now, we just report aggregate stats

            const payload = {
                timestamp: new Date().toISOString(),
                version: '2.0.0', // TODO: Get from package.json
                metrics: {
                    users: userCount,
                    licenses: licenseStats,
                },
                // We would also send the Instance ID here if we had one globally defined
            };

            console.log('💓 Sending Telemetry Heartbeat:', JSON.stringify(payload, null, 2));

            // Mock sending to external API
            // await fetch(this.HEARTBEAT_URL, {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(payload),
            // });

        } catch (error) {
            console.error('Failed to send telemetry heartbeat:', error);
        }
    }
}

export const telemetryService = new TelemetryService();
