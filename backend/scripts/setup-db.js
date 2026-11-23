require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const { mysqlOptions } = require("../src/config/mysqlOptions");

async function setup() {
  const sql = fs.readFileSync(path.join(__dirname, "database.sql"), "utf8");

  const connectionOptions = mysqlOptions();
  delete connectionOptions.database;
  const connection = await mysql.createConnection({
    ...connectionOptions,
    multipleStatements: true
  });

  await connection.query(sql);

  // Apply additive updates when setting up an existing MVP database.
  const analyticsColumns = [
    ["usuario", "anos_experiencia", "INT NOT NULL DEFAULT 0"],
    ["usuario", "descricao_profissional", "VARCHAR(500) NULL"],
    ["consulta", "tipo_atendimento", "VARCHAR(100) NOT NULL DEFAULT 'Psicoterapia individual'"]
  ];
  for (const [table, column, definition] of analyticsColumns) {
    const [rows] = await connection.query(
      `SELECT COUNT(*) AS total FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column]
    );
    if (!Number(rows[0].total)) {
      await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    }
  }

  const resetColumns = [
    ["reset_token_hash", "CHAR(64) NULL"],
    ["reset_expira", "DATETIME NULL"]
  ];
  for (const [column, definition] of resetColumns) {
    const [rows] = await connection.query(
      `SELECT COUNT(*) AS total FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuario' AND COLUMN_NAME = ?`,
      [column]
    );
    if (!Number(rows[0].total)) {
      await connection.query(`ALTER TABLE usuario ADD COLUMN \`${column}\` ${definition}`);
    }
  }

  await connection.end();

  console.log("Banco de dados configurado com sucesso.");
}

setup().catch((error) => {
  console.error("Erro ao configurar banco de dados:", error.message);
  process.exit(1);
});

