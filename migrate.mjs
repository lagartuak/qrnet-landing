import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = mysql.createPool(process.env.DATABASE_URL);
try {
  await pool.query("ALTER TABLE qr_codes ADD COLUMN verification_code VARCHAR(20) UNIQUE AFTER qr_url");
  console.log("OK - Columna añadida");
} catch(e) {
  console.error(e.message);
}
process.exit();
