import { connectKafka } from '../config/kafka';
import { Simulator } from './Simulator';

// Hardcoded routes matching the database seed data
const HARDCODED_ROUTES = [
    {
        id: '1',
        name: 'Majestic - Indiranagar',
        path: {
            type: 'LineString',
            coordinates: [
                [77.5702, 12.9779],
                [77.5843, 12.9754],
                [77.6078, 12.9744],
                [77.6186, 12.9740],
                [77.6408, 12.9784]
            ]
        },
        color: '#FF0000'
    },
    {
        id: '2',
        name: 'Majestic - Silk Board',
        path: {
            type: 'LineString',
            coordinates: [
                [77.5702, 12.9779],
                [77.5794, 12.9642],
                [77.5954, 12.9647],
                [77.6071, 12.9431],
                [77.6322, 12.9255],
                [77.6233, 12.9175]
            ]
        },
        color: '#0000FF'
    },
    {
        id: '3',
        name: 'ORR - Marathahalli to Hebbal',
        path: {
            type: 'LineString',
            coordinates: [
                [77.7044, 12.9520],
                [77.6830, 12.9912],
                [77.6715, 13.0112],
                [77.6200, 13.0450],
                [77.5900, 13.0350]
            ]
        },
        color: '#00FF00'
    }
];

const startSimulator = async () => {
    try {
        console.log('🚌 Starting GPS Simulator...');
        await connectKafka();
        console.log('✅ Kafka connected');

        const routes = HARDCODED_ROUTES;
        console.log(`✅ Loaded ${routes.length} routes (hardcoded)`);

        const simulator = new Simulator(routes);
        simulator.start();
    } catch (error) {
        console.error('❌ Simulator failed to start:', error);
        process.exit(1);
    }
};

startSimulator();
