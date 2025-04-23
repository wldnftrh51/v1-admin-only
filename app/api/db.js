import mysql from 'mysql2/promise'

// Membuat koneksi ke database MySQL
const db = await mysql.createPool({
  host: process.env.DB_HOST,      // Diambil dari .env
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
})

// Mengekspor koneksi database agar bisa digunakan di file lain
export default db
