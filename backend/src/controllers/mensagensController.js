const { query } = require("../config/database");

async function conversas(req, res, next) {
  try {
    const mensagens = await query(
      `SELECT m.*, r.nome AS remetente_nome, d.nome AS destinatario_nome
       FROM mensagem m
       INNER JOIN usuario r ON r.id_usuario = m.remetente_id
       INNER JOIN usuario d ON d.id_usuario = m.destinatario_id
       WHERE m.remetente_id = :id OR m.destinatario_id = :id
       ORDER BY m.data_envio DESC`,
      { id: req.usuario.id_usuario }
    );

    return res.json(mensagens);
  } catch (error) {
    return next(error);
  }
}

async function enviar(req, res, next) {
  try {
    const { destinatario_id, conteudo } = req.body;

    if (!destinatario_id || !conteudo) {
      return res.status(400).json({ erro: "Destinatario e conteudo sao obrigatorios." });
    }

    const resultado = await query(
      `INSERT INTO mensagem (remetente_id, destinatario_id, conteudo)
       VALUES (:remetente_id, :destinatario_id, :conteudo)`,
      {
        remetente_id: req.usuario.id_usuario,
        destinatario_id,
        conteudo
      }
    );

    return res.status(201).json({ id_mensagem: resultado.insertId });
  } catch (error) {
    return next(error);
  }
}

async function conversaComUsuario(req, res, next) {
  try {
    const outroUsuarioId = req.params.userId;

    const mensagens = await query(
      `SELECT *
       FROM mensagem
       WHERE (remetente_id = :meu_id AND destinatario_id = :outro_id)
          OR (remetente_id = :outro_id AND destinatario_id = :meu_id)
       ORDER BY data_envio ASC`,
      { meu_id: req.usuario.id_usuario, outro_id: outroUsuarioId }
    );

    await query(
      `UPDATE mensagem
       SET lida = 1
       WHERE remetente_id = :outro_id AND destinatario_id = :meu_id`,
      { meu_id: req.usuario.id_usuario, outro_id: outroUsuarioId }
    );

    return res.json(mensagens);
  } catch (error) {
    return next(error);
  }
}

module.exports = { conversas, enviar, conversaComUsuario };

