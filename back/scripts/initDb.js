// Usage: node scripts/initDb.js   (creates all tables using the DB_* values in .env)
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    const ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST, port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER, password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME, ssl, multipleStatements: true,
    });
    try {
        await conn.query(fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8'));
        console.log('Schema created.');
    } catch (e) { console.error('Failed:', e.message); process.exitCode = 1; }
    finally { await conn.end(); }
})();
