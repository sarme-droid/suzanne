const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const [rows] = await db.query(
            'SELECT staff_id AS user_id, username, password_hash, full_name, role, is_active FROM staff_accounts WHERE username = ? AND is_active = TRUE',
            [username]
        );

        const user = rows[0];
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatches) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { user_id: user.user_id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        await db.query(
            'INSERT INTO staff_activity_log (staff_id, action, details) VALUES (?, ?, ?)',
            [user.user_id, 'login', `${user.role} logged in`]
        );

        res.json({
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                full_name: user.full_name,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

module.exports = router;