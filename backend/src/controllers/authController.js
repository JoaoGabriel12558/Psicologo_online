const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
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

async function solicitarRecuperacao(req, res, next) {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ erro: "Informe seu e-mail." });

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const remetente = process.env.SMTP_FROM || smtpUser;
  if (!smtpHost || !smtpUser || !smtpPassword || !remetente) {
    return res.status(503).json({ erro: "A recuperação por e-mail ainda não está configurada." });
  }

  try {
    const usuarios = await query(
      "SELECT id_usuario, email FROM usuario WHERE email = :email",
      { email }
    );

    // Resposta igual para contas existentes e inexistentes evita enumeração de e-mails.
    if (usuarios.length) {
      const usuario = usuarios[0];
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      await query(
        `UPDATE usuario
         SET reset_token_hash = :tokenHash,
             reset_expira = DATE_ADD(NOW(), INTERVAL 1 HOUR)
         WHERE id_usuario = :id`,
        { tokenHash, id: usuario.id_usuario }
      );

      try {
        const appUrl = new URL(process.env.APP_URL || "http://localhost:5500/web/index.html");
        if (!["https:", "http:"].includes(appUrl.protocol) ||
            (process.env.NODE_ENV === "production" && appUrl.protocol !== "https:")) {
          throw new Error("APP_URL deve usar HTTP local ou HTTPS.");
        }
        appUrl.hash = "reset_token=" + encodeURIComponent(token);
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === "true",
          auth: { user: smtpUser, pass: smtpPassword }
        });
        await transporter.sendMail({
          from: remetente,
          to: usuario.email,
          subject: "Redefinição de senha — Portal Terapia",
          text: `Use este link para redefinir sua senha. Ele expira em uma hora:\n\n${appUrl.toString()}\n\nSe você não solicitou a redefinição, ignore esta mensagem.`,
          html: `<p>Use o link abaixo para redefinir sua senha. Ele expira em uma hora.</p><p><a href="${appUrl.toString()}">Redefinir minha senha</a></p><p>Se você não solicitou a redefinição, ignore esta mensagem.</p>`
        });
      } catch (error) {
        await query(
          "UPDATE usuario SET reset_token_hash = NULL, reset_expira = NULL WHERE id_usuario = :id",
          { id: usuario.id_usuario }
        );
        throw error;
      }
    }

    return res.status(202).json({ mensagem: "Se o e-mail estiver cadastrado, você receberá um link de redefinição." });
  } catch (error) {
    return next(error);
  }
}

async function redefinirSenha(req, res, next) {
  try {
    const token = String(req.body.token || "").trim();
    const novaSenha = String(req.body.novaSenha || "");
    if (!token || novaSenha.length < 8) {
      return res.status(400).json({ erro: "Informe o código e uma senha com pelo menos 8 caracteres." });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const usuarios = await query(
      `SELECT id_usuario FROM usuario
       WHERE reset_token_hash = :tokenHash AND reset_expira > NOW()`,
      { tokenHash }
    );
    if (!usuarios.length) {
      return res.status(400).json({ erro: "Link inválido ou expirado. Solicite outro link." });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await query(
      `UPDATE usuario
       SET senha = :senhaHash, reset_token_hash = NULL, reset_expira = NULL
       WHERE id_usuario = :id AND reset_token_hash = :tokenHash AND reset_expira > NOW()`,
      { senhaHash, id: usuarios[0].id_usuario, tokenHash }
    );
    return res.json({ mensagem: "Senha redefinida. Você já pode entrar." });
  } catch (error) {
    return next(error);
  }
}

module.exports = { registrar, login, solicitarRecuperacao, redefinirSenha, PERFIS };

