import 'reflect-metadata';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Hardcoded routes as fallback (matches seeded data)
const FALLBACK_ROUTES = [
    {
        id: '1',
        name: 'Majestic - Indiranagar',
        description: 'Majestic to Indiranagar via MG Road',
        color: '#FF0000',
        path: {
            type: 'LineString',
            coordinates: [
                [77.5702, 12.9779],
                [77.5843, 12.9754],
                [77.6078, 12.9744],
                [77.6186, 12.9740],
                [77.6408, 12.9784]
            ]
        }
    },
    {
        id: '2',
        name: 'Majestic - Silk Board',
        description: 'Majestic to Silk Board via Richmond Road',
        color: '#0000FF',
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
        }
    },
    {
        id: '3',
        name: 'ORR - Marathahalli to Hebbal',
        description: 'Outer Ring Road North-East corridor',
        color: '#00FF00',
        path: {
            type: 'LineString',
            coordinates: [
                [77.7044, 12.9520],
                [77.6830, 12.9912],
                [77.6715, 13.0112],
                [77.6200, 13.0450],
                [77.5900, 13.0350]
            ]
        }
    }
];

const FALLBACK_STOPS = [
    {
        id: '1',
        name: 'Majestic (KSR Station)',
        location: {
            type: 'Point',
            coordinates: [77.5702, 12.9779]
        }
    },
    {
        id: '2',
        name: 'MG Road Metro',
        location: {
            type: 'Point',
            coordinates: [77.6078, 12.9744]
        }
    },
    {
        id: '3',
        name: 'Indiranagar',
        location: {
            type: 'Point',
            coordinates: [77.6408, 12.9784]
        }
    }
];

import { subApi } from './config/redis';
import { connectKafka } from './config/kafka';

// Connect Kafka
connectKafka().catch(err => console.error('Kafka connection error:', err));

console.log('✅ Using fallback route data (database connection not required)');

// API Routes
app.get('/health', (req, res) => {
    res.send('Bus Tracker API is running');
});

app.get('/api/routes', (req, res) => {
    res.json(FALLBACK_ROUTES);
});

app.get('/api/stops', (req, res) => {
    res.json(FALLBACK_STOPS);
});

// Socket.IO
io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Subscribe to Redis bus-events and forward to Socket.IO
subApi.subscribe('bus-events', (err, count) => {
    if (err) {
        console.error('Failed to subscribe to bus-events', err);
    } else {
        console.log(`✅ Subscribed to bus-events. Count: ${count}`);
    }
});

subApi.on('message', (channel, message) => {
    if (channel === 'bus-events') {
        const data = JSON.parse(message);
        io.emit('busUpdate', data);
    }
});

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 WebSocket server ready`);
    console.log(`🗺️  API endpoints: /api/routes, /api/stops`);
});
