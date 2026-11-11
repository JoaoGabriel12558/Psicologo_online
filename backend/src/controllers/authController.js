const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../config/database");

const PERFIS = {
  ADMIN: 1,
  PSICOLOGO: 2,
  PACIENTE: 3
};

async function registrar(req, res, next) {
  try {
    const { nome, email, senha, perfil_id, telefone, idade, ocupacao, crp, especialidade, anos_experiencia, descricao_profissional } = req.body;

    if (!nome || !email || !senha || !perfil_id) {
      return res.status(400).json({ erro: "Nome, e-mail, senha e perfil sao obrigatorios." });
    }

    if (Number(perfil_id) === PERFIS.ADMIN) {
      return res.status(403).json({ erro: "Contas administrativas devem ser provisionadas pela equipe responsavel." });
    }

    const existentes = await query("SELECT id_usuario FROM usuario WHERE email = :email", { email });
    if (existentes.length) {
      return res.status(409).json({ erro: "E-mail ja cadastrado." });
    }

    if (Number(perfil_id) === PERFIS.PSICOLOGO && (!crp || !especialidade)) {
      return res.status(400).json({ erro: "CRP e especialidade sao obrigatorios para psicologos." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const resultado = await query(
      `INSERT INTO usuario
        (nome, email, senha, telefone, idade, ocupacao, crp, especialidade, anos_experiencia, descricao_profissional, perfil_id)
       VALUES
        (:nome, :email, :senha, :telefone, :idade, :ocupacao, :crp, :especialidade, :anos_experiencia, :descricao_profissional, :perfil_id)`,
      {
        nome,
        email,
        senha: senhaHash,
        telefone: telefone || null,
        idade: idade || null,
        ocupacao: ocupacao || null,
        crp: crp || null,
        especialidade: especialidade || null,
        anos_experiencia: Number(anos_experiencia || 0),
        descricao_profissional: descricao_profissional || null,
        perfil_id
      }
    );

    return res.status(201).json({ id_usuario: resultado.insertId, nome, email, perfil_id });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "E-mail e senha sao obrigatorios." });
    }

    const usuarios = await query(
      `SELECT id_usuario, nome, email, senha, perfil_id
       FROM usuario
       WHERE email = :email`,
      { email }
    );

    const usuario = usuarios[0];
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ erro: "Credenciais invalidas." });
    }

    const payload = {
      id_usuario: usuario.id_usuario,
      nome: usuario.nome,
      email: usuario.email,
      perfil_id: usuario.perfil_id
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    });

    return res.json({ token, usuario: payload });
  } catch (error) {
    return next(error);
  }
}

module.exports = { registrar, login, PERFIS };

