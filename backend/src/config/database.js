const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "atendimento_psicologico",
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  ssl: process.env.DB_HOST && process.env.DB_HOST !== "localhost"
    ? { rejectUnauthorized: false }
    : undefined
});

async function query(sql, params = {}) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = { pool, query };

