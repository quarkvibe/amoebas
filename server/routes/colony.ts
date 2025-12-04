import { Router } from 'express';
import { colonyService } from '../services/colonyService';

const router = Router();

// Get all instances
router.get('/instances', async (req, res) => {
    try {
        const instances = await colonyService.getInstances();
        res.json(instances);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get available species (branches)
router.get('/species', async (req, res) => {
    try {
        const species = await colonyService.getSpecies();
        res.json(species);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Spawn new instance
router.post('/spawn', async (req, res) => {
    try {
        const { species, name } = req.body;
        if (!species || !name) {
            return res.status(400).json({ error: 'Species and Name are required' });
        }

        const instance = await colonyService.spawnInstance(species, name);
        res.json(instance);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Kill instance
router.post('/kill', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        await colonyService.killInstance(name);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
