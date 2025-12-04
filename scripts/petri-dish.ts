import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { program } from 'commander';

// Configuration
const COLONY_DIR = path.join(process.cwd(), 'colony');
const INSTANCES_DIR = path.join(COLONY_DIR, 'instances');
const REGISTRY_FILE = path.join(COLONY_DIR, 'registry.json');
const BASE_PORT = 3001;

// Ensure directories exist
if (!fs.existsSync(COLONY_DIR)) fs.mkdirSync(COLONY_DIR);
if (!fs.existsSync(INSTANCES_DIR)) fs.mkdirSync(INSTANCES_DIR);
if (!fs.existsSync(REGISTRY_FILE)) fs.writeFileSync(REGISTRY_FILE, JSON.stringify({ instances: [] }, null, 2));

interface Instance {
    name: string;
    branch: string;
    port: number;
    path: string;
    created: string;
    status: 'running' | 'stopped' | 'error';
    pid?: number;
}

// Helper: Load Registry
function loadRegistry(): { instances: Instance[] } {
    return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
}

// Helper: Save Registry
function saveRegistry(registry: { instances: Instance[] }) {
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

// Helper: Get Next Port
function getNextPort(): number {
    const registry = loadRegistry();
    const usedPorts = registry.instances.map(i => i.port);
    let port = BASE_PORT;
    while (usedPorts.includes(port)) {
        port++;
    }
    return port;
}

// Command: List Species (Branches)
program
    .command('list-species')
    .description('List available Amoeba species (Git Branches)')
    .action(() => {
        console.log('🧬 Analyzing available species...');
        try {
            const branches = execSync('git branch -r').toString().split('\n');
            console.log('\nAvailable Species:');
            branches.forEach(b => {
                const name = b.trim().replace('origin/', '');
                if (name && !name.includes('HEAD')) {
                    console.log(`  - ${name}`);
                }
            });
        } catch (e) {
            console.error('Failed to fetch branches:', e);
        }
    });

// Command: Spawn Organism
program
    .command('spawn <species> <name>')
    .description('Spawn a new organism from a species (branch)')
    .action(async (species, name) => {
        console.log(`🧫 Spawning new organism: ${name} (Species: ${species})...`);

        const instancePath = path.join(INSTANCES_DIR, name);
        if (fs.existsSync(instancePath)) {
            console.error(`❌ Error: Organism '${name}' already exists.`);
            return;
        }

        const port = getNextPort();
        const registry = loadRegistry();

        try {
            // 1. Clone
            console.log('  ↳ Cloning DNA...');
            execSync(`git clone -b ${species} . ${instancePath}`, { stdio: 'inherit' });

            // 2. Install Dependencies
            console.log('  ↳ Feeding nutrients (npm install)...');
            execSync('npm install', { cwd: instancePath, stdio: 'ignore' });

            // 3. Configure Environment
            console.log(`  ↳ Configuring environment (Port: ${port})...`);
            const envContent = `PORT=${port}\nNODE_ENV=production\nDATABASE_URL=file:./amoeba.db`;
            fs.writeFileSync(path.join(instancePath, '.env'), envContent);

            // 4. Build
            console.log('  ↳ Gestating (Build)...');
            execSync('npm run build', { cwd: instancePath, stdio: 'ignore' });

            // 5. Start with PM2
            console.log('  ↳ Awakening...');
            // We use local PM2 from the main project to manage the child
            const pm2Path = path.join(process.cwd(), 'node_modules', '.bin', 'pm2');
            execSync(`${pm2Path} start npm --name "${name}" -- run start`, { cwd: instancePath, stdio: 'inherit' });

            // 6. Register
            registry.instances.push({
                name,
                branch: species,
                port,
                path: instancePath,
                created: new Date().toISOString(),
                status: 'running'
            });
            saveRegistry(registry);

            console.log(`\n✨ It's alive!`);
            console.log(`   Name: ${name}`);
            console.log(`   Species: ${species}`);
            console.log(`   Port: ${port}`);
            console.log(`   Path: ${instancePath}`);

        } catch (e: any) {
            console.error('❌ Failed to spawn organism:', e.message);
            // Cleanup
            if (fs.existsSync(instancePath)) {
                fs.rmSync(instancePath, { recursive: true, force: true });
            }
        }
    });

// Command: Status
program
    .command('status')
    .description('Check the status of the colony')
    .action(() => {
        const registry = loadRegistry();
        console.log(`\n🧫 Colony Status (${registry.instances.length} organisms):`);

        if (registry.instances.length === 0) {
            console.log('   The petri dish is empty.');
            return;
        }

        console.table(registry.instances.map(i => ({
            Name: i.name,
            Species: i.branch,
            Port: i.port,
            Status: i.status,
            Age: new Date(i.created).toLocaleString()
        })));

        // Show PM2 status
        console.log('\nProcess Manager Status:');
        const pm2Path = path.join(process.cwd(), 'node_modules', '.bin', 'pm2');
        try {
            execSync(`${pm2Path} list`, { stdio: 'inherit' });
        } catch (e) {
            console.log('Could not fetch PM2 status.');
        }
    });

// Command: Kill
program
    .command('kill <name>')
    .description('Terminate an organism')
    .action((name) => {
        const registry = loadRegistry();
        const instanceIndex = registry.instances.findIndex(i => i.name === name);

        if (instanceIndex === -1) {
            console.error(`❌ Organism '${name}' not found.`);
            return;
        }

        console.log(`💀 Terminating ${name}...`);
        const pm2Path = path.join(process.cwd(), 'node_modules', '.bin', 'pm2');

        try {
            execSync(`${pm2Path} delete "${name}"`, { stdio: 'ignore' });
        } catch (e) {
            console.warn('   (Process was not running)');
        }

        // Optional: Delete files? For now, keep them (cryostasis)
        // fs.rmSync(registry.instances[instanceIndex].path, { recursive: true, force: true });

        registry.instances.splice(instanceIndex, 1);
        saveRegistry(registry);
        console.log('   Terminated.');
    });

program.parse(process.argv);
