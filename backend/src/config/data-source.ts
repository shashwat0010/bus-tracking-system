import { DataSource } from 'typeorm';
import { Route } from '../entities/Route';
import { Stop } from '../entities/Stop';
import { Trip } from '../entities/Trip';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'bustracker',
    synchronize: true, // Use migrations in production
    logging: false,
    entities: [Route, Stop, Trip],
    subscribers: [],
    migrations: [],
});
