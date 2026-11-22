require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend online!");
});

app.get("/teste-banco", async (req, res) => {

  try {

    const [rows] = await db.query(
      "SELECT NOW() AS data"
    );

    res.json({
      sucesso: true,
      banco: rows
    });

  } catch (error) {
    console.error("Erro no banco:", error);

    res.status(500).json({
      sucesso: false,
      erro: error.message,
      codigo: error.code,
      detalhe: String(error)
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});