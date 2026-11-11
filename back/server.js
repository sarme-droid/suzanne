const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Restrict CORS to your frontend in production (comma-separated list in CORS_ORIGIN)
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined));
app.use(express.json());

// Test connection on startup and log the database name
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log(`Connected to MySQL database: ${process.env.DB_NAME}`);
        connection.release();
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
})();

// Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

// Base Route Test
app.get('/', (req, res) => {
    res.json({ message: 'Print Shop API is running successfully!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});