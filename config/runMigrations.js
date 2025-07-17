const fs = require('fs');
const path = require('path');
const { pool } = require('./database');

async function runMigrations() {
  const sqlPath = path.join(__dirname, '../database/init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const statements = sql.split(';').map(s => s.trim()).filter(Boolean);

  for (const statement of statements) {
    try {
      await pool.query(statement);
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.error('Migration error:', err.message);
      }
    }
  }
  console.log('Migration completed (init.sql)');
}

module.exports = runMigrations; 