const express = require("express");
const authController = require("../controllers/authController");
const usuariosController = require("../controllers/usuariosController");
const disponibilidadesController = require("../controllers/disponibilidadesController");
const consultasController = require("../controllers/consultasController");
const mensagensController = require("../controllers/mensagensController");
const estatisticasController = require("../controllers/estatisticasController");
const adminController = require("../controllers/adminController");
const { autenticar, autorizar } = require("../middleware/auth");

const router = express.Router();

router.post("/auth/registro", authController.registrar);
router.post("/auth/login", authController.login);

router.get("/estatisticas", estatisticasController.resumo);
router.get("/admin/indicadores", autenticar, autorizar(1), adminController.indicadores);

router.get("/usuarios/psicologos", usuariosController.listarPsicologos);
router.get("/usuarios/perfil", autenticar, usuariosController.obterPerfil);
router.put("/usuarios/perfil", autenticar, usuariosController.atualizarPerfil);

router.get("/disponibilidades/:psicologoId", disponibilidadesController.listar);
router.post("/disponibilidades", autenticar, autorizar(2), disponibilidadesController.cadastrar);
router.delete("/disponibilidades/:id", autenticar, autorizar(2), disponibilidadesController.remover);

router.post("/consultas", autenticar, autorizar(3), consultasController.agendar);
router.get("/consultas", autenticar, consultasController.listar);
router.patch("/consultas/:id/cancelar", autenticar, consultasController.cancelar);
router.patch("/consultas/:id/confirmar", autenticar, autorizar(2), consultasController.confirmar);

router.get("/mensagens", autenticar, mensagensController.conversas);
router.post("/mensagens", autenticar, mensagensController.enviar);
router.get("/mensagens/:userId", autenticar, mensagensController.conversaComUsuario);

module.exports = router;
