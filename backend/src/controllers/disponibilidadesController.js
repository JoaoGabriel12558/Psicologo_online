const { query } = require("../config/database");

async function listar(req, res, next) {
  try {
    const disponibilidades = await query(
      `SELECT id_disponibilidade, psicologo_id, dia_semana, horario_inicio, horario_fim
       FROM disponibilidade
       WHERE psicologo_id = :psicologoId
       ORDER BY dia_semana, horario_inicio`,
      { psicologoId: req.params.psicologoId }
    );

    return res.json(disponibilidades);
  } catch (error) {
    return next(error);
  }
}

async function cadastrar(req, res, next) {
  try {
    const { dia_semana, horario_inicio, horario_fim } = req.body;

    if (dia_semana === undefined || !horario_inicio || !horario_fim) {
      return res.status(400).json({ erro: "Dia da semana, inicio e fim sao obrigatorios." });
    }

    const resultado = await query(
      `INSERT INTO disponibilidade (psicologo_id, dia_semana, horario_inicio, horario_fim)
       VALUES (:psicologo_id, :dia_semana, :horario_inicio, :horario_fim)`,
      {
        psicologo_id: req.usuario.id_usuario,
        dia_semana,
        horario_inicio,
        horario_fim
      }
    );

    return res.status(201).json({ id_disponibilidade: resultado.insertId });
  } catch (error) {
    return next(error);
  }
}

async function remover(req, res, next) {
  try {
    await query(
      `DELETE FROM disponibilidade
       WHERE id_disponibilidade = :id
         AND psicologo_id = :psicologo_id`,
      { id: req.params.id, psicologo_id: req.usuario.id_usuario }
    );

    return res.json({ mensagem: "Disponibilidade removida." });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, cadastrar, remover };

