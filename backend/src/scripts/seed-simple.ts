import pg from 'pg';
const { Client } = pg;

const seed = async () => {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'admin',
        database: 'postgres',
    });

    try {
        await client.connect();
        console.log('Connected to Postgres');

        // Switch to bustracker database
        await client.end();

        const busClient = new Client({
            host: 'localhost',
            port: 5432,
            user: 'admin',
            database: 'bustracker',
        });

        await busClient.connect();
        console.log('Connected to bustracker database');

        // Enable PostGIS
        await busClient.query('CREATE EXTENSION IF NOT EXISTS postgis;');

        // Create Routes table
        await busClient.query(`
      DROP TABLE IF EXISTS trips CASCADE;
      DROP TABLE IF EXISTS stops CASCADE;
      DROP TABLE IF EXISTS routes CASCADE;
      
      CREATE TABLE routes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        color VARCHAR(7) DEFAULT '#000000',
        path GEOMETRY(LineString, 4326),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

        // Create Stops table
        await busClient.query(`
      CREATE TABLE stops (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        location GEOMETRY(Point, 4326) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

        // Create Trips table
        await busClient.query(`
      CREATE TABLE trips (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "routeId" UUID REFERENCES routes(id),
        "busId" VARCHAR(255) NOT NULL,
        "startTime" TIMESTAMP,
        "endTime" TIMESTAMP,
        status VARCHAR(50) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

        console.log('Tables created');

        // Insert Route 1
        await busClient.query(`
      INSERT INTO routes (name, description, color, path) 
      VALUES (
        'Market Street Line',
        'Ferry Building to Castro',
        '#FF0000',
        ST_GeomFromText('LINESTRING(-122.3954 37.7955, -122.3996 37.7930, -122.4087 37.7846, -122.4172 37.7770, -122.4278 37.7686, -122.4357 37.7628)', 4326)
      );
    `);

        // Insert Route 2
        await busClient.query(`
      INSERT INTO routes (name, description, color, path) 
      VALUES (
        'Mission Street Line',
        'Transbay to 24th Mission',
        '#0000FF',
        ST_GeomFromText('LINESTRING(-122.3963 37.7895, -122.4024 37.7850, -122.4190 37.7650, -122.4185 37.7523)', 4326)
      );
    `);

        // Insert Stops
        await busClient.query(`
      INSERT INTO stops (name, location) VALUES
      ('Ferry Building', ST_GeomFromText('POINT(-122.3954 37.7955)', 4326)),
      ('Civic Center', ST_GeomFromText('POINT(-122.4172 37.7770)', 4326)),
      ('Castro District', ST_GeomFromText('POINT(-122.4357 37.7628)', 4326));
    `);

        console.log('✅ Seeding completed successfully!');
        await busClient.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seed();
