const mysql = require('mysql2/promise');
require('dotenv').config();

// Aiven (and most managed MySQL) requires TLS. Enable with DB_SSL=true.
// Optionally paste Aiven's CA certificate into DB_SSL_CA to verify the server.
let ssl;
if (process.env.DB_SSL === 'true') {
    ssl = process.env.DB_SSL_CA
        ? { ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n'), rejectUnauthorized: true }
        : { rejectUnauthorized: false };
}

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'print_shop_db',
    ssl,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
