// Usage: node scripts/createUser.js <username> <password> <role> ["Full Name"]
const bcrypt = require('bcryptjs');
require('dotenv').config();
const pool = require('../config/db');

async function main() {
    const [username, password, role = 'cashier', fullName = ''] = process.argv.slice(2);

    if (!username || !password) {
        console.log('Usage: node scripts/createUser.js <username> <password> <role: admin|cashier> ["Full Name"]');
        process.exit(1);
    }

    if (!['admin', 'cashier'].includes(role)) {
        console.log('Role must be "admin" or "cashier"');
        process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
        await pool.query(
            'INSERT INTO staff_accounts (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
            [username, passwordHash, fullName, role]
        );
        console.log(`Created ${role} user "${username}"`);
    } catch (err) {
        console.error('Could not create user:', err.message);
    } finally {
        process.exit(0);
    }
}

main();