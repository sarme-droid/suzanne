const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// Get all active products with category names
router.get('/', requireAuth, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, c.name AS category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.category_id 
            WHERE p.is_active = TRUE
        `);
        res.json(rows);
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ error: 'Internal server error while fetching products' });
    }
});

// Get options/customizations for a specific product
router.get('/:id/options', requireAuth, async (req, res) => {
    try {
        const productId = req.params.id;
        const [rows] = await db.query(`
            WITH PA_TABLE AS (
                SELECT ao.option_id, ao.attribute_id, ao.option_value, ao.price_modifier, pa.product_id
                FROM product_attributes pa
                JOIN attribute_options ao ON pa.option_id = ao.option_id
                WHERE pa.product_id = ?
            )
            SELECT 
                pat.attribute_id, 
                pa_attr.attribute_name, 
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'option_id', pat.option_id, 
                        'option_value', pat.option_value, 
                        'price_modifier', pat.price_modifier
                    )
                ) AS options
            FROM PA_TABLE pat
            JOIN print_attributes pa_attr ON pat.attribute_id = pa_attr.attribute_id
            GROUP BY pat.attribute_id, pa_attr.attribute_name;
        `, [productId]);
        
        res.json(rows);
    } catch (err) {
        console.error('Database Error:', err.message);
        try {
            const [fallbackRows] = await db.query(`
                SELECT ao.*, pa_attr.attribute_name 
                FROM product_attributes pa
                JOIN attribute_options ao ON pa.option_id = ao.option_id
                JOIN print_attributes pa_attr ON ao.attribute_id = pa_attr.attribute_id
                WHERE pa.product_id = ?
            `, [req.params.id]);
            res.json(fallbackRows);
        } catch (fallbackErr) {
            res.status(500).json({ error: fallbackErr.message });
        }
    }
});

module.exports = router;