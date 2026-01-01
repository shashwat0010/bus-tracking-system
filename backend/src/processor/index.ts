import { connectKafka } from '../config/kafka';
import { startConsumer } from './consumer';

const startProcessor = async () => {
    console.log('Starting Processor...');
    // Ensure Kafka is ready (connectKafka handles initial connection for producer/consumer shared utils)
    // startConsumer calls consumer.connect internaly but good to be explicit
    await startConsumer();
    console.log('Processor started');
};

startProcessor();
