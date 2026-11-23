const fs = require("fs");

function mysqlOptions() {
  const sslEnabled = process.env.DB_SSL === "true";
  const ssl = sslEnabled
    ? {
        rejectUnauthorized: true,
        ...(process.env.DB_SSL_CA_PATH
          ? { ca: fs.readFileSync(process.env.DB_SSL_CA_PATH, "utf8") }
          : {})
      }
    : undefined;

  return {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "atendimento_psicologico",
    ...(ssl ? { ssl } : {})
  };
}

module.exports = { mysqlOptions };
