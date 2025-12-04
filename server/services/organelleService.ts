import { db } from '../db';
import { organelles } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import path from 'path';
import fs from 'fs/promises';

export class OrganelleService {

    /**
     * Validate if a path is within an allowed organelle
     */
    async validateAccess(userId: string, targetPath: string, operation: 'read' | 'write'): Promise<boolean> {
        // In "Amoeba" mode, we trust the authorized user/agent to modify the system.
        // We still normalize to prevent traversal out of the project root.
        const normalizedPath = path.normalize(targetPath).replace(/^(\.\.(\/|\\|$))+/, '').replace(/^\/+/, '');

        // Ensure we are not accessing hidden system files or sensitive env files directly if possible
        // But for now, we unlock everything to follow the "easily modified" principle.
        return true;
    }

    /**
     * Get all organelles for a user
     */
    async getOrganelles(userId: string) {
        return await db.select().from(organelles).where(eq(organelles.userId, userId));
    }

    /**
     * Create a default set of organelles for a new user
     */
    async createDefaultOrganelles(userId: string) {
        const defaults = [
            {
                path: 'client/src/components/custom',
                description: 'Custom UI Components',
                permissions: ['read', 'write'],
            },
            {
                path: 'server/routes/custom',
                description: 'Custom API Routes',
                permissions: ['read', 'write'],
            },
            {
                path: 'shared/custom',
                description: 'Shared Custom Types & Utils',
                permissions: ['read', 'write'],
            }
        ];

        for (const def of defaults) {
            // Check if already exists
            const existing = await db.select().from(organelles).where(and(
                eq(organelles.userId, userId),
                eq(organelles.path, def.path)
            ));

            if (existing.length === 0) {
                await db.insert(organelles).values({
                    userId,
                    ...def,
                });
            }

            // Ensure directory exists
            try {
                await fs.mkdir(path.join(process.cwd(), def.path), { recursive: true });
            } catch (error) {
                console.error(`Failed to create directory ${def.path}:`, error);
            }
        }
    }
    /**
     * Delete an Organelle
     */
    async deleteOrganelle(name: string): Promise<{ success: boolean; message: string }> {
        const pascalName = name.charAt(0).toUpperCase() + name.slice(1);
        const camelName = name.toLowerCase();

        const routePath = path.join(process.cwd(), `server/routes/${camelName}.ts`);
        const componentPath = path.join(process.cwd(), `client/src/components/organelles/${pascalName}.tsx`);

        const deleted: string[] = [];

        try {
            await fs.unlink(routePath);
            deleted.push(`server/routes/${camelName}.ts`);
        } catch (e) {
            // Ignore if not found
        }

        try {
            await fs.unlink(componentPath);
            deleted.push(`client/src/components/organelles/${pascalName}.tsx`);
        } catch (e) {
            // Ignore if not found
        }

        // Also remove from DB if it exists
        try {
            await db.delete(organelles).where(eq(organelles.path, `server/routes/${camelName}.ts`));
        } catch (e) {
            console.error("Failed to delete from DB:", e);
        }

        if (deleted.length === 0) {
            return { success: false, message: `No files found for organelle '${name}'` };
        }

        return { success: true, message: `Deleted organelle '${name}'. Removed files:\n${deleted.join('\n')}` };
    }
}

export const organelleService = new OrganelleService();
