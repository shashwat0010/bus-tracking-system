import { BusLocation } from '../shared/types';
import { producer } from '../config/kafka';

interface RouteData {
    id: string;
    name: string;
    path: {
        type: string;
        coordinates: number[][];
    };
    color?: string;
}

// Helper to calculate distance between two coordinates in km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Simple bus class to hold state
class Bus {
    id: string;
    routeId: string;
    path: number[][]; // [lon, lat]
    currentSegmentIndex: number;
    segmentProgress: number; // 0 to 1
    speed: number;
    targetSpeed: number;
    passengers: number;
    reverse: boolean;
    lastUpdate: number;

    constructor(id: string, route: RouteData) {
        this.id = id;
        this.routeId = route.id;
        this.path = route.path.coordinates;
        this.currentSegmentIndex = 0;
        this.segmentProgress = 0;
        this.speed = 30 + Math.random() * 20; // 30-50 km/h
        this.targetSpeed = this.speed;
        this.passengers = Math.floor(Math.random() * 30);
        this.reverse = false;
        this.lastUpdate = Date.now();
    }

    move() {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 1000; // seconds
        this.lastUpdate = now;

        // Fluctuating speed
        if (Math.random() < 0.05) {
            this.targetSpeed = 20 + Math.random() * 40; // 20-60 km/h
        }
        // Smooth speed change
        this.speed += (this.targetSpeed - this.speed) * 0.1;

        const distanceToMove = (this.speed / 3600) * deltaTime; // km to move in this step

        let remainingDistance = distanceToMove;

        while (remainingDistance > 0) {
            const currentPoint = this.path[this.currentSegmentIndex];
            const nextPoint = this.path[this.reverse ? this.currentSegmentIndex - 1 : this.currentSegmentIndex + 1];

            if (!nextPoint) {
                this.reverse = !this.reverse;
                // Simulate passenger stop change at end of route
                this.simulatePassengerChange();
                continue;
            }

            const segmentDist = getDistance(currentPoint[1], currentPoint[0], nextPoint[1], nextPoint[0]);
            const distanceRemainingInSegment = segmentDist * (1 - this.segmentProgress);

            if (remainingDistance < distanceRemainingInSegment) {
                this.segmentProgress += remainingDistance / segmentDist;
                remainingDistance = 0;
            } else {
                remainingDistance -= distanceRemainingInSegment;
                this.segmentProgress = 0;
                this.currentSegmentIndex = this.reverse ? this.currentSegmentIndex - 1 : this.currentSegmentIndex + 1;

                // Simulate passenger changes at segments (acting as virtual stops)
                if (Math.random() < 0.2) {
                    this.simulatePassengerChange();
                }

                if (this.currentSegmentIndex <= 0 || this.currentSegmentIndex >= this.path.length - 1) {
                    this.reverse = !this.reverse;
                    this.simulatePassengerChange();
                }
            }
        }
    }

    simulatePassengerChange() {
        // Randomly add or remove 1-5 passengers
        const change = Math.floor(Math.random() * 11) - 5; // -5 to 5
        this.passengers = Math.max(0, Math.min(60, this.passengers + change));
    }

    getCurrentLocation(): BusLocation {
        const p1 = this.path[this.currentSegmentIndex];
        const nextIdx = this.reverse ? this.currentSegmentIndex - 1 : this.currentSegmentIndex + 1;
        const p2 = this.path[nextIdx] || p1;

        // Interpolate
        const lon = p1[0] + (p2[0] - p1[0]) * this.segmentProgress;
        const lat = p1[1] + (p2[1] - p1[1]) * this.segmentProgress;

        return {
            busId: this.id,
            routeId: this.routeId,
            latitude: lat,
            longitude: lon,
            speed: this.speed,
            passengers: this.passengers,
            timestamp: Date.now()
        };
    }
}

export class Simulator {
    buses: Bus[] = [];

    constructor(routes: RouteData[]) {
        // initialize buses
        routes.forEach(route => {
            // Create 10 buses per route (Total 30)
            for (let i = 0; i < 10; i++) {
                const bus = new Bus(`bus-${route.id.slice(0, 4)}-${i}`, route);
                // Stagger start positions
                bus.currentSegmentIndex = Math.floor(Math.random() * (route.path.coordinates.length - 1));
                bus.segmentProgress = Math.random();
                this.buses.push(bus);
            }
        });
    }

    start() {
        console.log(`Starting simulator with ${this.buses.length} buses`);
        setInterval(async () => {
            for (const bus of this.buses) {
                bus.move();
                const update = bus.getCurrentLocation();

                try {
                    await producer.send({
                        topic: 'bus-updates',
                        messages: [
                            { value: JSON.stringify(update) }
                        ]
                    });
                } catch (err) {
                    console.error('Error sending Kafka message', err);
                }
            }
        }, 1000); // 1 update per second
    }
}

