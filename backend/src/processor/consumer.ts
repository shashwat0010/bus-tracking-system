import { consumer } from '../config/kafka';
import { redis, pubApi } from '../config/redis';
import { BusLocation } from '../shared/types';

export const startConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'bus-updates', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            if (!message.value) return;

            try {
                const data: BusLocation = JSON.parse(message.value.toString());
                const { busId, latitude, longitude, speed } = data;

                // 1. Store latest location
                await redis.set(`bus:${busId}:location`, JSON.stringify(data));

                // 2. Geo-spatial storage for radius queries
                await redis.geoadd('bus_positions', longitude, latitude, busId);

                // 3. Grid-based Heatmap (Simple Geohash-like approximation)
                // Round to 3 decimal places (~100m)
                const latGrid = Math.floor(latitude * 1000);
                const lonGrid = Math.floor(longitude * 1000);
                const gridKey = `heatmap:${latGrid}:${lonGrid}`;

                // Increment density, expire after 5 minutes
                await redis.incr(gridKey);
                await redis.expire(gridKey, 300);

                // 4. Publish to API for real-time WebSocket
                await pubApi.publish('bus-events', JSON.stringify(data));

                // console.log(`Processed update for ${busId}`);
            } catch (err) {
                console.error('Error processing message:', err);
            }
        },
    });
};
