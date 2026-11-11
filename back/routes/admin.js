const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

// Everything in this file requires a valid token AND the admin role
router.use(requireAuth, requireRole('admin'));

// All products, including inactive ones (cashier view only sees active products)
router.get('/products', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            ORDER BY p.product_id DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ error: 'Internal server error while fetching products' });
    }
});

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Create a new product
router.post('/products', async (req, res) => {
    const { name, base_price, category_id, is_active } = req.body;
    if (!name || base_price === undefined) {
        return res.status(400).json({ error: 'name and base_price are required' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO products (name, slug, base_price, category_id, is_active) VALUES (?, ?, ?, ?, ?)',
            [name, slugify(name), base_price, category_id || null, is_active === undefined ? true : is_active]
        );
        res.status(201).json({ product_id: result.insertId });
    } catch (err) {
        console.error('Database Error:', err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'A product with a similar name already exists (slug conflict)' });
        }
        res.status(500).json({ error: 'Internal server error while creating product' });
    }
});

// Update a product (name, price, category, active status)
router.put('/products/:id', async (req, res) => {
    const { name, base_price, category_id, is_active } = req.body;
    try {
        await db.query(
            'UPDATE products SET name = ?, slug = ?, base_price = ?, category_id = ?, is_active = ? WHERE product_id = ?',
            [name, slugify(name), base_price, category_id || null, is_active, req.params.id]
        );
        res.json({ ok: true });
    } catch (err) {
        console.error('Database Error:', err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'A product with a similar name already exists (slug conflict)' });
        }
        res.status(500).json({ error: 'Internal server error while updating product' });
    }
});

// Delete a product outright
router.delete('/products/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE product_id = ?', [req.params.id]);
        res.json({ ok: true });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ error: 'Internal server error while deleting product' });
    }
});

// --- Categories ---

router.get('/categories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY name');
        res.json(rows);
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ error: 'Internal server error while fetching categories' });
    }
});

router.post('/categories', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    try {
        const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
        res.status(201).json({ category_id: result.insertId });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ error: 'Internal server error while creating category' });
    }
});

// Recent activity across the system (logins, orders, etc.)
router.get('/activity', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT sal.log_id, sal.action, sal.details, sal.created_at,
                   sa.username, sa.role
            FROM staff_activity_log sal
            LEFT JOIN staff_accounts sa ON sal.staff_id = sa.staff_id
            ORDER BY sal.created_at DESC
            LIMIT 100
        `);
        res.json(rows);
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ error: 'Internal server error while fetching activity' });
    }
});

// All staff/admin login accounts (never returns password_hash)
router.get('/users', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT staff_id AS user_id, username, full_name, role, is_active, created_at
            FROM staff_accounts
            ORDER BY created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ error: 'Internal server error while fetching users' });
    }
});

// --- Staff accounts (create / deactivate / reactivate from the UI) ---

router.post('/staff', async (req, res) => {
    const { username, password, full_name, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ error: 'username, password, and role are required' });
    }
    if (!['admin', 'cashier'].includes(role)) {
        return res.status(400).json({ error: 'role must be admin or cashier' });
    }
    try {
        const bcrypt = require('bcryptjs');
        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO staff_accounts (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
            [username, passwordHash, full_name || null, role]
        );
        res.status(201).json({ staff_id: result.insertId });
    } catch (err) {
        console.error('Database Error:', err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'That username is already taken' });
        }
        res.status(500).json({ error: 'Internal server error while creating staff account' });
    }
});

router.patch('/staff/:id/status', async (req, res) => {
    const { is_active } = req.body;
    try {
        await db.query('UPDATE staff_accounts SET is_active = ? WHERE staff_id = ?', [is_active, req.params.id]);
        res.json({ ok: true });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ error: 'Internal server error while updating staff account' });
    }
});

module.exports = router;