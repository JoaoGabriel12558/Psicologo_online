const mysql = require("mysql2/promise");
const { mysqlOptions } = require("./mysqlOptions");

const pool = mysql.createPool({
  ...mysqlOptions(),
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true
});

async function query(sql, params = {}) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = { pool, query };

