// config/database.js
import dotenv from 'dotenv';

dotenv.config();

// Check if we should use PostgreSQL or in-memory DB
let db;

if (process.env.USE_POSTGRES === 'true') {
    // Use PostgreSQL
    try {
        const pkg = await import('pg');
        const { Pool } = pkg;
        
        const pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'careerlaunch',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
        });
        
        db = {
            query: (text, params) => pool.query(text, params),
            pool
        };
        console.log('Using PostgreSQL database');
    } catch (error) {
        console.log('PostgreSQL not available, falling back to in-memory database');
        const memoryDb = await import('./memoryDb.js');
        db = memoryDb.default;
    }
} else {
    // Use in-memory database for development
    const memoryDb = await import('./memoryDb.js');
    db = memoryDb.default;
    console.log('Using in-memory database (no PostgreSQL required)');
}

export default db;