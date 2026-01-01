import { Kafka } from 'kafkajs';

const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';

export const kafka = new Kafka({
    clientId: 'bus-tracker-service',
    brokers: [KAFKA_BROKER],
    retry: {
        initialRetryTime: 300,
        retries: 5
    }
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'bus-tracker-group' });

export const connectKafka = async () => {
    try {
        await producer.connect();
        await consumer.connect();
        console.log('Connected to Kafka');
    } catch (error) {
        console.error('Error connecting to Kafka:', error);
    }
};
