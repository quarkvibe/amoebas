import fs from 'fs';
import path from 'path';
import { exec, execSync } from 'child_process';
import { activityMonitor } from './activityMonitor';

// Configuration
const COLONY_DIR = path.join(process.cwd(), 'colony');
const INSTANCES_DIR = path.join(COLONY_DIR, 'instances');
const REGISTRY_FILE = path.join(COLONY_DIR, 'registry.json');
const BASE_PORT = 3001;

// Ensure directories exist
if (!fs.existsSync(COLONY_DIR)) fs.mkdirSync(COLONY_DIR);
if (!fs.existsSync(INSTANCES_DIR)) fs.mkdirSync(INSTANCES_DIR);
if (!fs.existsSync(REGISTRY_FILE)) fs.writeFileSync(REGISTRY_FILE, JSON.stringify({ instances: [] }, null, 2));

export interface Instance {
    name: string;
    branch: string;
    port: number;
    path: string;
    created: string;
    status: 'running' | 'stopped' | 'error' | 'spawning';
    url?: string;
}

class ColonyService {

    constructor() {
        // Ensure registry exists
        this.loadRegistry();
    }

    private loadRegistry(): { instances: Instance[] } {
        try {
            return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
        } catch (e) {
            return { instances: [] };
        }
    }

    private saveRegistry(registry: { instances: Instance[] }) {
        fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
    }

    private getNextPort(): number {
        const registry = this.loadRegistry();
        const usedPorts = registry.instances.map(i => i.port);
        let port = BASE_PORT;
        while (usedPorts.includes(port)) {
            port++;
        }
        return port;
    }

    async getInstances(): Promise<Instance[]> {
        const registry = this.loadRegistry();
        // Enrich with URL
        return registry.instances.map(i => ({
            ...i,
            url: `http://localhost:${i.port}`
        }));
    }

    async getSpecies(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            exec('git branch -r', (error, stdout) => {
                if (error) {
                    resolve([]); // Return empty if git fails
                    return;
                }
                const branches = stdout.split('\n')
                    .map(b => b.trim().replace('origin/', ''))
                    .filter(b => b && !b.includes('HEAD'));
                resolve(branches);
            });
        });
    }

    async spawnInstance(species: string, name: string): Promise<Instance> {
        const registry = this.loadRegistry();

        if (registry.instances.find(i => i.name === name)) {
            throw new Error(`Organism '${name}' already exists.`);
        }

        const port = this.getNextPort();
        const instancePath = path.join(INSTANCES_DIR, name);

        // Register as spawning
        const newInstance: Instance = {
            name,
            branch: species,
            port,
            path: instancePath,
            created: new Date().toISOString(),
            status: 'spawning'
        };
        registry.instances.push(newInstance);
        this.saveRegistry(registry);

        activityMonitor.logActivity('info', `🧫 Spawning ${name} (${species}) on port ${port}...`);

        // Start async spawning process
        this.runSpawnProcess(species, name, port, instancePath);

        return newInstance;
    }

    private async runSpawnProcess(species: string, name: string, port: number, instancePath: string) {
        try {
            // 1. Clone
            activityMonitor.logActivity('info', `[${name}] Cloning DNA...`);
            execSync(`git clone -b ${species} . ${instancePath}`);

            // 2. Install
            activityMonitor.logActivity('info', `[${name}] Installing dependencies...`);
            execSync('npm install', { cwd: instancePath });

            // 3. Configure
            activityMonitor.logActivity('info', `[${name}] Configuring environment...`);
            const envContent = `PORT=${port}\nNODE_ENV=production\nDATABASE_URL=file:./amoeba.db`;
            fs.writeFileSync(path.join(instancePath, '.env'), envContent);

            // 4. Build
            activityMonitor.logActivity('info', `[${name}] Building...`);
            execSync('npm run build', { cwd: instancePath });

            // 5. Start
            activityMonitor.logActivity('info', `[${name}] Awakening...`);
            const pm2Path = path.join(process.cwd(), 'node_modules', '.bin', 'pm2');
            execSync(`${pm2Path} start npm --name "${name}" -- run start`, { cwd: instancePath });

            // Update status
            const registry = this.loadRegistry();
            const instance = registry.instances.find(i => i.name === name);
            if (instance) {
                instance.status = 'running';
                this.saveRegistry(registry);
            }

            activityMonitor.logActivity('success', `✨ ${name} is alive at http://localhost:${port}`);

        } catch (error: any) {
            activityMonitor.logError(error, `Spawn failed for ${name}`);

            // Update status to error
            const registry = this.loadRegistry();
            const instance = registry.instances.find(i => i.name === name);
            if (instance) {
                instance.status = 'error';
                this.saveRegistry(registry);
            }
        }
    }

    async killInstance(name: string): Promise<void> {
        const registry = this.loadRegistry();
        const index = registry.instances.findIndex(i => i.name === name);

        if (index === -1) throw new Error('Instance not found');

        activityMonitor.logActivity('warning', `💀 Terminating ${name}...`);

        const pm2Path = path.join(process.cwd(), 'node_modules', '.bin', 'pm2');
        try {
            execSync(`${pm2Path} delete "${name}"`);
        } catch (e) {
            // Ignore if not running
        }

        // Remove from registry
        registry.instances.splice(index, 1);
        this.saveRegistry(registry);

        // Optional: Delete files
        // fs.rmSync(registry.instances[index].path, { recursive: true, force: true });
    }
}

export const colonyService = new ColonyService();
