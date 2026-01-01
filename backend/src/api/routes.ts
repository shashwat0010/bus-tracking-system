import { Router } from 'express';
import { AppDataSource } from '../config/data-source';
import { Route } from '../entities/Route';
import { Stop } from '../entities/Stop';

const router = Router();

router.get('/routes', async (req, res) => {
    try {
        const routeRepo = AppDataSource.getRepository(Route);
        const routes = await routeRepo.find();
        res.json(routes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch routes' });
    }
});

router.get('/stops', async (req, res) => {
    try {
        const stopRepo = AppDataSource.getRepository(Stop);
        const stops = await stopRepo.find();
        res.json(stops);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stops' });
    }
});

export default router;
