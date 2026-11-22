require("dotenv").config();

const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    nome: "Plataforma de Atendimento Psicologico Online",
    status: "online",
    rotas: "/api"
  });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ erro: "Rota nao encontrada." });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ erro: "Erro interno do servidor." });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

