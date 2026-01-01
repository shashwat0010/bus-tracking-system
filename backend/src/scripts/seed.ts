import 'dotenv/config';
import { AppDataSource } from '../config/data-source';
import { Route } from '../entities/Route';
import { Stop } from '../entities/Stop';

const seed = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected for seeding');

        // Clear existing data
        await AppDataSource.getRepository(Stop).delete({});
        await AppDataSource.getRepository(Route).delete({});

        // Route 1: Majestic - Indiranagar
        const route1Path = {
            type: 'LineString',
            coordinates: [
                [77.5702, 12.9779],
                [77.5843, 12.9754],
                [77.6078, 12.9744],
                [77.6186, 12.9740],
                [77.6408, 12.9784]
            ]
        };

        const route1 = new Route();
        route1.name = 'Majestic - Indiranagar';
        route1.description = 'Central Majestic to Indiranagar via MG Road';
        route1.color = '#FF0000';
        route1.path = route1Path;
        await AppDataSource.manager.save(route1);

        // Stops for Route 1
        const stop1 = new Stop();
        stop1.name = 'Majestic Station';
        stop1.location = { type: 'Point', coordinates: [77.5702, 12.9779] };
        await AppDataSource.manager.save(stop1);

        const stop2 = new Stop();
        stop2.name = 'MG Road';
        stop2.location = { type: 'Point', coordinates: [77.6078, 12.9744] };
        await AppDataSource.manager.save(stop2);

        const stop3 = new Stop();
        stop3.name = 'Indiranagar';
        stop3.location = { type: 'Point', coordinates: [77.6408, 12.9784] };
        await AppDataSource.manager.save(stop3);

        // Route 2: Majestic - Silk Board
        const route2Path = {
            type: 'LineString',
            coordinates: [
                [77.5702, 12.9779],
                [77.5794, 12.9642],
                [77.5954, 12.9647],
                [77.6071, 12.9431],
                [77.6322, 12.9255],
                [77.6233, 12.9175]
            ]
        };

        const route2 = new Route();
        route2.name = 'Majestic - Silk Board';
        route2.description = 'Central Majestic to Silk Board Junc';
        route2.color = '#0000FF';
        route2.path = route2Path;
        await AppDataSource.manager.save(route2);

        const stop4 = new Stop();
        stop4.name = 'Silk Board';
        stop4.location = { type: 'Point', coordinates: [77.6233, 12.9175] };
        await AppDataSource.manager.save(stop4);

        console.log('Seeding completed for Bengaluru data');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
